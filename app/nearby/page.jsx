import Link from "next/link";
import { createClient } from "../../lib/supabase/server";
import LocationCard from "../../components/LocationCard";
import NearbyForm from "./NearbyForm";
import { parseGps, distance3d } from "../../lib/gps";
import { formatCoords } from "../../lib/format";

export const metadata = {
  title: "Find nearest — Ore & POI Registry",
  description:
    "Paste your in-game GPS and find the closest Space Engineers ore deposits and points of interest on a world, sorted by distance.",
};

const CARD_SELECT =
  "id, name, type, resource, planet, color, x, y, z, server_name, avg_score, rating_count";

// Coordinates are only comparable within one server, so we fetch that server's
// locations and rank them by 3-D distance in JS (reusing distance3d). This cap
// guards against pulling an unbounded set; realistic worlds hold far fewer. If a
// world ever exceeds it, the scale-up path is a SQL function like the existing
// nearby_locations() that sorts/limits in the database.
const MAX_FETCH = 1000;
const RESULT_LIMITS = [10, 20, 50];
const DEFAULT_LIMIT = 20;

// Public GET search (no Turnstile) to stay shareable and crawlable — same
// decision as the browse page (see app/locations/page.jsx).

export default async function NearbyPage({ searchParams }) {
  const sp = await searchParams;
  const str = (v) => (typeof v === "string" ? v : "");
  const limitNum = parseInt(str(sp.limit), 10);
  const params = {
    gps: str(sp.gps),
    server: str(sp.server),
    type: str(sp.type),
    resource: str(sp.resource),
    radius: str(sp.radius),
    limit: RESULT_LIMITS.includes(limitNum) ? limitNum : DEFAULT_LIMIT,
  };

  const supabase = await createClient();
  const { data: servers } = await supabase
    .from("servers")
    .select("id, name")
    .order("name");

  const gpsProvided = params.gps.trim() !== "";
  const serverProvided = params.server !== "";
  const submitted = gpsProvided || serverProvided;
  const parsed = gpsProvided ? parseGps(params.gps) : null;

  // Decide what to render: a guidance message, an error, or ranked results.
  let view = "idle"; // idle | needGps | needServer | parseError | results
  let parseError = "";
  let queryError = "";
  let results = [];

  if (submitted) {
    if (gpsProvided && !parsed.ok) {
      view = "parseError";
      parseError = parsed.error;
    } else if (!serverProvided) {
      view = "needServer";
    } else if (!gpsProvided) {
      view = "needGps";
    } else {
      view = "results";

      let query = supabase
        .from("locations_with_stats")
        .select(CARD_SELECT)
        .eq("is_hidden", false)
        .eq("server_id", params.server)
        .limit(MAX_FETCH);

      if (params.type === "ore" || params.type === "poi") {
        query = query.eq("type", params.type);
      }
      if (params.resource.trim()) {
        query = query.ilike("resource", `%${params.resource.trim()}%`);
      }

      const { data, error } = await query;
      if (error) {
        queryError = error.message;
      } else {
        const origin = parsed.value;
        const maxMeters = parseFloat(params.radius) * 1000; // km → in-game meters
        const capped = Number.isFinite(maxMeters) && maxMeters > 0;
        results = (data ?? [])
          .map((loc) => ({ loc, distance: distance3d(origin, loc) }))
          .filter((r) => (capped ? r.distance <= maxMeters : true))
          .sort((a, b) => a.distance - b.distance)
          .slice(0, params.limit);
      }
    }
  }

  const serverName =
    servers?.find((s) => s.id === params.server)?.name ?? "";

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Find nearest</h1>
        <Link className="btn-ghost" href="/locations">
          Browse all
        </Link>
      </div>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Paste a GPS string from the game — your ship, a beacon, anywhere — and
        pick the world it&apos;s in. We&apos;ll list the closest charted ores and
        points of interest, nearest first.
      </p>

      <div className="mt-6">
        <NearbyForm
          servers={servers ?? []}
          params={params}
          limits={RESULT_LIMITS}
        />
      </div>

      {view === "parseError" && (
        <p className="alert alert-error mt-6">{parseError}</p>
      )}

      {view === "needServer" && (
        <p className="alert alert-warn mt-6">
          Choose a server — coordinates are only comparable within the same
          world.
        </p>
      )}

      {view === "needGps" && (
        <p className="alert alert-warn mt-6">
          Paste your GPS location to find what&apos;s nearby.
        </p>
      )}

      {view === "results" && queryError && (
        <p className="alert alert-error mt-6">
          Couldn&apos;t search locations: {queryError}
        </p>
      )}

      {view === "results" && !queryError && (
        <>
          <p className="mt-6 text-sm text-muted">
            {results.length === 0
              ? "No matching locations on "
              : `${results.length} closest location${
                  results.length === 1 ? "" : "s"
                } to ${formatCoords(parsed.value.x, parsed.value.y, parsed.value.z)} on `}
            <span className="text-text">{serverName}</span>
            {params.radius && parseFloat(params.radius) > 0
              ? ` within ${params.radius} km`
              : ""}
            .
          </p>

          {results.length > 0 && (
            <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {results.map(({ loc, distance }) => (
                <LocationCard key={loc.id} loc={loc} distance={distance} />
              ))}
            </div>
          )}
        </>
      )}

      {view === "idle" && (
        <p className="mt-6 text-sm text-muted">
          Results appear here, sorted by distance.
        </p>
      )}
    </main>
  );
}
