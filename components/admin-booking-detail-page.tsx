"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  confirmAvailabilityRequestAction,
  notifyPaymentRequestMemberAction,
  reissueDepositPaymentRequestAction,
  resendDepositRequestEmailAction,
  updateAvailabilityRequestStatusAction,
  updateReservationLifecycleAction
} from "@/app/(admin)/admin/actions";
import { verifyPaymentRequestAction } from "@/app/actions/payments";
import { calculateDepositAmount } from "@/lib/supabase/booking-finance";
import { AdminBookingDetailToolbar } from "@/components/admin-booking-detail-toolbar";
import { PortalBadge, PortalCard, PortalSectionHeading } from "@/components/portal-ui";
import type { Locale } from "@/lib/locale";
import { appendLocaleQuery } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";
import type { BookingDetailData } from "@/lib/supabase/queries/booking-details";
import type { WorkflowPaymentRequest } from "@/lib/supabase/workflow.types";

type AdminBookingDetailPageProps = {
  detail: BookingDetailData;
  locale: Locale;
};

type TimelineStepState = "active" | "done" | "pending";

function calculateNights(startAt: string, endAt: string) {
  const diffMs = new Date(endAt).getTime() - new Date(startAt).getTime();

  if (!Number.isFinite(diffMs) || diffMs <= 0) {
    return 1;
  }

  return Math.max(1, Math.round(diffMs / 86_400_000));
}

function formatMoney(locale: Locale, value: number) {
  return `${new Intl.NumberFormat(locale === "en" ? "en-US" : "vi-VN", {
    maximumFractionDigits: 0
  }).format(Math.max(0, value))} VND`;
}

function formatDateTime(locale: Locale, value: string) {
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Ho_Chi_Minh"
  }).format(new Date(value));
}

function formatDateRange(locale: Locale, startAt: string, endAt: string) {
  const formatter = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "vi-VN", {
    dateStyle: "medium",
    timeZone: "Asia/Ho_Chi_Minh"
  });

  return `${formatter.format(new Date(startAt))} → ${formatter.format(new Date(endAt))}`;
}

