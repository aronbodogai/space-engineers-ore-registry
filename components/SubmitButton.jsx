"use client";

import { useFormStatus } from "react-dom";

/**
 * Submit button that automatically shows a pending state while the enclosing
 * form's Server Action is running. Must be rendered inside a <form>.
 */
export default function SubmitButton({
  children,
  className = "btn-primary",
  pendingText,
  disabled,
  ...props
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={className}
      disabled={pending || disabled}
      {...props}
    >
      {pending ? pendingText ?? "Working…" : children}
    </button>
  );
}
