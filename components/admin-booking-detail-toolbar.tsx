"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { updateAvailabilityRequestStatusAction, updateReservationLifecycleAction } from "@/app/(admin)/admin/actions";

type AdminBookingDetailToolbarProps = {
  canCancel?: boolean;
  canComplete?: boolean;
  canReject?: boolean;
  copiedLabel: string;
  copyLabel: string;
  emailHref: string | null;
  emailLabel: string;
  locale: "en" | "vi";
  printLabel: string;
  requestId?: string;
  reservationId?: string;
  returnTo?: string;
  workflowHref: string | null;
  workflowLabel: string;
};

export function AdminBookingDetailToolbar({
  canCancel,
  canComplete,
  canReject,
  copiedLabel,
  copyLabel,
  emailHref,
  emailLabel,
  locale,
  printLabel,
  requestId,
  reservationId,
  returnTo,
  workflowHref,
  workflowLabel
}: AdminBookingDetailToolbarProps) {
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  function handleComplete() {
    if (!reservationId || !returnTo) return;
    const reason = window.prompt(locale === "en" ? "Optional completion note:" : "Ghi chú khi hoàn tất booking (không bắt buộc):") ?? "";
    const formData = new FormData();
    formData.append("reservationId", reservationId);
    formData.append("status", "completed");
    formData.append("returnTo", returnTo);
    formData.append("reason", reason);
    startTransition(() => {
      updateReservationLifecycleAction(formData);
    });
  }

  function handleCancel() {
    if (!reservationId || !returnTo) return;
    const reason = window.prompt(locale === "en" ? "Required cancellation reason:" : "Bắt buộc nhập lý do hủy booking:");
    if (!reason) return;
    const formData = new FormData();
    formData.append("reservationId", reservationId);
    formData.append("status", "cancelled");
    formData.append("returnTo", returnTo);
    formData.append("reason", reason);
    startTransition(() => {
      updateReservationLifecycleAction(formData);
    });
  }

  function handleReject() {
    if (!requestId || !returnTo) return;
    const note = window.prompt(locale === "en" ? "Required rejection reason:" : "Bắt buộc nhập lý do từ chối:");
    if (!note) return;
    const formData = new FormData();
    formData.append("availabilityRequestId", requestId);
    formData.append("status", "rejected");
    formData.append("returnTo", returnTo);
    formData.append("note", note);
    startTransition(() => {
      updateAvailabilityRequestStatusAction(formData);
    });
  }

  return (
    <div className="admin-booking-detail__toolbar">
      {workflowHref ? (
        <Link className="button button--text-light admin-booking-detail__toolbar-link" href={workflowHref}>
          {workflowLabel}
        </Link>
      ) : null}
      <button className="button button--solid admin-booking-detail__toolbar-link" onClick={() => window.print()} type="button">
        {printLabel}
      </button>
      {emailHref ? (
        <a className="button button--text-light admin-booking-detail__toolbar-link" href={emailHref}>
          {emailLabel}
        </a>
      ) : null}
      <button className="button button--text-light admin-booking-detail__toolbar-link" onClick={handleCopyLink} type="button">
        {copied ? copiedLabel : copyLabel}
      </button>
      {canComplete && (
        <button className="button button--solid admin-booking-detail__toolbar-link" disabled={isPending} onClick={handleComplete} type="button" style={{ backgroundColor: "#3f8c54", borderColor: "#3f8c54", color: "#fff" }}>
          {locale === "en" ? "Complete" : "Hoàn tất"}
        </button>
      )}
      {canCancel && (
        <button className="button button--solid admin-booking-detail__toolbar-link" disabled={isPending} onClick={handleCancel} type="button" style={{ backgroundColor: "#ffecec", borderColor: "#d85454", color: "#b14e4e" }}>
          {locale === "en" ? "Cancel Booking" : "Hủy Booking"}
        </button>
      )}
      {canReject && (
        <button className="button button--solid admin-booking-detail__toolbar-link" disabled={isPending} onClick={handleReject} type="button" style={{ backgroundColor: "#ffecec", borderColor: "#d85454", color: "#b14e4e" }}>
          {locale === "en" ? "Reject" : "Từ chối"}
        </button>
      )}
    </div>
  );
}
