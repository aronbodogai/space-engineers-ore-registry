"use server";

import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { verifyTurnstile } from "../../lib/turnstile";
import { getClientIp } from "../../lib/ip";

const USERNAME_RE = /^[a-zA-Z0-9_-]{3,24}$/;

export async function signup(prevState, formData) {
  const username = String(formData.get("username") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const token = String(formData.get("cf-turnstile-response") || "");

  if (!username || !email || !password) {
    return { error: "Username, email, and password are all required." };
  }
  if (!USERNAME_RE.test(username)) {
    return {
      error:
        "Username must be 3–24 characters: letters, numbers, underscores, or hyphens.",
    };
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const ts = await verifyTurnstile(token, await getClientIp());
  if (!ts.success) {
    return { error: ts.error || "Bot check failed — please try again." };
  }

  const supabase = await createClient();

  // Friendly pre-check; the unique constraint on profiles.username is the real
  // guard against a race between two simultaneous signups.
  const { data: taken } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();
  if (taken) {
    return { error: "That username is already taken." };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  });
  if (error) {
    return { error: error.message };
  }

  // When email confirmation is enabled, signUp returns no session.
  if (!data.session) {
    return {
      notice:
        "Account created. Check your email to confirm your address, then log in.",
    };
  }

  redirect("/");
}
