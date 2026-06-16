"use client";

import { useActionState, useMemo, useState } from "react";
import { updateLocation } from "./actions";
import { parseGps } from "../../../../lib/gps";
import {
  ENVIRONMENTS,
  DEFAULT_ENVIRONMENT,
  ORE_RESOURCES,
  ORE_SIZES,
} from "../../../../lib/constants";
import { usePhotoUpload } from "../../../../lib/usePhotoUpload";
import SubmitButton from "../../../../components/SubmitButton";
import GpsPreview from "../../../../components/GpsPreview";

export default function EditForm({ servers, location }) {
  const [state, formAction] = useActionState(updateLocation, {});

  const [gps, setGps] = useState(location.gps_raw ?? "");
  const [type, setType] = useState(location.type);
  const { uploading, imageUrl, imageError, handleImage } = usePhotoUpload({
    initialUrl: location.image_url ?? "",
    failureHint: " — keeping current photo.",
  });

  const parsed = useMemo(() => parseGps(gps), [gps]);
  const coords = parsed.ok ? parsed.value : null;
  const showParseError = gps.trim() !== "" && !parsed.ok;

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
        <GpsPreview coords={coords} />
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

      {type === "ore" && (
        <div className="sm:max-w-xs">
          <label className="label" htmlFor="size">
            Size (optional)
          </label>
          <select
            className="select"
            id="size"
            name="size"
            defaultValue={location.size ?? ""}
          >
            <option value="">— unspecified —</option>
            {ORE_SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      )}

      {type === "ore" && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="exposed"
            defaultChecked={location.exposed}
          />
          Exposed deposit — visible on the surface, easy to mine
        </label>
      )}

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
