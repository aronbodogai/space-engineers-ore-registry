"use client";

import { useActionState } from "react";
import { login } from "./actions";
import Turnstile from "../../components/Turnstile";
import SubmitButton from "../../components/SubmitButton";

export default function LoginForm({ next = "/" }) {
  const [state, formAction] = useActionState(login, {});

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

      <Turnstile />

      <SubmitButton className="btn-primary w-full" pendingText="Logging in…">
        Log in
      </SubmitButton>
    </form>
  );
}
