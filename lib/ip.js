import { headers } from "next/headers";

/**
 * Best-effort client IP from the request headers, for passing to Cloudflare
 * Turnstile's optional `remoteip` check. Returns undefined if unknown.
 * For use in Route Handlers and Server Actions.
 */
export async function getClientIp() {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return h.get("x-real-ip") ?? undefined;
}
