"use client";

import { useFormStatus } from "react-dom";

/**
 * Submit button for destructive actions. Shows a native confirm() dialog before
 * allowing the enclosing form to submit, and a pending state while it runs.
 */
export default function ConfirmButton({
  children,
  message,
  className = "btn-danger",
  ...props
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={className}
      disabled={pending}
      onClick={(e) => {
        if (message && !window.confirm(message)) e.preventDefault();
      }}
      {...props}
    >
      {pending ? "Working…" : children}
    </button>
  );
}
