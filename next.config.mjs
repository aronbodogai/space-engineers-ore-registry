/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV !== "production";

// Our Supabase project origin — derived from the public env var so the policy
// follows whatever project is wired up. Used for photos (img-src) and the
// browser client's REST/auth/storage calls (connect-src). Left blank (and so
// omitted) if the URL is missing or malformed at build time.
let supabaseOrigin = "";
try {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    supabaseOrigin = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin;
  }
} catch {
  // ignore — directives below simply won't include a Supabase host
}
const supabaseWs = supabaseOrigin.replace(/^https:/, "wss:");

const TURNSTILE = "https://challenges.cloudflare.com";
// In dev, @vercel/analytics loads its debug script from this host; in
// production the script and beacon are same-origin (/_vercel/insights/*).
const VERCEL_DEV = isDev ? "https://va.vercel-scripts.com" : "";

// Content-Security-Policy.
//
// Note on 'unsafe-inline' in script-src: Next.js injects inline bootstrap /
// streaming scripts, and these pages render statically and are cached for SEO.
// A nonce-based CSP would force every page to render dynamically per request,
// defeating that caching, so we accept 'unsafe-inline' here. React escapes all
// interpolated text, so there is no HTML-injection sink for it to guard anyway.
// The directives doing real work for us are img-src (photos can only load from
// our own bucket), frame-ancestors (anti-clickjacking), object-src and base-uri.
const csp = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} ${TURNSTILE} ${VERCEL_DEV}`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob: ${supabaseOrigin}`,
  `font-src 'self'`,
  `connect-src 'self' ${supabaseOrigin} ${supabaseWs} ${TURNSTILE} ${VERCEL_DEV}${isDev ? " ws:" : ""}`,
  `frame-src 'self' ${TURNSTILE}`,
  `frame-ancestors 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `object-src 'none'`,
  `worker-src 'self' blob:`,
  `manifest-src 'self'`,
]
  .map((directive) => directive.replace(/\s+/g, " ").trim())
  .join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Legacy clickjacking guard alongside CSP frame-ancestors.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
