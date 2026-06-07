"use server";

import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { verifyTurnstile } from "../../lib/turnstile";
import { getClientIp } from "../../lib/ip";

/** Only allow same-origin relative redirects (no open-redirect to other hosts). */
function safeNext(value) {
  const next = typeof value === "string" ? value : "/";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export async function login(prevState, formData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const token = String(formData.get("cf-turnstile-response") || "");
  const next = safeNext(formData.get("next"));

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const ts = await verifyTurnstile(token, await getClientIp());
  if (!ts.success) {
    return { error: ts.error || "Bot check failed — please try again." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: error.message };
  }

  redirect(next);
}
