"use client";

import { cancelMemberBookingAction } from "@/app/(member)/member/actions";
import { submitPaymentProofAction } from "@/app/actions/payments";
import { useEffect, useState } from "react";
import { PortalSubmitButton } from "@/components/portal-submit-button";
import { PortalBadge, PortalCard, PortalSectionHeading } from "@/components/portal-ui";
import { MemberProfileEditor } from "@/components/member-profile-editor";
import type { Locale } from "@/lib/locale";
import { localize, type LocalizedText } from "@/lib/mock/i18n";
import type {
  WorkflowAvailabilityRequest,
  WorkflowMemberHistoryData,
  WorkflowPaymentRequest,
  WorkflowReservation
} from "@/lib/supabase/workflow.types";
import { canMemberCancelBooking, type MemberBookingKind, type MemberBookingStatus } from "@/lib/supabase/member-booking-policy";

type BookingStage = "urgent" | "waiting" | "active" | "done";
type BookingKind = MemberBookingKind;

type BookingEntry = {
  anchorId: string;
  bodyNote: LocalizedText;
  bookingId: string;
  bookingStatus: MemberBookingStatus;
  code: string;
  createdAt: string;
  detail: LocalizedText;
  guestCount: number;
  kind: BookingKind;
  kindLabel: LocalizedText;
  canCancel: boolean;
  paymentRequest: WorkflowPaymentRequest | null;
  roomTypeName: LocalizedText;
  stage: BookingStage;
  status: LocalizedText;
  statusTone: "neutral" | "soft" | "accent";
  title: LocalizedText;
  totalAmount: number | null;
  updatedAt: string;
  branchName: LocalizedText;
  responseDueAt: string | null;
  stayStartAt: string;
  stayEndAt: string;
};

type StatLinkProps = {
  detail: LocalizedText;
  href: string;
  label: LocalizedText;
  tone: "default" | "soft" | "accent";
  value: string;
  locale: Locale;
};

type BookingCardProps = {
  entry: BookingEntry;
  locale: Locale;
};

type MemberPortalDashboardProps = {
  data: WorkflowMemberHistoryData;
  locale: Locale;
  customerNameFallback?: string | null;
};

function text(vi: string, en: string): LocalizedText {
  return { vi, en };
}

function formatDateTime(locale: Locale, value: string) {
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "vi-VN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function formatDateRange(locale: Locale, startAt: string, endAt: string) {
  const formatter = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "vi-VN", {
    dateStyle: "medium",
    timeZone: "Asia/Ho_Chi_Minh"
  });

  return `${formatter.format(new Date(startAt))} → ${formatter.format(new Date(endAt))}`;
}

function formatMoney(locale: Locale, value: number, currency = "VND") {
  const formatted = new Intl.NumberFormat(locale === "en" ? "en-US" : "vi-VN", {
    maximumFractionDigits: 0
  }).format(value);

  if (currency === "VND") {
    return locale === "en" ? `${formatted} VND` : `${formatted} đ`;
  }

  return locale === "en" ? `${formatted} ${currency}` : `${formatted} ${currency}`;
}

