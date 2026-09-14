import LocationCard from "../LocationCard";
import GpsPreview from "../GpsPreview";
import Shot from "./Shot";
import { formatCoords } from "../../lib/format";
import { SAMPLE_ORIGIN, SAMPLE_RESULTS, SAMPLE_SERVER } from "./samples";

/**
 * Mockup of /nearby with a GPS pasted in: the parsed readout, the filters, and
 * the closest charted deposits ranked by 3-D distance. Static — the controls
 * are for show; the real page is one click away.
 */
export default function NearbyShot() {
  return (
    <Shot
      path="/nearby"
      caption="The Find nearest page with a GPS pasted in: the string parsed back to you, the world picked, and the closest charted deposits ranked by distance. Sample data for illustration — not registry contents."
    >
      <div className="card space-y-4">
        <div>
          <p className="label">Your GPS location</p>
          <p className="textarea overflow-x-auto font-mono text-xs whitespace-nowrap">
            {SAMPLE_ORIGIN.gps_raw}
          </p>
          <GpsPreview coords={SAMPLE_ORIGIN} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Control label="Server / world" value={SAMPLE_SERVER} />
          <Control label="Type" value="Ore deposit" />
          {/* "Any" — the results below mix Cobalt, Silver and Ice, so pinning
              one resource here would contradict them. */}
          <Control label="Resource" value="Any" />
          <Control label="Within (km)" value="10" />
        </div>

        <div className="flex justify-end">
          <span className="btn-primary">Find nearest</span>
        </div>
      </div>

      <p className="mt-4 text-sm text-muted">
        3 closest locations to{" "}
        {formatCoords(SAMPLE_ORIGIN.x, SAMPLE_ORIGIN.y, SAMPLE_ORIGIN.z)} on{" "}
        <span className="text-text">{SAMPLE_SERVER}</span> within 10 km.
      </p>

      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SAMPLE_RESULTS.map(({ loc, distance }) => (
          <LocationCard
            key={loc.id}
            loc={loc}
            distance={distance}
            href="/nearby"
          />
        ))}
      </div>
    </Shot>
  );
}

function Control({ label, value }) {
  return (
    <div>
      <p className="label">{label}</p>
      <p className="select flex items-center justify-between gap-2">
        <span className="truncate">{value}</span>
        <span aria-hidden className="text-muted">
          ▾
        </span>
      </p>
    </div>
  );
}
