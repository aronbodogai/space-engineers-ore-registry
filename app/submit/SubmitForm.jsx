"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { submitLocation } from "./actions";
import { parseGps } from "../../lib/gps";
import { createClient } from "../../lib/supabase/client";
import {
  ENVIRONMENTS,
  DEFAULT_ENVIRONMENT,
  ORE_RESOURCES,
  PHOTO_BUCKET,
} from "../../lib/constants";
import { seColorToCss } from "../../lib/format";
import Turnstile from "../../components/Turnstile";
import SubmitButton from "../../components/SubmitButton";

const TURNSTILE_ENABLED = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export default function SubmitForm({ servers }) {
  const [state, formAction] = useActionState(submitLocation, {});

  const [gps, setGps] = useState("");
  const [serverId, setServerId] = useState(servers[0]?.id ?? "");
  const [type, setType] = useState("ore");
  const [acknowledged, setAcknowledged] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  const [nearby, setNearby] = useState([]);
  const [checking, setChecking] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageError, setImageError] = useState("");

  const parsed = useMemo(() => parseGps(gps), [gps]);
  const coords = parsed.ok ? parsed.value : null;
  const showParseError = gps.trim() !== "" && !parsed.ok;

  // Advisory near-duplicate check: same server, within 5 km. The user can still
  // submit after reviewing matches (SPEC.md §6.2).
  useEffect(() => {
    if (!coords || !serverId) {
      setNearby([]);
      return;
    }
    let cancelled = false;
    setChecking(true);
    const handle = setTimeout(async () => {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("nearby_locations", {
        p_server_id: serverId,
        p_x: coords.x,
        p_y: coords.y,
        p_z: coords.z,
      });
      if (!cancelled) {
        setNearby(error ? [] : data ?? []);
        setChecking(false);
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [coords?.x, coords?.y, coords?.z, serverId]);

  // Reset the acknowledgement whenever the set of matches changes.
  useEffect(() => {
    setAcknowledged(false);
  }, [nearby.length, serverId]);

  async function handleImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError("");
    setUploading(true);
    setImageUrl("");
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from(PHOTO_BUCKET)
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);
      setImageUrl(data.publicUrl);
    } catch (err) {
      setImageError(
        (err?.message || "Upload failed") +
          " — you can still submit without a photo."
      );
    } finally {
      setUploading(false);
    }
  }

  const blocked =
    !coords ||
    !serverId ||
    uploading ||
    (nearby.length > 0 && !acknowledged) ||
    (TURNSTILE_ENABLED && !hasToken);

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && <p className="alert alert-error">{state.error}</p>}

      {/* GPS string */}
      <div>
        <label className="label" htmlFor="gps">
          GPS string
        </label>
        <textarea
          className="textarea font-mono text-xs"
          id="gps"
          name="gps"
          rows={2}
          required
          placeholder="GPS:ICE_9:79138.94:253235.78:-760016.75:#FF75C9F1:"
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

      {/* Server + type */}
      <div className="grid gap-4 sm:grid-cols-2">
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
        </div>

        <div>
          <label className="label" htmlFor="type">
            Type
          </label>
          <select
            className="select"
            id="type"
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="ore">Ore deposit</option>
            <option value="poi">Point of interest</option>
          </select>
        </div>
      </div>

      {/* Resource (ore only) + planet */}
      <div className="grid gap-4 sm:grid-cols-2">
        {type === "ore" && (
          <div>
            <label className="label" htmlFor="resource">
              Ore / resource
            </label>
            <input
              className="input"
              id="resource"
              name="resource"
              list="ore-resources"
              required
              placeholder="e.g. Ice"
            />
            <datalist id="ore-resources">
              {ORE_RESOURCES.map((r) => (
                <option key={r} value={r} />
              ))}
            </datalist>
          </div>
        )}

        <div>
          <label className="label" htmlFor="planet">
            Environment
          </label>
          <select
            className="select"
            id="planet"
            name="planet"
            defaultValue={DEFAULT_ENVIRONMENT}
          >
            {ENVIRONMENTS.map((env) => (
              <option key={env} value={env}>
                {env}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="label" htmlFor="description">
          Description (optional)
        </label>
        <textarea
          className="textarea"
          id="description"
          name="description"
          rows={3}
          placeholder="Notes — richness, hazards, nearby landmarks…"
        />
      </div>

      {/* Optional photo */}
      <div>
        <label className="label" htmlFor="photo">
          Photo (optional)
        </label>
        <input
          className="input"
          id="photo"
          type="file"
          accept="image/*"
          onChange={handleImage}
          disabled={uploading}
        />
        <input type="hidden" name="image_url" value={imageUrl} />
        {uploading && <p className="mt-1 text-xs text-muted">Uploading…</p>}
        {imageUrl && (
          <p className="mt-1 text-xs text-emerald-300">Photo attached.</p>
        )}
        {imageError && <p className="mt-1 text-xs text-amber-300">{imageError}</p>}
      </div>

      {/* Near-duplicate warning */}
      {checking && (
        <p className="text-xs text-muted">Checking for nearby locations…</p>
      )}
      {nearby.length > 0 && (
        <div className="alert alert-warn space-y-2">
          <p className="font-medium">
            {nearby.length} existing location
            {nearby.length === 1 ? "" : "s"} within 5 km on this server:
          </p>
          <ul className="space-y-1">
            {nearby.map((m) => (
              <li key={m.id} className="text-sm">
                <Link className="link" href={`/locations/${m.id}`} target="_blank">
                  {m.name}
                </Link>{" "}
                <span className="text-muted">
                  ({m.type}
                  {m.resource ? `, ${m.resource}` : ""}) —{" "}
                  {Math.round(m.distance)} m away
                </span>
              </li>
            ))}
          </ul>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
            />
            I&apos;ve checked these — this is a different spot.
          </label>
        </div>
      )}

      <Turnstile onToken={(t) => setHasToken(!!t)} />

      <SubmitButton disabled={blocked} pendingText="Submitting…">
        Submit location
      </SubmitButton>
    </form>
  );
}
