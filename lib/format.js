/**
 * Small display helpers shared across pages.
 */

/**
 * Space Engineers colors are #AARRGGBB (alpha first). Return a CSS #RRGGBB for a
 * swatch, or null if the value isn't a recognizable hex color.
 */
export function seColorToCss(color) {
  if (!color) return null;
  const m = /^#([0-9a-fA-F]{8})$/.exec(color);
  if (m) return `#${m[1].slice(2)}`;
  return /^#[0-9a-fA-F]{6}$/.test(color) ? color : null;
}

/** Rounded, thousands-separated "x, y, z". */
export function formatCoords(x, y, z) {
  const r = (n) => Math.round(Number(n)).toLocaleString("en-US");
  return `${r(x)}, ${r(y)}, ${r(z)}`;
}

/**
 * In-game distance (meters) → friendly label. Under 1 km shows whole meters
 * ("840 m"); 1 km and up shows one decimal of kilometers ("12.4 km"). Used by
 * the "find nearest" proximity search. Returns "" for non-numeric input.
 */
export function formatDistance(meters) {
  const m = Number(meters);
  if (!Number.isFinite(m)) return "";
  if (m < 1000) return `${Math.round(m).toLocaleString("en-US")} m`;
  return `${(m / 1000).toLocaleString("en-US", { maximumFractionDigits: 1 })} km`;
}

/** e.g. "Jun 7, 2026". */
export function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
