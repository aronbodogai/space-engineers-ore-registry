/**
 * Read-only star rating display. `value` is 0–5 (may be fractional); `count` is
 * the number of ratings (shown in parentheses when provided).
 */
export default function Stars({ value = 0, count }) {
  const v = Number(value) || 0;
  const rounded = Math.round(v);
  const n = count == null ? null : Number(count) || 0;

  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <span aria-hidden className="tracking-tight">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={i <= rounded ? "text-amber-400" : "text-border"}>
            ★
          </span>
        ))}
      </span>
      {n != null && (
        <span className="text-muted">
          {v ? v.toFixed(1) : "—"}
          {n ? ` (${n})` : ""}
        </span>
      )}
    </span>
  );
}
