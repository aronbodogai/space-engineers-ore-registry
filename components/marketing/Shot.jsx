/**
 * Frame around a landing-page mockup, so a block of real UI reads as a
 * screenshot of the site — `path` fills a browser address pill, or pass
 * `label` instead for the game-client frame.
 *
 * The contents are live components rather than a captured image: they stay
 * sharp at any zoom and can't drift out of date with the real pages. Two
 * consequences are handled here rather than left to each caller.
 *
 * Honesty: `caption` is required and visible. These frames are convincing
 * enough to be mistaken for registry contents, so each one says what it is.
 *
 * Assistive tech: an inert frame is announced as a single image with the
 * caption as its description, the same way the PNG it imitates would be —
 * `inert` goes on the inner element, since it would otherwise hide the
 * aria-label on its own node. Pass `interactive` for a frame holding a real
 * control (step three mounts the actual copy button); it stays reachable.
 */
export default function Shot({
  path,
  label,
  chip,
  caption,
  interactive = false,
  children,
}) {
  return (
    <figure className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex items-center gap-3 border-b border-border px-3 py-2">
        {path ? (
          <>
            <span aria-hidden className="flex gap-1.5">
              <Dot />
              <Dot />
              <Dot />
            </span>
            <span className="truncate rounded-md bg-bg px-2 py-1 font-mono text-[11px] text-muted">
              {path}
            </span>
          </>
        ) : (
          <span className="truncate text-xs font-medium text-muted">{label}</span>
        )}
        {chip && (
          <span className="badge ml-auto shrink-0 text-[10px]">{chip}</span>
        )}
      </div>

      <div
        className="overflow-x-auto bg-bg p-3 sm:p-4"
        {...(interactive
          ? {}
          : { role: "img", "aria-label": caption })}
      >
        {interactive ? (
          children
        ) : (
          <div inert={true} className="select-none">
            {children}
          </div>
        )}
      </div>

      <figcaption className="border-t border-border px-3 py-2 text-xs text-muted">
        {caption}
      </figcaption>
    </figure>
  );
}

function Dot() {
  return <span className="inline-block h-2 w-2 rounded-full bg-border" />;
}
