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

/**
 * Where a location sits. Every Space Engineers location is either on a planet or
 * out in space; we deliberately don't track *which* planet. Stored in the
 * `planet` column. New locations default to Space.
 */
export const ENVIRONMENTS = ["Planet", "Space"];
export const DEFAULT_ENVIRONMENT = "Space";

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

/**
 * Deposit size — we only track the notable big end; smaller or unrated spots
 * stay unspecified (null) and get no badge. Ore-only.
 */
export const ORE_SIZES = ["Big", "Huge"];

/** Sort options for the browse page. */
export const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Highest rated" },
  { value: "name", label: "Name (A–Z)" },
];

/** Supabase Storage bucket for optional location photos. */
export const PHOTO_BUCKET = "location-photos";
