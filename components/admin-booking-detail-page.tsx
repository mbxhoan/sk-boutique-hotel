"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AdminBookingDetailToolbar } from "@/components/admin-booking-detail-toolbar";
import { PortalBadge, PortalCard, PortalSectionHeading } from "@/components/portal-ui";
import type { Locale } from "@/lib/locale";
import { appendLocaleQuery } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";
import {
  notifyPaymentRequestMemberAction,
  resendDepositRequestEmailAction,
  updateAvailabilityRequestStatusAction
} from "@/app/(admin)/admin/actions";
import type { BookingDetailData } from "@/lib/supabase/queries/booking-details";
import type { WorkflowAvailabilityRequest, WorkflowBookingRow, WorkflowRoomHold } from "@/lib/supabase/workflow.types";

type AdminBookingDetailPageProps = {
  detail: BookingDetailData;
  locale: Locale;
};

const requestStatusOptions = [
  { value: "new", label: { en: "Mark new", vi: "Đánh dấu mới" } },
  { value: "in_review", label: { en: "Mark in review", vi: "Đang xử lý" } },
  { value: "quoted", label: { en: "Mark quoted", vi: "Đã báo giá" } },
  { value: "closed", label: { en: "Close request", vi: "Đóng request" } },
  { value: "rejected", label: { en: "Reject request", vi: "Từ chối request" } }
] as const;

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
    timeStyle: "short"
  }).format(new Date(value));
}

function formatDateRange(locale: Locale, startAt: string, endAt: string) {
  const formatter = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "vi-VN", {
    dateStyle: "medium"
  });

  return `${formatter.format(new Date(startAt))} → ${formatter.format(new Date(endAt))}`;
}

function statusTone(status: WorkflowBookingRow["status"]) {
  switch (status) {
    case "confirmed":
    case "completed":
    case "converted":
      return "accent" as const;
    case "new":
    case "in_review":
    case "quoted":
    case "draft":
    case "pending_deposit":
      return "soft" as const;
    default:
      return "neutral" as const;
  }
}

function statusLabel(locale: Locale, status: WorkflowBookingRow["status"]) {
  const labels: Record<Locale, Record<WorkflowBookingRow["status"], string>> = {
    en: {
      cancelled: "CANCELLED",
      closed: "CLOSED",
      completed: "COMPLETED",
      converted: "CONVERTED",
      draft: "DRAFT",
      expired: "EXPIRED",
      in_review: "IN REVIEW",
      new: "NEW",
      pending_deposit: "PENDING DEPOSIT",
      confirmed: "CONFIRMED",
      rejected: "REJECTED",
      quoted: "QUOTED"
    },
    vi: {
      cancelled: "ĐÃ HỦY",
      closed: "ĐÃ ĐÓNG",
      completed: "HOÀN TẤT",
      converted: "ĐÃ CHUYỂN",
      draft: "NHÁP",
      expired: "HẾT HẠN",
      in_review: "ĐANG XỬ LÝ",
      new: "MỚI",
      pending_deposit: "CHỜ CỌC",
      confirmed: "ĐÃ XÁC NHẬN",
      rejected: "TỪ CHỐI",
      quoted: "ĐÃ BÁO GIÁ"
    }
  };

  return labels[locale][status] ?? status;
}

function sourceLabel(locale: Locale, source: WorkflowBookingRow["source"]) {
  return localize(locale, {
    vi: source === "reservation" ? "Đặt phòng" : "Yêu cầu",
    en: source === "reservation" ? "Reservation" : "Request"
  });
}

function renderField(label: string, value: string | number | null | undefined) {
  return (
    <div className="portal-profile-list__item">
      <dt className="portal-profile-list__label">{label}</dt>
      <dd className="portal-profile-list__value">{value ?? "—"}</dd>
    </div>
  );
}

