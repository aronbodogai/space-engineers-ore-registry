"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup } from "./actions";
import Turnstile from "../../components/Turnstile";
import SubmitButton from "../../components/SubmitButton";

export default function SignupForm() {
  const [state, formAction] = useActionState(signup, {});

  if (state?.notice) {
    return (
      <div className="space-y-4">
        <p className="alert alert-success">{state.notice}</p>
        <Link className="btn-primary w-full" href="/login">
          Go to log in
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && <p className="alert alert-error">{state.error}</p>}

      <div>
        <label className="label" htmlFor="username">
          Username
        </label>
        <input
          className="input"
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          minLength={3}
          maxLength={24}
          required
        />
        <p className="mt-1 text-xs text-muted">
          Shown on your submissions. Letters, numbers, _ and - only.
        </p>
      </div>

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
          autoComplete="new-password"
          minLength={6}
          required
        />
      </div>

      <Turnstile />

      <SubmitButton className="btn-primary w-full" pendingText="Creating…">
        Create account
      </SubmitButton>
    </form>
  );
}