function formatCountdown(locale: Locale, expiresAt: string, now = Date.now()) {
  const diffMs = new Date(expiresAt).getTime() - now;

  if (!Number.isFinite(diffMs) || diffMs <= 0) {
    return localize(locale, { vi: "Đã hết hạn", en: "Expired" });
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const hours = Math.floor(totalSeconds / 3600);
  const parts = [
    hours > 0 ? `${hours}h` : null,
    `${minutes.toString().padStart(2, "0")}m`,
    `${seconds.toString().padStart(2, "0")}s`
  ].filter(Boolean);

  return parts.join(" ");
}

function statusTone(status: string) {
  switch (status) {
    case "confirmed":
    case "completed":
    case "converted":
    case "verified":
      return "accent" as const;
    case "new":
    case "in_review":
    case "quoted":
    case "draft":
    case "pending_deposit":
    case "pending_verification":
    case "sent":
    case "active":
      return "soft" as const;
    default:
      return "neutral" as const;
  }
}

function statusLabel(locale: Locale, status: string) {
  const labels: Record<Locale, Record<string, string>> = {
    en: {
      active: "Active",
      cancelled: "Cancelled",
      closed: "Closed",
      completed: "Completed",
      confirmed: "Confirmed",
      converted: "Converted",
      draft: "Draft",
      expired: "Expired",
      in_review: "In review",
      new: "New",
      pending_deposit: "Pending deposit",
      pending_verification: "Pending verification",
      quoted: "Quoted",
      rejected: "Rejected",
      sent: "Deposit sent",
      verified: "Verified"
    },
    vi: {
      active: "Đang hoạt động",
      cancelled: "Đã hủy",
      closed: "Đã đóng",
      completed: "Hoàn tất",
      confirmed: "Đã xác nhận",
      converted: "Đã chuyển",
      draft: "Nháp",
      expired: "Hết hạn",
      in_review: "Đang xử lý",
      new: "Mới",
      pending_deposit: "Chờ cọc",
      pending_verification: "Chờ kiểm tra cọc",
      quoted: "Đã báo giá",
      rejected: "Từ chối",
      sent: "Đã gửi QR cọc",
      verified: "Đã duyệt cọc"
    }
  };

  return labels[locale][status] ?? status;
}

function renderField(label: string, value: string | number | null | undefined) {
  return (
    <div className="portal-profile-list__item">
      <dt className="portal-profile-list__label">{label}</dt>
      <dd className="portal-profile-list__value">{value ?? "—"}</dd>
    </div>
  );
}

function formatConsent(locale: Locale, value: boolean | null | undefined) {
  if (value == null) {
    return "—";
  }

  return value
    ? localize(locale, { vi: "Đã đồng ý", en: "Consented" })
    : localize(locale, { vi: "Chưa đồng ý", en: "Not consented" });
}

function getWorkflowTitle(detail: BookingDetailData, locale: Locale) {
  const activePaymentRequest =
    detail.payment_requests.find((paymentRequest) => ["sent", "pending_verification"].includes(paymentRequest.status)) ?? null;

  if (detail.reservation?.status === "completed") {
    return localize(locale, { vi: "Booking đã hoàn tất", en: "Booking completed" });
  }

  if (detail.reservation?.status === "cancelled" || detail.booking.status === "rejected") {
    return localize(locale, { vi: "Booking đã hủy", en: "Booking cancelled" });
  }

  if (detail.reservation?.status === "confirmed") {
    return localize(locale, {
      vi: "Booking đã được xác nhận sau khi admin duyệt cọc.",
      en: "Booking is confirmed after the deposit was verified manually."
    });
  }

  if (activePaymentRequest?.status === "pending_verification") {
    return localize(locale, {
      vi: "Khách đã gửi cọc, đang chờ admin kiểm tra xác nhận.",
      en: "Deposit was sent by the guest and is waiting for manual verification."
    });
  }

  if (detail.reservation?.status === "pending_deposit") {
    return localize(locale, {
      vi: "Booking đã chốt phòng, đang chờ khách hoàn tất cọc trong thời hạn giữ chỗ.",
      en: "Room is confirmed and the booking is waiting for the deposit within the hold window."
    });
  }

  return localize(locale, {
    vi: "Yêu cầu mới đang chờ admin kiểm tra phòng và xác nhận booking.",
    en: "A new booking request is waiting for availability confirmation."
  });
}

function getPaymentTone(status: WorkflowPaymentRequest["status"]) {
  switch (status) {
    case "verified":
      return "accent" as const;
    case "sent":
    case "pending_verification":
      return "soft" as const;
    default:
      return "neutral" as const;
  }
}

function CountdownPill({
  expiresAt,
  locale
}: {
  expiresAt: string;
  locale: Locale;
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="admin-booking-detail__countdown">
      <span aria-hidden="true" className="admin-booking-detail__countdown-icon">
        !
      </span>
      <span>
        {locale === "en" ? "Time left:" : "Thời gian xử lý còn lại:"} <strong>{formatCountdown(locale, expiresAt, now)}</strong>
      </span>
    </div>
  );
}

function GuestBookingCard({
  detail,
  locale
}: {
  detail: BookingDetailData;
  locale: Locale;
}) {
  const booking = detail.booking;
  const request = detail.request;
  const guestName = detail.customer?.full_name ?? booking.customer_name;
  const guestEmail = detail.customer?.email ?? booking.customer_email;
  const guestPhone = detail.customer?.phone ?? request?.contact_phone ?? null;
  const nights = calculateNights(booking.stay_start_at, booking.stay_end_at);
  const roomTypeLabel = locale === "en" ? booking.room_type_name_en : booking.room_type_name_vi;
  const guestInitials = guestName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <PortalCard className="admin-booking-detail__surface-card admin-booking-detail__guest-card">
      <div className="admin-booking-detail__card-head">
        <h2 className="admin-booking-detail__card-title">{locale === "en" ? "Guest & booking information" : "Thông tin khách hàng & Đặt phòng"}</h2>
        <PortalBadge tone={statusTone(booking.status)}>{statusLabel(locale, booking.status)}</PortalBadge>
      </div>

      <div className="admin-booking-detail__guest-grid">
        <div className="admin-booking-detail__guest-person">
          <div className="admin-booking-detail__avatar-block">
            <span aria-hidden="true">{guestInitials || "GU"}</span>
          </div>
          <div className="admin-booking-detail__guest-copy">
            <p className="admin-booking-detail__meta-label">{locale === "en" ? "Guest" : "Khách hàng"}</p>
            <p className="admin-booking-detail__guest-name">{guestName}</p>
            <div className="admin-booking-detail__guest-contact">
              <p>{guestPhone ?? "—"}</p>
              <p>{guestEmail}</p>
            </div>
          </div>
        </div>

        <div className="admin-booking-detail__booking-meta">
          <div>
            <p className="admin-booking-detail__meta-label">{locale === "en" ? "Stay dates" : "Ngày lưu trú"}</p>
            <p className="admin-booking-detail__meta-value">{formatDateRange(locale, booking.stay_start_at, booking.stay_end_at)}</p>
            <p className="admin-booking-detail__meta-subtle">{locale === "en" ? `${nights} nights` : `${nights} đêm`}</p>
          </div>
          <div className="admin-booking-detail__meta-pair-grid">
            <div>
              <p className="admin-booking-detail__meta-label">{locale === "en" ? "Room type" : "Loại phòng"}</p>
              <p className="admin-booking-detail__meta-value">{roomTypeLabel}</p>
            </div>
            <div>
              <p className="admin-booking-detail__meta-label">{locale === "en" ? "Total value" : "Tổng giá trị"}</p>
              <p className="admin-booking-detail__meta-value admin-booking-detail__meta-value--accent">
                {formatMoney(locale, detail.financial_summary.total_amount)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-booking-detail__special-request">
        <p className="admin-booking-detail__meta-label">{locale === "en" ? "Special request" : "Yêu cầu đặc biệt"}</p>
        <p className="admin-booking-detail__special-request-copy">{request?.note || booking.notes || localize(locale, { vi: "Không có ghi chú thêm.", en: "No special request." })}</p>
      </div>
    </PortalCard>
  );
}

function HeroMetrics({
  detail,
  locale
}: {
  detail: BookingDetailData;
  locale: Locale;
}) {
  const nights = calculateNights(detail.booking.stay_start_at, detail.booking.stay_end_at);
  const metrics = [
    {
      label: locale === "en" ? "Booking value" : "Giá trị booking",
      note: locale === "en" ? `${nights} nights` : `${nights} đêm`,
      tone: "accent",
      value: formatMoney(locale, detail.financial_summary.total_amount)
    },
    {
      label: locale === "en" ? "Deposit target" : "Mục tiêu cọc",
      note:
        locale === "en"
          ? `${detail.financial_summary.default_deposit_percentage}% default`
          : `Mặc định ${detail.financial_summary.default_deposit_percentage}%`,
      tone: "soft",
      value: formatMoney(locale, detail.financial_summary.requested_deposit_amount)
    },
    {
      label: locale === "en" ? "Verified deposit" : "Cọc đã nhận",
      note:
        detail.financial_summary.verified_deposit_amount > 0
          ? locale === "en"
            ? "Manual verification completed"
            : "Đã xác nhận thủ công"
          : locale === "en"
            ? "Waiting for verification"
            : "Đang chờ xác nhận",
      tone: "default",
      value: formatMoney(locale, detail.financial_summary.verified_deposit_amount)
    },
    {
      label: locale === "en" ? "Remaining balance" : "Số tiền còn lại",
      note: statusLabel(locale, detail.reservation?.status ?? detail.booking.status),
      tone: "default",
      value: formatMoney(locale, detail.financial_summary.remaining_balance_amount)
    }
  ] as const;

  return (
    <div className="admin-booking-detail__metrics">
      {metrics.map((metric) => (
        <div
          className={`admin-booking-detail__metric${metric.tone === "soft" ? " admin-booking-detail__metric--soft" : metric.tone === "accent" ? " admin-booking-detail__metric--accent" : ""}`}
          key={metric.label}
        >
          <p className="admin-booking-detail__metric-label">{metric.label}</p>
          <p className="admin-booking-detail__metric-value">{metric.value}</p>
          <p className="admin-booking-detail__metric-note">{metric.note}</p>
        </div>
      ))}
    </div>
  );
}

function ProcessingTimeline({
  detail,
  locale
}: {
  detail: BookingDetailData;
  locale: Locale;
}) {
  const request = detail.request;
  const reservation = detail.reservation;
  const activePaymentRequest =
    detail.payment_requests.find((paymentRequest) => ["sent", "pending_verification"].includes(paymentRequest.status)) ??
    detail.payment_requests.find((paymentRequest) => paymentRequest.status === "verified") ??
    null;
  const steps: Array<{
    description: string;
    time: string | null;
    label: string;
    state: TimelineStepState;
  }> = [
    {
      description: localize(locale, {
        vi: `Hệ thống ghi nhận yêu cầu lúc ${formatDateTime(locale, detail.booking.created_at)}`,
        en: `The request entered the system at ${formatDateTime(locale, detail.booking.created_at)}`
      }),
      time: formatDateTime(locale, detail.booking.created_at),
      label: localize(locale, { vi: "Yêu cầu mới", en: "New request" }),
      state: "done"
    },
    {
      description: reservation
        ? localize(locale, {
            vi: "Admin đã chốt phòng và chuyển booking sang trạng thái chờ cọc.",
            en: "The room was confirmed and the booking moved to pending deposit."
          })
        : localize(locale, {
            vi: "Đang chờ admin kiểm tra phòng trống và xác nhận booking.",
            en: "Waiting for manual availability confirmation."
          }),
      time: reservation?.confirmed_at
        ? formatDateTime(locale, reservation.confirmed_at)
        : request?.response_due_at
          ? formatDateTime(locale, request.response_due_at)
          : null,
      label: localize(locale, { vi: "Xác nhận còn phòng", en: "Confirm availability" }),
      state: reservation ? "done" : "active"
    },
    {
      description:
        activePaymentRequest?.status === "verified"
          ? localize(locale, {
              vi: "Cọc đã được khách chuyển và admin đã xác nhận thủ công.",
              en: "The deposit was paid and manually verified."
            })
          : activePaymentRequest
            ? localize(locale, {
                vi: "QR cọc đã phát hành, đang chờ khách thanh toán.",
                en: "The deposit QR has been issued and is waiting for payment."
            })
            : localize(locale, {
                vi: "QR cọc sẽ được phát hành ngay sau khi chốt booking.",
                en: "The deposit QR will be generated after booking confirmation."
              }),
      time: activePaymentRequest?.verified_at
        ? formatDateTime(locale, activePaymentRequest.verified_at)
        : activePaymentRequest?.latest_proof_uploaded_at
          ? formatDateTime(locale, activePaymentRequest.latest_proof_uploaded_at)
          : activePaymentRequest?.created_at
            ? formatDateTime(locale, activePaymentRequest.created_at)
            : null,
      label: localize(locale, { vi: "Đã thanh toán cọc", en: "Deposit payment" }),
      state: activePaymentRequest?.status === "verified" ? "done" : activePaymentRequest ? "active" : "pending"
    },
    {
      description:
        reservation?.status === "completed"
          ? localize(locale, {
              vi: "Booking đã kết thúc và được đánh dấu hoàn tất.",
              en: "The stay was completed and the booking was closed successfully."
            })
          : reservation?.status === "confirmed"
            ? localize(locale, {
                vi: "Booking đã được xác nhận cuối cùng sau khi cọc được duyệt.",
                en: "The booking was confirmed after the deposit was verified."
              })
            : localize(locale, {
                vi: "Bước cuối cùng sẽ hoàn tất sau khi admin xác nhận cọc.",
                en: "The final confirmation will be completed after deposit verification."
              }),
      time: reservation?.completed_at
        ? formatDateTime(locale, reservation.completed_at)
        : reservation?.cancelled_at
          ? formatDateTime(locale, reservation.cancelled_at)
          : reservation?.confirmed_at
            ? formatDateTime(locale, reservation.confirmed_at)
            : null,
      label: localize(locale, { vi: "Xác nhận cuối cùng", en: "Final confirmation" }),
      state: reservation?.status === "confirmed" || reservation?.status === "completed" ? "done" : "pending"
    }
  ];

  return (
    <PortalCard className="admin-booking-detail__surface-card">
      <h3 className="admin-booking-detail__card-title">{locale === "en" ? "Processing status" : "Trạng thái xử lý"}</h3>
      <div className="admin-booking-detail__timeline">
        {steps.map((step) => (
          <div className={`admin-booking-detail__timeline-step admin-booking-detail__timeline-step--${step.state}`} key={step.label}>
            <div className="admin-booking-detail__timeline-marker" aria-hidden="true">
              {step.state === "done" ? "✓" : step.state === "active" ? "•" : "○"}
            </div>
            <div className="admin-booking-detail__timeline-copy">
              <p className="admin-booking-detail__timeline-title">{step.label}</p>
              {step.time ? <p className="admin-booking-detail__timeline-time">{step.time}</p> : null}
              <p className="admin-booking-detail__timeline-description">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </PortalCard>
  );
}

function ConfirmAvailabilityCard({
  detail,
  locale,
  returnTo
}: {
  detail: BookingDetailData;
  locale: Locale;
  returnTo: string;
}) {
  const request = detail.request;
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState(request?.room_type_id ?? detail.booking.room_type_id);
  const roomSuggestions = useMemo(
    () => detail.room_suggestions.filter((room) => room.room_type_id === selectedRoomTypeId),
    [detail.room_suggestions, selectedRoomTypeId]
  );
  const [selectedRoomId, setSelectedRoomId] = useState(roomSuggestions[0]?.id ?? "");

  useEffect(() => {
    const nextRoomId = roomSuggestions[0]?.id ?? "";
    if (!roomSuggestions.some((room) => room.id === selectedRoomId)) {
      setSelectedRoomId(nextRoomId);
    }
  }, [roomSuggestions, selectedRoomId]);

  if (!request || detail.reservation) {
    return null;
  }

  return (
    <PortalCard className="admin-booking-detail__action-card">
      <div className="admin-booking-detail__action-head">
        <span className="admin-booking-detail__action-icon" aria-hidden="true">
          ✓
        </span>
        <h3 className="admin-booking-detail__action-title">{locale === "en" ? "Step 1: Confirm room" : "Bước 1: Xác nhận phòng"}</h3>
      </div>
      <p className="admin-booking-detail__action-description">
        {locale === "en"
          ? "Check availability, confirm the room class, and issue the deposit QR in one action."
          : "Kiểm tra phòng trống, chốt hạng phòng và phát hành QR cọc trong cùng một bước."}
      </p>

      {request.response_due_at ? <CountdownPill expiresAt={request.response_due_at} locale={locale} /> : null}

      <form action={confirmAvailabilityRequestAction} className="portal-form">
        <input name="availabilityRequestId" type="hidden" value={request.id} />
        <input name="actorRole" type="hidden" value="staff" />
        <input name="returnTo" type="hidden" value={returnTo} />

        <label className="portal-field">
          <span className="portal-field__label">{locale === "en" ? "Room type" : "Hạng phòng"}</span>
          <select
            className="portal-field__control"
            name="roomTypeId"
            onChange={(event) => setSelectedRoomTypeId(event.target.value)}
            value={selectedRoomTypeId}
          >
            {detail.room_type_options.map((roomType) => (
              <option key={roomType.id} value={roomType.id}>
                {locale === "en" ? roomType.name_en : roomType.name_vi}
              </option>
            ))}
          </select>
        </label>

        <label className="portal-field">
          <span className="portal-field__label">{locale === "en" ? "Physical room" : "Phòng thực tế"}</span>
          <select className="portal-field__control" name="roomId" onChange={(event) => setSelectedRoomId(event.target.value)} value={selectedRoomId}>
            {roomSuggestions.length ? (
              roomSuggestions.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.code} • {locale === "en" ? room.room_type_name_en : room.room_type_name_vi}
                </option>
              ))
            ) : (
              <option value="">{locale === "en" ? "No available room" : "Không còn phòng phù hợp"}</option>
            )}
          </select>
        </label>

        <div className="portal-grid portal-grid--two">
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Check-in" : "Check-in"}</span>
            <input className="portal-field__control" defaultValue={request.stay_start_at.slice(0, 10)} name="stayStartAt" type="date" />
          </label>
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Check-out" : "Check-out"}</span>
            <input className="portal-field__control" defaultValue={request.stay_end_at.slice(0, 10)} name="stayEndAt" type="date" />
          </label>
        </div>

        <div className="portal-grid portal-grid--three">
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Guests" : "Số khách"}</span>
            <input className="portal-field__control" defaultValue={request.guest_count} min={1} name="guestCount" type="number" />
          </label>
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Deposit %" : "% cọc"}</span>
            <input className="portal-field__control" defaultValue={detail.financial_summary.default_deposit_percentage} min={0} name="depositPercent" type="number" />
          </label>
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Custom deposit" : "Cọc tùy chỉnh"}</span>
            <input
              className="portal-field__control"
              min={0}
              name="depositAmount"
              placeholder={locale === "en" ? "Optional amount" : "Không bắt buộc"}
              type="number"
            />
          </label>
        </div>

        <label className="portal-field">
          <span className="portal-field__label">{locale === "en" ? "Branch bank account" : "Tài khoản nhận cọc"}</span>
          <select className="portal-field__control" defaultValue="" name="branchBankAccountId">
            <option value="">{locale === "en" ? "Use default bank account" : "Dùng tài khoản mặc định"}</option>
            {detail.branch_bank_accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.bank_name} • {account.account_number}
              </option>
            ))}
          </select>
        </label>

        <label className="portal-field">
          <span className="portal-field__label">{locale === "en" ? "Operational note" : "Ghi chú vận hành"}</span>
          <textarea className="portal-field__control" defaultValue={request.note} name="notes" rows={3} />
        </label>

        <button className="button admin-booking-detail__primary-action" disabled={!selectedRoomId} type="submit">
          {locale === "en" ? "Confirm availability" : "Xác nhận còn phòng"}
        </button>
      </form>
    </PortalCard>
  );
}