function formatCountdown(locale: Locale, expiresAt: string, now = Date.now()) {
  const diffMs = new Date(expiresAt).getTime() - now;

  if (!Number.isFinite(diffMs) || diffMs <= 0) {
    return localize(locale, { vi: "Đã hết hạn", en: "Expired" });
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

function formatConsent(locale: Locale, value: boolean | null | undefined) {
  if (value == null) {
    return "—";
  }

  return value
    ? localize(locale, { vi: "Đã đồng ý", en: "Consented" })
    : localize(locale, { vi: "Chưa đồng ý", en: "Not consented" });
}

function RequestStatusForm({
  locale,
  requestId,
  requestStatus
}: {
  locale: Locale;
  requestId: string;
  requestStatus: WorkflowAvailabilityRequest["status"];
}) {
  const options = requestStatusOptions.filter((option) => option.value !== requestStatus);

  if (!options.length) {
    return null;
  }

  return (
    <form className="admin-booking-detail__status-form" action={updateAvailabilityRequestStatusAction}>
      <input name="actorRole" type="hidden" value="staff" />
      <input name="availabilityRequestId" type="hidden" value={requestId} />
      <label className="portal-field">
        <span className="portal-field__label">{locale === "en" ? "Change to" : "Đổi sang"}</span>
        <select className="portal-field__control" defaultValue={options[0]?.value} name="status">
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label[locale]}
            </option>
          ))}
        </select>
      </label>
      <button className="button button--solid" type="submit">
        {locale === "en" ? "Update status" : "Cập nhật trạng thái"}
      </button>
    </form>
  );
}

function HoldCountdown({ expiresAt, locale }: { expiresAt: string; locale: Locale }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <PortalBadge tone="accent">
      {localize(locale, { vi: "Còn lại", en: "Left" })} {formatCountdown(locale, expiresAt, now)}
    </PortalBadge>
  );
}

