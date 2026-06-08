"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "../../../lib/supabase/server";
import { requireAdmin } from "../../../lib/auth";

export async function createServer(prevState, formData) {
  await requireAdmin();

  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  if (!name) return { error: "Server name is required." };

  const supabase = await createClient();
  const { error } = await supabase.from("servers").insert({ name, description });
  if (error) {
    if (error.code === "23505") {
      return { error: "A server with that name already exists." };
    }
    return { error: error.message };
  }

  revalidatePath("/admin/servers");
  revalidateTag("servers");
  return { success: `Added “${name}”.` };
}

export async function renameServer(formData) {
  await requireAdmin();

  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  if (!id || !name) return;

  const supabase = await createClient();
  await supabase.from("servers").update({ name, description }).eq("id", id);
  revalidatePath("/admin/servers");
  revalidateTag("servers");
  revalidateTag("locations");
}

export async function deleteServer(formData) {
  await requireAdmin();

  const id = String(formData.get("id") || "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("servers").delete().eq("id", id);
  revalidatePath("/admin/servers");
  revalidateTag("servers");
  revalidateTag("locations");
}
