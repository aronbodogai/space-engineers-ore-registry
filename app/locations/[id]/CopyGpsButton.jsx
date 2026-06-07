"use client";

import { useState } from "react";

/** Copies the original GPS string to the clipboard for pasting back in-game. */
export default function CopyGpsButton({ gps }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(gps);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked (e.g. insecure context) — no-op; the string is shown.
    }
  }

  return (
    <button type="button" onClick={copy} className="btn-primary">
      {copied ? "Copied!" : "Copy GPS"}
    </button>
  );
}