function DepositCard({
  activePaymentRequest,
  detail,
  locale,
  returnTo
}: {
  activePaymentRequest: WorkflowPaymentRequest | null;
  detail: BookingDetailData;
  locale: Locale;
  returnTo: string;
}) {
  const reservation = detail.reservation;
  const [depositPercent, setDepositPercent] = useState(detail.financial_summary.default_deposit_percentage);
  const depositAmount = useMemo(
    () => calculateDepositAmount({
      depositPercent,
      totalAmount: detail.financial_summary.total_amount
    }),
    [depositPercent, detail.financial_summary.total_amount]
  );
  const shouldHighlightRegenerate = depositPercent !== detail.financial_summary.default_deposit_percentage;

  if (!reservation) {
    return null;
  }

  return (
    <PortalCard className="admin-booking-detail__action-card admin-booking-detail__action-card--accent">
      <div className="admin-booking-detail__action-head">
        <span className="admin-booking-detail__action-icon" aria-hidden="true">
          QR
        </span>
        <h3 className="admin-booking-detail__action-title">{locale === "en" ? "Step 2: Deposit QR" : "Bước 2: Thanh toán cọc"}</h3>
      </div>

      <form action={reissueDepositPaymentRequestAction} className="portal-form">
        <input name="reservationId" type="hidden" value={reservation.id} />
        <input name="actorRole" type="hidden" value="staff" />
        <input name="returnTo" type="hidden" value={returnTo} />

        <div className="portal-grid portal-grid--two">
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Deposit %" : "% cọc"}</span>
            <input
              className="portal-field__control"
              min={0}
              name="depositPercent"
              step={1}
              type="number"
              value={depositPercent}
              onChange={(event) => {
                const rawValue = event.currentTarget.value;
                const nextValue = rawValue === "" ? 0 : Number(rawValue);
                setDepositPercent(Number.isFinite(nextValue) ? nextValue : 0);
              }}
            />
          </label>
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Deposit amount" : "Số tiền cọc"}</span>
            <input
              className="portal-field__control"
              min={0}
              name="depositAmount"
              readOnly
              type="number"
              value={depositAmount}
            />
          </label>
        </div>

        <label className="portal-field">
          <span className="portal-field__label">{locale === "en" ? "Branch bank account" : "Tài khoản nhận cọc"}</span>
          <select className="portal-field__control" defaultValue="" name="branchBankAccountId">
            <option value="">{locale === "en" ? "Use default bank account" : "Dùng tài khoản mặc định"}</option>
            {detail.branch_bank_accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.bank_name} • {account.account_number}
              </option>
            ))}
          </select>
        </label>

        <div className="admin-booking-detail__qr-panel">
          {activePaymentRequest?.qr_image_url ? (
            <img alt={activePaymentRequest.payment_code} className="admin-booking-detail__payment-qr-image" src={activePaymentRequest.qr_image_url} />
          ) : (
            <div className="admin-booking-detail__qr-placeholder" aria-hidden="true">
              QR
            </div>
          )}
          <p className="admin-booking-detail__qr-caption">{locale === "en" ? "VietQR - scan to pay" : "VietQR - quét để thanh toán"}</p>
          {activePaymentRequest ? <PaymentRequestActions locale={locale} paymentRequest={activePaymentRequest} returnTo={returnTo} /> : null}
        </div>

        <button className={`button button--text-light ${shouldHighlightRegenerate ? "admin-booking-detail__button--attention" : ""}`} type="submit">
          {activePaymentRequest ? (locale === "en" ? "Regenerate QR" : "Tạo lại mã QR") : locale === "en" ? "Issue QR" : "Tạo mã QR"}
        </button>
      </form>
    </PortalCard>
  );
}

