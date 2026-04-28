import { useTransition } from "react";

import {
  resendDepositRequestEmailAction,
  updateAvailabilityRequestStatusAction,
  updateReservationLifecycleAction
} from "@/app/(admin)/admin/actions";
import { verifyPaymentRequestAction } from "@/app/actions/payments";

type AdminBookingDetailToolbarProps = {
  canCancel?: boolean;
  canComplete?: boolean;
  canReject?: boolean;
  canResendEmail?: boolean;
  canVerify?: boolean;
  locale: "en" | "vi";
  paymentRequestId?: string;
  printLabel: string;
  requestId?: string;
  reservationId?: string;
  returnTo?: string;
};

export function AdminBookingDetailToolbar({
  canCancel,
  canComplete,
  canReject,
  canResendEmail,
  canVerify,
  locale,
  paymentRequestId,
  printLabel,
  requestId,
  reservationId,
  returnTo
}: AdminBookingDetailToolbarProps) {
  const [isPending, startTransition] = useTransition();

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

  function handleVerifyDeposit() {
    if (!paymentRequestId || !returnTo) return;
    const confirmed = window.confirm(
      locale === "en"
        ? "Are you sure you want to verify this deposit? This will confirm the booking."
        : "Xác nhận đã nhận tiền cọc? Thao tác này sẽ chính thức xác nhận booking."
    );
    if (!confirmed) return;

    const formData = new FormData();
    formData.append("paymentRequestId", paymentRequestId);
    formData.append("status", "verified");
    formData.append("returnTo", returnTo);
    formData.append("note", "Manual verification from toolbar");

    startTransition(() => {
      verifyPaymentRequestAction(formData);
    });
  }

  function handleResendEmail() {
    if (!paymentRequestId || !returnTo) return;
    const formData = new FormData();
    formData.append("paymentRequestId", paymentRequestId);
    formData.append("returnTo", returnTo);
    startTransition(() => {
      resendDepositRequestEmailAction(formData);
    });
  }

  return (
    <div className="admin-booking-detail__toolbar">
      <button className="button button--solid admin-booking-detail__toolbar-link" onClick={() => window.print()} type="button">
        {printLabel}
      </button>

      {canVerify && (
        <button
          className="button admin-booking-detail__toolbar-link admin-booking-detail__toolbar-link--success"
          disabled={isPending}
          onClick={handleVerifyDeposit}
          type="button"
        >
          {locale === "en" ? "Verify Deposit" : "Duyệt cọc"}
        </button>
      )}

      {canResendEmail && (
        <button className="button button--text-light admin-booking-detail__toolbar-link" disabled={isPending} onClick={handleResendEmail} type="button">
          {locale === "en" ? "Resend QR" : "Gửi lại QR"}
        </button>
      )}

      {canComplete && (
        <button
          className="button admin-booking-detail__toolbar-link admin-booking-detail__toolbar-link--success"
          disabled={isPending}
          onClick={handleComplete}
          type="button"
        >
          {locale === "en" ? "Complete" : "Hoàn tất"}
        </button>
      )}
      {canCancel && (
        <button
          className="button admin-booking-detail__toolbar-link admin-booking-detail__toolbar-link--danger"
          disabled={isPending}
          onClick={handleCancel}
          type="button"
        >
          {locale === "en" ? "Cancel Booking" : "Hủy Booking"}
        </button>
      )}
      {canReject && (
        <button
          className="button admin-booking-detail__toolbar-link admin-booking-detail__toolbar-link--danger"
          disabled={isPending}
          onClick={handleReject}
          type="button"
        >
          {locale === "en" ? "Reject" : "Từ chối"}
        </button>
      )}
    </div>
  );
}
