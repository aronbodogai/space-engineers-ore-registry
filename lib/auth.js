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
