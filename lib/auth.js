import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

/**
 * Returns the current authenticated user and their profile row (with role),
 * or { user: null, profile: null } if not logged in. For use in Server
 * Components, Route Handlers, and Server Actions.
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, profile: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, role, banned")
    .eq("id", user.id)
    .single();

  return { user, profile };
}

/** True if the given profile is an admin. */
export function isAdmin(profile) {
  return profile?.role === "admin";
}

/**
 * Require a logged-in user. Redirects to /login (preserving where to return to)
 * if there is no session. Returns { user, profile } otherwise.
 */
export async function requireUser(next = "/") {
  const data = await getCurrentUser();
  if (!data.user) {
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }
  return data;
}

/**
 * Require an admin. Redirects to /login if signed out, or home if signed in but
 * not an admin. Returns { user, profile } for admins.
 */
export async function requireAdmin() {
  const data = await getCurrentUser();
  if (!data.user) redirect("/login?next=/admin");
  if (!isAdmin(data.profile)) redirect("/");
  return data;
}
