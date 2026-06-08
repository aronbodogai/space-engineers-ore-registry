"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "../../../../lib/supabase/server";
import { requireUser } from "../../../../lib/auth";
import { parseGps } from "../../../../lib/gps";

export async function updateLocation(prevState, formData) {
  await requireUser();

  const id = String(formData.get("id") || "");
  if (!id) return { error: "Missing location id." };

  const gps = String(formData.get("gps") || "");
  const serverId = String(formData.get("server_id") || "");
  const type = String(formData.get("type") || "");
  const resourceRaw = String(formData.get("resource") || "").trim();
  const planetRaw = String(formData.get("planet") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const imageUrl = String(formData.get("image_url") || "").trim() || null;

  if (!serverId) return { error: "Choose which server / world this is on." };
  if (type !== "ore" && type !== "poi") return { error: "Choose a location type." };

  const parsed = parseGps(gps);
  if (!parsed.ok) return { error: parsed.error };

  const resource = type === "ore" ? resourceRaw || null : null;
  if (type === "ore" && !resource) {
    return { error: "Enter the ore / resource for an ore deposit." };
  }
  const exposed = type === "ore" && formData.get("exposed") === "on";

  const { name, x, y, z, color, gps_raw } = parsed.value;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("locations")
    .update({
      server_id: serverId,
      name,
      type,
      resource,
      exposed,
      x,
      y,
      z,
      gps_raw,
      color,
      planet: planetRaw || null,
      description,
      image_url: imageUrl,
    })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) return { error: error.message };
  // RLS filters out rows the user may not edit, so no row means not allowed.
  if (!data) return { error: "You can only edit your own locations." };

  revalidatePath(`/locations/${id}`);
  redirect(`/locations/${id}`);
}
