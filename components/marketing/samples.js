/**
 * Illustrative data for the landing-page mockups — not real registry rows.
 *
 * Kept in one place so every step of the walkthrough tells the same story: one
 * world, one origin GPS, and the same three deposits found near it. Coordinates
 * and distances are consistent with each other, and the marker names follow the
 * conventions lib/resources.js actually reads (element symbol, capitalised when
 * the deposit is exposed on the surface).
 */
import { distance3d } from "../../lib/gps";

export const SAMPLE_SERVER = "recskabajnok";

/** Where the player is standing — the GPS they copy out of the game. */
export const SAMPLE_ORIGIN = {
  name: "Space station 1",
  x: 8086.18,
  y: 134400.13,
  z: -100323.22,
  color: "#FF75C9F1",
  gps_raw: "GPS:Space station 1:8086.18:134400.13:-100323.22:#FF75C9F1:",
};

/**
 * Nearest charted locations to that origin, closest first.
 *
 * Distances are derived with the same distance3d() the real search uses rather
 * than typed in, so the "1.2 km away" on a card can never drift away from the
 * coordinates printed above it.
 *
 * These rows deliberately carry no `exposed` or `size`: lib/queries.js
 * CARD_SELECT can't select those columns yet, so the live grid doesn't show
 * those badges and neither should something framed as a screenshot.
 */
const SAMPLE_LOCATIONS = [
  {
    loc: {
      id: "sample-co-3",
      name: "Co 3",
      type: "ore",
      resource: "Cobalt",
      planet: "Space",
      color: "#FF75C9F1",
      x: 8712.44,
      y: 133502.19,
      z: -100910.07,
      server_name: SAMPLE_SERVER,
      avg_score: 4.6,
      rating_count: 9,
    },
  },
  {
    loc: {
      id: "sample-ag2",
      name: "ag2",
      type: "ore",
      resource: "Silver",
      planet: "Space",
      color: "#FFC9C9D1",
      x: 5700.9,
      y: 136700.4,
      z: -101500.6,
      server_name: SAMPLE_SERVER,
      avg_score: 4.2,
      rating_count: 5,
    },
  },
  {
    loc: {
      id: "sample-ice-9",
      name: "ICE_9",
      type: "ore",
      resource: "Ice",
      planet: "Planet",
      color: "#FF8FE3FF",
      x: 12940.2,
      y: 139800.7,
      z: -104100.3,
      server_name: SAMPLE_SERVER,
      avg_score: 5,
      rating_count: 3,
    },
  },
];

export const SAMPLE_RESULTS = SAMPLE_LOCATIONS.map(({ loc }) => ({
  loc,
  distance: distance3d(SAMPLE_ORIGIN, loc),
})).sort((a, b) => a.distance - b.distance);

/** The deposit the player opens and copies back into the game. */
export const SAMPLE_PICK = SAMPLE_RESULTS[0].loc;
export const SAMPLE_PICK_GPS =
  "GPS:Co 3:8712.4392:133502.1907:-100910.0713:#FF75C9F1:";
