"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  confirmAvailabilityRequestAction,
  notifyPaymentRequestMemberAction,
  reissueDepositPaymentRequestAction,
  resendDepositRequestEmailAction,
  releaseExpiredHoldsAction,
  updateManualReservationFinancialsAction,
  updateAvailabilityRequestStatusAction,
  updateReservationLifecycleAction
} from "@/app/(admin)/admin/actions";
import { verifyPaymentRequestAction } from "@/app/actions/payments";
import { calculateDepositAmount } from "@/lib/supabase/booking-finance";
import { AdminBookingDetailToolbar } from "@/components/admin-booking-detail-toolbar";
import { AdminBookingReceiptPrint } from "@/components/admin-booking-receipt-print";
import { PortalSubmitButton } from "@/components/portal-submit-button";
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

function toAsiaSaigonDateInputValue(value: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  return formatter.format(new Date(value));
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
      quoted: "Received",
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
      quoted: "Đã tiếp nhận",
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

function isManualReservation(detail: BookingDetailData) {
  return detail.reservation?.source === "admin_manual_booking";
}

function getWorkflowTitle(detail: BookingDetailData, locale: Locale) {
  const activePaymentRequest =
    detail.payment_requests.find((paymentRequest) => ["sent", "pending_verification"].includes(paymentRequest.status)) ?? null;

  if (detail.booking.status === "expired") {
    return localize(
      locale,
      detail.booking.source === "reservation"
        ? { vi: "Booking này đã hết hạn.", en: "This booking has expired." }
        : { vi: "Yêu cầu này đã hết hạn xử lý.", en: "This request has expired." }
    );
  }

  if (detail.booking.status === "closed") {
    return localize(locale, {
      vi: "Yêu cầu này đã được đóng.",
      en: "This request has been closed."
    });
  }

  if (isManualReservation(detail) && detail.reservation?.status === "completed") {
    return localize(locale, {
      vi: "Booking thủ công đã hoàn tất.",
      en: "The manual booking has been completed."
    });
  }

  if (detail.reservation?.status === "completed") {
    return localize(locale, { vi: "Booking đã hoàn tất", en: "Booking completed" });
  }

  if (detail.reservation?.status === "cancelled" || detail.booking.status === "rejected") {
    return localize(locale, { vi: "Booking đã hủy", en: "Booking cancelled" });
  }

  if (isManualReservation(detail) && detail.reservation?.status === "confirmed") {
    return localize(locale, {
      vi: "Booking thủ công đã được ghi nhận và xác nhận.",
      en: "The manual booking has been recorded and confirmed."
    });
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

  const specialRequest = request?.note || booking.notes || null;
  const branchLabel = locale === "en" ? booking.branch_name_en : booking.branch_name_vi;

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

      <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(0,12,30,0.08)" }}>
        <dl className="portal-profile-list portal-profile-list--dense">
          {renderField(locale === "en" ? "Branch" : "Chi nhánh", branchLabel)}
          {renderField(locale === "en" ? "Assigned room" : "Phòng", detail.room_code ?? "—")}
          {renderField(locale === "en" ? "Created at" : "Tạo lúc", formatDateTime(locale, booking.created_at))}
          {renderField(locale === "en" ? "Marketing consent" : "Marketing consent", formatConsent(locale, detail.customer?.marketing_consent ?? request?.marketing_consent ?? null))}
        </dl>
      </div>

      {specialRequest ? (
        <div className="admin-booking-detail__special-request">
          <p className="admin-booking-detail__meta-label">{locale === "en" ? "Special request" : "Yêu cầu đặc biệt"}</p>
          <p className="admin-booking-detail__special-request-copy">{specialRequest}</p>
        </div>
      ) : null}
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
  const manualReservation = isManualReservation(detail);
  const metrics = manualReservation
    ? ([
        {
          label: locale === "en" ? "Booking value" : "Giá trị booking",
          note: locale === "en" ? `${nights} nights` : `${nights} đêm`,
          tone: "accent",
          value: formatMoney(locale, detail.financial_summary.total_amount)
        },
        {
          label: locale === "en" ? "Received amount" : "Số tiền đã nhận",
          note:
            detail.financial_summary.verified_deposit_amount > 0
              ? locale === "en"
                ? "Recorded manually"
                : "Đã ghi nhận thủ công"
              : locale === "en"
                ? "Nothing collected yet"
                : "Chưa thu tiền",
          tone: "soft",
          value: formatMoney(locale, detail.financial_summary.verified_deposit_amount)
        },
        {
          label: locale === "en" ? "Remaining balance" : "Số tiền còn lại",
          note: locale === "en" ? "Manual booking" : "Booking thủ công",
          tone: "default",
          value: formatMoney(locale, detail.financial_summary.remaining_balance_amount)
        }
      ] as const)
    : ([
        {
          label: locale === "en" ? "Booking value" : "Giá trị booking",
          note: locale === "en" ? `${nights} nights` : `${nights} đêm`,
          tone: "accent",
          value: formatMoney(locale, detail.financial_summary.total_amount)
        },
        {
          label: locale === "en" ? "Deposit target" : "Mục tiêu cọc",
          note:
            detail.financial_summary.active_payment_request_id
              ? locale === "en"
                ? `${detail.financial_summary.requested_deposit_percentage}% current`
                : `${detail.financial_summary.requested_deposit_percentage}% hiện tại`
              : locale === "en"
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
      ] as const);

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
  const manualReservation = isManualReservation(detail);
  const activePaymentRequest =
    detail.payment_requests.find((paymentRequest) => ["sent", "pending_verification"].includes(paymentRequest.status)) ??
    detail.payment_requests.find((paymentRequest) => paymentRequest.status === "verified") ??
    null;
  const requestTerminalWithoutReservation = !reservation && request ? ["closed", "rejected", "expired"].includes(request.status) : false;
  const requestExpired = !reservation && request?.status === "expired";
  const availabilityStepDescription = reservation
    ? localize(locale, {
        vi: "Admin đã chốt phòng và chuyển booking sang trạng thái chờ cọc.",
        en: "The room was confirmed and the booking moved to pending deposit."
      })
    : requestExpired
      ? localize(locale, {
          vi: "Yêu cầu đã hết hạn xử lý trước khi được xác nhận.",
          en: "The request expired before staff could confirm availability."
        })
      : requestTerminalWithoutReservation
        ? localize(locale, {
            vi: "Yêu cầu đã được đóng hoặc từ chối trước khi xác nhận còn phòng.",
            en: "The request was closed or rejected before availability was confirmed."
          })
        : localize(locale, {
            vi: "Đang chờ admin kiểm tra phòng trống và xác nhận booking.",
            en: "Waiting for manual availability confirmation."
          });
  const availabilityStepState: TimelineStepState = reservation || requestTerminalWithoutReservation ? "done" : "active";
  const steps: Array<{
    description: string;
    time: string | null;
    label: string;
    state: TimelineStepState;
  }> = manualReservation
    ? [
        {
          description: localize(locale, {
            vi: `Hệ thống ghi nhận booking thủ công lúc ${formatDateTime(locale, detail.booking.created_at)}`,
            en: `The manual booking entered the system at ${formatDateTime(locale, detail.booking.created_at)}`
          }),
          time: formatDateTime(locale, detail.booking.created_at),
          label: localize(locale, { vi: "Yêu cầu mới", en: "New request" }),
          state: "done"
        },
        {
          description: localize(locale, {
            vi: "Admin đã tạo booking thủ công và bỏ qua bước cọc.",
            en: "Staff created the booking manually and skipped the deposit step."
          }),
          time: reservation?.confirmed_at ? formatDateTime(locale, reservation.confirmed_at) : null,
          label: localize(locale, { vi: "Đặt phòng thủ công", en: "Manual booking" }),
          state: reservation ? "done" : "active"
        },
        {
          description:
            detail.financial_summary.verified_deposit_amount > 0
              ? localize(locale, {
                  vi: `Đã ghi nhận ${formatMoney(locale, detail.financial_summary.verified_deposit_amount)} từ khách.`,
                  en: `Recorded ${formatMoney(locale, detail.financial_summary.verified_deposit_amount)} from the guest.`
                })
              : localize(locale, {
                  vi: "Chưa ghi nhận khoản tiền nào cho booking thủ công này.",
                  en: "No amount has been recorded for this manual booking yet."
                }),
          time:
            reservation?.updated_at && detail.financial_summary.verified_deposit_amount > 0
              ? formatDateTime(locale, reservation.updated_at)
              : reservation?.confirmed_at
                ? formatDateTime(locale, reservation.confirmed_at)
                : null,
          label: localize(locale, { vi: "Số tiền đã nhận", en: "Received amount" }),
          state: detail.financial_summary.verified_deposit_amount > 0 ? "done" : "pending"
        },
        {
          description:
            reservation?.status === "completed"
              ? localize(locale, {
                  vi: "Booking đã kết thúc và được đánh dấu hoàn tất.",
                  en: "The stay was completed and the booking was closed successfully."
                })
              : localize(locale, {
                  vi: "Booking thủ công đã sẵn sàng cho vận hành.",
                  en: "The manual booking is ready for operations."
                }),
          time: reservation?.completed_at
            ? formatDateTime(locale, reservation.completed_at)
            : reservation?.confirmed_at
              ? formatDateTime(locale, reservation.confirmed_at)
              : null,
          label: localize(locale, { vi: "Xác nhận cuối cùng", en: "Final confirmation" }),
          state: reservation?.status === "confirmed" || reservation?.status === "completed" ? "done" : "pending"
        }
      ]
    : [
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
          description: availabilityStepDescription,
          time: reservation?.confirmed_at
            ? formatDateTime(locale, reservation.confirmed_at)
            : requestTerminalWithoutReservation && request?.closed_at
              ? formatDateTime(locale, request.closed_at)
              : request?.response_due_at
                ? formatDateTime(locale, request.response_due_at)
                : null,
          label: localize(locale, { vi: "Xác nhận còn phòng", en: "Confirm availability" }),
          state: availabilityStepState
        },
        {
          description:
            activePaymentRequest?.status === "verified"
              ? localize(locale, {
                  vi: "Cọc đã được khách chuyển và admin đã xác nhận thủ công.",
                  en: "The deposit was paid and manually verified."
                })
              : activePaymentRequest?.latest_proof_uploaded_at
                ? localize(locale, {
                    vi: "Khách đã tải lên ảnh xác nhận thanh toán và đang chờ admin kiểm tra.",
                    en: "Guest has uploaded the payment proof and is waiting for review."
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
      <h3 className="admin-booking-detail__card-title">{locale === "en" ? "History" : "Lịch sử"}</h3>
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

      <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px dashed rgba(0, 12, 30, 0.12)" }}>
        <h4 className="admin-booking-detail__card-title" style={{ fontSize: "1rem", marginBottom: "0.8rem" }}>
          {locale === "en" ? "Deposit history" : "Lịch sử thanh toán cọc"}
        </h4>
        <PaymentHistoryTable locale={locale} paymentRequests={detail.payment_requests} />
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

  if (!request || detail.reservation || ["closed", "rejected", "expired"].includes(request.status)) {
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
        <input name="locale" type="hidden" value={locale} />
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
            <input className="portal-field__control" defaultValue={toAsiaSaigonDateInputValue(request.stay_start_at)} name="stayStartAt" type="date" />
          </label>
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Check-out" : "Check-out"}</span>
            <input className="portal-field__control" defaultValue={toAsiaSaigonDateInputValue(request.stay_end_at)} name="stayEndAt" type="date" />
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

        <PortalSubmitButton className="button admin-booking-detail__primary-action" disabled={!selectedRoomId} pendingLabel={locale === "en" ? "Confirming..." : "Đang xác nhận..."}>
          {locale === "en" ? "Confirm availability" : "Xác nhận còn phòng"}
        </PortalSubmitButton>
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
  const [depositPercent, setDepositPercent] = useState(detail.financial_summary.requested_deposit_percentage);
  useEffect(() => {
    setDepositPercent(detail.financial_summary.requested_deposit_percentage);
  }, [detail.financial_summary.requested_deposit_percentage]);
  const depositAmount = useMemo(
    () => calculateDepositAmount({
      depositPercent,
      totalAmount: detail.financial_summary.total_amount
    }),
    [depositPercent, detail.financial_summary.total_amount]
  );
  const shouldHighlightRegenerate = depositPercent !== detail.financial_summary.requested_deposit_percentage;

  if (!reservation || reservation.status === "confirmed" || reservation.status === "completed") {
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
        <input name="locale" type="hidden" value={locale} />
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

        <PortalSubmitButton
          className={`button button--text-light ${shouldHighlightRegenerate ? "admin-booking-detail__button--attention" : ""}`}
          pendingLabel={locale === "en" ? "Generating..." : "Đang tạo..."}
        >
          {activePaymentRequest ? (locale === "en" ? "Regenerate QR" : "Tạo lại mã QR") : locale === "en" ? "Issue QR" : "Tạo mã QR"}
        </PortalSubmitButton>
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

  if (!reservation || reservation.status === "confirmed" || reservation.status === "completed") {
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
        <div className="admin-booking-detail__action-description">
          <p>
            {locale === "en" ? "Latest proof uploaded at" : "Ảnh xác nhận thanh toán gần nhất được tải lên lúc"} {formatDateTime(locale, activePaymentRequest.latest_proof_uploaded_at)}
          </p>
          {activePaymentRequest.latest_proof_url && (
            <a href={activePaymentRequest.latest_proof_url} rel="noreferrer" target="_blank">
              <img
                alt={locale === "en" ? "Payment proof" : "Ảnh xác nhận thanh toán"}
                src={activePaymentRequest.latest_proof_url}
                style={{
                  borderRadius: "0.5rem",
                  border: "1px solid rgba(0, 12, 30, 0.12)",
                  display: "block",
                  marginTop: "0.6rem",
                  maxHeight: "20rem",
                  maxWidth: "100%",
                  objectFit: "contain"
                }}
              />
            </a>
          )}
        </div>
      ) : (
        <p className="admin-booking-detail__action-description">
          {locale === "en"
            ? "Manual verification can still be completed even when the payment was checked offline."
            : "Admin vẫn có thể xác nhận thủ công khi đã đối chiếu chuyển khoản ngoài hệ thống."}
        </p>
      )}

      <form action={verifyPaymentRequestAction} className="portal-form">
        <input name="actorRole" type="hidden" value="staff" />
        <input name="locale" type="hidden" value={locale} />
        <input name="paymentRequestId" type="hidden" value={activePaymentRequest?.id ?? ""} />
        <input name="returnTo" type="hidden" value={returnTo} />

        <label className="portal-field">
          <span className="portal-field__label">{locale === "en" ? "Review note" : "Ghi chú kiểm tra"}</span>
          <textarea
            className="portal-field__control"
            name="reviewNote"
            placeholder={locale === "en" ? "Optional note for proof review" : "Ghi chú nội bộ khi xác nhận ảnh thanh toán"}
            rows={3}
          />
        </label>

        <PortalSubmitButton
          className="button admin-booking-detail__muted-action"
          disabled={!canVerify}
          name="status"
          pendingLabel={locale === "en" ? "Saving..." : "Đang lưu..."}
          value="verified"
        >
          {locale === "en" ? "Confirm deposit received" : "Xác nhận đã nhận cọc"}
        </PortalSubmitButton>

        {canVerify ? (
          <PortalSubmitButton
            className="button admin-booking-detail__ghost-danger"
            name="status"
            pendingLabel={locale === "en" ? "Saving..." : "Đang lưu..."}
            value="rejected"
          >
            {locale === "en" ? "Reject proof" : "Từ chối ảnh xác nhận"}
          </PortalSubmitButton>
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
  const manualReservation = isManualReservation(detail);

  return (
    <PortalCard className="admin-booking-detail__finance-card">
      <h3 className="admin-booking-detail__finance-title">{locale === "en" ? "Financial summary" : "Tóm tắt tài chính"}</h3>
      <div className="admin-booking-detail__finance-list">
        <div className="admin-booking-detail__finance-row">
          <span>{manualReservation ? (locale === "en" ? "Booking value" : "Giá trị booking") : locale === "en" ? "Grand total" : "Tổng cộng"}</span>
          <strong>{formatMoney(locale, detail.financial_summary.total_amount)}</strong>
        </div>
        <div className="admin-booking-detail__finance-row admin-booking-detail__finance-row--accent">
          <span>{manualReservation ? (locale === "en" ? "Received amount" : "Số tiền đã nhận") : locale === "en" ? "Deposit target" : "Tiền cọc"}</span>
          <strong>{manualReservation ? formatMoney(locale, detail.financial_summary.verified_deposit_amount) : formatMoney(locale, detail.financial_summary.requested_deposit_amount)}</strong>
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

function ManualBookingFinancialCard({
  detail,
  locale,
  returnTo
}: {
  detail: BookingDetailData;
  locale: Locale;
  returnTo: string;
}) {
  const reservation = detail.reservation;

  if (!reservation || reservation.source !== "admin_manual_booking") {
    return null;
  }

  return (
    <PortalCard className="admin-booking-detail__action-card admin-booking-detail__action-card--accent">
      <div className="admin-booking-detail__action-head">
        <span className="admin-booking-detail__action-icon" aria-hidden="true">
          ↔
        </span>
        <h3 className="admin-booking-detail__action-title">{locale === "en" ? "Adjust manual amounts" : "Chỉnh số tiền thủ công"}</h3>
      </div>
      <p className="admin-booking-detail__action-description">
        {localize(locale, {
          vi: "Booking thủ công không dùng cọc. Bạn có thể chỉnh tổng giá trị booking và số tiền đã nhận ngay tại đây.",
          en: "Manual bookings do not use a deposit. You can update the actual booking value and the collected amount here."
        })}
      </p>

      <form action={updateManualReservationFinancialsAction} className="portal-form">
        <input name="actorRole" type="hidden" value="staff" />
        <input name="locale" type="hidden" value={locale} />
        <input name="reservationId" type="hidden" value={reservation.id} />
        <input name="returnTo" type="hidden" value={returnTo} />

        <div className="portal-grid portal-grid--two">
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Booking value" : "Giá trị booking"}</span>
            <input className="portal-field__control" defaultValue={detail.financial_summary.total_amount} min={0} name="totalAmount" step="0.01" type="number" />
          </label>
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Received amount" : "Số tiền đã nhận"}</span>
            <input className="portal-field__control" defaultValue={detail.financial_summary.verified_deposit_amount} min={0} name="depositAmount" step="0.01" type="number" />
          </label>
        </div>

        <PortalSubmitButton className="button button--solid" pendingLabel={locale === "en" ? "Saving..." : "Đang lưu..."}>
          {locale === "en" ? "Save amounts" : "Lưu số tiền"}
        </PortalSubmitButton>
      </form>
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
        <input name="locale" type="hidden" value={locale} />
        <input name="returnTo" type="hidden" value={returnTo} />
        <PortalSubmitButton className="button button--text-light" pendingLabel={locale === "en" ? "Sending..." : "Đang gửi..."}>
          {locale === "en" ? "Send email" : "Gửi email"}
        </PortalSubmitButton>
      </form>
      <form action={notifyPaymentRequestMemberAction}>
        <input name="paymentRequestId" type="hidden" value={paymentRequest.id} />
        <input name="locale" type="hidden" value={locale} />
        <input name="returnTo" type="hidden" value={returnTo} />
        <PortalSubmitButton className="button button--text-light" pendingLabel={locale === "en" ? "Sending..." : "Đang gửi..."}>
          {locale === "en" ? "Notify app" : "Thông báo app"}
        </PortalSubmitButton>
      </form>
    </div>
  );
}


function PaymentHistoryTable({
  locale,
  paymentRequests
}: {
  locale: Locale;
  paymentRequests: BookingDetailData["payment_requests"];
}) {
  const [previewedProof, setPreviewedProof] = useState<{
    url: string;
    title: string;
    fileName: string | null;
    uploadedAt: string | null;
  } | null>(null);

  if (!paymentRequests.length) {
    return <p className="portal-panel__note-copy">{locale === "en" ? "No deposit requests yet." : "Chưa có yêu cầu cọc nào."}</p>;
  }

  return (
    <>
      <div className="portal-table-shell">
        <table className="portal-data-table">
          <thead>
            <tr>
              <th>{locale === "en" ? "Payment" : "Thanh toán"}</th>
              <th>{locale === "en" ? "Amount" : "Số tiền"}</th>
              <th>{locale === "en" ? "Status" : "Trạng thái"}</th>
              <th>{locale === "en" ? "Proof" : "Ảnh xác nhận"}</th>
            </tr>
          </thead>
          <tbody>
            {paymentRequests.map((paymentRequest) => {
              const hasProof = !!paymentRequest.latest_proof_url;
              const proofLabel = paymentRequest.latest_proof_status
                ? statusLabel(locale, paymentRequest.latest_proof_status)
                : locale === "en"
                  ? "No proof yet"
                  : "Chưa có ảnh xác nhận";
              const isClickable = hasProof;

              return (
                <tr
                  key={paymentRequest.id}
                  className={isClickable ? "admin-booking-detail__proof-row" : undefined}
                  onClick={
                    isClickable
                      ? () =>
                          setPreviewedProof({
                            url: paymentRequest.latest_proof_url as string,
                            title: paymentRequest.payment_code,
                            fileName: paymentRequest.latest_proof_file_name,
                            uploadedAt: paymentRequest.latest_proof_uploaded_at
                          })
                      : undefined
                  }
                  role={isClickable ? "button" : undefined}
                  tabIndex={isClickable ? 0 : undefined}
                  onKeyDown={
                    isClickable
                      ? (event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setPreviewedProof({
                              url: paymentRequest.latest_proof_url as string,
                              title: paymentRequest.payment_code,
                              fileName: paymentRequest.latest_proof_file_name,
                              uploadedAt: paymentRequest.latest_proof_uploaded_at
                            });
                          }
                        }
                      : undefined
                  }
                >
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
                      <strong className="portal-data-table__title">{proofLabel}</strong>
                      <p className="portal-data-table__meta">
                        {paymentRequest.latest_proof_uploaded_at ? formatDateTime(locale, paymentRequest.latest_proof_uploaded_at) : "—"}
                        {hasProof ? (
                          <>
                            {" · "}
                            <span className="admin-booking-detail__proof-link">{locale === "en" ? "View image" : "Xem ảnh"}</span>
                          </>
                        ) : null}
                      </p>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {previewedProof ? (
        <ProofImageModal
          locale={locale}
          fileName={previewedProof.fileName}
          onClose={() => setPreviewedProof(null)}
          title={previewedProof.title}
          uploadedAt={previewedProof.uploadedAt}
          url={previewedProof.url}
        />
      ) : null}
    </>
  );
}

function ProofImageModal({
  fileName,
  locale,
  onClose,
  title,
  uploadedAt,
  url
}: {
  fileName: string | null;
  locale: Locale;
  onClose: () => void;
  title: string;
  uploadedAt: string | null;
  url: string;
}) {
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const isPdf = url.toLowerCase().includes(".pdf") || (fileName ?? "").toLowerCase().endsWith(".pdf");

  return (
    <div className="proof-modal" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <div className="proof-modal__card" onClick={(event) => event.stopPropagation()}>
        <header className="proof-modal__head">
          <div>
            <p className="proof-modal__eyebrow">{locale === "en" ? "Payment proof" : "Ảnh xác nhận thanh toán"}</p>
            <h3 className="proof-modal__title">{title}</h3>
            <p className="proof-modal__meta">
              {fileName ? `${fileName} · ` : ""}
              {uploadedAt ? formatDateTime(locale, uploadedAt) : ""}
            </p>
          </div>
          <button className="proof-modal__close" onClick={onClose} type="button" aria-label={locale === "en" ? "Close" : "Đóng"}>
            ×
          </button>
        </header>

        <div className="proof-modal__body">
          {isPdf ? (
            <iframe className="proof-modal__pdf" src={url} title={title} />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="proof-modal__image" src={url} alt={title} />
          )}
        </div>

        <footer className="proof-modal__foot">
          <a className="button button--solid" href={url} rel="noreferrer" target="_blank">
            {locale === "en" ? "Open in new tab" : "Mở trong tab mới"}
          </a>
        </footer>
      </div>
    </div>
  );
}

export function AdminBookingDetailPage({ detail, locale }: AdminBookingDetailPageProps) {
  const booking = detail.booking;
  const request = detail.request;
  const reservation = detail.reservation;
  const router = useRouter();
  const autoExpiryKeyRef = useRef<string | null>(null);
  const backHref = appendLocaleQuery("/admin/bookings", locale);
  const detailHref = appendLocaleQuery(`/admin/bookings/${booking.booking_code}`, locale);
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
  const shouldAutoExpire =
    (!reservation && request ? ["new", "in_review", "quoted"].includes(request.status) : false) || reservation?.status === "pending_deposit";

  useEffect(() => {
    if (!countdownTarget || !shouldAutoExpire) {
      autoExpiryKeyRef.current = null;
      return;
    }

    const targetMs = new Date(countdownTarget).getTime();

    if (!Number.isFinite(targetMs)) {
      return;
    }

    const expiryKey = `${booking.booking_code}:${countdownTarget}`;

    const triggerExpiryCleanup = () => {
      if (autoExpiryKeyRef.current === expiryKey) {
        return;
      }

      autoExpiryKeyRef.current = expiryKey;
      void releaseExpiredHoldsAction(new FormData())
        .catch((error) => {
          console.warn("[workflow] Failed to auto-release expired booking detail", error);
        })
        .finally(() => {
          router.refresh();
        });
    };

    const remainingMs = targetMs - Date.now();

    if (remainingMs <= 0) {
      triggerExpiryCleanup();
      return;
    }

    const timer = window.setTimeout(triggerExpiryCleanup, remainingMs);

    return () => window.clearTimeout(timer);
  }, [booking.booking_code, countdownTarget, router, shouldAutoExpire]);

  const canCancelReservation = reservation && !["cancelled", "completed", "expired"].includes(reservation.status);
  const canCompleteReservation = reservation?.status === "confirmed";
  const canRejectRequest = !reservation && request && !["rejected", "closed", "expired"].includes(request.status);
  const shouldHidePaymentCards = activePaymentRequest?.status === "verified" || reservation?.status === "confirmed" || reservation?.status === "completed";

  return (
    <div className="admin-page admin-booking-detail">
      <PortalCard className="admin-booking-detail__hero-card">
        <div className="admin-booking-detail__hero-top">
          <div className="admin-booking-detail__hero-copy">
            <Link className="admin-booking-detail__back-link" href={backHref}>
              ← {locale === "en" ? "Back to bookings" : "Quay lại danh sách booking"}
            </Link>
            <div className="admin-booking-detail__hero-title-row">
              <h1 className="admin-booking-detail__hero-title">{locale === "en" ? "Booking request detail" : "Chi tiết yêu cầu đặt phòng"}</h1>
              <span className="admin-booking-detail__request-pill">{booking.booking_code}</span>
            </div>
            <p className="admin-booking-detail__hero-description">{getWorkflowTitle(detail, locale)}</p>
          </div>
          <div className="admin-booking-detail__hero-actions">
            {countdownTarget ? <CountdownPill expiresAt={countdownTarget} locale={locale} /> : null}
            <AdminBookingDetailToolbar
              canCancel={!!reservation && ["confirmed", "pending_deposit"].includes(reservation.status)}
              canComplete={!!reservation && reservation.status === "confirmed"}
              canPrint={reservation?.status === "completed"}
              canReject={booking.status === "new" || booking.status === "in_review"}
              canResendEmail={!!activePaymentRequest && activePaymentRequest.status !== "verified"}
              canVerify={!!activePaymentRequest && ["sent", "pending_verification"].includes(activePaymentRequest.status)}
              locale={locale}
              paymentRequestId={activePaymentRequest?.id}
              printLabel={locale === "en" ? "Print" : "In"}
              requestId={request?.id}
              reservationId={reservation?.id}
              returnTo={detailHref}
            />
          </div>
        </div>

        <HeroMetrics detail={detail} locale={locale} />
      </PortalCard>

      <div className="admin-booking-detail__bento">
        <div className="admin-booking-detail__bento-main">
          <GuestBookingCard detail={detail} locale={locale} />
          <ProcessingTimeline detail={detail} locale={locale} />
        </div>

        <div className="admin-booking-detail__bento-side">
          <ConfirmAvailabilityCard detail={detail} locale={locale} returnTo={detailHref} />
          {!shouldHidePaymentCards && (
            <>
              <DepositCard activePaymentRequest={activePaymentRequest} detail={detail} locale={locale} returnTo={detailHref} />
              <VerifyDepositCard activePaymentRequest={activePaymentRequest} detail={detail} locale={locale} returnTo={detailHref} />
            </>
          )}
          <ManualBookingFinancialCard detail={detail} locale={locale} returnTo={detailHref} />
          <FinancialSummaryCard detail={detail} locale={locale} />
        </div>
      </div>

      {reservation?.status === "completed" ? <AdminBookingReceiptPrint detail={detail} locale={locale} /> : null}
    </div>
  );
}
