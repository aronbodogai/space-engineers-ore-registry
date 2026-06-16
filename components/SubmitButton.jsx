"use client";

import { useFormStatus } from "react-dom";

/**
 * Submit button with an automatic pending state — must be rendered inside a
 * <form>. Pass `confirm` to require a native confirm() dialog before the form
 * submits (use for destructive actions; defaults to the danger style then).
 */
export default function SubmitButton({
  children,
  className,
  pendingText,
  disabled,
  confirm,
  onClick,
  ...props
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={className ?? (confirm ? "btn-danger" : "btn-primary")}
      disabled={pending || disabled}
      onClick={(e) => {
        if (confirm && !window.confirm(confirm)) {
          e.preventDefault();
          return;
        }
        onClick?.(e);
      }}
      {...props}
    >
      {pending ? pendingText ?? "Working…" : children}
    </button>
  );
}
