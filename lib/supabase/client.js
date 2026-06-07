"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for use in the browser (Client Components).
 * Uses the publishable key, which is safe to expose to the browser and is
 * constrained by Row Level Security. Never use the secret key here.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}
