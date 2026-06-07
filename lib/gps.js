/**
 * GPS parsing for Space Engineers location strings.
 *
 * Space Engineers exports a location as:
 *     GPS:NAME:X:Y:Z:#COLOR:
 * e.g.
 *     GPS:ICE_9:79138.9433054972:253235.787713332:-760016.753826463:#FF75C9F1:
 *
 * Rules (see SPEC.md §5):
 *   - First segment must be the literal "GPS".
 *   - Segment 2 = name; segments 3-5 = X, Y, Z (decimals, may be negative).
 *   - Segment 6 = color (optional; starts with "#").
 *   - The original unmodified string is always preserved as `gps_raw`.
 *   - Reject input that doesn't start with "GPS:" or lacks three numeric coords.
 *
 * Note: a name could itself contain a ":" in theory, but the SE export format
 * does not escape it and coordinates are always the last numeric fields. We
 * keep parsing strict and predictable: exactly the documented segment layout.
 */

/**
 * Parse a Space Engineers GPS string.
 * @param {string} input
 * @returns {{ ok: true, value: { name: string, x: number, y: number, z: number,
 *   color: string|null, gps_raw: string } } | { ok: false, error: string }}
 */
export function parseGps(input) {
  if (typeof input !== "string") {
    return { ok: false, error: "No GPS string provided." };
  }

  const raw = input.trim();
  if (raw === "") {
    return { ok: false, error: "Paste a GPS string to continue." };
  }

  if (!/^GPS:/i.test(raw)) {
    return {
      ok: false,
      error: 'GPS string must start with "GPS:". Copy it from the game first.',
    };
  }

  const segments = raw.split(":");
  // Expected: ["GPS", name, x, y, z, color?, ""?] — trailing colon yields "".
  if (segments.length < 5) {
    return {
      ok: false,
      error:
        "GPS string is incomplete — expected a name and three coordinates.",
    };
  }

  const name = segments[1].trim();
  if (name === "") {
    return { ok: false, error: "GPS string is missing a name." };
  }

  const x = Number(segments[2]);
  const y = Number(segments[3]);
  const z = Number(segments[4]);

  if (
    !Number.isFinite(x) ||
    !Number.isFinite(y) ||
    !Number.isFinite(z) ||
    segments[2].trim() === "" ||
    segments[3].trim() === "" ||
    segments[4].trim() === ""
  ) {
    return {
      ok: false,
      error: "GPS string must contain three numeric coordinates (X, Y, Z).",
    };
  }

  // Color is optional. It's segment 6 if present and looks like a hex color.
  let color = null;
  if (segments[5] && segments[5].trim() !== "") {
    const c = segments[5].trim();
    color = c.startsWith("#") ? c : null;
  }

  return {
    ok: true,
    value: { name, x, y, z, color, gps_raw: raw },
  };
}

/**
 * Rebuild a canonical GPS string from parsed fields. Useful when a location was
 * created without a stored raw string, or to normalize for copy-to-game.
 */
export function formatGps({ name, x, y, z, color }) {
  const c = color && color.startsWith("#") ? color : "#FFFFFFFF";
  return `GPS:${name}:${x}:${y}:${z}:${c}:`;
}

/**
 * 3D straight-line distance between two points in in-game meters.
 * Used for the near-duplicate check (5 km = 5000 units, same server only).
 */
export function distance3d(a, b) {
  return Math.sqrt(
    (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2
  );
}
