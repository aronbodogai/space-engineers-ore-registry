import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

/**
 * Sign the current user out and return to the home page.
 * Invoked by a POST form (see the nav and profile page).
 */
export async function POST(request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  // 303 so the browser follows the redirect with a GET.
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
