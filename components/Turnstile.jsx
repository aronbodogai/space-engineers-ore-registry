"use client";

import { useEffect, useRef, useState } from "react";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

/**
 * Cloudflare Turnstile widget (explicit render).
 *
 * Emits the verification token as a hidden `cf-turnstile-response` field so it
 * is included automatically in form / Server Action submissions, and also calls
 * the optional `onToken` callback (useful for enabling a submit button only once
 * the challenge has passed).
 *
 * Requires NEXT_PUBLIC_TURNSTILE_SITE_KEY. For local development without a real
 * widget, use Cloudflare's always-passing test keys (see .env.example).
 */
export default function Turnstile({ onToken, className }) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const onTokenRef = useRef(onToken);
  onTokenRef.current = onToken;

  const [token, setToken] = useState("");
  const [ready, setReady] = useState(false);

  // Load the Cloudflare script once per page.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.turnstile) {
      setReady(true);
      return;
    }
    let script = document.querySelector("script[data-turnstile]");
    const onLoad = () => setReady(true);
    if (!script) {
      script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.dataset.turnstile = "true";
      document.head.appendChild(script);
    }
    script.addEventListener("load", onLoad);
    return () => script.removeEventListener("load", onLoad);
  }, []);

  // Render the widget once the script is ready.
  useEffect(() => {
    if (!ready || !SITE_KEY || !containerRef.current) return;
    if (widgetIdRef.current !== null) return;

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: SITE_KEY,
      callback: (t) => {
        setToken(t);
        onTokenRef.current?.(t);
      },
      "error-callback": () => {
        setToken("");
        onTokenRef.current?.("");
      },
      "expired-callback": () => {
        setToken("");
        onTokenRef.current?.("");
      },
    });

    return () => {
      if (widgetIdRef.current !== null && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // Widget already gone (e.g. fast navigation) — nothing to clean up.
        }
        widgetIdRef.current = null;
      }
    };
  }, [ready]);

  if (!SITE_KEY) {
    return (
      <p className="alert alert-warn">
        Turnstile is not configured. Set <code>NEXT_PUBLIC_TURNSTILE_SITE_KEY</code>{" "}
        (and <code>TURNSTILE_SECRET_KEY</code> on the server) to enable bot
        protection.
      </p>
    );
  }

  return (
    <div className={className}>
      <div ref={containerRef} />
      <input type="hidden" name="cf-turnstile-response" value={token} />
    </div>
  );
}
