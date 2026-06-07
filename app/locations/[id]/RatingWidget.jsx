"use client";

import { useState, useTransition } from "react";
import { rateLocation } from "../actions";

/**
 * Interactive 1–5 star rating. Members get one rating per location; clicking a
 * star upserts it via the rateLocation server action and the page revalidates.
 */
export default function RatingWidget({ locationId, initialScore = 0 }) {
  const [score, setScore] = useState(initialScore);
  const [hover, setHover] = useState(0);
  const [pending, startTransition] = useTransition();
  const display = hover || score;

  function choose(n) {
    setScore(n);
    startTransition(async () => {
      await rateLocation(locationId, n);
    });
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            disabled={pending}
            onMouseEnter={() => setHover(n)}
            onClick={() => choose(n)}
            aria-label={`Rate ${n} star${n === 1 ? "" : "s"}`}
            className={`px-0.5 text-2xl leading-none transition hover:scale-110 ${
              n <= display ? "text-amber-400" : "text-border"
            }`}
          >
            ★
          </button>
        ))}
      </div>
      <span className="text-sm text-muted">
        {score ? `Your rating: ${score}/5` : "Tap a star to rate"}
        {pending ? " · saving…" : ""}
      </span>
    </div>
  );
}
