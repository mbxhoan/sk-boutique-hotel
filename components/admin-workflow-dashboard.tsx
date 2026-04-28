"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { Locale } from "@/lib/locale";
import { appendLocaleQuery } from "@/lib/locale";
import { PortalSubmitButton } from "@/components/portal-submit-button";
import { PortalBadge, PortalCard, PortalHelp, PortalSectionHeading, PortalStatCard } from "@/components/portal-ui";
import {
  confirmAvailabilityRequestAction,
  createPaymentRequestAction,
  createReservationAction,
  createRoomHoldAction,
  releaseExpiredHoldsAction,
  updateAvailabilityRequestStatusAction,
  sendEmailTestAction,
  verifyPaymentRequestAction
} from "@/app/(admin)/admin/actions";
import { adminDashboardCopy } from "@/lib/mock/admin-dashboard";
import { emailTemplateTestOptions } from "@/lib/email/test-presets";
import type {
  WorkflowAvailabilityRequest,
  WorkflowDashboardData,
  WorkflowBranchBankAccountOption,
  WorkflowReservation,
  WorkflowRoomHold,
  WorkflowRoomSuggestion,
  WorkflowRoomTypeOption,
  WorkflowPaymentRequest,
  WorkflowStatCard
} from "@/lib/supabase/workflow.types";

type AdminWorkflowDashboardProps = {
  canOperate: boolean;
  data: WorkflowDashboardData;
  locale: Locale;
  testEmailDefaultRecipient: string;
};