function VerifyDepositCard({
  activePaymentRequest,
  detail,
  locale,
  returnTo
}: {
  activePaymentRequest: WorkflowPaymentRequest | null;
  detail: BookingDetailData;
  locale: Locale;
  returnTo: string;
}) {
  const reservation = detail.reservation;
  const canVerify = activePaymentRequest && ["sent", "pending_verification"].includes(activePaymentRequest.status);

  if (!reservation) {
    return null;
  }

  return (
    <PortalCard className={`admin-booking-detail__action-card${!canVerify ? " admin-booking-detail__action-card--disabled" : ""}`}>
      <div className="admin-booking-detail__action-head">
        <span className="admin-booking-detail__action-icon" aria-hidden="true">
          $
        </span>
        <h3 className="admin-booking-detail__action-title">{locale === "en" ? "Step 3: Confirm deposit" : "Bước 3: Xác nhận nhận cọc"}</h3>
      </div>

      {activePaymentRequest?.latest_proof_uploaded_at ? (
        <p className="admin-booking-detail__action-description">
          {locale === "en" ? "Latest proof uploaded at" : "Proof gần nhất được tải lên lúc"} {formatDateTime(locale, activePaymentRequest.latest_proof_uploaded_at)}
        </p>
      ) : (
        <p className="admin-booking-detail__action-description">
          {locale === "en"
            ? "Manual verification can still be completed even when the payment was checked offline."
            : "Admin vẫn có thể xác nhận thủ công khi đã đối chiếu chuyển khoản ngoài hệ thống."}
        </p>
      )}

      <form action={verifyPaymentRequestAction} className="portal-form">
        <input name="actorRole" type="hidden" value="staff" />
        <input name="paymentRequestId" type="hidden" value={activePaymentRequest?.id ?? ""} />
        <input name="returnTo" type="hidden" value={returnTo} />

        <label className="portal-field">
          <span className="portal-field__label">{locale === "en" ? "Review note" : "Ghi chú kiểm tra"}</span>
          <textarea
            className="portal-field__control"
            name="reviewNote"
            placeholder={locale === "en" ? "Optional note for proof review" : "Ghi chú nội bộ khi xác nhận cọc"}
            rows={3}
          />
        </label>

        <button className="button admin-booking-detail__muted-action" disabled={!canVerify} name="status" type="submit" value="verified">
          {locale === "en" ? "Confirm deposit received" : "Xác nhận đã nhận cọc"}
        </button>

        {canVerify ? (
          <button className="button admin-booking-detail__ghost-danger" name="status" type="submit" value="rejected">
            {locale === "en" ? "Reject proof" : "Từ chối proof"}
          </button>
        ) : null}
      </form>
    </PortalCard>
  );
}