function PaymentRequestActions({
  locale,
  paymentRequest
}: {
  locale: Locale;
  paymentRequest: BookingDetailData["payment_requests"][number];
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const payload = [
      paymentRequest.payment_code,
      paymentRequest.bank_name,
      paymentRequest.account_number,
      paymentRequest.account_name,
      paymentRequest.transfer_content,
      formatMoney(locale, paymentRequest.amount)
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="admin-booking-detail__payment-actions">
      <button className="button button--text-light" onClick={handleCopy} type="button">
        {copied ? (locale === "en" ? "Copied" : "Đã sao chép") : locale === "en" ? "Copy transfer info" : "Sao chép thông tin"}
      </button>
      <form action={resendDepositRequestEmailAction}>
        <input name="paymentRequestId" type="hidden" value={paymentRequest.id} />
        <button className="button button--solid" type="submit">
          {locale === "en" ? "Resend email" : "Gửi email"}
        </button>
      </form>
      <form action={notifyPaymentRequestMemberAction}>
        <input name="paymentRequestId" type="hidden" value={paymentRequest.id} />
        <button className="button button--text-light" type="submit">
          {locale === "en" ? "Notify member" : "Gửi thông báo"}
        </button>
      </form>
    </div>
  );
}

function BookingPaymentTable({ locale, detail }: { detail: BookingDetailData; locale: Locale }) {
  if (!detail.payment_requests.length) {
    return (
      <p className="portal-panel__note-copy">
        {locale === "en" ? "No deposit request has been created for this booking yet." : "Chưa có yêu cầu cọc nào được tạo cho booking này."}
      </p>
    );
  }

  const primaryRequest = detail.payment_requests[0];

  return (
    <div className="admin-booking-detail__payment-stack">
      <PortalCard className="admin-booking-detail__payment-hero" tone="soft">
        <div className="admin-booking-detail__payment-hero-copy">
          <p className="portal-panel__eyebrow">{locale === "en" ? "Deposit QR" : "QR deposit"}</p>
          <h3 className="portal-item-card__title">{primaryRequest.payment_code}</h3>
          <p className="portal-item-card__detail">
            {locale === "en"
              ? "Manual deposit payment. The QR and transfer content below are used for bank transfer."
              : "Thanh toán cọc thủ công. QR và nội dung chuyển tiền bên dưới dùng cho giao dịch ngân hàng."}
          </p>
          <dl className="portal-profile-list">
            <div className="portal-profile-list__item">
              <dt className="portal-profile-list__label">{locale === "en" ? "Amount" : "Số tiền"}</dt>
              <dd className="portal-profile-list__value">{formatMoney(locale, primaryRequest.amount)}</dd>
            </div>
            <div className="portal-profile-list__item">
              <dt className="portal-profile-list__label">{locale === "en" ? "Transfer content" : "Nội dung chuyển khoản"}</dt>
              <dd className="portal-profile-list__value">{primaryRequest.transfer_content}</dd>
            </div>
            <div className="portal-profile-list__item">
              <dt className="portal-profile-list__label">{locale === "en" ? "Status" : "Trạng thái"}</dt>
              <dd className="portal-profile-list__value">
                <PortalBadge
                  tone={
                    primaryRequest.status === "verified" ? "accent" : primaryRequest.status === "pending_verification" || primaryRequest.status === "sent" ? "soft" : "neutral"
                  }
                >
                  {primaryRequest.status}
                </PortalBadge>
              </dd>
            </div>
          </dl>
          <PaymentRequestActions locale={locale} paymentRequest={primaryRequest} />
        </div>
        <div className="admin-booking-detail__payment-hero-qr">
          {primaryRequest.qr_image_url ? (
            <img alt={primaryRequest.payment_code} className="admin-booking-detail__payment-qr-image" src={primaryRequest.qr_image_url} />
          ) : null}
        </div>
      </PortalCard>

      <div className="portal-table-shell">
        <table className="portal-data-table">
          <thead>
            <tr>
              <th>{locale === "en" ? "Code" : "Mã"}</th>
              <th>{locale === "en" ? "Amount" : "Số tiền"}</th>
              <th>{locale === "en" ? "Status" : "Trạng thái"}</th>
              <th>{locale === "en" ? "Proof" : "Proof"}</th>
            </tr>
          </thead>
          <tbody>
            {detail.payment_requests.map((paymentRequest) => (
              <tr key={paymentRequest.id}>
                <td>
                  <div className="portal-data-table__primary">
                    <strong className="portal-data-table__title">{paymentRequest.payment_code}</strong>
                    <p className="portal-data-table__meta">{paymentRequest.branch_name_vi}</p>
                  </div>
                </td>
                <td>
                  <strong className="portal-data-table__title">{formatMoney(locale, paymentRequest.amount)}</strong>
                </td>
                <td>
                  <PortalBadge
                    tone={
                      paymentRequest.status === "verified" ? "accent" : paymentRequest.status === "pending_verification" || paymentRequest.status === "sent" ? "soft" : "neutral"
                    }
                  >
                    {paymentRequest.status}
                  </PortalBadge>
                </td>
                <td>
                  <div className="portal-data-table__primary">
                    <strong className="portal-data-table__title">
                      {paymentRequest.latest_proof_status ?? (locale === "en" ? "No proof yet" : "Chưa có proof")}
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
    </div>
  );
}

function BookingTimelineTable({ locale, logs }: { locale: Locale; logs: BookingDetailData["audit_logs"] }) {
  if (!logs.length) {
    return <p className="portal-panel__note-copy">{locale === "en" ? "No audit logs were found for this record." : "Chưa tìm thấy audit log cho record này."}</p>;
  }

  return (
    <div className="portal-table-shell">
      <table className="portal-data-table">
        <thead>
          <tr>
            <th>{locale === "en" ? "Time" : "Thời gian"}</th>
            <th>{locale === "en" ? "Event" : "Sự kiện"}</th>
            <th>{locale === "en" ? "Scope" : "Phạm vi"}</th>
            <th>{locale === "en" ? "Summary" : "Mô tả"}</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((event) => (
            <tr key={event.id}>
              <td>
                <p className="portal-data-table__meta">{formatDateTime(locale, event.happened_at)}</p>
              </td>
              <td>
                <strong className="portal-data-table__title">{event.action}</strong>
              </td>
              <td>
                <p className="portal-data-table__meta">
                  {locale === "en"
                    ? `${event.entity_label_en}${event.branch_name_en ? ` • ${event.branch_name_en}` : ""}`
                    : `${event.entity_label_vi}${event.branch_name_vi ? ` • ${event.branch_name_vi}` : ""}`}
                </p>
              </td>
              <td>
                <p className="portal-data-table__meta">{event.summary}</p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BookingHoldTable({ detail, locale, activeHold }: { detail: BookingDetailData; locale: Locale; activeHold?: WorkflowRoomHold | null }) {
  if (!detail.room_holds.length) {
    return <p className="portal-panel__note-copy">{locale === "en" ? "There is no room hold linked to this record." : "Không có hold phòng nào liên kết với record này."}</p>;
  }

  return (
    <div className="portal-table-shell">
      <table className="portal-data-table">
        <thead>
          <tr>
            <th>{locale === "en" ? "Hold" : "Hold"}</th>
            <th>{locale === "en" ? "Room" : "Phòng"}</th>
            <th>{locale === "en" ? "Stay" : "Lưu trú"}</th>
            <th>{locale === "en" ? "Expires" : "Hết hạn"}</th>
          </tr>
        </thead>
        <tbody>
          {detail.room_holds.map((hold) => (
            <tr className={hold.id === activeHold?.id ? "portal-data-table__row--selected" : ""} key={hold.id}>
              <td>
                <div className="portal-data-table__primary">
                  <strong className="portal-data-table__title">{hold.hold_code}</strong>
                  <p className="portal-data-table__meta">{hold.branch_name_vi}</p>
                </div>
              </td>
              <td>
                <div className="portal-data-table__primary">
                  <strong className="portal-data-table__title">{hold.room_code}</strong>
                  <p className="portal-data-table__meta">{locale === "en" ? hold.room_type_name_en : hold.room_type_name_vi}</p>
                </div>
              </td>
              <td>
                <strong className="portal-data-table__title">{formatDateRange(locale, hold.stay_start_at, hold.stay_end_at)}</strong>
              </td>
              <td>
                <p className="portal-data-table__meta">{formatDateTime(locale, hold.expires_at)}</p>
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
  const nights = calculateNights(booking.stay_start_at, booking.stay_end_at);
  const guestName = detail.customer?.full_name ?? booking.customer_name;
  const guestEmail = detail.customer?.email ?? booking.customer_email;
  const guestPhone = detail.customer?.phone ?? detail.request?.contact_phone ?? null;
  const activeRoomHold = detail.room_holds.find((hold) => hold.status === "active") ?? detail.room_holds[0] ?? null;
  const workflowHref = detail.request ? appendLocaleQuery(`/admin?request=${detail.request.id}`, locale) : null;
  const backHref = appendLocaleQuery("/admin/bookings", locale);
  const roomTypeLabel = locale === "en" ? booking.room_type_name_en : booking.room_type_name_vi;
  const branchLabel = locale === "en" ? booking.branch_name_en : booking.branch_name_vi;
  const canUpdateRequest = booking.source === "availability_request" && detail.request != null;
  const showDepositSection = !["confirmed", "completed", "converted"].includes(booking.status);

  return (
    <div className="admin-page admin-booking-detail">
      <PortalCard className="admin-booking-detail__hero" tone="accent">
        <div className="admin-booking-detail__breadcrumb">
          <Link href={backHref}>{localize(locale, { vi: "Đặt phòng", en: "Bookings" })}</Link>
          <span aria-hidden="true">›</span>
          <span>{booking.booking_code}</span>
        </div>

        <div className="admin-booking-detail__hero-row">
          <div className="admin-booking-detail__hero-copy">
            <p className="portal-panel__eyebrow">{localize(locale, { vi: "Chi tiết booking", en: "Booking detail" })}</p>
            <h1 className="admin-page__title">{booking.booking_code}</h1>
            <p className="admin-page__description">
              {localize(locale, {
                vi: "Màn hình xem nhanh record booking, request, payment và nhật ký xử lý.",
                en: "Quick view for booking records, requests, payments, and handling logs."
              })}
            </p>
          </div>

          <div className="admin-booking-detail__hero-badge">
            <PortalBadge tone={statusTone(booking.status)}>{statusLabel(locale, booking.status)}</PortalBadge>
            <p className="portal-panel__note-copy">{sourceLabel(locale, booking.source)}</p>
          </div>
        </div>

        <AdminBookingDetailToolbar
          backHref={backHref}
          backLabel={localize(locale, { vi: "Quay lại", en: "Back" })}
          copyLabel={localize(locale, { vi: "Sao chép link", en: "Copy link" })}
          copiedLabel={localize(locale, { vi: "Đã sao chép", en: "Copied" })}
          emailHref={guestEmail ? `mailto:${guestEmail}` : null}
          emailLabel={localize(locale, { vi: "Gửi email", en: "Send email" })}
          printLabel={localize(locale, { vi: "In", en: "Print" })}
          workflowHref={workflowHref}
          workflowLabel={localize(locale, { vi: "Mở workflow", en: "Open workflow" })}
        />
      </PortalCard>

      <div className="admin-booking-detail__layout">
        <div className="admin-booking-detail__main">
          <PortalSectionHeading
            description={{
              vi: "Tóm tắt booking, request và các mốc vận hành liên quan.",
              en: "Summary of booking, request, and operational milestones."
            }}
            eyebrow={{ vi: "Booking", en: "Booking" }}
            help={{
              vi: "Nếu record đang ở trạng thái request, thao tác đổi trạng thái sẽ chạy ngay tại đây.",
              en: "If the record is still a request, status updates can be handled right here."
            }}
            locale={locale}
            title={{ vi: "Thông tin booking", en: "Booking summary" }}
          />
          <PortalCard className="admin-booking-detail__panel">
            <dl className="portal-profile-list portal-profile-list--dense">
              {renderField(localize(locale, { vi: "Mã booking", en: "Booking ID" }), booking.booking_code)}
              {renderField(localize(locale, { vi: "Loại record", en: "Record type" }), sourceLabel(locale, booking.source))}
              {renderField(localize(locale, { vi: "Mã request gốc", en: "Original request" }), detail.request?.request_code ?? "—")}
              {renderField(localize(locale, { vi: "Trạng thái", en: "Status" }), statusLabel(locale, booking.status))}
              {renderField(
                localize(locale, { vi: "Hạn phản hồi", en: "Response due" }),
                detail.request?.response_due_at ? formatDateTime(locale, detail.request.response_due_at) : "—"
              )}
              {renderField(localize(locale, { vi: "Chi nhánh", en: "Branch" }), branchLabel)}
              {renderField(localize(locale, { vi: "Ngày ở", en: "Stay" }), formatDateRange(locale, booking.stay_start_at, booking.stay_end_at))}
              {renderField(localize(locale, { vi: "Số đêm", en: "Nights" }), nights)}
              {renderField(localize(locale, { vi: "Loại phòng", en: "Room type" }), roomTypeLabel)}
              {renderField(localize(locale, { vi: "Phòng", en: "Room" }), detail.room_code ?? "—")}
              {renderField(localize(locale, { vi: "Số khách", en: "Guests" }), booking.guest_count)}
              {renderField(localize(locale, { vi: "Tổng tiền", en: "Total amount" }), formatMoney(locale, booking.total_amount))}
              {renderField(localize(locale, { vi: "Tạo lúc", en: "Created at" }), formatDateTime(locale, booking.created_at))}
              {renderField(localize(locale, { vi: "Cập nhật lúc", en: "Updated at" }), formatDateTime(locale, booking.updated_at))}
              {detail.reservation?.confirmed_at
                ? renderField(localize(locale, { vi: "Xác nhận lúc", en: "Confirmed at" }), formatDateTime(locale, detail.reservation.confirmed_at))
                : null}
              {detail.reservation?.deposit_amount != null
                ? renderField(localize(locale, { vi: "Cọc", en: "Deposit" }), formatMoney(locale, detail.reservation.deposit_amount))
                : null}
            </dl>
          </PortalCard>

          <PortalSectionHeading
            description={{
              vi: "Thông tin liên hệ và hồ sơ member/guest cho record này.",
              en: "Contact details and member/guest profile for this record."
            }}
            eyebrow={{ vi: "Hồ sơ", en: "Profile" }}
            help={{
              vi: "Dữ liệu member sẽ ưu tiên customer profile, còn request sẽ fallback sang contact form.",
              en: "Member data prioritizes the customer profile, while request data falls back to the contact form."
            }}
            locale={locale}
            title={{ vi: "Thông tin khách", en: "Guest information" }}
          />
          <PortalCard className="admin-booking-detail__panel">
            <dl className="portal-profile-list portal-profile-list--dense">
              {renderField(localize(locale, { vi: "Tài khoản khách", en: "Customer account" }), detail.customer?.auth_user_id ? localize(locale, { vi: "Đã liên kết", en: "Linked" }) : localize(locale, { vi: "Chưa liên kết", en: "Not linked" }))}
              {renderField(localize(locale, { vi: "Auth user ID", en: "Auth user ID" }), detail.customer?.auth_user_id ?? "—")}
              {renderField(localize(locale, { vi: "Customer ID", en: "Customer ID" }), detail.customer?.id ?? "—")}
              {renderField(localize(locale, { vi: "Họ và tên", en: "Full name" }), guestName)}
              {renderField(localize(locale, { vi: "Email", en: "Email" }), guestEmail)}
              {renderField(localize(locale, { vi: "Số điện thoại", en: "Phone" }), guestPhone)}
              {renderField(
                localize(locale, { vi: "Hoạt động gần nhất", en: "Last seen" }),
                detail.customer?.last_seen_at ? formatDateTime(locale, detail.customer.last_seen_at) : "—"
              )}
              {renderField(
                localize(locale, { vi: "Ngôn ngữ", en: "Language" }),
                detail.customer?.preferred_locale?.toUpperCase() ?? detail.request?.preferred_locale?.toUpperCase() ?? "—"
              )}
              {renderField(
                localize(locale, { vi: "Marketing consent", en: "Marketing consent" }),
                formatConsent(locale, detail.customer?.marketing_consent ?? detail.request?.marketing_consent ?? null)
              )}
              {renderField(
                localize(locale, { vi: "Nguồn hồ sơ", en: "Profile source" }),
                detail.customer?.source ?? detail.request?.source ?? "—"
              )}
              {renderField(
                localize(locale, { vi: "Ghi chú", en: "Notes" }),
                detail.customer?.notes || detail.request?.note || booking.notes || "—"
              )}
            </dl>
          </PortalCard>

          {showDepositSection ? (
            <>
              <PortalSectionHeading
                description={{
                  vi: "Các yêu cầu cọc gắn với booking này và proof tương ứng.",
                  en: "Deposit requests linked to this booking and their proofs."
                }}
                eyebrow={{ vi: "Thanh toán", en: "Payments" }}
                help={{
                  vi: "QR cọc và nội dung chuyển tiền lấy từ payment request gần nhất.",
                  en: "The deposit QR and transfer content are taken from the latest payment request."
                }}
                locale={locale}
                title={{ vi: "Thanh toán cọc", en: "Deposit payment" }}
              />
              <PortalCard className="admin-booking-detail__panel">
                <BookingPaymentTable detail={detail} locale={locale} />
              </PortalCard>
            </>
          ) : null}

          <PortalSectionHeading
            description={{
              vi: "Lịch sử thao tác được ghi lại để staff và admin dễ theo dõi.",
              en: "Recorded actions for staff and admin follow-up."
            }}
            eyebrow={{ vi: "Audit", en: "Audit" }}
            help={{
              vi: "Các thao tác nhạy cảm luôn được log để theo dõi vận hành.",
              en: "Sensitive actions are always logged for operational tracking."
            }}
            locale={locale}
            title={{ vi: "Nhật ký hoạt động", en: "Activity timeline" }}
          />
          <PortalCard className="admin-booking-detail__panel">
            <BookingTimelineTable logs={detail.audit_logs} locale={locale} />
          </PortalCard>
        </div>

        <aside className="admin-booking-detail__aside">
          <PortalSectionHeading
            description={{
              vi: "Trạng thái hiện tại và lối vào workflow chính để staff tiếp tục xử lý.",
              en: "Current status and the main workflow entry point for staff follow-up."
            }}
            eyebrow={{ vi: "Workflow", en: "Workflow" }}
            help={{
              vi: "Request có thể đổi trạng thái trực tiếp, còn booking/reservation sẽ theo workflow dashboard.",
              en: "Requests can be updated directly here, while bookings/reservations follow the workflow dashboard."
            }}
            locale={locale}
            title={{ vi: "Quy trình xử lý", en: "Processing workflow" }}
          />
          <PortalCard className="admin-booking-detail__panel">
            <div className="portal-item-card__top">
              <p className="portal-item-card__code">{booking.booking_code}</p>
              <PortalBadge tone={statusTone(booking.status)}>{statusLabel(locale, booking.status)}</PortalBadge>
            </div>
            <p className="portal-item-card__detail">
              {booking.source === "availability_request"
                ? localize(locale, {
                    vi: "Request này có thể đổi trạng thái ngay tại đây trước khi staff chốt booking.",
                    en: "This request can be updated here before staff confirms the booking."
                  })
                : localize(locale, {
                    vi: "Reservation này đã chuyển sang booking workflow. Các thay đổi quan trọng sẽ xử lý trong queue vận hành.",
                    en: "This reservation has moved into the booking workflow. Major changes are handled in the operations queue."
                  })}
            </p>

            {canUpdateRequest && detail.request ? (
              <RequestStatusForm locale={locale} requestId={detail.request.id} requestStatus={detail.request.status} />
            ) : null}

            {workflowHref ? (
              <Link className="button button--text-light admin-booking-detail__inline-action" href={workflowHref}>
                {localize(locale, { vi: "Mở request trong workflow", en: "Open request in workflow" })}
              </Link>
            ) : null}
          </PortalCard>

          <PortalSectionHeading
            description={{
              vi: "Tài khoản ngân hàng dùng cho deposit của chi nhánh hiện tại.",
              en: "Bank accounts used for deposits in the current branch."
            }}
            eyebrow={{ vi: "Ngân hàng", en: "Banking" }}
            help={{
              vi: "Thông tin này đi cùng payment request để staff và khách hàng cùng đối chiếu.",
              en: "This information travels with the payment request so staff and guests can verify transfers."
            }}
            locale={locale}
            title={{ vi: "Tài khoản chi nhánh", en: "Branch bank accounts" }}
          />
          {detail.branch_bank_accounts.length ? (
            <PortalCard className="admin-booking-detail__panel">
              <div className="portal-table-shell">
                <table className="portal-data-table">
                  <thead>
                    <tr>
                      <th>{locale === "en" ? "Bank" : "Ngân hàng"}</th>
                      <th>{locale === "en" ? "Account" : "Tài khoản"}</th>
                      <th>{locale === "en" ? "Default" : "Mặc định"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.branch_bank_accounts.map((account) => (
                      <tr key={account.id}>
                        <td>
                          <div className="portal-data-table__primary">
                            <strong className="portal-data-table__title">{account.bank_name}</strong>
                            <p className="portal-data-table__meta">{account.account_label}</p>
                          </div>
                        </td>
                        <td>
                          <div className="portal-data-table__primary">
                            <strong className="portal-data-table__title">{account.account_number}</strong>
                            <p className="portal-data-table__meta">{account.account_name}</p>
                          </div>
                        </td>
                        <td>
                          <PortalBadge tone={account.is_default ? "accent" : "neutral"}>
                            {account.is_default ? localize(locale, { vi: "Mặc định", en: "Default" }) : "—"}
                          </PortalBadge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </PortalCard>
          ) : (
            <PortalCard className="admin-booking-detail__empty-card" tone="soft">
              <p className="portal-panel__note-copy">{localize(locale, { vi: "Chưa có tài khoản ngân hàng nào.", en: "No bank account has been added yet." })}</p>
            </PortalCard>
          )}

          <PortalSectionHeading
            description={{
              vi: "Hold hoặc phòng được gắn với record này nếu staff đã giữ chỗ.",
              en: "Holds or rooms linked to this record if staff has already reserved stock."
            }}
            eyebrow={{ vi: "Phòng", en: "Rooms" }}
            help={{
              vi: "Nếu booking chưa có hold, phần này sẽ trống và staff xử lý trong workflow dashboard.",
              en: "If there is no hold yet, this section stays empty and staff will handle it in the workflow dashboard."
            }}
            locale={locale}
            title={{ vi: "Giữ chỗ & phòng", en: "Hold & room" }}
          />
          <PortalCard className="admin-booking-detail__panel">
            {activeRoomHold ? (
              <div className="admin-booking-detail__hold-head">
                <div>
                  <p className="portal-panel__eyebrow">{locale === "en" ? "Active hold" : "Hold đang chạy"}</p>
                  <p className="portal-item-card__title">{activeRoomHold.hold_code}</p>
                </div>
                <HoldCountdown expiresAt={activeRoomHold.expires_at} locale={locale} />
              </div>
            ) : null}
            <BookingHoldTable activeHold={activeRoomHold} detail={detail} locale={locale} />
          </PortalCard>
        </aside>
      </div>
    </div>
  );
}
