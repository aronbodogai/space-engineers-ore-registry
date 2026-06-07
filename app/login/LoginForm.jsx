"use client";

import { useActionState, useState } from "react";
import { login } from "./actions";
import Turnstile from "../../components/Turnstile";
import SubmitButton from "../../components/SubmitButton";

const TURNSTILE_ENABLED = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export default function LoginForm({ next = "/" }) {
  const [state, formAction] = useActionState(login, {});
  const [hasToken, setHasToken] = useState(false);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && <p className="alert alert-error">{state.error}</p>}

      <input type="hidden" name="next" value={next} />

      <div>
        <label className="label" htmlFor="email">
          Email
        </label>
        <input
          className="input"
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </div>

      <div>
        <label className="label" htmlFor="password">
          Password
        </label>
        <input
          className="input"
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>

      <Turnstile onToken={(t) => setHasToken(!!t)} />

      <SubmitButton
        className="btn-primary w-full"
        pendingText="Logging in…"
        disabled={TURNSTILE_ENABLED && !hasToken}
      >
        Log in
      </SubmitButton>
    </form>
  );
}
