/**
 * Shared option lists for forms and filters. Kept in one place so the submit
 * form, edit form, and the browse filters stay in sync. See SPEC.md §4.
 */

export const LOCATION_TYPES = [
  { value: "ore", label: "Ore deposit" },
  { value: "poi", label: "Point of interest" },
];

/** Human label for a stored type value. */
export function typeLabel(type) {
  return LOCATION_TYPES.find((t) => t.value === type)?.label ?? type;
}

/** Planet/biome tags a submitter can pick from (SPEC.md §4 `planet`). */
export const PLANETS = [
  "Earthlike",
  "Mars",
  "Moon",
  "Alien",
  "Europa",
  "Titan",
  "Pertam",
  "Triton",
  "Space",
];

/** Common Space Engineers ores — suggestions only; `resource` is free text. */
export const ORE_RESOURCES = [
  "Ice",
  "Iron",
  "Nickel",
  "Cobalt",
  "Silicon",
  "Silver",
  "Gold",
  "Platinum",
  "Uranium",
  "Magnesium",
  "Stone",
];

/** Sort options for the browse page. */
export const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Highest rated" },
  { value: "name", label: "Name (A–Z)" },
];

/** Supabase Storage bucket for optional location photos. */
export const PHOTO_BUCKET = "location-photos";