function formatCountdown(locale: Locale, expiresAt: string, now = Date.now()) {
  const diffMs = new Date(expiresAt).getTime() - now;

  if (!Number.isFinite(diffMs) || diffMs <= 0) {
    return locale === "en" ? "Expired" : "Đã hết hạn";
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts = [
    hours > 0 ? `${hours}h` : null,
    `${minutes.toString().padStart(2, "0")}m`,
    `${seconds.toString().padStart(2, "0")}s`
  ].filter(Boolean);

  return parts.join(" ");
}

function statusToneForStage(stage: BookingStage): "neutral" | "soft" | "accent" {
  if (stage === "urgent") {
    return "accent";
  }

  if (stage === "waiting") {
    return "soft";
  }

  return "neutral";
}

function stageRank(stage: BookingStage) {
  switch (stage) {
    case "urgent":
      return 0;
    case "waiting":
      return 1;
    case "active":
      return 2;
    case "done":
    default:
      return 3;
  }
}

function sortEntries(a: BookingEntry, b: BookingEntry) {
  const rankDelta = stageRank(a.stage) - stageRank(b.stage);

  if (rankDelta !== 0) {
    return rankDelta;
  }

  return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
}

function buildRequestEntry(request: WorkflowAvailabilityRequest): BookingEntry {
  let stage: BookingStage = "waiting";
  let bodyNote = text(
    "Yêu cầu đang chờ staff xem xét.",
    "The request is waiting for staff review."
  );

  if (request.status === "new") {
    stage = "urgent";
    bodyNote = text(
      "Yêu cầu mới vừa được gửi và đang chờ xử lý.",
      "A new request has just been submitted and is waiting to be processed."
    );
  } else if (request.status === "in_review" || request.status === "quoted") {
    stage = "waiting";
    bodyNote = text(
      "Yêu cầu đang được staff xem và phản hồi.",
      "The request is currently under staff review."
    );
  } else if (request.status === "converted") {
    stage = "active";
    bodyNote = text(
      "Yêu cầu này đã chuyển sang booking.",
      "This request has been converted into a booking."
    );
  } else if (request.status === "closed") {
    stage = "done";
    bodyNote = text(
      "Yêu cầu này đã được hủy.",
      "This request has been cancelled."
    );
  } else if (request.status === "rejected") {
    stage = "done";
    bodyNote = text(
      "Yêu cầu này đã bị từ chối.",
      "This request was rejected."
    );
  } else {
    stage = "done";
    bodyNote = text(
      "Yêu cầu này đã hết hạn.",
      "This request has expired."
    );
  }

  return {
    anchorId: `booking-request-${request.id}`,
    bodyNote,
    bookingId: request.id,
    bookingStatus: request.status,
    code: request.request_code,
    createdAt: request.created_at,
    detail: text(
      `${formatDateRange("vi", request.stay_start_at, request.stay_end_at)} • ${request.guest_count} khách`,
      `${formatDateRange("en", request.stay_start_at, request.stay_end_at)} • ${request.guest_count} guests`
    ),
    guestCount: request.guest_count,
    kind: "request",
    kindLabel: text("Yêu cầu", "Request"),
    canCancel: canMemberCancelBooking("request", request.status),
    paymentRequest: null,
    totalAmount: request.quoted_total_amount ?? null,
    roomTypeName: text(request.room_type_name_vi, request.room_type_name_en),
    responseDueAt: request.response_due_at,
    stage,
    status: text(
      request.status === "new"
        ? "Mới"
        : request.status === "in_review"
          ? "Đang xem xét"
          : request.status === "quoted"
            ? "Đã tiếp nhận"
            : request.status === "converted"
              ? "Đã chuyển đổi"
              : request.status === "closed"
                ? "Đã hủy"
                : request.status === "rejected"
                  ? "Từ chối"
                  : "Hết hạn",
      request.status === "new"
        ? "New"
        : request.status === "in_review"
          ? "In review"
        : request.status === "quoted"
            ? "Received"
            : request.status === "converted"
              ? "Converted"
              : request.status === "closed"
                ? "Cancelled"
                : request.status === "rejected"
                  ? "Rejected"
                  : "Expired"
    ),
    statusTone: statusToneForStage(stage),
    title: text(request.room_type_name_vi, request.room_type_name_en),
    updatedAt: request.updated_at,
    branchName: text(request.branch_name_vi, request.branch_name_en),
    stayStartAt: request.stay_start_at,
    stayEndAt: request.stay_end_at
  };
}

function buildReservationEntry(reservation: WorkflowReservation, paymentRequest: WorkflowPaymentRequest | null): BookingEntry {
  let stage: BookingStage = "waiting";
  let bodyNote = text(
    "Booking đang chờ xác nhận.",
    "The booking is waiting for confirmation."
  );

  if (paymentRequest?.status === "sent") {
    stage = "urgent";
    bodyNote = text(
      "Yêu cầu cọc đã sẵn sàng để bạn gửi proof.",
      "The deposit request is ready for you to upload proof."
    );
  } else if (paymentRequest?.status === "pending_verification") {
    stage = "waiting";
    bodyNote = text(
      "Proof đã gửi và đang chờ staff xác nhận.",
      "The proof has been sent and is waiting for staff verification."
    );
  } else if (reservation.status === "draft" || reservation.status === "pending_deposit") {
    stage = "urgent";
    bodyNote = text(
      "Booking này vẫn đang cần deposit.",
      "This booking still needs a deposit."
    );
  } else if (reservation.status === "confirmed") {
    stage = "active";
    bodyNote = text(
      "Booking đã được xác nhận.",
      "The booking has been confirmed."
    );
  } else if (reservation.status === "cancelled") {
    stage = "done";
    bodyNote = text(
      "Booking này đã bị hủy.",
      "This booking has been cancelled."
    );
  } else if (reservation.status === "completed") {
    stage = "done";
    bodyNote = text(
      "Booking này đã hoàn tất.",
      "This booking is complete."
    );
  } else {
    stage = "done";
    bodyNote = text(
      "Booking này đã hết hạn.",
      "This booking has expired."
    );
  }

  const statusText =
    reservation.status === "draft"
      ? text("Nháp", "Draft")
      : reservation.status === "pending_deposit"
        ? text("Chờ cọc", "Pending deposit")
        : reservation.status === "confirmed"
          ? text("Đã xác nhận", "Confirmed")
          : reservation.status === "completed"
            ? text("Hoàn tất", "Completed")
            : reservation.status === "cancelled"
              ? text("Đã hủy", "Cancelled")
              : text("Hết hạn", "Expired");

  return {
    anchorId: `booking-reservation-${reservation.id}`,
    bodyNote,
    bookingId: reservation.id,
    bookingStatus: reservation.status,
    code: reservation.booking_code,
    createdAt: reservation.created_at,
    detail: text(
      `${formatDateRange("vi", reservation.stay_start_at, reservation.stay_end_at)} • ${reservation.guest_count} khách`,
      `${formatDateRange("en", reservation.stay_start_at, reservation.stay_end_at)} • ${reservation.guest_count} guests`
    ),
    guestCount: reservation.guest_count,
    kind: "reservation",
    kindLabel: text("Booking", "Booking"),
    canCancel: canMemberCancelBooking("reservation", reservation.status),
    paymentRequest,
    totalAmount: reservation.total_amount,
    roomTypeName: text(reservation.primary_room_type_name_vi, reservation.primary_room_type_name_en),
    responseDueAt: null,
    stage,
    status: statusText,
    statusTone: statusToneForStage(stage),
    title: text(reservation.primary_room_type_name_vi, reservation.primary_room_type_name_en),
    updatedAt: reservation.updated_at,
    branchName: text(reservation.branch_name_vi, reservation.branch_name_en),
    stayStartAt: reservation.stay_start_at,
    stayEndAt: reservation.stay_end_at
  };
}

function buildBookingEntries(data: WorkflowMemberHistoryData) {
  const reservationByAvailabilityRequestId = new Map<string, WorkflowReservation>();
  const paymentRequestByReservationId = new Map<string, WorkflowPaymentRequest>();

  for (const reservation of data.reservations) {
    if (reservation.availability_request_id) {
      reservationByAvailabilityRequestId.set(reservation.availability_request_id, reservation);
    }
  }

  for (const paymentRequest of data.payment_requests) {
    if (!paymentRequestByReservationId.has(paymentRequest.reservation_id)) {
      paymentRequestByReservationId.set(paymentRequest.reservation_id, paymentRequest);
    }
  }

  const entries: BookingEntry[] = [];

  for (const reservation of data.reservations) {
    entries.push(buildReservationEntry(reservation, paymentRequestByReservationId.get(reservation.id) ?? null));
  }

  for (const request of data.availability_requests) {
    if (reservationByAvailabilityRequestId.has(request.id)) {
      continue;
    }

    entries.push(buildRequestEntry(request));
  }

  return entries.sort(sortEntries);
}

function paymentStatusLabel(locale: Locale, status: WorkflowPaymentRequest["status"]) {
  if (status === "sent") {
    return locale === "en" ? "Awaiting deposit" : "Chờ cọc";
  }

  if (status === "pending_verification") {
    return locale === "en" ? "Pending verification" : "Chờ xác minh";
  }

  if (status === "verified") {
    return locale === "en" ? "Verified" : "Đã xác nhận";
  }

  if (status === "rejected") {
    return locale === "en" ? "Rejected" : "Bị từ chối";
  }

  if (status === "expired") {
    return locale === "en" ? "Expired" : "Hết hạn";
  }

  return locale === "en" ? "Cancelled" : "Đã hủy";
}

function StatLink({ detail, href, label, locale, tone, value }: StatLinkProps) {
  return (
    <a className={`member-overview-stat member-overview-stat--${tone}`} href={href}>
      <span className="member-overview-stat__label">{localize(locale, label)}</span>
      <strong className="member-overview-stat__value">{value}</strong>
      <span className="member-overview-stat__detail">{localize(locale, detail)}</span>
    </a>
  );
}

function PaymentRequestPanel({
  locale,
  paymentRequest,
  returnTo
}: {
  locale: Locale;
  paymentRequest: WorkflowPaymentRequest;
  returnTo: string;
}) {
  const badgeTone = paymentRequest.status === "verified" ? "accent" : paymentRequest.status === "rejected" ? "neutral" : "soft";

  return (
    <div className="member-payment-panel">
      <div className="member-payment-panel__head">
        <div className="member-payment-panel__head-copy">
          <p className="member-payment-panel__eyebrow">{locale === "en" ? "Deposit" : "Cọc"}</p>
          <h4 className="member-payment-panel__title">{paymentRequest.payment_code}</h4>
          <p className="member-payment-panel__description">
            {locale === "en"
              ? "The QR, bank details, and transfer content are ready here."
              : "QR, thông tin ngân hàng, và nội dung chuyển khoản hiển thị ở đây."}
          </p>
        </div>

        <PortalBadge tone={badgeTone}>{paymentStatusLabel(locale, paymentRequest.status)}</PortalBadge>
      </div>

      {paymentRequest.status === "sent" ? (
        <>
          <div className="member-payment-panel__grid">
            <div className="member-payment-panel__qr">
              <img alt={paymentRequest.payment_code} className="member-payment-panel__qr-image" src={paymentRequest.qr_image_url} />
            </div>

            <dl className="member-payment-panel__facts">
              <div className="member-payment-panel__fact">
                <dt className="member-payment-panel__fact-label">{locale === "en" ? "Amount" : "Số tiền"}</dt>
                <dd className="member-payment-panel__fact-value">{formatMoney(locale, paymentRequest.amount, paymentRequest.currency)}</dd>
              </div>
              <div className="member-payment-panel__fact">
                <dt className="member-payment-panel__fact-label">{locale === "en" ? "Bank" : "Ngân hàng"}</dt>
                <dd className="member-payment-panel__fact-value">{paymentRequest.bank_name}</dd>
              </div>
              <div className="member-payment-panel__fact">
                <dt className="member-payment-panel__fact-label">{locale === "en" ? "Account name" : "Tên tài khoản"}</dt>
                <dd className="member-payment-panel__fact-value">{paymentRequest.account_name}</dd>
              </div>
              <div className="member-payment-panel__fact">
                <dt className="member-payment-panel__fact-label">{locale === "en" ? "Account number" : "Số tài khoản"}</dt>
                <dd className="member-payment-panel__fact-value">{paymentRequest.account_number}</dd>
              </div>
              <div className="member-payment-panel__fact">
                <dt className="member-payment-panel__fact-label">{locale === "en" ? "Transfer content" : "Nội dung CK"}</dt>
                <dd className="member-payment-panel__fact-value">{paymentRequest.transfer_content}</dd>
              </div>
            </dl>
          </div>

          <form className="portal-form member-payment-panel__form" action={submitPaymentProofAction} encType="multipart/form-data">
            <input name="paymentRequestId" type="hidden" value={paymentRequest.id} />
            <input name="locale" type="hidden" value={locale} />
            <input name="returnTo" type="hidden" value={returnTo} />
            <input name="uploadedVia" type="hidden" value="member_portal" />

            <label className="portal-field">
              <span className="portal-field__label">{locale === "en" ? "Payment screenshot" : "Ảnh chụp màn hình thanh toán"}</span>
              <input className="portal-field__control member-payment-panel__input" name="proofFile" type="file" accept="image/*,.pdf" />
            </label>

            <label className="portal-field">
              <span className="portal-field__label">{locale === "en" ? "Note" : "Ghi chú"}</span>
              <textarea className="portal-field__control member-payment-panel__input member-payment-panel__input--textarea" name="note" rows={3} />
            </label>

            <div className="member-payment-panel__actions">
              <PortalSubmitButton
                className="button button--solid member-payment-panel__submit"
                pendingLabel={locale === "en" ? "Submitting..." : "Đang gửi..."}
              >
                {locale === "en" ? "Confirm deposit paid" : "Xác nhận đã thanh toán cọc"}
              </PortalSubmitButton>
            </div>
          </form>
        </>
      ) : (
              <p className="member-payment-panel__note">
          {paymentRequest.status === "pending_verification"
            ? locale === "en"
              ? "The proof has been uploaded and is waiting for staff verification."
              : "Proof đã được upload và đang chờ staff xác minh."
            : paymentRequest.status === "verified"
              ? locale === "en"
                ? "The deposit has been verified."
                : "Cọc đã được xác nhận."
              : paymentRequest.status === "rejected"
                ? locale === "en"
                  ? "The deposit proof was rejected by staff."
                  : "Proof cọc đã bị staff từ chối."
                : locale === "en"
                  ? "This payment request is no longer active."
                  : "Yêu cầu thanh toán này không còn hoạt động."}
        </p>
      )}
    </div>
  );
}

function CountdownBadge({ expiresAt, locale }: { expiresAt: string; locale: Locale }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <PortalBadge tone="soft">
      {locale === "en" ? "Time left" : "Còn lại"} {formatCountdown(locale, expiresAt, now)}
    </PortalBadge>
  );
}

