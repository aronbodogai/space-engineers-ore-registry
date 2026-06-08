/**
 * Resource auto-detection for the bulk importer.
 *
 * Players label exposed-ore GPS markers by element — either the periodic symbol
 * ("Ag", "Fe", "U") or the plain name ("Silver", "Ice"), sometimes with a number
 * for repeat spots ("Ag 2", "ag2"). The matcher maps such a marker name to one
 * of ORE_RESOURCES so the bulk importer can pre-select the dropdown.
 *
 * Casing carries meaning too: any capital letter in the matched element token
 * means the ore is surface-exposed (easy to mine, more desirable); an all-
 * lowercase token means it's buried. detectOre() returns both signals.
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
 * Core matcher. Returns the canonical resource plus the *original-case* token
 * that matched (so callers can inspect its casing), or null when nothing matches.
 * @param {string} name
 * @returns {{ resource: string, token: string } | null}
 */
function matchOre(name) {
  if (typeof name !== "string") return null;
  const trimmed = name.trim();
  if (trimmed === "") return null;

  // 1. The whole name is exactly an ore name or symbol — "Ag", "Ice", "iron".
  const whole = trimmed.toLowerCase();
  if (TOKEN_TO_RESOURCE.has(whole)) {
    return { resource: TOKEN_TO_RESOURCE.get(whole), token: trimmed };
  }

  // 2. Earliest matching token wins — "Ag North", "iron-2" key off the first
  //    word. 3. Trailing digits on a symbol ("ag2") match on the leading letters.
  for (const token of trimmed.split(/[^a-zA-Z0-9]+/).filter(Boolean)) {
    const lc = token.toLowerCase();
    if (TOKEN_TO_RESOURCE.has(lc)) {
      return { resource: TOKEN_TO_RESOURCE.get(lc), token };
    }
    const lead = lc.match(/^[a-z]+/)?.[0];
    if (lead && TOKEN_TO_RESOURCE.has(lead)) {
      const tokenLead = token.match(/^[a-zA-Z]+/)?.[0] ?? token;
      return { resource: TOKEN_TO_RESOURCE.get(lead), token: tokenLead };
    }
  }

  return null;
}

/**
 * Best-effort resource for a GPS marker name.
 * @param {string} name - the GPS marker name (e.g. "Ag", "Iron 2", "Outpost").
 * @returns {string|null} a value from ORE_RESOURCES, or null when nothing matches.
 */
export function guessResource(name) {
  return matchOre(name)?.resource ?? null;
}

/**
 * Resource plus the exposed signal for a GPS marker name. An ore is "exposed"
 * (surface, easy to mine) when the matched element token has any capital letter;
 * an all-lowercase token means buried.
 * @param {string} name
 * @returns {{ resource: string|null, exposed: boolean }}
 */
export function detectOre(name) {
  const match = matchOre(name);
  if (!match) return { resource: null, exposed: false };
  return { resource: match.resource, exposed: /[A-Z]/.test(match.token) };
}
