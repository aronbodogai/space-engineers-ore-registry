/**
 * Resource auto-detection for the bulk importer.
 *
 * Players label exposed-ore GPS markers by element — either the periodic symbol
 * ("Ag", "Fe", "U") or the plain name ("Silver", "Ice"), sometimes with a number
 * for repeat spots ("Ag 2", "ag2"). guessResource() maps such a marker name to
 * one of ORE_RESOURCES so the bulk importer can pre-select the dropdown.
 *
 * Matching is deliberately conservative — it favors exact tokens over substrings
 * so a name like "Outpost" never reads as an ore. The importer grid stays fully
 * editable, so a wrong guess is a one-click fix.
 */
import { ORE_RESOURCES } from "./constants.js";

// Periodic symbols / shorthand for the ores we track. The resource's own name is
// always matched as well, so only *extra* aliases need listing here. (Ice has no
// element symbol; Stone gets a friendly "rock" alias.)
const ORE_ALIASES = {
  Ice: [],
  Iron: ["fe"],
  Nickel: ["ni"],
  Cobalt: ["co"],
  Silicon: ["si"],
  Silver: ["ag"],
  Gold: ["au"],
  Platinum: ["pt"],
  Uranium: ["u"],
  Magnesium: ["mg"],
  Stone: ["rock"],
};

// token -> canonical resource, e.g. "ag" -> "Silver", "silver" -> "Silver".
const TOKEN_TO_RESOURCE = new Map();
for (const resource of ORE_RESOURCES) {
  TOKEN_TO_RESOURCE.set(resource.toLowerCase(), resource);
  for (const alias of ORE_ALIASES[resource] ?? []) {
    TOKEN_TO_RESOURCE.set(alias.toLowerCase(), resource);
  }
}

/**
 * Best-effort resource for a GPS marker name.
 * @param {string} name - the GPS marker name (e.g. "Ag", "Iron 2", "Outpost").
 * @returns {string|null} a value from ORE_RESOURCES, or null when nothing matches.
 */
export function guessResource(name) {
  if (typeof name !== "string") return null;
  const cleaned = name.trim().toLowerCase();
  if (cleaned === "") return null;

  // 1. The whole name is exactly an ore name or symbol — "Ag", "Ice", "iron".
  if (TOKEN_TO_RESOURCE.has(cleaned)) return TOKEN_TO_RESOURCE.get(cleaned);

  // 2. Earliest matching token wins — "Ag North", "iron-2" key off the first word.
  const tokens = cleaned.split(/[^a-z0-9]+/).filter(Boolean);
  for (const token of tokens) {
    if (TOKEN_TO_RESOURCE.has(token)) return TOKEN_TO_RESOURCE.get(token);
    // Trailing digits on a symbol — "ag2", "u3" — match on the leading letters.
    const lead = token.match(/^[a-z]+/)?.[0];
    if (lead && TOKEN_TO_RESOURCE.has(lead)) return TOKEN_TO_RESOURCE.get(lead);
  }

  return null;
}
