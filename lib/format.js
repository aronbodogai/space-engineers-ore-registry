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

/** e.g. "Jun 7, 2026". */
export function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
