"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { bulkImport } from "./actions";
import { parseGps } from "../../../lib/gps";
import { guessResource } from "../../../lib/resources";
import {
  ORE_RESOURCES,
  ENVIRONMENTS,
  DEFAULT_ENVIRONMENT,
} from "../../../lib/constants";
import { seColorToCss, formatCoords } from "../../../lib/format";
import Turnstile from "../../../components/Turnstile";
import SubmitButton from "../../../components/SubmitButton";

const TURNSTILE_ENABLED = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

// Monotonic key for React list rows — survives edits and removals.
let rowKeySeq = 0;

export default function BulkImportForm({ servers }) {
  const [state, formAction] = useActionState(bulkImport, {});

  const [serverId, setServerId] = useState(servers[0]?.id ?? "");
  const [raw, setRaw] = useState("");
  const [rows, setRows] = useState([]);
  const [skipped, setSkipped] = useState([]);
  const [dupes, setDupes] = useState(0);
  const [parsedOnce, setParsedOnce] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  const lineCount = useMemo(
    () => raw.split(/\r?\n/).filter((l) => l.trim() !== "").length,
    [raw]
  );

  function parse() {
    const nextRows = [];
    const nextSkipped = [];
    const seen = new Set();
    let dup = 0;

    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (trimmed === "") continue;

      const result = parseGps(trimmed);
      if (!result.ok) {
        nextSkipped.push({ line: trimmed, error: result.error });
        continue;
      }

      const key = result.value.gps_raw.toLowerCase();
      if (seen.has(key)) {
        dup++;
        continue;
      }
      seen.add(key);

      const resource = guessResource(result.value.name);
      nextRows.push({
        key: ++rowKeySeq,
        gps_raw: result.value.gps_raw,
        name: result.value.name,
        x: result.value.x,
        y: result.value.y,
        z: result.value.z,
        color: result.value.color,
        type: resource ? "ore" : "poi",
        resource: resource ?? "",
        environment: DEFAULT_ENVIRONMENT,
      });
    }

    setRows(nextRows);
    setSkipped(nextSkipped);
    setDupes(dup);
    setParsedOnce(true);
  }

  function updateRow(key, patch) {
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }
  function removeRow(key) {
    setRows((rs) => rs.filter((r) => r.key !== key));
  }

  // Clear the grid after a successful import so the next paste starts clean.
  // Depend on the whole state object — useActionState returns a fresh one per
  // dispatch, so repeat imports with the same count still trigger this.
  useEffect(() => {
    if (state?.imported) {
      setRows([]);
      setSkipped([]);
      setDupes(0);
      setRaw("");
      setParsedOnce(false);
    }
  }, [state]);

  const oreMissingResource = rows.some(
    (r) => r.type === "ore" && r.resource.trim() === ""
  );

  const blocked =
    rows.length === 0 ||
    !serverId ||
    oreMissingResource ||
    (TURNSTILE_ENABLED && !hasToken);

  // The server re-parses gps_raw, so only send what it can't re-derive.
  const payload = JSON.stringify(
    rows.map((r) => ({
      gps_raw: r.gps_raw,
      type: r.type,
      resource: r.resource,
      environment: r.environment,
    }))
  );

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && <p className="alert alert-error">{state.error}</p>}
      {state?.imported ? (
        <div className="alert alert-success space-y-1">
          <p className="font-medium">
            Imported {state.imported} location
            {state.imported === 1 ? "" : "s"}.
            {state.skipped ? ` ${state.skipped} skipped.` : ""}
          </p>
          <Link className="link" href={`/locations?server=${serverId}`}>
            View them on the browse page →
          </Link>
        </div>
      ) : null}

      {/* Server — chosen once for the whole batch */}
      <div>
        <label className="label" htmlFor="server_id">
          Server / world
        </label>
        <select
          className="select"
          id="server_id"
          name="server_id"
          value={serverId}
          onChange={(e) => setServerId(e.target.value)}
          required
        >
          {servers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-muted">
          Every pasted coordinate is imported under this world.
        </p>
      </div>

      {/* Paste box */}
      <div>
        <label className="label" htmlFor="raw">
          GPS strings — one per line
        </label>
        <textarea
          className="textarea font-mono text-xs"
          id="raw"
          rows={8}
          placeholder={
            "GPS:Ag:12345:678:-90123:#FF75C9F1:\nGPS:Ice 2:5000:1200:-8000:#FF00BFFF:"
          }
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
        />
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
          <button
            type="button"
            className="btn-ghost"
            onClick={parse}
            disabled={lineCount === 0}
          >
            Parse{lineCount ? ` ${lineCount} line${lineCount === 1 ? "" : "s"}` : ""}
          </button>
          {parsedOnce && (
            <span className="text-xs text-muted">
              {rows.length} ready
              {skipped.length ? ` · ${skipped.length} skipped` : ""}
              {dupes ? ` · ${dupes} duplicate${dupes === 1 ? "" : "s"} removed` : ""}
            </span>
          )}
          <span className="ml-auto text-xs text-muted">Up to 500 at a time</span>
        </div>
      </div>

      {/* Lines that couldn't be parsed */}
      {skipped.length > 0 && (
        <div className="alert alert-warn space-y-1">
          <p className="font-medium">
            {skipped.length} line{skipped.length === 1 ? "" : "s"} couldn&apos;t be
            parsed:
          </p>
          <ul className="space-y-1 text-xs">
            {skipped.map((s, i) => (
              <li key={i} className="break-all font-mono">
                <span className="text-red-300">{s.error}</span> — {s.line}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Editable preview grid */}
      {rows.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-xs text-muted">
              <tr>
                <th className="p-2 font-medium">Name &amp; coords</th>
                <th className="p-2 font-medium">Type</th>
                <th className="p-2 font-medium">Resource</th>
                <th className="p-2 font-medium">Environment</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key} className="border-t border-border align-top">
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      {r.color && (
                        <span
                          className="inline-block h-3 w-3 shrink-0 rounded-sm border border-border"
                          style={{
                            background: seColorToCss(r.color) ?? r.color,
                          }}
                        />
                      )}
                      <span className="font-medium">{r.name}</span>
                    </div>
                    <div className="mt-0.5 font-mono text-[11px] text-muted">
                      {formatCoords(r.x, r.y, r.z)}
                    </div>
                  </td>
                  <td className="p-2">
                    <select
                      className="select"
                      value={r.type}
                      onChange={(e) => updateRow(r.key, { type: e.target.value })}
                      aria-label={`Type for ${r.name}`}
                    >
                      <option value="ore">Ore</option>
                      <option value="poi">POI</option>
                    </select>
                  </td>
                  <td className="p-2">
                    {r.type === "ore" ? (
                      <input
                        className="input"
                        list="bulk-resources"
                        value={r.resource}
                        onChange={(e) =>
                          updateRow(r.key, { resource: e.target.value })
                        }
                        placeholder="e.g. Ice"
                        aria-label={`Resource for ${r.name}`}
                        aria-invalid={r.resource.trim() === ""}
                      />
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="p-2">
                    <select
                      className="select"
                      value={r.environment}
                      onChange={(e) =>
                        updateRow(r.key, { environment: e.target.value })
                      }
                      aria-label={`Environment for ${r.name}`}
                    >
                      {ENVIRONMENTS.map((env) => (
                        <option key={env} value={env}>
                          {env}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2 text-right">
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => removeRow(r.key)}
                      aria-label={`Remove ${r.name}`}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <datalist id="bulk-resources">
            {ORE_RESOURCES.map((r) => (
              <option key={r} value={r} />
            ))}
          </datalist>
        </div>
      )}

      {oreMissingResource && (
        <p className="text-xs text-amber-300">
          Every ore row needs a resource — fill the blanks or switch the row to
          POI.
        </p>
      )}

      <input type="hidden" name="rows" value={payload} />

      <Turnstile onToken={(t) => setHasToken(!!t)} />

      <SubmitButton disabled={blocked} pendingText="Importing…">
        Import{rows.length ? ` ${rows.length}` : ""} location
        {rows.length === 1 ? "" : "s"}
      </SubmitButton>
    </form>
  );
}
