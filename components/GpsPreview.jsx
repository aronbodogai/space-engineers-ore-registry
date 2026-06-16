import { seColorToCss } from "../lib/format";

/**
 * Read-only readout of parsed GPS fields (name, X/Y/Z, color swatch). Renders
 * nothing when `coords` is null. Shared by the submit, edit, and nearby forms.
 */
export default function GpsPreview({ coords }) {
  if (!coords) return null;
  return (
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
  );
}
