import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the SECRET key. This bypasses Row Level
 * Security, so it must NEVER be imported into client code. Use only inside
 * Route Handlers / Server Actions for privileged operations that have already
 * been authorization-checked (e.g. verified-admin tasks).
 */
export function createAdminClient() {
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!secret) {
    throw new Error("SUPABASE_SECRET_KEY is not set");
  }
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL, secret, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