function FinancialSummaryCard({
  detail,
  locale
}: {
  detail: BookingDetailData;
  locale: Locale;
}) {
  return (
    <PortalCard className="admin-booking-detail__finance-card">
      <h3 className="admin-booking-detail__finance-title">{locale === "en" ? "Financial summary" : "Tóm tắt tài chính"}</h3>
      <div className="admin-booking-detail__finance-list">
        <div className="admin-booking-detail__finance-row">
          <span>{locale === "en" ? "Grand total" : "Tổng cộng"}</span>
          <strong>{formatMoney(locale, detail.financial_summary.total_amount)}</strong>
        </div>
        <div className="admin-booking-detail__finance-row admin-booking-detail__finance-row--accent">
          <span>{locale === "en" ? "Deposit target" : "Tiền cọc"}</span>
          <strong>{formatMoney(locale, detail.financial_summary.requested_deposit_amount)}</strong>
        </div>
        <div className="admin-booking-detail__finance-divider" />
        <div className="admin-booking-detail__finance-row admin-booking-detail__finance-row--strong">
          <span>{locale === "en" ? "Remaining balance" : "Còn lại"}</span>
          <strong>{formatMoney(locale, detail.financial_summary.remaining_balance_amount)}</strong>
        </div>
      </div>
    </PortalCard>
  );
}

