// Weekly usage stats for the Space Engineers Ore & POI Registry.
//
// Read-only. Connects with the Supabase SECRET key (bypasses RLS so hidden
// rows and every profile are counted) and prints a usage report for the last
// 7 days versus the prior 7 days.
//
// Run:  node --env-file=.env scripts/weekly-stats.mjs
//       node --env-file=.env scripts/weekly-stats.mjs --json   (machine output)
//
// The `--json` form prints the raw stats object — that is what gets handed to
// Claude to write the weekly narrative report.

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
if (!url || !secret) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY. Run with: node --env-file=.env scripts/weekly-stats.mjs"
  );
  process.exit(1);
}

const supabase = createClient(url, secret, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const now = new Date();
const DAY = 24 * 60 * 60 * 1000;
const weekAgo = new Date(now - 7 * DAY);
const twoWeeksAgo = new Date(now - 14 * DAY);

// Supabase caps a single response at ~1000 rows; page through to be correct.
async function fetchAll(table, columns) {
  const out = [];
  const size = 1000;
  for (let from = 0; ; from += size) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .range(from, from + size - 1);
    if (error) throw new Error(`${table}: ${error.message}`);
    out.push(...data);
    if (data.length < size) break;
  }
  return out;
}

// `exposed` is a newer column; tolerate a live DB where its migration hasn't
// been applied yet by retrying the locations query without it.
const locCols =
  "id, type, resource, planet, exposed, is_hidden, submitted_by, server_id, created_at";
async function fetchLocations() {
  try {
    return { rows: await fetchAll("locations", locCols), hasExposed: true };
  } catch (e) {
    if (!/column .*exposed.* does not exist/i.test(e.message)) throw e;
    const rows = await fetchAll("locations", locCols.replace(", exposed", ""));
    return { rows, hasExposed: false };
  }
}

const [profiles, servers, locResult, ratings] = await Promise.all([
  fetchAll("profiles", "id, username, role, banned, created_at"),
  fetchAll("servers", "id, name, created_at"),
  fetchLocations(),
  fetchAll("ratings", "id, score, user_id, location_id, created_at"),
]);
const locations = locResult.rows;

const inWindow = (rows, start, end = now) =>
  rows.filter((r) => {
    const t = new Date(r.created_at);
    return t >= start && t < end;
  });

const serverName = Object.fromEntries(servers.map((s) => [s.id, s.name]));
const username = Object.fromEntries(profiles.map((p) => [p.id, p.username]));

// Group a list into a sorted [key, count] array.
function tally(rows, keyFn, { limit = Infinity } = {}) {
  const m = new Map();
  for (const r of rows) {
    const k = keyFn(r) ?? "—";
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
}

const newUsersWeek = inWindow(profiles, weekAgo);
const newUsersPrev = inWindow(profiles, twoWeeksAgo, weekAgo);
const newLocWeek = inWindow(locations, weekAgo);
const newLocPrev = inWindow(locations, twoWeeksAgo, weekAgo);
const newRateWeek = inWindow(ratings, weekAgo);
const newRatePrev = inWindow(ratings, twoWeeksAgo, weekAgo);

// "Active" = anyone who submitted a location or left a rating in the window.
const activeWeek = new Set([
  ...newLocWeek.map((l) => l.submitted_by),
  ...newRateWeek.map((r) => r.user_id),
]);

const ores = locations.filter((l) => l.type === "ore");
const pois = locations.filter((l) => l.type === "poi");

const stats = {
  generated_at: now.toISOString(),
  window: { week_start: weekAgo.toISOString(), now: now.toISOString() },
  totals: {
    users: profiles.length,
    admins: profiles.filter((p) => p.role === "admin").length,
    banned: profiles.filter((p) => p.banned).length,
    servers: servers.length,
    locations: locations.length,
    ores: ores.length,
    pois: pois.length,
    hidden_locations: locations.filter((l) => l.is_hidden).length,
    exposed_ores: locResult.hasExposed ? ores.filter((l) => l.exposed).length : null,
    ratings: ratings.length,
  },
  this_week: {
    new_users: newUsersWeek.length,
    new_locations: newLocWeek.length,
    new_ores: newLocWeek.filter((l) => l.type === "ore").length,
    new_pois: newLocWeek.filter((l) => l.type === "poi").length,
    new_ratings: newRateWeek.length,
    active_contributors: activeWeek.size,
  },
  prev_week: {
    new_users: newUsersPrev.length,
    new_locations: newLocPrev.length,
    new_ratings: newRatePrev.length,
  },
  top_contributors_week: tally(
    newLocWeek,
    (l) => username[l.submitted_by] ?? "unknown",
    { limit: 5 }
  ),
  top_resources: tally(
    ores.filter((l) => l.resource),
    (l) => l.resource,
    { limit: 8 }
  ),
  by_planet: tally(locations, (l) => l.planet, { limit: 10 }),
  by_server: tally(locations, (l) => serverName[l.server_id] ?? "—", {
    limit: 10,
  }),
};

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(stats, null, 2));
  process.exit(0);
}

// ----- Human-readable report -------------------------------------------------
const pct = (cur, prev) => {
  if (prev === 0) return cur === 0 ? "±0%" : "new";
  const d = Math.round(((cur - prev) / prev) * 100);
  return `${d >= 0 ? "+" : ""}${d}%`;
};
const line = "─".repeat(52);
const rows = (pairs) =>
  pairs.length
    ? pairs.map(([k, v]) => `    ${String(v).padStart(4)}  ${k}`).join("\n")
    : "    (none)";

console.log(`
${line}
 Space Engineers Ore & POI Registry — Weekly Usage
 ${now.toISOString().slice(0, 10)}  (last 7 days vs prior 7 days)
${line}

 ALL-TIME TOTALS
    ${stats.totals.users} users  (${stats.totals.admins} admin, ${stats.totals.banned} banned)
    ${stats.totals.locations} locations  (${stats.totals.ores} ore, ${stats.totals.pois} POI, ${stats.totals.hidden_locations} hidden)
    ${stats.totals.exposed_ores ?? "n/a"} exposed ores · ${stats.totals.ratings} ratings · ${stats.totals.servers} servers

 THIS WEEK
    New users ........... ${stats.this_week.new_users}   (${pct(stats.this_week.new_users, stats.prev_week.new_users)} vs prior week)
    New locations ....... ${stats.this_week.new_locations}   (${pct(stats.this_week.new_locations, stats.prev_week.new_locations)} vs prior week)
       ↳ ${stats.this_week.new_ores} ore, ${stats.this_week.new_pois} POI
    New ratings ......... ${stats.this_week.new_ratings}   (${pct(stats.this_week.new_ratings, stats.prev_week.new_ratings)} vs prior week)
    Active contributors . ${stats.this_week.active_contributors}

 TOP CONTRIBUTORS (this week)
${rows(stats.top_contributors_week)}

 LOCATIONS BY RESOURCE (all-time, ores)
${rows(stats.top_resources)}

 LOCATIONS BY PLANET (all-time)
${rows(stats.by_planet)}

 LOCATIONS BY SERVER (all-time)
${rows(stats.by_server)}
${line}
`);