function BookingCard({ entry, locale }: BookingCardProps) {
  const paymentRequest = entry.paymentRequest;
  const showPaymentPanel = paymentRequest?.status === "sent" && entry.kind === "reservation" && entry.stage !== "active" && entry.stage !== "done";
  const returnTo = `/member#${entry.anchorId}`;
  const cancelLabel =
    locale === "en" ? (entry.kind === "request" ? "Cancel request" : "Cancel booking") : entry.kind === "request" ? "Hủy yêu cầu" : "Hủy booking";
  const cancelConfirmMessage = localize(locale, {
    vi: entry.kind === "request" ? "Bạn có chắc muốn hủy yêu cầu này không? Thao tác này không thể hoàn tác." : "Bạn có chắc muốn hủy booking này không? Thao tác này không thể hoàn tác.",
    en:
      entry.kind === "request"
        ? "Are you sure you want to cancel this request? This cannot be undone."
        : "Are you sure you want to cancel this booking? This cannot be undone."
  });

  return (
    <details className={`member-booking-card member-booking-card--${entry.stage}`} id={entry.anchorId}>
      <summary className="member-booking-card__summary">
        <div className="member-booking-card__summary-top">
          <div className="member-booking-card__kind-row">
            <span className="member-booking-card__kind">{localize(locale, entry.kindLabel)}</span>
            <span className="member-booking-card__code">{entry.code}</span>
          </div>
          <PortalBadge tone={entry.statusTone}>{localize(locale, entry.status)}</PortalBadge>
        </div>

        <div className="member-booking-card__summary-body">
          <h3 className="member-booking-card__title">{localize(locale, entry.title)}</h3>
          <p className="member-booking-card__detail">{localize(locale, entry.detail)}</p>
          <p className="member-booking-card__note">{localize(locale, entry.bodyNote)}</p>
        </div>

        <div className="member-booking-card__summary-meta">
          <span>{localize(locale, entry.branchName)}</span>
          <span>{formatDateTime(locale, entry.updatedAt)}</span>
          <span className="member-booking-card__chevron" aria-hidden="true">⌄</span>
        </div>
      </summary>

      <div className="member-booking-card__body">
        <dl className="member-booking-card__facts">
          <div className="member-booking-card__fact">
            <dt className="member-booking-card__fact-label">{locale === "en" ? "Stay" : "Lưu trú"}</dt>
            <dd className="member-booking-card__fact-value">{formatDateRange(locale, entry.stayStartAt, entry.stayEndAt)}</dd>
          </div>
          <div className="member-booking-card__fact">
            <dt className="member-booking-card__fact-label">{locale === "en" ? "Guests" : "Khách"}</dt>
            <dd className="member-booking-card__fact-value">{locale === "en" ? `${entry.guestCount} guests` : `${entry.guestCount} khách`}</dd>
          </div>
          <div className="member-booking-card__fact">
            <dt className="member-booking-card__fact-label">{locale === "en" ? "Created" : "Tạo lúc"}</dt>
            <dd className="member-booking-card__fact-value">{formatDateTime(locale, entry.createdAt)}</dd>
          </div>
          {entry.totalAmount != null ? (
            <div className="member-booking-card__fact">
              <dt className="member-booking-card__fact-label">{locale === "en" ? "Amount" : "Giá tiền"}</dt>
              <dd className="member-booking-card__fact-value">{formatMoney(locale, entry.totalAmount)}</dd>
            </div>
          ) : null}
        </dl>

        {entry.kind === "request" && entry.responseDueAt ? (
          <div className="member-booking-card__status-panel">
            <p className="member-booking-card__status-panel-eyebrow">{locale === "en" ? "Response SLA" : "Hạn phản hồi"}</p>
            <p className="member-booking-card__status-panel-title">{formatDateTime(locale, entry.responseDueAt)}</p>
            <p className="member-booking-card__status-panel-copy">
              <CountdownBadge expiresAt={entry.responseDueAt} locale={locale} />
            </p>
          </div>
        ) : null}

        {showPaymentPanel && paymentRequest ? (
          <PaymentRequestPanel locale={locale} paymentRequest={paymentRequest} returnTo={returnTo} />
        ) : paymentRequest ? (
          <div className="member-booking-card__status-panel">
            <p className="member-booking-card__status-panel-eyebrow">{locale === "en" ? "Payment status" : "Trạng thái thanh toán"}</p>
            <p className="member-booking-card__status-panel-title">{paymentStatusLabel(locale, paymentRequest.status)}</p>
            <p className="member-booking-card__status-panel-copy">
              {paymentRequest.status === "pending_verification"
                ? locale === "en"
                  ? "Proof is already uploaded and is waiting for staff verification."
                  : "Proof đã upload và đang chờ staff xác minh."
                : paymentRequest.status === "verified"
                  ? locale === "en"
                    ? "The deposit has already been verified."
                    : "Cọc đã được xác nhận."
                  : paymentRequest.status === "rejected"
                    ? locale === "en"
                      ? "Staff rejected the deposit proof."
                      : "Staff đã từ chối proof cọc."
                    : locale === "en"
                      ? "This request is not active anymore."
                      : "Yêu cầu này không còn hoạt động."}
            </p>
          </div>
        ) : (
          <div className="member-booking-card__status-panel">
            <p className="member-booking-card__status-panel-eyebrow">{locale === "en" ? "Status" : "Trạng thái"}</p>
            <p className="member-booking-card__status-panel-title">{localize(locale, entry.bodyNote)}</p>
            <p className="member-booking-card__status-panel-copy">
              {entry.kind === "reservation" && entry.stage === "done"
                ? locale === "en"
                  ? "No payment action is needed for this booking."
                  : "Booking này không cần thao tác thanh toán."
                : locale === "en"
                  ? "This item is still moving through the manual workflow."
                  : "Mục này vẫn đang đi qua luồng manual."}
            </p>
          </div>
        )}

        {entry.canCancel ? (
          <form
            action={cancelMemberBookingAction}
            className="member-booking-card__actions"
            onSubmit={(event) => {
              if (!window.confirm(cancelConfirmMessage)) {
                event.preventDefault();
              }
            }}
          >
            <input name="bookingId" type="hidden" value={entry.bookingId} />
            <input name="bookingKind" type="hidden" value={entry.kind} />
            <input name="locale" type="hidden" value={locale} />
            <input name="returnTo" type="hidden" value={returnTo} />

            <PortalSubmitButton
              className="button member-booking-card__danger-button"
              pendingLabel={locale === "en" ? "Cancelling..." : "Đang hủy..."}
            >
              {cancelLabel}
            </PortalSubmitButton>
          </form>
        ) : null}
      </div>
    </details>
  );
}