function FinalActionCard({
  detail,
  locale,
  returnTo
}: {
  detail: BookingDetailData;
  locale: Locale;
  returnTo: string;
}) {
  const reservation = detail.reservation;
  const request = detail.request;
  const canCancelReservation = reservation && !["cancelled", "completed", "expired"].includes(reservation.status);
  const canCompleteReservation = reservation?.status === "confirmed";
  const canRejectRequest = !reservation && request && !["rejected", "closed", "expired"].includes(request.status);

  if (!canCancelReservation && !canCompleteReservation && !canRejectRequest) {
    return null;
  }

  return (
    <PortalCard className="admin-booking-detail__final-card">
      <div className="admin-booking-detail__action-head">
        <span className="admin-booking-detail__action-icon" aria-hidden="true">
          ✓
        </span>
        <h3 className="admin-booking-detail__action-title">{locale === "en" ? "Final actions" : "Kết quả cuối cùng"}</h3>
      </div>

      {canCompleteReservation ? (
        <form action={updateReservationLifecycleAction} className="portal-form">
          <input name="reservationId" type="hidden" value={reservation.id} />
          <input name="status" type="hidden" value="completed" />
          <input name="returnTo" type="hidden" value={returnTo} />
          <textarea className="portal-field__control" name="reason" placeholder={locale === "en" ? "Optional completion note" : "Ghi chú khi hoàn tất booking"} rows={3} />
          <button className="button admin-booking-detail__primary-action" type="submit">
            {locale === "en" ? "Mark booking completed" : "Hoàn tất booking"}
          </button>
        </form>
      ) : null}

      {canCancelReservation ? (
        <form action={updateReservationLifecycleAction} className="portal-form">
          <input name="reservationId" type="hidden" value={reservation.id} />
          <input name="status" type="hidden" value="cancelled" />
          <input name="returnTo" type="hidden" value={returnTo} />
          <textarea
            className="portal-field__control"
            name="reason"
            placeholder={locale === "en" ? "Required cancellation reason" : "Bắt buộc nhập lý do hủy booking"}
            required
            rows={3}
          />
          <button className="button admin-booking-detail__ghost-danger" type="submit">
            {locale === "en" ? "Cancel booking" : "Hủy booking"}
          </button>
        </form>
      ) : null}

      {canRejectRequest ? (
        <form action={updateAvailabilityRequestStatusAction} className="portal-form">
          <input name="availabilityRequestId" type="hidden" value={request.id} />
          <input name="status" type="hidden" value="rejected" />
          <input name="returnTo" type="hidden" value={returnTo} />
          <textarea
            className="portal-field__control"
            name="note"
            placeholder={locale === "en" ? "Required rejection reason" : "Bắt buộc nhập lý do từ chối"}
            required
            rows={3}
          />
          <button className="button admin-booking-detail__ghost-danger" type="submit">
            {locale === "en" ? "Reject request" : "Từ chối yêu cầu"}
          </button>
        </form>
      ) : null}
    </PortalCard>
  );
}