function buildMap<T extends { id: string }>(items: T[]) {
  return Object.fromEntries(items.map((item) => [item.id, item])) as Record<string, T>;
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

function toAsiaSaigonDateInputValue(value: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  return formatter.format(new Date(value));
}

function formatMoney(locale: Locale, value: number, currency = "VND") {
  const formatted = new Intl.NumberFormat(locale === "en" ? "en-US" : "vi-VN", {
    maximumFractionDigits: 0
  }).format(value);

  return `${formatted} VND`;
}

function calculateNights(startAt: string, endAt: string) {
  const diffMs = new Date(endAt).getTime() - new Date(startAt).getTime();

  if (!Number.isFinite(diffMs) || diffMs <= 0) {
    return 1;
  }

  return Math.max(1, Math.round(diffMs / 86_400_000));
}

function getRoomTypePricing(roomType?: WorkflowRoomTypeOption | null) {
  const basePrice = roomType?.base_price ?? 0;
  const manualOverridePrice = roomType?.manual_override_price ?? null;
  const nightlyRate = manualOverridePrice ?? basePrice;
  const weekendSurcharge = roomType?.weekend_surcharge ?? 0;

  return {
    basePrice,
    manualOverridePrice,
    nightlyRate,
    weekendSurcharge
  };
}

function getReservationTotal(roomType: WorkflowRoomTypeOption | undefined, startAt: string, endAt: string) {
  const pricing = getRoomTypePricing(roomType);
  const nights = calculateNights(startAt, endAt);

  return pricing.nightlyRate * nights + pricing.weekendSurcharge;
}

function getRequestNightlyRate(request: WorkflowAvailabilityRequest, roomType?: WorkflowRoomTypeOption | null) {
  if (request.quoted_nightly_rate != null) {
    return request.quoted_nightly_rate;
  }

  if (request.quoted_total_amount != null) {
    return Number((request.quoted_total_amount / calculateNights(request.stay_start_at, request.stay_end_at)).toFixed(2));
  }

  return getRoomTypePricing(roomType).nightlyRate;
}

function getRequestTotal(request: WorkflowAvailabilityRequest, roomType?: WorkflowRoomTypeOption | null) {
  if (request.quoted_total_amount != null) {
    return request.quoted_total_amount;
  }

  return getReservationTotal(roomType ?? undefined, request.stay_start_at, request.stay_end_at);
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

function CountdownBadge({
  expiresAt,
  locale,
  tone = "accent"
}: {
  expiresAt: string;
  locale: Locale;
  tone?: "accent" | "neutral" | "soft";
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <PortalBadge tone={tone}>
      {locale === "en" ? "Time left" : "Còn lại"} {formatCountdown(locale, expiresAt, now)}
    </PortalBadge>
  );
}

function badgeToneForRequest(status: WorkflowAvailabilityRequest["status"]) {
  switch (status) {
    case "quoted":
    case "converted":
      return "accent" as const;
    case "new":
    case "in_review":
      return "soft" as const;
    default:
      return "neutral" as const;
  }
}

function badgeToneForHold(status: WorkflowRoomHold["status"]) {
  switch (status) {
    case "active":
      return "accent" as const;
    case "converted":
      return "soft" as const;
    default:
      return "neutral" as const;
  }
}

function badgeToneForReservation(status: WorkflowReservation["status"]) {
  switch (status) {
    case "confirmed":
      return "accent" as const;
    case "pending_deposit":
    case "draft":
    case "expired":
      return "soft" as const;
    default:
      return "neutral" as const;
  }
}

function badgeToneForPayment(status: WorkflowPaymentRequest["status"]) {
  switch (status) {
    case "verified":
      return "accent" as const;
    case "pending_verification":
    case "sent":
      return "soft" as const;
    default:
      return "neutral" as const;
  }
}

function statusLabel(locale: Locale, status: string) {
  const labels: Record<Locale, Record<string, string>> = {
    en: {
      cancelled: "Cancelled",
      closed: "Closed",
      completed: "Completed",
      converted: "Converted",
      draft: "Draft",
      expired: "Expired",
      in_review: "In review",
      new: "New",
      pending_deposit: "Pending deposit",
      pending_verification: "Pending verification",
      quoted: "Quoted",
      rejected: "Rejected",
      released: "Released",
      sent: "Sent",
      active: "Active",
      confirmed: "Confirmed",
      verified: "Verified",
      proof_uploaded: "Proof uploaded"
    },
    vi: {
      cancelled: "Đã hủy",
      closed: "Đã đóng",
      completed: "Hoàn tất",
      converted: "Đã chuyển",
      draft: "Nháp",
      expired: "Hết hạn",
      in_review: "Đang duyệt",
      new: "Mới",
      pending_deposit: "Chờ deposit",
      pending_verification: "Chờ verify",
      quoted: "Đã báo giá",
      rejected: "Từ chối",
      released: "Đã release",
      sent: "Đã gửi",
      active: "Đang giữ",
      confirmed: "Đã xác nhận",
      verified: "Đã duyệt",
      proof_uploaded: "Đã upload proof"
    }
  };

  return labels[locale][status] ?? status;
}

const availabilityRequestStatusTransitions = [
  {
    value: "new",
    label: {
      en: "Mark new",
      vi: "Đánh dấu mới"
    }
  },
  {
    value: "in_review",
    label: {
      en: "Mark in review",
      vi: "Đang xử lý"
    }
  },
  {
    value: "quoted",
    label: {
      en: "Mark quoted",
      vi: "Đã báo giá"
    }
  },
  {
    value: "closed",
    label: {
      en: "Close request",
      vi: "Đóng request"
    }
  },
  {
    value: "rejected",
    label: {
      en: "Reject request",
      vi: "Từ chối request"
    }
  }
] as const;

function buildAdminHref(locale: Locale, requestId: string) {
  return appendLocaleQuery(`/admin?request=${requestId}`, locale);
}

function buildLookupMaps(data: WorkflowDashboardData) {
  return {
    roomTypeMap: buildMap(data.room_type_options)
  };
}

function SectionEmptyState({ locale, title, description }: { description: string; locale: Locale; title: string }) {
  return (
    <PortalCard className="portal-empty-state" tone="soft">
      <p className="portal-panel__eyebrow">{title}</p>
      <p className="portal-panel__note-copy">{description}</p>
    </PortalCard>
  );
}

function RequestInboxTable({
  locale,
  requests,
  selectedRequestId
}: {
  locale: Locale;
  requests: WorkflowAvailabilityRequest[];
  selectedRequestId: string | null;
}) {
  return (
    <div className="portal-table-shell">
      <table className="portal-data-table">
        <thead>
          <tr>
            <th>{locale === "en" ? "Request" : "Request"}</th>
            <th>{locale === "en" ? "Guest" : "Khách"}</th>
            <th>{locale === "en" ? "Stay" : "Lưu trú"}</th>
            <th>{locale === "en" ? "Room type" : "Hạng phòng"}</th>
            <th>{locale === "en" ? "Status" : "Trạng thái"}</th>
            <th>{locale === "en" ? "Action" : "Xử lý"}</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => {
            const selected = selectedRequestId === request.id;

            return (
              <tr className={selected ? "portal-data-table__row portal-data-table__row--selected" : "portal-data-table__row"} key={request.id}>
                <td>
                  <div className="portal-data-table__primary">
                    <strong className="portal-data-table__title">{request.request_code}</strong>
                    <p className="portal-data-table__meta">{locale === "en" ? request.branch_name_en : request.branch_name_vi}</p>
                  </div>
                </td>
                <td>
                  <div className="portal-data-table__primary">
                    <strong className="portal-data-table__title">{request.contact_name}</strong>
                    <p className="portal-data-table__meta">
                      <a className="button button--text-light" href={`mailto:${request.contact_email}`}>
                        {request.contact_email}
                      </a>
                    </p>
                  </div>
                </td>
                <td>
                  <div className="portal-data-table__primary">
                    <strong className="portal-data-table__title">{formatDateRange(locale, request.stay_start_at, request.stay_end_at)}</strong>
                    <p className="portal-data-table__meta">{request.guest_count} guest(s)</p>
                  </div>
                </td>
                <td>
                  <div className="portal-data-table__primary">
                    <strong className="portal-data-table__title">
                      {locale === "en" ? request.room_type_name_en : request.room_type_name_vi}
                    </strong>
                    <p className="portal-data-table__meta">{request.note || "—"}</p>
                  </div>
                </td>
                <td>
                  <div className="portal-data-table__status">
                    <PortalBadge tone={badgeToneForRequest(request.status)}>{statusLabel(locale, request.status)}</PortalBadge>
                  </div>
                </td>
                <td>
                  <div className="portal-data-table__actions">
                    <Link className="button button--text-light" href={buildAdminHref(locale, request.id)}>
                      {locale === "en" ? "Open" : "Mở"}
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function HoldTable({
  holds,
  locale
}: {
  holds: WorkflowRoomHold[];
  locale: Locale;
}) {
  return (
    <div className="portal-table-shell">
      <table className="portal-data-table">
        <thead>
          <tr>
            <th>{locale === "en" ? "Hold" : "Hold"}</th>
            <th>{locale === "en" ? "Room" : "Phòng"}</th>
            <th>{locale === "en" ? "Stay" : "Lưu trú"}</th>
            <th>{locale === "en" ? "Expires" : "Hết hạn"}</th>
            <th>{locale === "en" ? "Status" : "Trạng thái"}</th>
          </tr>
        </thead>
        <tbody>
          {holds.map((hold) => (
            <tr key={hold.id}>
              <td>
                <div className="portal-data-table__primary">
                  <strong className="portal-data-table__title">{hold.hold_code}</strong>
                  <p className="portal-data-table__meta">{locale === "en" ? hold.branch_name_en : hold.branch_name_vi}</p>
                </div>
              </td>
              <td>
                <div className="portal-data-table__primary">
                  <strong className="portal-data-table__title">{hold.room_code}</strong>
                  <p className="portal-data-table__meta">
                    {locale === "en" ? hold.room_type_name_en : hold.room_type_name_vi}
                  </p>
                </div>
              </td>
              <td>
                <strong className="portal-data-table__title">{formatDateRange(locale, hold.stay_start_at, hold.stay_end_at)}</strong>
              </td>
              <td>
                <p className="portal-data-table__meta">{formatDateTime(locale, hold.expires_at)}</p>
              </td>
              <td>
                <PortalBadge tone={badgeToneForHold(hold.status)}>{statusLabel(locale, hold.status)}</PortalBadge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ReservationTable({
  locale,
  reservations
}: {
  locale: Locale;
  reservations: WorkflowReservation[];
}) {
  return (
    <div className="portal-table-shell">
      <table className="portal-data-table">
        <thead>
          <tr>
            <th>{locale === "en" ? "Booking" : "Booking"}</th>
            <th>{locale === "en" ? "Customer" : "Khách"}</th>
            <th>{locale === "en" ? "Stay" : "Lưu trú"}</th>
            <th>{locale === "en" ? "Room" : "Phòng"}</th>
            <th>{locale === "en" ? "Status" : "Trạng thái"}</th>
            <th>{locale === "en" ? "Amount" : "Số tiền"}</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((reservation) => (
            <tr key={reservation.id}>
              <td>
                <div className="portal-data-table__primary">
                  <strong className="portal-data-table__title">{reservation.booking_code}</strong>
                  <p className="portal-data-table__meta">{locale === "en" ? reservation.branch_name_en : reservation.branch_name_vi}</p>
                </div>
              </td>
              <td>
                <div className="portal-data-table__primary">
                  <strong className="portal-data-table__title">{reservation.customer_name}</strong>
                  <p className="portal-data-table__meta">{reservation.customer_email}</p>
                </div>
              </td>
              <td>
                <strong className="portal-data-table__title">
                  {formatDateRange(locale, reservation.stay_start_at, reservation.stay_end_at)}
                </strong>
              </td>
              <td>
                <div className="portal-data-table__primary">
                  <strong className="portal-data-table__title">{reservation.room_code}</strong>
                  <p className="portal-data-table__meta">
                    {locale === "en" ? reservation.primary_room_type_name_en : reservation.primary_room_type_name_vi}
                  </p>
                </div>
              </td>
              <td>
                <PortalBadge tone={badgeToneForReservation(reservation.status)}>{statusLabel(locale, reservation.status)}</PortalBadge>
              </td>
              <td>
                <strong className="portal-data-table__title">{formatMoney(locale, reservation.total_amount)}</strong>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BranchTable({
  branches,
  locale
}: {
  branches: WorkflowDashboardData["branch_options"];
  locale: Locale;
}) {
  return (
    <div className="portal-table-shell">
      <table className="portal-data-table">
        <thead>
          <tr>
            <th>{locale === "en" ? "Branch" : "Chi nhánh"}</th>
            <th>{locale === "en" ? "Code" : "Mã"}</th>
            <th>{locale === "en" ? "Slug" : "Slug"}</th>
            <th>{locale === "en" ? "Timezone" : "Múi giờ"}</th>
          </tr>
        </thead>
        <tbody>
          {branches.map((branch) => (
            <tr key={branch.id}>
              <td>
                <div className="portal-data-table__primary">
                  <strong className="portal-data-table__title">{locale === "en" ? branch.name_en : branch.name_vi}</strong>
                  <p className="portal-data-table__meta">{branch.id}</p>
                </div>
              </td>
              <td>
                <strong className="portal-data-table__title">{branch.code}</strong>
              </td>
              <td>
                <p className="portal-data-table__meta">{branch.slug}</p>
              </td>
              <td>
                <p className="portal-data-table__meta">{branch.timezone}</p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AuditTable({
  events,
  locale
}: {
  events: WorkflowDashboardData["audit_logs"];
  locale: Locale;
}) {
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
          {events.map((event) => (
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

function RequestSummaryCard({
  locale,
  request,
  selected
}: {
  locale: Locale;
  request: WorkflowAvailabilityRequest;
  selected: boolean;
}) {
  return (
    <PortalCard className="portal-workflow-card" tone={selected ? "accent" : "default"}>
      <div className="portal-item-card__top">
        <p className="portal-item-card__code">{request.request_code}</p>
        <PortalBadge tone={badgeToneForRequest(request.status)}>{statusLabel(locale, request.status)}</PortalBadge>
      </div>
      <h3 className="portal-item-card__title">{request.contact_name}</h3>
      <dl className="portal-profile-list">
        <div className="portal-profile-list__item">
          <dt className="portal-profile-list__label">{locale === "en" ? "Branch" : "Chi nhánh"}</dt>
          <dd className="portal-profile-list__value">{locale === "en" ? request.branch_name_en : request.branch_name_vi}</dd>
        </div>
        <div className="portal-profile-list__item">
          <dt className="portal-profile-list__label">{locale === "en" ? "Stay" : "Lưu trú"}</dt>
          <dd className="portal-profile-list__value">{formatDateRange(locale, request.stay_start_at, request.stay_end_at)}</dd>
        </div>
        <div className="portal-profile-list__item">
          <dt className="portal-profile-list__label">{locale === "en" ? "Room type" : "Loại phòng"}</dt>
          <dd className="portal-profile-list__value">
            {locale === "en" ? request.room_type_name_en : request.room_type_name_vi}
          </dd>
        </div>
      </dl>
      <p className="portal-item-card__detail">
        <a className="button button--text-light" href={`mailto:${request.contact_email}`}>
          {request.contact_email}
        </a>
      </p>
      {request.contact_phone ? (
        <p className="portal-item-card__note">
          <a className="button button--text-light" href={`tel:${request.contact_phone}`}>
            {request.contact_phone}
          </a>
        </p>
      ) : null}
      {request.note ? <p className="portal-item-card__note">{request.note}</p> : null}
      <Link className="button button--text-light" href={buildAdminHref(locale, request.id)}>
        {locale === "en" ? "Load suggestions" : "Tải gợi ý"}
      </Link>
    </PortalCard>
      );
}

function RequestDetailPanel({
  canOperate,
  branchBankAccounts,
  locale,
  roomType,
  roomTypes,
  request,
  roomSuggestions
}: {
  canOperate: boolean;
  branchBankAccounts: WorkflowBranchBankAccountOption[];
  locale: Locale;
  request: WorkflowAvailabilityRequest | null;
  roomSuggestions: WorkflowRoomSuggestion[];
  roomType: WorkflowRoomTypeOption | null;
  roomTypes: WorkflowRoomTypeOption[];
}) {
  if (!request) {
    return (
      <SectionEmptyState
        description={locale === "en" ? "Pick a request from the inbox to see room suggestions." : "Chọn một request để xem gợi ý phòng."}
        locale={locale}
        title={locale === "en" ? "Selected request" : "Request đã chọn"}
      />
    );
  }

  const pricing = getRoomTypePricing(roomType);
  const nights = calculateNights(request.stay_start_at, request.stay_end_at);
  const nightlyRate = getRequestNightlyRate(request, roomType);
  const totalAmount = getRequestTotal(request, roomType);
  const alternativeStatuses = availabilityRequestStatusTransitions.filter((option) => option.value !== request.status);

  return (
    <PortalCard className="portal-panel" tone="accent">
      <div className="portal-item-card__top">
        <div>
          <p className="portal-item-card__code">{request.request_code}</p>
          <h3 className="portal-item-card__title">
            {locale === "en" ? request.room_type_name_en : request.room_type_name_vi}
          </h3>
        </div>
        <PortalBadge tone={badgeToneForRequest(request.status)}>{statusLabel(locale, request.status)}</PortalBadge>
      </div>

      <dl className="portal-profile-list">
        <div className="portal-profile-list__item">
          <dt className="portal-profile-list__label">{locale === "en" ? "Guest" : "Khách"}</dt>
          <dd className="portal-profile-list__value">{request.contact_name}</dd>
        </div>
        <div className="portal-profile-list__item">
          <dt className="portal-profile-list__label">{locale === "en" ? "Dates" : "Ngày ở"}</dt>
          <dd className="portal-profile-list__value">{formatDateRange(locale, request.stay_start_at, request.stay_end_at)}</dd>
        </div>
        <div className="portal-profile-list__item">
          <dt className="portal-profile-list__label">{locale === "en" ? "Guests" : "Số khách"}</dt>
          <dd className="portal-profile-list__value">{request.guest_count}</dd>
        </div>
        <div className="portal-profile-list__item">
          <dt className="portal-profile-list__label">{locale === "en" ? "Contact" : "Liên hệ"}</dt>
          <dd className="portal-profile-list__value">{request.contact_email}</dd>
        </div>
        {request.contact_phone ? (
          <div className="portal-profile-list__item">
            <dt className="portal-profile-list__label">{locale === "en" ? "Phone" : "Số điện thoại"}</dt>
            <dd className="portal-profile-list__value">
              <a className="button button--text-light" href={`tel:${request.contact_phone}`}>
                {request.contact_phone}
              </a>
            </dd>
          </div>
        ) : null}
      </dl>

      {request.note ? <p className="portal-item-card__note">{request.note}</p> : null}

      <div className="portal-workflow-card__status-strip">
        <div className="portal-workflow-card__status-current">
          <p className="portal-panel__eyebrow">{locale === "en" ? "Current status" : "Trạng thái hiện tại"}</p>
          <PortalBadge tone={badgeToneForRequest(request.status)}>{statusLabel(locale, request.status)}</PortalBadge>
          <div className="portal-panel__note-copy">
            <CountdownBadge expiresAt={request.response_due_at} locale={locale} tone="soft" />
          </div>
        </div>
        {canOperate ? (
          <form className="portal-form portal-workflow-card__status-form" action={updateAvailabilityRequestStatusAction}>
            <input name="availabilityRequestId" type="hidden" value={request.id} />
            <input name="actorRole" type="hidden" value="staff" />
            <input name="locale" type="hidden" value={locale} />
            {alternativeStatuses.length ? (
              <label className="portal-field">
                <span className="portal-field__label">{locale === "en" ? "Change to" : "Đổi sang"}</span>
                <select className="portal-field__control" name="status" defaultValue={alternativeStatuses[0].value}>
                  {alternativeStatuses.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label[locale]}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <PortalSubmitButton className="button button--solid" disabled={!alternativeStatuses.length} pendingLabel={locale === "en" ? "Updating..." : "Đang cập nhật..."}>
              {locale === "en" ? "Update status" : "Cập nhật trạng thái"}
            </PortalSubmitButton>
          </form>
        ) : null}
      </div>

      <p className="portal-panel__eyebrow">{locale === "en" ? "Guest contact" : "Liên hệ khách"}</p>
      <div className="portal-workflow-card__contact-actions">
        <a className="button button--text-light" href={`mailto:${request.contact_email}`}>
          {locale === "en" ? "Email guest" : "Email khách"}
        </a>
        {request.contact_phone ? (
          <a className="button button--text-light" href={`tel:${request.contact_phone}`}>
            {locale === "en" ? "Call guest" : "Gọi khách"}
        </a>
      ) : null}
      </div>

      <div className="portal-panel__note-copy portal-workflow-card__hint-line">
        <span>
          {locale === "en"
            ? "Room suggestions are filtered by the selected branch, room type, and stay window."
            : "Gợi ý phòng được lọc theo chi nhánh, loại phòng và khung thời gian đã chọn."}
        </span>
        <PortalHelp
          content={
            locale === "en"
              ? "If you change room type or stay window, refresh the request to reload suggestions before confirming."
              : "Nếu đổi loại phòng hoặc khung lưu trú, hãy tải lại request để gợi ý phòng khớp trước khi xác nhận."
          }
          locale={locale}
        />
      </div>

      {canOperate ? (
        <form className="portal-form portal-workflow-card__confirm-form" action={confirmAvailabilityRequestAction}>
          <input name="actorRole" type="hidden" value="staff" />
          <input name="locale" type="hidden" value={locale} />
          <input name="availabilityRequestId" type="hidden" value={request.id} />
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Room type" : "Hạng phòng"}</span>
            <select className="portal-field__control" defaultValue={request.room_type_id} name="roomTypeId">
              {roomTypes.map((option) => (
                <option key={option.id} value={option.id}>
                  {locale === "en" ? option.name_en : option.name_vi}
                </option>
              ))}
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
          <div className="portal-grid portal-grid--two">
            <label className="portal-field">
              <span className="portal-field__label">{locale === "en" ? "Room" : "Phòng"}</span>
              <select className="portal-field__control" defaultValue={roomSuggestions[0]?.id ?? ""} name="roomId">
                {roomSuggestions.length ? (
                  roomSuggestions.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.code} • {locale === "en" ? room.room_type_name_en : room.room_type_name_vi}
                    </option>
                  ))
                ) : (
                  <option value="">{locale === "en" ? "No available room" : "Không có phòng phù hợp"}</option>
                )}
              </select>
            </label>
            <label className="portal-field">
              <span className="portal-field__label">{locale === "en" ? "Guests" : "Khách"}</span>
              <input className="portal-field__control" defaultValue={request.guest_count} min={1} name="guestCount" type="number" />
            </label>
          </div>
          <label className="portal-field">
            <span className="portal-field__label">
              {locale === "en" ? "Deposit amount" : "Số tiền cọc"}
            </span>
            <input className="portal-field__control" min={0} name="depositAmount" placeholder={locale === "en" ? "Leave blank to use total amount" : "Để trống sẽ dùng tổng tiền"} type="number" />
          </label>
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Notes" : "Ghi chú"}</span>
            <textarea className="portal-field__control" name="notes" rows={3} defaultValue={request.note} />
          </label>
          <PortalSubmitButton className="button button--solid" disabled={!roomSuggestions.length} pendingLabel={locale === "en" ? "Confirming..." : "Đang chốt..."}>
            {locale === "en" ? "Confirm & send deposit" : "Chốt & gửi cọc"}
          </PortalSubmitButton>
        </form>
      ) : null}

      {branchBankAccounts.length ? (
        <p className="portal-panel__note-copy">
          {locale === "en"
            ? `Default bank: ${branchBankAccounts.find((item) => item.is_default)?.bank_name ?? branchBankAccounts[0].bank_name}`
            : `Tài khoản mặc định: ${branchBankAccounts.find((item) => item.is_default)?.bank_name ?? branchBankAccounts[0].bank_name}`}
        </p>
      ) : null}

      <div className="portal-workflow-card__pricing">
        <span>{locale === "en" ? "Nights" : "Đêm"}</span>
        <strong>{nights}</strong>
        <span>{locale === "en" ? "Nightly rate" : "Giá đêm"}</span>
        <strong>{formatMoney(locale, nightlyRate)}</strong>
        <span>{locale === "en" ? "Weekend surcharge" : "Phụ thu cuối tuần"}</span>
        <strong>{formatMoney(locale, pricing.weekendSurcharge)}</strong>
        <span>{request.quoted_total_amount != null ? (locale === "en" ? "Quoted total" : "Tổng đã gửi khách") : locale === "en" ? "Estimated total" : "Tổng dự kiến"}</span>
        <strong>{formatMoney(locale, totalAmount)}</strong>
      </div>

      {roomSuggestions.length ? (
        <div className="portal-suggestion-grid">
          {roomSuggestions.map((room) => {
            const roomCode = room.code;

            return (
              <PortalCard key={room.id} tone="default">
                <div className="portal-item-card__top">
                  <p className="portal-item-card__code">{roomCode}</p>
                  <PortalBadge tone="soft">
                    {room.floor_code ?? (locale === "en" ? "Floor ready" : "Sàn sẵn sàng")}
                  </PortalBadge>
                </div>
                <h4 className="portal-item-card__title">
                  {locale === "en" ? room.room_type_name_en : room.room_type_name_vi}
                </h4>
                <p className="portal-item-card__detail">
                  {locale === "en" ? room.branch_name_en : room.branch_name_vi}
                </p>
                <p className="portal-item-card__note">
                  {locale === "en"
                    ? `Floor ${room.floor_code ?? "n/a"} • ${room.status}`
                    : `Tầng ${room.floor_code ?? "n/a"} • ${room.status}`}
                </p>

                {canOperate ? (
                  <form className="portal-form" action={createRoomHoldAction}>
                    <input name="actorRole" type="hidden" value="staff" />
                    <input name="locale" type="hidden" value={locale} />
                    <input name="availabilityRequestId" type="hidden" value={request.id} />
                    <input name="branchId" type="hidden" value={request.branch_id} />
                    <input name="roomTypeId" type="hidden" value={request.room_type_id} />
                    <input name="roomId" type="hidden" value={room.id} />
                    <input name="stayStartAt" type="hidden" value={request.stay_start_at} />
                    <input name="stayEndAt" type="hidden" value={request.stay_end_at} />
                    <input name="customerId" type="hidden" value={request.customer_id ?? ""} />
                    <input name="notes" type="hidden" value={request.note} />
                    <label className="portal-field">
                      <span className="portal-field__label">{locale === "en" ? "Hold minutes" : "Số phút hold"}</span>
                      <input className="portal-field__control" defaultValue={30} min={5} name="holdMinutes" step={5} type="number" />
                    </label>
                    <PortalSubmitButton className="button button--solid" pendingLabel={locale === "en" ? "Holding..." : "Đang giữ..."}>
                      {locale === "en" ? "Hold this room" : "Giữ phòng này"}
                    </PortalSubmitButton>
                  </form>
                ) : null}
              </PortalCard>
            );
          })}
        </div>
      ) : (
        <SectionEmptyState
          description={locale === "en" ? "No room suggestions matched this request." : "Không có phòng phù hợp với request này."}
          locale={locale}
          title={locale === "en" ? "Suggestions" : "Gợi ý"}
        />
      )}
    </PortalCard>
  );
}

function HoldCard({
  canOperate,
  locale,
  hold,
  roomType
}: {
  canOperate: boolean;
  locale: Locale;
  hold: WorkflowRoomHold;
  roomType: WorkflowRoomTypeOption | null;
}) {
  const pricing = getRoomTypePricing(roomType ?? undefined);
  const nights = calculateNights(hold.stay_start_at, hold.stay_end_at);
  const totalAmount = getReservationTotal(roomType ?? undefined, hold.stay_start_at, hold.stay_end_at);

  return (
    <PortalCard className="portal-workflow-card" tone="default">
      <div className="portal-item-card__top">
        <p className="portal-item-card__code">{hold.hold_code}</p>
        <PortalBadge tone={badgeToneForHold(hold.status)}>{statusLabel(locale, hold.status)}</PortalBadge>
      </div>
      <h3 className="portal-item-card__title">{hold.room_code}</h3>
      <dl className="portal-profile-list">
        <div className="portal-profile-list__item">
          <dt className="portal-profile-list__label">{locale === "en" ? "Branch" : "Chi nhánh"}</dt>
          <dd className="portal-profile-list__value">{locale === "en" ? hold.branch_name_en : hold.branch_name_vi}</dd>
        </div>
        <div className="portal-profile-list__item">
          <dt className="portal-profile-list__label">{locale === "en" ? "Room type" : "Loại phòng"}</dt>
          <dd className="portal-profile-list__value">
            {locale === "en" ? hold.room_type_name_en : hold.room_type_name_vi}
          </dd>
        </div>
        <div className="portal-profile-list__item">
          <dt className="portal-profile-list__label">{locale === "en" ? "Stay" : "Lưu trú"}</dt>
          <dd className="portal-profile-list__value">{formatDateRange(locale, hold.stay_start_at, hold.stay_end_at)}</dd>
        </div>
        <div className="portal-profile-list__item">
          <dt className="portal-profile-list__label">{locale === "en" ? "Expires" : "Hết hạn"}</dt>
          <dd className="portal-profile-list__value">{formatDateTime(locale, hold.expires_at)}</dd>
        </div>
      </dl>

      <div className="portal-workflow-card__pricing">
        <span>{locale === "en" ? "Nights" : "Đêm"}</span>
        <strong>{nights}</strong>
        <span>{locale === "en" ? "Nightly rate" : "Giá đêm"}</span>
        <strong>{formatMoney(locale, pricing.nightlyRate)}</strong>
        <span>{locale === "en" ? "Weekend surcharge" : "Phụ thu cuối tuần"}</span>
        <strong>{formatMoney(locale, pricing.weekendSurcharge)}</strong>
        <span>{locale === "en" ? "Estimated total" : "Tổng dự kiến"}</span>
        <strong>{formatMoney(locale, totalAmount)}</strong>
      </div>

      {canOperate && hold.customer_id ? (
        <form className="portal-form" action={createReservationAction}>
          <input name="actorRole" type="hidden" value="staff" />
          <input name="locale" type="hidden" value={locale} />
          <input name="availabilityRequestId" type="hidden" value={hold.availability_request_id ?? ""} />
          <input name="basePrice" type="hidden" value={String(pricing.basePrice)} />
          <input name="branchId" type="hidden" value={hold.branch_id} />
          <input name="createdBy" type="hidden" value="" />
          <input name="customerId" type="hidden" value={hold.customer_id} />
          <input name="depositAmount" type="hidden" value="0" />
          <input name="guestCount" type="hidden" value="1" />
          <input name="holdId" type="hidden" value={hold.id} />
          <input name="manualOverridePrice" type="hidden" value={roomType?.manual_override_price ?? ""} />
          <input name="nightlyRate" type="hidden" value={String(pricing.nightlyRate)} />
          <input name="notes" type="hidden" value={hold.notes} />
          <input name="primaryRoomTypeId" type="hidden" value={hold.room_type_id} />
          <input name="roomId" type="hidden" value={hold.room_id} />
          <input name="stayEndAt" type="hidden" value={hold.stay_end_at} />
          <input name="stayStartAt" type="hidden" value={hold.stay_start_at} />
          <input name="totalAmount" type="hidden" value={String(totalAmount)} />
          <input name="weekendSurcharge" type="hidden" value={String(pricing.weekendSurcharge)} />
          <PortalSubmitButton className="button button--solid" pendingLabel={locale === "en" ? "Creating..." : "Đang tạo..."}>
            {locale === "en" ? "Create reservation" : "Tạo reservation"}
          </PortalSubmitButton>
        </form>
      ) : canOperate ? (
        <p className="portal-item-card__note">
          {locale === "en" ? "Hold needs a customer before it can convert to a reservation." : "Hold cần có customer trước khi chuyển sang booking."}
        </p>
      ) : null}
    </PortalCard>
  );
}

function ReservationCard({
  bankAccounts,
  canOperate,
  locale,
  reservation,
  roomType
}: {
  bankAccounts: WorkflowBranchBankAccountOption[];
  canOperate: boolean;
  locale: Locale;
  reservation: WorkflowReservation;
  roomType: WorkflowRoomTypeOption | null;
}) {
  const branchBankAccounts = bankAccounts.filter((account) => account.branch_id === reservation.branch_id);

  return (
    <PortalCard className="portal-workflow-card" tone="default">
      <div className="portal-item-card__top">
        <p className="portal-item-card__code">{reservation.booking_code}</p>
        <PortalBadge tone={badgeToneForReservation(reservation.status)}>{statusLabel(locale, reservation.status)}</PortalBadge>
      </div>
      <h3 className="portal-item-card__title">{reservation.room_code}</h3>
      <dl className="portal-profile-list">
        <div className="portal-profile-list__item">
          <dt className="portal-profile-list__label">{locale === "en" ? "Branch" : "Chi nhánh"}</dt>
          <dd className="portal-profile-list__value">{locale === "en" ? reservation.branch_name_en : reservation.branch_name_vi}</dd>
        </div>
        <div className="portal-profile-list__item">
          <dt className="portal-profile-list__label">{locale === "en" ? "Room type" : "Loại phòng"}</dt>
          <dd className="portal-profile-list__value">
            {locale === "en" ? reservation.primary_room_type_name_en : reservation.primary_room_type_name_vi}
          </dd>
        </div>
        <div className="portal-profile-list__item">
          <dt className="portal-profile-list__label">{locale === "en" ? "Stay" : "Lưu trú"}</dt>
          <dd className="portal-profile-list__value">{formatDateRange(locale, reservation.stay_start_at, reservation.stay_end_at)}</dd>
        </div>
        <div className="portal-profile-list__item">
          <dt className="portal-profile-list__label">{locale === "en" ? "Customer" : "Khách"}</dt>
          <dd className="portal-profile-list__value">{reservation.customer_id}</dd>
        </div>
      </dl>
      <div className="portal-workflow-card__pricing">
        <span>{locale === "en" ? "Nightly rate" : "Giá đêm"}</span>
        <strong>{formatMoney(locale, reservation.nightly_rate)}</strong>
        <span>{locale === "en" ? "Total amount" : "Tổng tiền"}</span>
        <strong>{formatMoney(locale, reservation.total_amount)}</strong>
        <span>{locale === "en" ? "Deposit" : "Deposit"}</span>
        <strong>{formatMoney(locale, reservation.deposit_amount)}</strong>
        <span>{locale === "en" ? "Room pricing" : "Giá phòng"}</span>
        <strong>{roomType ? formatMoney(locale, roomType.base_price) : "—"}</strong>
      </div>

      {canOperate && reservation.status !== "confirmed" ? (
        <form className="portal-form" action={createPaymentRequestAction}>
          <input name="amount" type="hidden" value={String(reservation.deposit_amount || reservation.total_amount)} />
          <input name="createdBy" type="hidden" value="staff" />
          <input name="locale" type="hidden" value={locale} />
          <input name="reservationId" type="hidden" value={reservation.id} />
          <input name="source" type="hidden" value="admin_console" />
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Branch bank account" : "Tài khoản chi nhánh"}</span>
            <select className="portal-field__control" name="branchBankAccountId" defaultValue="">
              <option value="">{locale === "en" ? "Use default bank account" : "Dùng tài khoản mặc định"}</option>
              {branchBankAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.bank_name} • {account.account_number}
                </option>
              ))}
            </select>
          </label>
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Note" : "Ghi chú"}</span>
            <textarea className="portal-field__control" name="note" rows={3} defaultValue={reservation.notes} />
          </label>
          <PortalSubmitButton className="button button--solid" pendingLabel={locale === "en" ? "Creating..." : "Đang tạo..."}>
            {locale === "en" ? "Create payment request" : "Tạo payment request"}
          </PortalSubmitButton>
        </form>
      ) : null}
    </PortalCard>
  );
}

function PaymentRequestCard({
  bankAccounts,
  canOperate,
  locale,
  paymentRequest
}: {
  bankAccounts: WorkflowBranchBankAccountOption[];
  canOperate: boolean;
  locale: Locale;
  paymentRequest: WorkflowPaymentRequest;
}) {
  const bankAccountOptions = bankAccounts.filter((account) => account.branch_id === paymentRequest.branch_id);
  const canVerify = paymentRequest.status === "pending_verification" || paymentRequest.status === "sent";

  return (
    <PortalCard className="portal-workflow-card" tone="default">
      <div className="portal-item-card__top">
        <p className="portal-item-card__code">{paymentRequest.payment_code}</p>
        <PortalBadge tone={badgeToneForPayment(paymentRequest.status)}>{statusLabel(locale, paymentRequest.status)}</PortalBadge>
      </div>
      <h3 className="portal-item-card__title">{paymentRequest.customer_name}</h3>
      <p className="portal-item-card__detail">
        {locale === "en" ? paymentRequest.branch_name_en : paymentRequest.branch_name_vi}
      </p>
      <dl className="portal-profile-list">
        <div className="portal-profile-list__item">
          <dt className="portal-profile-list__label">{locale === "en" ? "Reservation" : "Reservation"}</dt>
          <dd className="portal-profile-list__value">{paymentRequest.reservation_booking_code}</dd>
        </div>
        <div className="portal-profile-list__item">
          <dt className="portal-profile-list__label">{locale === "en" ? "Amount" : "Số tiền"}</dt>
          <dd className="portal-profile-list__value">{formatMoney(locale, paymentRequest.amount, paymentRequest.currency)}</dd>
        </div>
        <div className="portal-profile-list__item">
          <dt className="portal-profile-list__label">{locale === "en" ? "Transfer content" : "Nội dung CK"}</dt>
          <dd className="portal-profile-list__value">{paymentRequest.transfer_content}</dd>
        </div>
        <div className="portal-profile-list__item">
          <dt className="portal-profile-list__label">{locale === "en" ? "Expires" : "Hết hạn"}</dt>
          <dd className="portal-profile-list__value">{formatDateTime(locale, paymentRequest.public_upload_link_expires_at)}</dd>
        </div>
      </dl>
      {paymentRequest.payment_upload_path ? (
        <p className="portal-item-card__note">
          <Link className="button button--text-light" href={appendLocaleQuery(paymentRequest.payment_upload_path, locale)}>
            {locale === "en" ? "Open secure upload link" : "Mở link upload an toàn"}
          </Link>
        </p>
      ) : null}
      {paymentRequest.latest_proof_file_path ? (
        <p className="portal-item-card__note">
          {locale === "en" ? "Latest proof uploaded." : "Proof gần nhất đã upload."}
        </p>
      ) : null}

      <div className="portal-qr-block">
        <img alt={paymentRequest.payment_code} className="portal-qr-block__image" src={paymentRequest.qr_image_url} />
      </div>

      {canOperate && canVerify ? (
        <form className="portal-form" action={verifyPaymentRequestAction}>
          <input name="actorRole" type="hidden" value="staff" />
          <input name="locale" type="hidden" value={locale} />
          <input name="paymentRequestId" type="hidden" value={paymentRequest.id} />
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Status" : "Trạng thái"}</span>
            <select className="portal-field__control" name="status" defaultValue="verified">
              <option value="verified">{locale === "en" ? "Verify" : "Duyệt"}</option>
              <option value="rejected">{locale === "en" ? "Reject" : "Từ chối"}</option>
            </select>
          </label>
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Review note" : "Ghi chú duyệt"}</span>
            <textarea className="portal-field__control" name="reviewNote" rows={3} />
          </label>
          <PortalSubmitButton className="button button--solid" pendingLabel={locale === "en" ? "Saving..." : "Đang lưu..."}>
            {locale === "en" ? "Save verification" : "Lưu verify"}
          </PortalSubmitButton>
        </form>
      ) : null}

      {bankAccountOptions.length ? (
        <p className="portal-item-card__note">
          {locale === "en"
            ? `Default bank: ${bankAccountOptions.find((item) => item.is_default)?.bank_name ?? bankAccountOptions[0].bank_name}`
            : `Tài khoản mặc định: ${bankAccountOptions.find((item) => item.is_default)?.bank_name ?? bankAccountOptions[0].bank_name}`}
        </p>
      ) : null}
    </PortalCard>
  );
}

function AuditCard({
  locale,
  event
}: {
  locale: Locale;
  event: WorkflowDashboardData["audit_logs"][number];
}) {
  return (
    <PortalCard className="portal-workflow-card" tone="default">
      <div className="portal-item-card__top">
        <span className="portal-timeline__time">{formatDateTime(locale, event.happened_at)}</span>
        <PortalBadge tone="soft">{locale === "en" ? "Audit event" : "Audit event"}</PortalBadge>
      </div>
      <h3 className="portal-item-card__title">{event.action}</h3>
      <p className="portal-item-card__detail">{event.summary}</p>
      <p className="portal-item-card__note">
        {locale === "en"
          ? `${event.entity_label_en}${event.branch_name_en ? ` • ${event.branch_name_en}` : ""}`
          : `${event.entity_label_vi}${event.branch_name_vi ? ` • ${event.branch_name_vi}` : ""}`}
      </p>
    </PortalCard>
  );
}

function EmailTestCard({
  locale,
  defaultRecipient
}: {
  defaultRecipient: string;
  locale: Locale;
}) {
  return (
    <PortalCard className="portal-panel" tone="soft">
      <p className="portal-panel__eyebrow">{locale === "en" ? "Email test" : "Email test"}</p>
      <p className="portal-panel__note-copy">
        {locale === "en"
          ? "Send one of the live templates to a mailbox for rendering checks."
          : "Gửi một trong các template thật tới mailbox để kiểm tra hiển thị."}
      </p>

      <form className="portal-form" action={sendEmailTestAction}>
        <input name="locale" type="hidden" value={locale} />
        <label className="portal-field">
          <span className="portal-field__label">{locale === "en" ? "Template" : "Template"}</span>
          <select className="portal-field__control" name="templateKey" defaultValue="booking_request_customer">
            {emailTemplateTestOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="portal-field">
          <span className="portal-field__label">{locale === "en" ? "Recipient email" : "Email nhận test"}</span>
          <input
            className="portal-field__control"
            defaultValue={defaultRecipient}
            name="recipientEmail"
            placeholder={defaultRecipient}
            type="email"
          />
        </label>

        <PortalSubmitButton className="button button--solid" pendingLabel={locale === "en" ? "Sending..." : "Đang gửi..."}>
          {locale === "en" ? "Send test email" : "Gửi test email"}
        </PortalSubmitButton>
      </form>
    </PortalCard>
  );
}

export function AdminWorkflowDashboard({ canOperate, data, locale, testEmailDefaultRecipient }: AdminWorkflowDashboardProps) {
  const { roomTypeMap } = buildLookupMaps(data);
  const selectedRequest = data.selected_request;
  const selectedRoomType = selectedRequest ? roomTypeMap[selectedRequest.room_type_id] : null;

  return (
    <div className="portal-content">
      {!canOperate ? (
        <PortalCard className="portal-panel" tone="soft">
          <p className="portal-panel__eyebrow">{locale === "en" ? "Service unavailable" : "Chưa nối Supabase service role"}</p>
          <p className="portal-panel__note-copy">
            {locale === "en"
              ? "The workflow console is in read-only mode."
              : "Bảng vận hành đang ở chế độ đọc."}
          </p>
        </PortalCard>
      ) : null}

      <section className="portal-section" id="overview">
        <PortalSectionHeading
          description={adminDashboardCopy.sections.overview.description}
          eyebrow={adminDashboardCopy.sections.overview.eyebrow}
          help={{
            en: "These numbers summarize the operational queue. Use them to spot the next bottleneck quickly.",
            vi: "Các số này tóm tắt queue vận hành. Dùng để nhìn nhanh điểm nghẽn tiếp theo."
          }}
          locale={locale}
          title={adminDashboardCopy.sections.overview.title}
        />

        <div className="portal-stat-grid">
          {data.stats.map((stat: WorkflowStatCard, index) => (
            <PortalStatCard
              detail={{ en: stat.detail_en, vi: stat.detail_vi }}
              label={{ en: stat.label_en, vi: stat.label_vi }}
              locale={locale}
              key={`${stat.value}-${index}`}
              tone={index === 2 ? "accent" : "soft"}
              value={stat.value}
            />
          ))}
        </div>
      </section>

      <section className="portal-section" id="requests">
        <PortalSectionHeading
          description={{
            en: "Open a request row to review stays, room suggestions, and staff actions.",
            vi: "Chọn một request để xem lưu trú, gợi ý phòng và thao tác staff."
          }}
          eyebrow={{ en: "Requests & holds", vi: "Requests & holds" }}
          help={{
            en: "Request inbox stays in a table so staff can scan status, contact, and dates before opening the detail pane.",
            vi: "Hộp thư request ở dạng bảng để staff quét trạng thái, liên hệ và ngày ở trước khi mở panel chi tiết."
          }}
          locale={locale}
          title={{ en: "Availability inbox", vi: "Hộp thư availability" }}
        />

        <div className="portal-grid portal-grid--two">
          <RequestInboxTable locale={locale} requests={data.availability_requests} selectedRequestId={selectedRequest?.id ?? null} />

          <RequestDetailPanel
            canOperate={canOperate}
            branchBankAccounts={data.branch_bank_account_options}
            locale={locale}
            request={selectedRequest}
            roomSuggestions={data.room_suggestions}
            roomTypes={data.room_type_options}
            roomType={selectedRoomType ?? null}
          />
        </div>
      </section>

      <section className="portal-section" id="holds">
        <PortalSectionHeading
        actions={
          canOperate ? (
            <form action={releaseExpiredHoldsAction}>
              <input name="asOf" type="hidden" value="" />
              <input name="locale" type="hidden" value={locale} />
              <PortalSubmitButton className="button button--text-light" pendingLabel={locale === "en" ? "Releasing..." : "Đang dọn..."}>
                {locale === "en" ? "Release expired holds & bookings" : "Dọn holds & booking hết hạn"}
              </PortalSubmitButton>
            </form>
          ) : null
        }
          description={{
            en: "Active holds live here until they convert or expire.",
            vi: "Hold đang mở sẽ nằm ở đây cho tới khi chuyển đổi hoặc hết hạn."
          }}
          eyebrow={{ en: "Hold queue", vi: "Hold queue" }}
          help={{
            en: "A hold is a temporary lock. Staff can convert it to a reservation once customer details are ready.",
            vi: "Hold là khóa tạm thời. Staff có thể chuyển sang reservation khi thông tin khách đã sẵn sàng."
          }}
          locale={locale}
          title={{ en: "Active holds", vi: "Hold đang mở" }}
        />

        {data.active_room_holds.length ? (
          <HoldTable holds={data.active_room_holds} locale={locale} />
        ) : (
          <SectionEmptyState
            description={locale === "en" ? "No active holds right now." : "Hiện chưa có hold nào đang mở."}
            locale={locale}
            title={locale === "en" ? "Hold list" : "Danh sách hold"}
          />
        )}
      </section>

      <section className="portal-section" id="reservations">
        <PortalSectionHeading
          description={{
            en: "Recent reservations stay close to the hold queue for quick follow-up.",
            vi: "Reservation gần đây nằm cạnh queue hold để xử lý nhanh."
          }}
          eyebrow={{ en: "Reservation queue", vi: "Reservation queue" }}
          help={{
            en: "Once a request is confirmed, staff can create or review the reservation and continue the deposit workflow.",
            vi: "Khi request đã chốt, staff có thể tạo hoặc xem reservation và tiếp tục luồng cọc."
          }}
          locale={locale}
          title={{ en: "Recent reservations", vi: "Reservation gần đây" }}
        />

        {data.recent_reservations.length ? (
          <ReservationTable locale={locale} reservations={data.recent_reservations} />
        ) : (
          <SectionEmptyState
            description={locale === "en" ? "No reservations have been created yet." : "Chưa có reservation nào."}
            locale={locale}
            title={locale === "en" ? "Reservation list" : "Danh sách reservation"}
          />
        )}
      </section>

      <section className="portal-section" id="payments">
        <PortalSectionHeading
          description={{
            en: "Deposit requests, proof uploads, and manual verification live here.",
            vi: "Deposit request, proof upload và verify thủ công nằm ở đây."
          }}
          eyebrow={{ en: "Payments", vi: "Thanh toán" }}
          help={{
            en: "Send the deposit QR first, then verify the proof and let the reservation move to confirmed.",
            vi: "Gửi QR cọc trước, sau đó verify proof và chuyển reservation sang confirmed."
          }}
          locale={locale}
          title={{ en: "Payment queue", vi: "Hàng đợi payment" }}
        />

        <div className="portal-card-grid portal-card-grid--two">
          {data.payment_requests.length ? (
            data.payment_requests.map((paymentRequest) => (
              <PaymentRequestCard
                bankAccounts={data.branch_bank_account_options}
                canOperate={canOperate}
                key={paymentRequest.id}
                locale={locale}
                paymentRequest={paymentRequest}
              />
            ))
          ) : (
            <SectionEmptyState
              description={locale === "en" ? "No payment requests are waiting yet." : "Chưa có payment request nào."}
              locale={locale}
              title={locale === "en" ? "Payment list" : "Danh sách payment"}
            />
          )}
        </div>
      </section>

      <section className="portal-section" id="email-tests">
        <PortalSectionHeading
          description={{
            en: "Render the live templates before they go into production workflows.",
            vi: "Render template thật trước khi đưa vào workflow sản xuất."
          }}
          eyebrow={{ en: "Email test", vi: "Email test" }}
          help={{
            en: "Use this to confirm subject, layout, and spacing against the current mailbox.",
            vi: "Dùng để kiểm tra subject, layout và khoảng cách trên mailbox hiện tại."
          }}
          locale={locale}
          title={{ en: "Template test sender", vi: "Gửi test template" }}
        />

        {canOperate ? (
          <EmailTestCard defaultRecipient={testEmailDefaultRecipient} locale={locale} />
        ) : (
          <SectionEmptyState
            description={
              locale === "en"
                ? "Email test is available once Supabase service role is configured."
                : "Email test sẽ mở khi Supabase service role đã được cấu hình."
            }
            locale={locale}
            title={locale === "en" ? "Email test disabled" : "Email test chưa bật"}
          />
        )}
      </section>

      <section className="portal-section" id="branches">
        <PortalSectionHeading
          description={{
            en: "Branch settings, bank accounts, and contact details stay grouped here.",
            vi: "Cấu hình chi nhánh, tài khoản ngân hàng và liên hệ nằm ở đây."
          }}
          eyebrow={adminDashboardCopy.sections.branches.eyebrow}
          help={{
            en: "Branches act as the parent scope for rooms, bank accounts, and public contact details.",
            vi: "Chi nhánh là scope cha cho phòng, tài khoản ngân hàng và thông tin liên hệ public."
          }}
          locale={locale}
          title={adminDashboardCopy.sections.branches.title}
        />

        <BranchTable branches={data.branch_options} locale={locale} />
      </section>

      <section className="portal-section" id="audit">
        <PortalSectionHeading
          description={{
            en: "Audit entries keep the operational trail visible for every staff action.",
            vi: "Audit entry giữ vết thao tác vận hành cho mọi hành động staff."
          }}
          eyebrow={adminDashboardCopy.sections.audit.eyebrow}
          help={{
            en: "Use the audit log to verify who changed a request, booking, or payment and when it happened.",
            vi: "Dùng audit log để biết ai đã đổi request, booking hoặc payment và thời điểm xảy ra."
          }}
          locale={locale}
          title={adminDashboardCopy.sections.audit.title}
        />

        {data.audit_logs.length ? (
          <AuditTable events={data.audit_logs} locale={locale} />
        ) : (
          <SectionEmptyState
            description={locale === "en" ? "No audit events were recorded today." : "Hôm nay chưa có audit event."}
            locale={locale}
            title={locale === "en" ? "Audit log" : "Audit log"}
          />
        )}
      </section>
    </div>
  );
}
