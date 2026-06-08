"use server";

import { redirect } from "next/navigation";
import { revalidateTag } from "next/cache";
import { createClient } from "../../lib/supabase/server";
import { requireUser } from "../../lib/auth";
import { verifyTurnstile } from "../../lib/turnstile";
import { getClientIp } from "../../lib/ip";
import { parseGps } from "../../lib/gps";
import { ORE_SIZES } from "../../lib/constants";

export async function submitLocation(prevState, formData) {
  const { user, profile } = await requireUser("/submit");
  if (profile?.banned) {
    return { error: "Your account is currently banned from submitting." };
  }

  const gps = String(formData.get("gps") || "");
  const serverId = String(formData.get("server_id") || "");
  const type = String(formData.get("type") || "");
  const resourceRaw = String(formData.get("resource") || "").trim();
  const planetRaw = String(formData.get("planet") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const imageUrl = String(formData.get("image_url") || "").trim() || null;
  const token = String(formData.get("cf-turnstile-response") || "");

  const ts = await verifyTurnstile(token, await getClientIp());
  if (!ts.success) {
    return { error: ts.error || "Bot check failed — please try again." };
  }

  if (!serverId) {
    return { error: "Choose which server / world this location is on." };
  }
  if (type !== "ore" && type !== "poi") {
    return { error: "Choose a location type." };
  }

  // Re-parse server-side: never trust client-parsed coordinates.
  const parsed = parseGps(gps);
  if (!parsed.ok) return { error: parsed.error };

  const resource = type === "ore" ? resourceRaw || null : null;
  if (type === "ore" && !resource) {
    return { error: "Enter the ore / resource for an ore deposit." };
  }
  const exposed = type === "ore" && formData.get("exposed") === "on";
  const sizeRaw = String(formData.get("size") || "").trim();
  const size = type === "ore" && ORE_SIZES.includes(sizeRaw) ? sizeRaw : null;

  const { name, x, y, z, color, gps_raw } = parsed.value;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("locations")
    .insert({
      server_id: serverId,
      name,
      type,
      resource,
      exposed,
      size,
      x,
      y,
      z,
      gps_raw,
      color,
      planet: planetRaw || null,
      description,
      image_url: imageUrl,
      submitted_by: user.id,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23503") {
      return { error: "That server no longer exists — pick another." };
    }
    return { error: error.message };
  }

  revalidateTag("locations");
  redirect(`/locations/${data.id}`);
}
