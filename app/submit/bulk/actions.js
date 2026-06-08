"use server";

import { createClient } from "../../../lib/supabase/server";
import { requireUser } from "../../../lib/auth";
import { verifyTurnstile } from "../../../lib/turnstile";
import { getClientIp } from "../../../lib/ip";
import { parseGps } from "../../../lib/gps";
import { ENVIRONMENTS, DEFAULT_ENVIRONMENT } from "../../../lib/constants";

// Guard against an accidental huge paste (and slow inserts / timeouts).
const MAX_ROWS = 500;

export async function bulkImport(prevState, formData) {
  const { user, profile } = await requireUser("/submit/bulk");
  if (profile?.banned) {
    return { error: "Your account is currently banned from submitting." };
  }

  const serverId = String(formData.get("server_id") || "");
  const token = String(formData.get("cf-turnstile-response") || "");
  const rowsJson = String(formData.get("rows") || "");

  const ts = await verifyTurnstile(token, await getClientIp());
  if (!ts.success) {
    return { error: ts.error || "Bot check failed — please try again." };
  }

  if (!serverId) {
    return { error: "Choose which server / world these locations are on." };
  }

  let rows;
  try {
    rows = JSON.parse(rowsJson);
  } catch {
    return {
      error: "Could not read the import data — re-parse and try again.",
    };
  }
  if (!Array.isArray(rows) || rows.length === 0) {
    return { error: "Nothing to import — paste some GPS strings first." };
  }
  if (rows.length > MAX_ROWS) {
    return {
      error: `Too many at once (${rows.length}). Import up to ${MAX_ROWS} at a time.`,
    };
  }

  // Re-parse and re-validate every row server-side: never trust client coords,
  // type, or resource. Rows that fail validation are skipped, not fatal.
  const inserts = [];
  let skipped = 0;
  for (const row of rows) {
    const parsed = parseGps(String(row?.gps_raw || ""));
    if (!parsed.ok) {
      skipped++;
      continue;
    }

    const type =
      row?.type === "poi" ? "poi" : row?.type === "ore" ? "ore" : null;
    if (!type) {
      skipped++;
      continue;
    }

    const resource = type === "ore" ? String(row?.resource || "").trim() : null;
    if (type === "ore" && !resource) {
      skipped++;
      continue;
    }

    const environment = ENVIRONMENTS.includes(row?.environment)
      ? row.environment
      : DEFAULT_ENVIRONMENT;

    const { name, x, y, z, color, gps_raw } = parsed.value;
    inserts.push({
      server_id: serverId,
      name,
      type,
      resource,
      x,
      y,
      z,
      gps_raw,
      color,
      planet: environment,
      submitted_by: user.id,
    });
  }

  if (inserts.length === 0) {
    return {
      error: "No valid rows to import. Check the GPS strings and ore types.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("locations")
    .insert(inserts)
    .select("id");

  if (error) {
    if (error.code === "23503") {
      return { error: "That server no longer exists — pick another." };
    }
    return { error: error.message };
  }

  return { imported: data.length, skipped };
}