function PaymentRequestActions({
  locale,
  paymentRequest,
  returnTo
}: {
  locale: Locale;
  paymentRequest: WorkflowPaymentRequest;
  returnTo: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const payload = [
      paymentRequest.bank_name,
      paymentRequest.account_number,
      paymentRequest.account_name,
      paymentRequest.transfer_content,
      formatMoney(locale, paymentRequest.amount)
    ].join("\n");

    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="admin-booking-detail__mini-actions">
      <button className="button button--text-light" onClick={handleCopy} type="button">
        {copied ? (locale === "en" ? "Copied" : "Đã sao chép") : locale === "en" ? "Copy info" : "Sao chép"}
      </button>
      <form action={resendDepositRequestEmailAction}>
        <input name="paymentRequestId" type="hidden" value={paymentRequest.id} />
        <input name="returnTo" type="hidden" value={returnTo} />
        <button className="button button--text-light" type="submit">
          {locale === "en" ? "Send email" : "Gửi email"}
        </button>
      </form>
      <form action={notifyPaymentRequestMemberAction}>
        <input name="paymentRequestId" type="hidden" value={paymentRequest.id} />
        <input name="returnTo" type="hidden" value={returnTo} />
        <button className="button button--text-light" type="submit">
          {locale === "en" ? "Notify app" : "Notify app"}
        </button>
      </form>
    </div>
  );
}

function BookingSnapshotCard({
  detail,
  locale
}: {
  detail: BookingDetailData;
  locale: Locale;
}) {
  const booking = detail.booking;
  const request = detail.request;
  const guestName = detail.customer?.full_name ?? booking.customer_name;
  const guestEmail = detail.customer?.email ?? booking.customer_email;
  const guestPhone = detail.customer?.phone ?? request?.contact_phone ?? null;
  const branchLabel = locale === "en" ? booking.branch_name_en : booking.branch_name_vi;
  const roomTypeLabel = locale === "en" ? booking.room_type_name_en : booking.room_type_name_vi;

  return (
    <PortalCard className="admin-booking-detail__surface-card">
      <h3 className="admin-booking-detail__card-title">{locale === "en" ? "Booking snapshot" : "Thông tin booking"}</h3>
      <dl className="portal-profile-list portal-profile-list--dense">
        {renderField(locale === "en" ? "Guest" : "Khách đặt", guestName)}
        {renderField(locale === "en" ? "Email" : "Email", guestEmail)}
        {renderField(locale === "en" ? "Phone" : "Điện thoại", guestPhone)}
        {renderField(locale === "en" ? "Branch" : "Chi nhánh", branchLabel)}
        {renderField(locale === "en" ? "Room type" : "Loại phòng", roomTypeLabel)}
        {renderField(locale === "en" ? "Assigned room" : "Phòng", detail.room_code ?? "—")}
        {renderField(locale === "en" ? "Created at" : "Tạo lúc", formatDateTime(locale, booking.created_at))}
        {renderField(locale === "en" ? "Marketing consent" : "Marketing consent", formatConsent(locale, detail.customer?.marketing_consent ?? request?.marketing_consent ?? null))}
      </dl>
    </PortalCard>
  );
}

