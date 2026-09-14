import CopyGpsButton from "../CopyGpsButton";
import Stars from "../Stars";
import Shot from "./Shot";
import { formatCoords, seColorToCss } from "../../lib/format";
import { SAMPLE_PICK, SAMPLE_PICK_GPS } from "./samples";

/**
 * Mockup of a location detail page, using the real CopyGpsButton — the button
 * on this page genuinely copies the sample GPS string and flips green, so the
 * last step of the walkthrough is the actual thing rather than a picture of it.
 */
export default function CopyBackShot() {
  const swatch = seColorToCss(SAMPLE_PICK.color);

  return (
    <Shot
      path="/locations/co-3"
      interactive
      caption="A location page. The Copy GPS button here is the real component, not a picture of one — press it and the sample string goes to your clipboard. Sample data for illustration — not registry contents."
    >
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="inline-block h-5 w-5 shrink-0 rounded border border-border"
              style={{ background: swatch }}
            />
            <p className="truncate text-2xl font-bold">{SAMPLE_PICK.name}</p>
          </div>
          <p className="mt-1 text-sm text-muted">{SAMPLE_PICK.server_name}</p>
        </div>
        {/* Full width on a phone: pinned shrink-0 the badges reserve ~193px of
            a 286px header and ellipsize the very name this step is about. */}
        <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:shrink-0">
          <span className="badge badge-exposed">Exposed</span>
          <span className="badge badge-size">Big</span>
          <span className="badge">Ore deposit</span>
        </div>
      </header>

      <section className="card mt-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="label">Coordinates</p>
            <p className="font-mono text-sm">
              {formatCoords(SAMPLE_PICK.x, SAMPLE_PICK.y, SAMPLE_PICK.z)}
            </p>
          </div>
          <CopyGpsButton gps={SAMPLE_PICK_GPS} />
        </div>
        <pre className="mt-4 overflow-x-auto rounded-lg border border-border bg-[#0d1626] p-3 font-mono text-xs text-muted">
          {SAMPLE_PICK_GPS}
        </pre>
      </section>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <dl className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <div>
            <dt className="label">Resource</dt>
            <dd>{SAMPLE_PICK.resource}</dd>
          </div>
          <div>
            <dt className="label">Environment</dt>
            <dd>{SAMPLE_PICK.planet}</dd>
          </div>
        </dl>
        <Stars value={SAMPLE_PICK.avg_score} count={SAMPLE_PICK.rating_count} />
      </div>
    </Shot>
  );
}
