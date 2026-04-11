import Link from "next/link";

import type { Locale } from "@/lib/locale";
import { appendLocaleQuery } from "@/lib/locale";
import { PortalBadge, PortalCard, PortalSectionHeading, PortalStatCard } from "@/components/portal-ui";
import {
  createPaymentRequestAction,
  createReservationAction,
  createRoomHoldAction,
  releaseExpiredHoldsAction,
  verifyPaymentRequestAction
} from "@/app/(admin)/admin/actions";
import { adminDashboardCopy } from "@/lib/mock/admin-dashboard";
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
};

function buildMap<T extends { id: string }>(items: T[]) {
  return Object.fromEntries(items.map((item) => [item.id, item])) as Record<string, T>;
}

function groupBankAccountsByBranch(accounts: WorkflowBranchBankAccountOption[]) {
  return accounts.reduce<Record<string, WorkflowBranchBankAccountOption[]>>((acc, account) => {
    if (!acc[account.branch_id]) {
      acc[account.branch_id] = [];
    }

    acc[account.branch_id].push(account);
    return acc;
  }, {});
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

function formatMoney(locale: Locale, value: number, currency = "VND") {
  const formatted = new Intl.NumberFormat(locale === "en" ? "en-US" : "vi-VN", {
    maximumFractionDigits: 0
  }).format(value);

  return locale === "en" ? `${formatted} ${currency}` : `${formatted} ${currency === "VND" ? "đ" : currency}`;
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

function buildAdminHref(locale: Locale, requestId: string) {
  return appendLocaleQuery(`/admin?request=${requestId}`, locale);
}

function buildLookupMaps(data: WorkflowDashboardData) {
  return {
    bankAccountsByBranch: groupBankAccountsByBranch(data.branch_bank_account_options),
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
      <p className="portal-item-card__detail">{request.contact_email}</p>
      <Link className="button button--text-light" href={buildAdminHref(locale, request.id)}>
        {locale === "en" ? "Load suggestions" : "Tải gợi ý"}
      </Link>
    </PortalCard>
  );
}

function RequestDetailPanel({
  canOperate,
  locale,
  roomType,
  request,
  roomSuggestions
}: {
  canOperate: boolean;
  locale: Locale;
  request: WorkflowAvailabilityRequest | null;
  roomSuggestions: WorkflowRoomSuggestion[];
  roomType: WorkflowRoomTypeOption | null;
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
  const totalAmount = getReservationTotal(roomType ?? undefined, request.stay_start_at, request.stay_end_at);

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
      </dl>

      <p className="portal-panel__note-copy">
        {locale === "en"
          ? "Room suggestions are filtered by the selected branch, room type, and stay window."
          : "Gợi ý phòng được lọc theo chi nhánh, loại phòng và khung thời gian đã chọn."}
      </p>

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
                    <button className="button button--solid" type="submit">
                      {locale === "en" ? "Hold this room" : "Giữ phòng này"}
                    </button>
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
          <button className="button button--solid" type="submit">
            {locale === "en" ? "Create reservation" : "Tạo reservation"}
          </button>
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
          <button className="button button--solid" type="submit">
            {locale === "en" ? "Create payment request" : "Tạo payment request"}
          </button>
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
          <button className="button button--solid" type="submit">
            {locale === "en" ? "Save verification" : "Lưu verify"}
          </button>
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

export function AdminWorkflowDashboard({ canOperate, data, locale }: AdminWorkflowDashboardProps) {
  const { bankAccountsByBranch, roomTypeMap } = buildLookupMaps(data);
  const selectedRequest = data.selected_request;
  const selectedRoomType = selectedRequest ? roomTypeMap[selectedRequest.room_type_id] : null;

  return (
    <div className="portal-content">
      {!canOperate ? (
        <PortalCard className="portal-panel" tone="soft">
          <p className="portal-panel__eyebrow">{locale === "en" ? "Service unavailable" : "Chưa nối Supabase service role"}</p>
          <p className="portal-panel__note-copy">
            {locale === "en"
              ? "The workflow console is in read-only mode until SUPABASE_SERVICE_ROLE_KEY is available."
              : "Bảng vận hành đang ở chế độ đọc cho tới khi có SUPABASE_SERVICE_ROLE_KEY."}
          </p>
        </PortalCard>
      ) : null}

      <section className="portal-section" id="overview">
        <PortalSectionHeading
          description={adminDashboardCopy.sections.overview.description}
          eyebrow={adminDashboardCopy.sections.overview.eyebrow}
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
          description={adminDashboardCopy.sections.operations.description}
          eyebrow={{ en: "Requests & holds", vi: "Requests & holds" }}
          locale={locale}
          title={{ en: "Availability inbox", vi: "Hộp thư availability" }}
        />

        <div className="portal-grid portal-grid--two">
          <div className="portal-card-grid portal-card-grid--two">
            {data.availability_requests.map((request) => (
              <RequestSummaryCard
                key={request.id}
                locale={locale}
                request={request}
                selected={selectedRequest?.id === request.id}
              />
            ))}
          </div>

          <RequestDetailPanel
            canOperate={canOperate}
            locale={locale}
            request={selectedRequest}
            roomSuggestions={data.room_suggestions}
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
                <button className="button button--text-light" type="submit">
                  {locale === "en" ? "Release expired holds" : "Release holds hết hạn"}
                </button>
              </form>
            ) : null
          }
          description={adminDashboardCopy.sections.operations.description}
          eyebrow={{ en: "Hold queue", vi: "Hold queue" }}
          locale={locale}
          title={{ en: "Active holds", vi: "Hold đang mở" }}
        />

        <div className="portal-card-grid portal-card-grid--two">
          {data.active_room_holds.length ? (
            data.active_room_holds.map((hold) => (
              <HoldCard
                canOperate={canOperate}
                key={hold.id}
                locale={locale}
                hold={hold}
                roomType={roomTypeMap[hold.room_type_id] ?? null}
              />
            ))
          ) : (
            <SectionEmptyState
              description={locale === "en" ? "No active holds right now." : "Hiện chưa có hold nào đang mở."}
              locale={locale}
              title={locale === "en" ? "Hold list" : "Danh sách hold"}
            />
          )}
        </div>
      </section>

      <section className="portal-section" id="reservations">
        <PortalSectionHeading
          description={{
            en: "Manual bookings created from holds stay one room per reservation in phase 1.",
            vi: "Booking thủ công vẫn giữ nguyên 1 reservation = 1 phòng trong phase 1."
          }}
          eyebrow={{ en: "Reservation queue", vi: "Reservation queue" }}
          locale={locale}
          title={{ en: "Recent reservations", vi: "Reservation gần đây" }}
        />

        <div className="portal-card-grid portal-card-grid--two">
            {data.recent_reservations.length ? (
              data.recent_reservations.map((reservation) => (
                <ReservationCard
                  bankAccounts={bankAccountsByBranch[reservation.branch_id] ?? []}
                  canOperate={canOperate}
                  key={reservation.id}
                  locale={locale}
                  reservation={reservation}
                  roomType={roomTypeMap[reservation.primary_room_type_id] ?? null}
                />
            ))
          ) : (
            <SectionEmptyState
              description={locale === "en" ? "No reservations have been created yet." : "Chưa có reservation nào."}
              locale={locale}
              title={locale === "en" ? "Reservation list" : "Danh sách reservation"}
            />
          )}
        </div>
      </section>

      <section className="portal-section" id="payments">
        <PortalSectionHeading
          description={{
            en: "Deposit requests, public upload links, and manual verification live here.",
            vi: "Deposit request, public upload link và verify thủ công nằm ở đây."
          }}
          eyebrow={{ en: "Payments", vi: "Thanh toán" }}
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

      <section className="portal-section" id="branches">
        <PortalSectionHeading
          description={adminDashboardCopy.sections.branches.description}
          eyebrow={adminDashboardCopy.sections.branches.eyebrow}
          locale={locale}
          title={adminDashboardCopy.sections.branches.title}
        />

        <div className="portal-card-grid portal-card-grid--two">
          {data.branch_options.map((branch) => (
            <PortalCard className="portal-panel" key={branch.id} tone="soft">
              <div className="portal-item-card__top">
                <h3 className="portal-item-card__title">{locale === "en" ? branch.name_en : branch.name_vi}</h3>
                <PortalBadge tone="accent">{branch.code}</PortalBadge>
              </div>
              <p className="portal-item-card__detail">{branch.timezone}</p>
              <p className="portal-panel__note-copy">
                {branch.slug} • {locale === "en" ? "Physical room inventory" : "Kho phòng vật lý"}
              </p>
            </PortalCard>
          ))}
        </div>
      </section>

      <section className="portal-section" id="audit">
        <PortalSectionHeading
          description={adminDashboardCopy.sections.audit.description}
          eyebrow={adminDashboardCopy.sections.audit.eyebrow}
          locale={locale}
          title={adminDashboardCopy.sections.audit.title}
        />

        <div className="portal-card-grid portal-card-grid--audit">
          {data.audit_logs.length ? (
            data.audit_logs.map((event) => <AuditCard event={event} key={event.id} locale={locale} />)
          ) : (
            <SectionEmptyState
              description={locale === "en" ? "No audit events were recorded today." : "Hôm nay chưa có audit event."}
              locale={locale}
              title={locale === "en" ? "Audit log" : "Audit log"}
            />
          )}
        </div>
      </section>
    </div>
  );
}
