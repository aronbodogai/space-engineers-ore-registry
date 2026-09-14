import GpsPreview from "../GpsPreview";
import Shot from "./Shot";
import { SAMPLE_SERVER } from "./samples";

const PASTED = {
  name: "Pt 4",
  x: 9420.77,
  y: 131880.05,
  z: -99640.41,
  color: "#FFE0C36B",
  gps_raw: "GPS:Pt 4:9420.77:131880.05:-99640.41:#FFE0C36B:",
};

/**
 * Mockup of /submit right after a GPS is pasted: the fields the form fills in
 * on its own, and the 5 km duplicate check that runs against the same world.
 */
export default function SubmitShot() {
  return (
    <Shot
      path="/submit"
      caption="The submit form just after a GPS is pasted: ore and exposure read out of the marker name, and one existing deposit 214 m away flagged before anything publishes. Sample data for illustration — not registry contents."
    >
      <div className="space-y-4">
        <div>
          <p className="label">GPS string</p>
          <p className="textarea overflow-x-auto font-mono text-xs whitespace-nowrap">
            {PASTED.gps_raw}
          </p>
          <GpsPreview coords={PASTED} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Filled label="Server / world" value={SAMPLE_SERVER} />
          <Filled label="Type" value="Ore deposit" auto />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Filled label="Ore / resource" value="Platinum" auto />
          <Filled label="Size (optional)" value="Big" />
        </div>

        <p className="flex items-center gap-2 text-sm">
          <span
            aria-hidden
            className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-emerald-400/60 bg-emerald-400/20 text-[10px] text-emerald-300"
          >
            ✓
          </span>
          Exposed deposit — visible on the surface, easy to mine
          <span className="badge badge-exposed">auto</span>
        </p>

        <div className="alert alert-warn space-y-1">
          <p className="font-medium">
            1 existing location within 5 km on this server:
          </p>
          <p className="text-sm">
            <span className="link">Pt 4</span>{" "}
            <span className="text-muted">(ore, Platinum) — 214 m away</span>
          </p>
          <p className="text-sm text-muted">
            Check it&apos;s not the same spot before publishing.
          </p>
        </div>
      </div>
    </Shot>
  );
}

function Filled({ label, value, auto }) {
  return (
    <div>
      <p className="label">
        {label}
        {auto && <span className="ml-2 normal-case text-accent">auto-filled</span>}
      </p>
      <p className="input">{value}</p>
    </div>
  );
}
