"use client";

import { useActionState, useMemo, useState } from "react";
import { updateLocation } from "./actions";
import { parseGps } from "../../../../lib/gps";
import { createClient } from "../../../../lib/supabase/client";
import {
  ENVIRONMENTS,
  DEFAULT_ENVIRONMENT,
  ORE_RESOURCES,
  PHOTO_BUCKET,
} from "../../../../lib/constants";
import { seColorToCss } from "../../../../lib/format";
import SubmitButton from "../../../../components/SubmitButton";

export default function EditForm({ servers, location }) {
  const [state, formAction] = useActionState(updateLocation, {});

  const [gps, setGps] = useState(location.gps_raw ?? "");
  const [type, setType] = useState(location.type);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(location.image_url ?? "");
  const [imageError, setImageError] = useState("");

  const parsed = useMemo(() => parseGps(gps), [gps]);
  const coords = parsed.ok ? parsed.value : null;
  const showParseError = gps.trim() !== "" && !parsed.ok;

  async function handleImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError("");
    setUploading(true);
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
      setImageError((err?.message || "Upload failed") + " — keeping current photo.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && <p className="alert alert-error">{state.error}</p>}
      <input type="hidden" name="id" value={location.id} />

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
              <span
                className="inline-block h-3 w-3 rounded-sm border border-border"
                style={{ background: seColorToCss(coords.color) ?? coords.color }}
              />
            )}
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="server_id">
            Server / world
          </label>
          <select
            className="select"
            id="server_id"
            name="server_id"
            defaultValue={location.server_id}
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
              defaultValue={location.resource ?? ""}
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
            defaultValue={location.planet || DEFAULT_ENVIRONMENT}
          >
            {location.planet && !ENVIRONMENTS.includes(location.planet) && (
              <option value={location.planet}>{location.planet} (legacy)</option>
            )}
            {ENVIRONMENTS.map((env) => (
              <option key={env} value={env}>
                {env}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="description">
          Description (optional)
        </label>
        <textarea
          className="textarea"
          id="description"
          name="description"
          rows={3}
          defaultValue={location.description ?? ""}
        />
      </div>

      <div>
        <label className="label" htmlFor="photo">
          Photo (optional)
        </label>
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt="Current photo"
            className="mb-2 h-32 rounded-lg border border-border object-cover"
          />
        )}
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
        {imageError && <p className="mt-1 text-xs text-amber-300">{imageError}</p>}
      </div>

      <SubmitButton disabled={!coords || uploading} pendingText="Saving…">
        Save changes
      </SubmitButton>
    </form>
  );
}
