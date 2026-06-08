import Link from "next/link";
import Stars from "./Stars";
import { seColorToCss, formatCoords, formatDistance } from "../lib/format";

/**
 * Compact card for a location in the browse grid. Pass `distance` (in-game
 * meters) to show a "… away" badge — used by the nearest-location search.
 */
export default function LocationCard({ loc, distance }) {
  const swatch = seColorToCss(loc.color);
  const hasDistance = typeof distance === "number" && Number.isFinite(distance);

  return (
    <Link
      href={`/locations/${loc.id}`}
      className="card block transition-colors hover:border-accent"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {swatch && (
              <span
                className="inline-block h-3 w-3 shrink-0 rounded-sm border border-border"
                style={{ background: swatch }}
              />
            )}
            <h3 className="truncate font-semibold">{loc.name}</h3>
          </div>
          <p className="mt-1 truncate text-xs text-muted">{loc.server_name}</p>
        </div>
        <span className="badge shrink-0">
          {loc.type === "ore" ? "Ore" : "POI"}
        </span>
      </div>

      {(loc.exposed || loc.resource || loc.planet) && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {loc.exposed && <span className="badge badge-exposed">Exposed</span>}
          {loc.resource && <span className="badge">{loc.resource}</span>}
          {loc.planet && <span className="badge">{loc.planet}</span>}
        </div>
      )}

      <p className="mt-3 font-mono text-xs text-muted">
        {formatCoords(loc.x, loc.y, loc.z)}
      </p>

      {hasDistance && (
        <p className="mt-2 text-sm font-semibold text-accent">
          {formatDistance(distance)} away
        </p>
      )}

      <div className="mt-3">
        <Stars value={loc.avg_score} count={loc.rating_count} />
      </div>
    </Link>
  );
}
