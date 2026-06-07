"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { parseGps } from "../../lib/gps";
import { seColorToCss } from "../../lib/format";
import { LOCATION_TYPES, ORE_RESOURCES } from "../../lib/constants";

/**
 * Proximity-search controls for /nearby. A plain GET form so results live in the
 * URL (shareable, SSR — same approach as the browse filters). The GPS field is
 * parsed live for instant feedback, but the page re-parses server-side; this
 * preview is purely advisory.
 */
export default function NearbyForm({ servers, params, limits }) {
  const [gps, setGps] = useState(params.gps ?? "");

  const parsed = useMemo(() => parseGps(gps), [gps]);
  const coords = parsed.ok ? parsed.value : null;
  const showParseError = gps.trim() !== "" && !parsed.ok;

  return (
    <form method="get" action="/nearby" className="card space-y-4">
      {/* Your location */}
      <div>
        <label className="label" htmlFor="gps">
          Your GPS location
        </label>
        <textarea
          className="textarea font-mono text-xs"
          id="gps"
          name="gps"
          rows={2}
          required
          placeholder="GPS:ME:12345.6:67890.1:-13579.2:#FFFFFFFF:"
          value={gps}
          onChange={(e) => setGps(e.target.value)}
        />
        {showParseError && (
          <p className="mt-1 text-xs text-red-300">{parsed.error}</p>
        )}
        {coords && (
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
            <span>
              Name: <span className="text-text">{coords.name}</span>
            </span>
            <span>
              X <span className="text-text">{coords.x}</span>
            </span>
            <span>
              Y <span className="text-text">{coords.y}</span>
            </span>
            <span>
              Z <span className="text-text">{coords.z}</span>
            </span>
            {coords.color && (
              <span className="inline-flex items-center gap-1">
                Color
                <span
                  className="inline-block h-3 w-3 rounded-sm border border-border align-middle"
                  style={{ background: seColorToCss(coords.color) ?? coords.color }}
                />
              </span>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Server is required — coordinates only compare within one world. */}
        <div>
          <label className="label" htmlFor="server">
            Server / world
          </label>
          <select
            className="select"
            id="server"
            name="server"
            defaultValue={params.server}
            required
          >
            <option value="">Choose a server…</option>
            {servers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="type">
            Type
          </label>
          <select
            className="select"
            id="type"
            name="type"
            defaultValue={params.type}
          >
            <option value="">Ores &amp; POIs</option>
            {LOCATION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="resource">
            Resource
          </label>
          <input
            className="input"
            id="resource"
            name="resource"
            list="nearby-resources"
            defaultValue={params.resource}
            placeholder="Any"
          />
          <datalist id="nearby-resources">
            {ORE_RESOURCES.map((r) => (
              <option key={r} value={r} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="label" htmlFor="radius">
            Within (km)
          </label>
          <input
            className="input"
            id="radius"
            name="radius"
            type="number"
            min="0"
            step="any"
            defaultValue={params.radius}
            placeholder="No limit"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="w-28">
          <label className="label" htmlFor="limit">
            Show
          </label>
          <select
            className="select"
            id="limit"
            name="limit"
            defaultValue={String(params.limit)}
          >
            {limits.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end gap-2">
          <button type="submit" className="btn-primary">
            Find nearest
          </button>
          <Link className="btn-ghost" href="/nearby">
            Clear
          </Link>
        </div>
      </div>
    </form>
  );
}
