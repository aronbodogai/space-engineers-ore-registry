/**
 * Server-side verification of a Cloudflare Turnstile token.
 *
 * The widget runs in the browser and issues a token; the server must verify it
 * with Cloudflare before allowing the action (submission, login, search).
 * The secret key is server-only and must never reach the client.
 *
 * Guards the three endpoints in SPEC.md §6.5.
 */

const VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * @param {string} token  The token from the Turnstile widget (cf-turnstile-response).
 * @param {string} [remoteip]  Optional client IP for extra validation.
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function verifyTurnstile(token, remoteip) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    // Misconfiguration — fail closed rather than silently allowing bots.
    return { success: false, error: "Turnstile secret key is not configured." };
  }
  if (!token) {
    return { success: false, error: "Missing Turnstile token." };
  }

  const body = new URLSearchParams({ secret, response: token });
  if (remoteip) body.set("remoteip", remoteip);

  try {
    const res = await fetch(VERIFY_URL, { method: "POST", body });
    const data = await res.json();
    if (data.success) return { success: true };
    return {
      success: false,
      error:
        "Turnstile verification failed" +
        (Array.isArray(data["error-codes"]) && data["error-codes"].length
          ? `: ${data["error-codes"].join(", ")}`
          : "."),
    };
  } catch {
    return { success: false, error: "Could not reach Turnstile to verify." };
  }
}
