"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "../../lib/supabase/server";
import { requireUser, requireAdmin } from "../../lib/auth";

/** Add or update the current user's 1–5 rating for a location (one per user). */
export async function rateLocation(locationId, score) {
  const { user } = await requireUser(`/locations/${locationId}`);
  const s = Number(score);
  if (!Number.isInteger(s) || s < 1 || s > 5) return;

  const supabase = await createClient();
  await supabase
    .from("ratings")
    .upsert(
      { location_id: locationId, user_id: user.id, score: s },
      { onConflict: "location_id,user_id" }
    );
  revalidatePath(`/locations/${locationId}`);
}

/** Admin: hide or un-hide a location. The DB trigger also blocks non-admins. */
export async function setHidden(formData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const hidden = String(formData.get("hidden") || "") === "true";
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("locations").update({ is_hidden: hidden }).eq("id", id);
  revalidatePath(`/locations/${id}`);
  revalidatePath("/admin");
  revalidatePath("/locations");
}

/**
 * Delete a location. RLS restricts this to the owner or an admin. If a
 * `redirectTo` is supplied (e.g. from the detail page, which would 404 after
 * deletion) the user is sent there; otherwise the current lists are revalidated.
 */
export async function deleteLocation(formData) {
  await requireUser("/locations");
  const id = String(formData.get("id") || "");
  const redirectTo = String(formData.get("redirectTo") || "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("locations").delete().eq("id", id);

  revalidatePath("/locations");
  revalidatePath("/profile");
  revalidatePath("/admin");
  if (redirectTo) redirect(redirectTo);
}
