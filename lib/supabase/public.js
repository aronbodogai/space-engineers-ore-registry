import { createClient } from "@supabase/supabase-js";

/**
 * Cookieless Supabase client for cached, public reads (anonymous role).
 *
 * Unlike lib/supabase/server.js this never touches request cookies, so it's
 * safe to call inside unstable_cache() — which runs outside request scope on a
 * cache miss and would throw if it tried to read cookies(). Every public
 * listing query forces is_hidden = false, so the anonymous-role result is
 * identical for all viewers and safe to cache and share.
 */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
