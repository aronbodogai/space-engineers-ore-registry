"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../../../lib/supabase/server";
import { requireAdmin } from "../../../lib/auth";

export async function setRole(formData) {
  const { user } = await requireAdmin();
  const id = String(formData.get("id") || "");
  const role = String(formData.get("role") || "");
  if (!id || (role !== "admin" && role !== "member")) return;
  // Never let an admin change their own role (avoids locking yourself out).
  if (id === user.id) return;

  const supabase = await createClient();
  await supabase.from("profiles").update({ role }).eq("id", id);
  revalidatePath("/admin/users");
}

export async function setBanned(formData) {
  const { user } = await requireAdmin();
  const id = String(formData.get("id") || "");
  const banned = String(formData.get("banned") || "") === "true";
  if (!id) return;
  if (id === user.id) return; // never ban yourself

  const supabase = await createClient();
  await supabase.from("profiles").update({ banned }).eq("id", id);
  revalidatePath("/admin/users");
}
