"use client";

import { useActionState } from "react";
import { createServer } from "./actions";
import SubmitButton from "../../../components/SubmitButton";

export default function CreateServerForm() {
  const [state, formAction] = useActionState(createServer, {});

  return (
    <form action={formAction} className="card space-y-3">
      <h2 className="font-semibold">Add a server / world</h2>
      {state?.error && <p className="alert alert-error">{state.error}</p>}
      {state?.success && <p className="alert alert-success">{state.success}</p>}

      <div>
        <label className="label" htmlFor="new-name">
          Name
        </label>
        <input
          className="input"
          id="new-name"
          name="name"
          required
          placeholder="e.g. Official EU #3"
        />
      </div>

      <div>
        <label className="label" htmlFor="new-description">
          Description (optional)
        </label>
        <input
          className="input"
          id="new-description"
          name="description"
          placeholder="mods, seed, public / private…"
        />
      </div>

      <SubmitButton pendingText="Adding…">Add server</SubmitButton>
    </form>
  );
}