function PaymentHistoryTable({
  locale,
  paymentRequests
}: {
  locale: Locale;
  paymentRequests: BookingDetailData["payment_requests"];
}) {
  if (!paymentRequests.length) {
    return <p className="portal-panel__note-copy">{locale === "en" ? "No deposit requests yet." : "Chưa có yêu cầu cọc nào."}</p>;
  }

  return (
    <div className="portal-table-shell">
      <table className="portal-data-table">
        <thead>
          <tr>
            <th>{locale === "en" ? "Payment" : "Thanh toán"}</th>
            <th>{locale === "en" ? "Amount" : "Số tiền"}</th>
            <th>{locale === "en" ? "Status" : "Trạng thái"}</th>
            <th>{locale === "en" ? "Proof" : "Proof"}</th>
          </tr>
        </thead>
        <tbody>
          {paymentRequests.map((paymentRequest) => (
            <tr key={paymentRequest.id}>
              <td>
                <div className="portal-data-table__primary">
                  <strong className="portal-data-table__title">{paymentRequest.payment_code}</strong>
                  <p className="portal-data-table__meta">{paymentRequest.transfer_content}</p>
                </div>
              </td>
              <td>
                <strong className="portal-data-table__title">{formatMoney(locale, paymentRequest.amount)}</strong>
              </td>
              <td>
                <PortalBadge tone={getPaymentTone(paymentRequest.status)}>{statusLabel(locale, paymentRequest.status)}</PortalBadge>
              </td>
              <td>
                <div className="portal-data-table__primary">
                  <strong className="portal-data-table__title">
                    {paymentRequest.latest_proof_status ? statusLabel(locale, paymentRequest.latest_proof_status) : locale === "en" ? "No proof yet" : "Chưa có proof"}
                  </strong>
                  <p className="portal-data-table__meta">
                    {paymentRequest.latest_proof_uploaded_at ? formatDateTime(locale, paymentRequest.latest_proof_uploaded_at) : "—"}
                  </p>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AdminBookingDetailPage({ detail, locale }: AdminBookingDetailPageProps) {
  const booking = detail.booking;
  const request = detail.request;
  const reservation = detail.reservation;
  const backHref = appendLocaleQuery("/admin/bookings", locale);
  const detailHref = appendLocaleQuery(`/admin/bookings/${booking.booking_code}`, locale);
  const workflowHref = request ? appendLocaleQuery(`/admin?request=${request.id}#requests`, locale) : null;
  const activePaymentRequest =
    detail.payment_requests.find((paymentRequest) => ["sent", "pending_verification"].includes(paymentRequest.status)) ??
    detail.payment_requests.find((paymentRequest) => paymentRequest.status === "verified") ??
    null;
  const countdownTarget =
    reservation?.status === "pending_deposit"
      ? reservation.expires_at
      : !reservation && request?.response_due_at
        ? request.response_due_at
        : null;

  return (
    <div className="admin-page admin-booking-detail">
      <PortalCard className="admin-booking-detail__hero-card">
        <div className="admin-booking-detail__hero-top">
          <div>
            <Link className="admin-booking-detail__back-link" href={backHref}>
              ← {locale === "en" ? "Back to bookings" : "Quay lại danh sách booking"}
            </Link>
            <div className="admin-booking-detail__hero-title-row">
              <h1 className="admin-booking-detail__hero-title">{locale === "en" ? "Booking request detail" : "Chi tiết yêu cầu đặt phòng"}</h1>
              <span className="admin-booking-detail__request-pill">{booking.booking_code}</span>
            </div>
            <p className="admin-booking-detail__hero-description">{getWorkflowTitle(detail, locale)}</p>
          </div>
          {countdownTarget ? <CountdownPill expiresAt={countdownTarget} locale={locale} /> : null}
        </div>

        <AdminBookingDetailToolbar
          backHref={backHref}
          backLabel={localize(locale, { vi: "Quay lại", en: "Back" })}
          copyLabel={localize(locale, { vi: "Sao chép link", en: "Copy link" })}
          copiedLabel={localize(locale, { vi: "Đã sao chép", en: "Copied" })}
          emailHref={booking.customer_email ? `mailto:${booking.customer_email}` : null}
          emailLabel={localize(locale, { vi: "Email khách", en: "Email guest" })}
          printLabel={localize(locale, { vi: "In", en: "Print" })}
          workflowHref={workflowHref}
          workflowLabel={localize(locale, { vi: "Mở workflow", en: "Open workflow" })}
        />

        <HeroMetrics detail={detail} locale={locale} />
      </PortalCard>

      <div className="admin-booking-detail__bento">
        <div className="admin-booking-detail__bento-main">
          <GuestBookingCard detail={detail} locale={locale} />
          <ProcessingTimeline detail={detail} locale={locale} />
        </div>

        <div className="admin-booking-detail__bento-side">
          <ConfirmAvailabilityCard detail={detail} locale={locale} returnTo={detailHref} />
          <DepositCard activePaymentRequest={activePaymentRequest} detail={detail} locale={locale} returnTo={detailHref} />
          <VerifyDepositCard activePaymentRequest={activePaymentRequest} detail={detail} locale={locale} returnTo={detailHref} />
          <FinancialSummaryCard detail={detail} locale={locale} />
          <FinalActionCard detail={detail} locale={locale} returnTo={detailHref} />
        </div>
      </div>

      <div className="admin-booking-detail__detail-grid">
        <div className="admin-booking-detail__detail-main">
          <PortalSectionHeading
            description={{
              vi: "Lịch sử các lần phát hành QR cọc, proof, và trạng thái xử lý thanh toán cho booking này.",
              en: "History of issued deposit QRs, uploaded proofs, and manual payment handling for this booking."
            }}
            eyebrow={{ vi: "Payments", en: "Payments" }}
            locale={locale}
            title={{ vi: "Lịch sử thanh toán cọc", en: "Deposit history" }}
          />
          <PortalCard className="admin-booking-detail__surface-card">
            <PaymentHistoryTable locale={locale} paymentRequests={detail.payment_requests} />
          </PortalCard>
        </div>

        <div className="admin-booking-detail__detail-side">
          <BookingSnapshotCard detail={detail} locale={locale} />
        </div>
      </div>
    </div>
  );
}
