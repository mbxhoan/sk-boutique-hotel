"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useFormStatus } from "react-dom";

type PortalSubmitButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  pendingLabel?: ReactNode;
};

export function PortalSubmitButton({
  children,
  className,
  disabled,
  pendingLabel,
  type = "submit",
  ...props
}: PortalSubmitButtonProps) {
  const { pending } = useFormStatus();
  const isBusy = pending || Boolean(disabled);
  const label = pending ? pendingLabel ?? children : children;

  return (
    <button
      {...props}
      className={`portal-submit-button${className ? ` ${className}` : ""}`}
      data-busy={pending ? "true" : undefined}
      disabled={isBusy}
      type={type}
    >
      {pending ? <span aria-hidden="true" className="portal-submit-button__spinner" /> : null}
      <span className="portal-submit-button__label">{label}</span>
    </button>
  );
}
