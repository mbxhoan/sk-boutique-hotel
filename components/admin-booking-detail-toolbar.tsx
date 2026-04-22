"use client";

import Link from "next/link";
import { useState } from "react";

type AdminBookingDetailToolbarProps = {
  backHref: string;
  backLabel: string;
  copyLabel: string;
  copiedLabel: string;
  emailHref: string | null;
  emailLabel: string;
  printLabel: string;
  workflowHref: string | null;
  workflowLabel: string;
};

export function AdminBookingDetailToolbar({
  backHref,
  backLabel,
  copyLabel,
  copiedLabel,
  emailHref,
  emailLabel,
  printLabel,
  workflowHref,
  workflowLabel
}: AdminBookingDetailToolbarProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="admin-booking-detail__toolbar">
      <Link className="button button--text-light admin-booking-detail__toolbar-link" href={backHref}>
        {backLabel}
      </Link>
      {workflowHref ? (
        <Link className="button button--text-light admin-booking-detail__toolbar-link" href={workflowHref}>
          {workflowLabel}
        </Link>
      ) : null}
      {emailHref ? (
        <a className="button button--text-light admin-booking-detail__toolbar-link" href={emailHref}>
          {emailLabel}
        </a>
      ) : null}
      <button className="button button--solid admin-booking-detail__toolbar-link" onClick={() => window.print()} type="button">
        {printLabel}
      </button>
      <button className="button button--text-light admin-booking-detail__toolbar-link" onClick={handleCopyLink} type="button">
        {copied ? copiedLabel : copyLabel}
      </button>
    </div>
  );
}