export function MemberHistoryDashboard({ data, locale, customerNameFallback }: MemberPortalDashboardProps) {
  const bookingEntries = buildBookingEntries(data);
  const pendingPaymentCount = data.payment_requests.filter((request) => request.status === "sent" || request.status === "pending_verification").length;
  const confirmedReservationCount = data.reservations.filter(
    (reservation) => reservation.status === "confirmed" || reservation.status === "completed"
  ).length;

  const firstRequestAnchor = bookingEntries.find((entry) => entry.kind === "request")?.anchorId ?? "booking";
  const firstReservationAnchor = bookingEntries.find((entry) => entry.kind === "reservation")?.anchorId ?? "booking";
  const firstPendingPaymentAnchor = bookingEntries.find((entry) => entry.paymentRequest?.status === "sent")?.anchorId ?? "booking";
  const firstConfirmedAnchor =
    bookingEntries.find((entry) => entry.kind === "reservation" && (entry.stage === "active" || entry.stage === "done"))?.anchorId ?? "info";
  const customerDisplayName = (() => {
    const customerName = data.customer.full_name?.trim();
    const customerEmailPrefix = data.customer.email.split("@")[0]?.trim().toLowerCase() ?? "";
    const fallbackName = customerNameFallback?.trim();

    if (customerName && customerName.toLowerCase() !== customerEmailPrefix) {
      return customerName;
    }

    if (fallbackName) {
      return fallbackName;
    }

    return customerName || customerEmailPrefix || data.customer.email;
  })();

  return (
    <div className="portal-content member-portal-content">
      <section className="member-portal-overview" id="overview">
        <div className="member-portal-greeting">
          <h1 className="member-portal-greeting__title">
            {locale === "en" ? "Hello" : "Xin chào"}, {customerDisplayName},
          </h1>
          <p className="member-portal-greeting__description">
            {locale === "en"
              ? "Your requests, bookings, deposit state, and personal details stay in one calm view."
              : "Yêu cầu, booking, trạng thái cọc, và thông tin cá nhân nằm trong một màn hình gọn."}
          </p>
        </div>

        <div className="member-overview-stats">
          <StatLink
            detail={{
              vi: "Tất cả yêu cầu đặt phòng của bạn.",
              en: "All booking requests tied to your account."
            }}
            href={`#${firstRequestAnchor}`}
            label={{
              vi: "Yêu cầu đặt phòng",
              en: "Booking requests"
            }}
            locale={locale}
            tone="soft"
            value={`${data.availability_requests.length}`}
          />
          <StatLink
            detail={{
              vi: "Tất cả booking và reservation đã ghi nhận.",
              en: "All recorded bookings and reservations."
            }}
            href={`#${firstReservationAnchor}`}
            label={{
              vi: "Booking",
              en: "Bookings"
            }}
            locale={locale}
            tone="default"
            value={`${data.reservations.length}`}
          />
          <StatLink
            detail={{
              vi: "Các yêu cầu cọc còn đang chờ xử lý.",
              en: "Deposit requests that are still waiting."
            }}
            href={`#${firstPendingPaymentAnchor}`}
            label={{
              vi: "Chờ cọc",
              en: "Pending deposit"
            }}
            locale={locale}
            tone="accent"
            value={`${pendingPaymentCount}`}
          />
          <StatLink
            detail={{
              vi: "Booking đã xác nhận hoặc hoàn tất.",
              en: "Bookings that are confirmed or completed."
            }}
            href={`#${firstConfirmedAnchor}`}
            label={{
              vi: "Đã xác nhận",
              en: "Confirmed"
            }}
            locale={locale}
            tone="soft"
            value={`${confirmedReservationCount}`}
          />
        </div>
      </section>

      <section className="member-portal-section" id="booking">
        <PortalSectionHeading
          description={{
            vi: "Các mục mới và chưa hoàn tất nằm ở trên; bấm vào từng mục để xem chi tiết và phần cọc nếu cần.",
            en: "New and unfinished items stay on top; open each item for details and deposit handling when needed."
          }}
          eyebrow={{
            vi: "Booking",
            en: "Booking"
          }}
          locale={locale}
          title={{
            vi: "Booking và trạng thái",
            en: "Bookings and status"
          }}
        />

        <div className="member-booking-list">
          {bookingEntries.length ? (
            bookingEntries.map((entry) => <BookingCard entry={entry} key={entry.anchorId} locale={locale} />)
          ) : (
            <PortalCard tone="soft">
              <p className="member-empty-state__eyebrow">{locale === "en" ? "No booking history" : "Chưa có booking"}</p>
              <p className="member-empty-state__copy">
                {locale === "en"
                  ? "Your requests and reservations will appear here once staff starts the manual flow."
                  : "Yêu cầu và reservation của bạn sẽ hiện ở đây khi staff bắt đầu luồng manual."}
              </p>
            </PortalCard>
          )}
        </div>
      </section>

      <section className="member-portal-section" id="info">
        <PortalSectionHeading
          description={{
            vi: "Thông tin cá nhân, liên hệ được cập nhật tại đây.",
            en: "Personal details, contact data are updated here."
          }}
          eyebrow={{
            vi: "Thông tin",
            en: "Info"
          }}
          locale={locale}
          title={{
            vi: "Thông tin cá nhân",
            en: "Personal information"
          }}
        />

        <MemberProfileEditor customer={data.customer} locale={locale} />
      </section>
    </div>
  );
}
