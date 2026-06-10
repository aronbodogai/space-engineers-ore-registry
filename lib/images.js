import { PHOTO_BUCKET } from "./constants.js";

/**
 * Validate a location photo URL before it is stored.
 *
 * Photos are uploaded by the browser straight into our Supabase Storage bucket
 * (see SubmitForm / EditForm), so a legitimate image_url is ALWAYS the public
 * URL of an object in that bucket:
 *
 *   https://<project>.supabase.co/storage/v1/object/public/location-photos/<file>
 *
 * The server actions must not trust the posted value, though: a crafted request
 * can set image_url to any string, and it is rendered into an <img src> on the
 * public detail page. An off-site URL would turn every visitor's browser into a
 * tracking beacon for whoever submitted the row (leaking IP / User-Agent) and
 * let arbitrary image content be injected. So we accept only https URLs that
 * live under our own photo bucket and reject everything else.
 *
 * @param {unknown} value  The posted image_url.
 * @returns {string|null}  The canonical URL if valid, otherwise null ("no photo").
 */
export function safeImageUrl(value) {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return null;

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;

  let url, baseUrl;
  try {
    url = new URL(raw);
    baseUrl = new URL(base);
  } catch {
    return null; // not a parseable absolute URL
  }

  // Must be https and the exact origin of our Supabase project (origin compares
  // scheme + host + port, so it also blocks userinfo/look-alike host tricks)...
  if (url.protocol !== "https:") return null;
  if (url.origin !== baseUrl.origin) return null;

  // ...and point inside the public photo bucket, nothing else in the project.
  if (!url.pathname.startsWith(`/storage/v1/object/public/${PHOTO_BUCKET}/`)) {
    return null;
  }

  return url.href;
}
