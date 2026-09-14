"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Copies the original GPS string to the clipboard for pasting back in-game.
 *
 * On success the button flips to a green "Copied!" for a moment, so the click
 * is visibly acknowledged even though nothing else on the page changes. If the
 * browser refuses the clipboard (older browser, insecure context, permission
 * denied) it says so instead of silently doing nothing — the raw string is
 * printed next to the button either way.
 */
export default function CopyGpsButton({ gps }) {
  const [status, setStatus] = useState("idle"); // idle | copied | failed
  const timer = useRef(null);

  // Clear a pending reset if the button unmounts mid-flash.
  useEffect(() => () => clearTimeout(timer.current), []);

  function flash(next) {
    setStatus(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus("idle"), 1500);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(gps);
      flash("copied");
    } catch {
      flash(legacyCopy(gps) ? "copied" : "failed");
    }
  }

  const label = { copied: "Copied!", failed: "Copy blocked" }[status] ?? "Copy GPS";
  const className = { copied: "btn-success", failed: "btn-danger" }[status] ?? "btn-primary";

  return (
    <>
      <button type="button" onClick={copy} className={className}>
        {status === "copied" && <CheckIcon />}
        {label}
      </button>
      {/* The announcement lives outside the button on purpose. Making the
          button its own live region would also announce the revert 1.5s later,
          reading "Copy GPS" at a user who has already moved on. Clearing this
          node back to "" is a removal, which is not announced. */}
      <span role="status" className="sr-only">
        {status === "copied"
          ? "GPS copied to clipboard"
          : status === "failed"
            ? "Copy blocked"
            : ""}
      </span>
    </>
  );
}

/**
 * Fallback for browsers that reject the async Clipboard API. Copies from an
 * offscreen textarea via the deprecated execCommand; returns whether it worked.
 */
function legacyCopy(text) {
  try {
    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.cssText = "position:fixed;top:0;left:-9999px;opacity:0";
    document.body.appendChild(field);
    field.select();
    const ok = document.execCommand("copy");
    field.remove();
    return ok;
  } catch {
    return false;
  }
}

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="3,8.5 6.5,12 13,4" />
    </svg>
  );
}
