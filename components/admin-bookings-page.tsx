import { PortalBadge, PortalCard } from "@/components/portal-ui";
import type { Locale } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";
import type { WorkflowReservation } from "@/lib/supabase/workflow.types";

type AdminBookingsPageProps = {
  locale: Locale;
  reservations: WorkflowReservation[];
  totalCount: number;
};

function formatDateRange(locale: Locale, startAt: string, endAt: string) {
  const formatter = new Intl.DateTimeFormat(locale === "en" ? "en-US" : "vi-VN", {
    month: "short",
    day: "numeric"
  });

  return `${formatter.format(new Date(startAt))} - ${formatter.format(new Date(endAt))}`;
}

function formatMoney(locale: Locale, value: number) {
  return new Intl.NumberFormat(locale === "en" ? "en-US" : "vi-VN", {
    maximumFractionDigits: 0,
  }).format(value) + " VND";
}

function statusTone(status: WorkflowReservation["status"]) {
  switch (status) {
    case "confirmed":
      return "accent" as const;
    case "pending_deposit":
    case "draft":
      return "soft" as const;
    case "cancelled":
      return "neutral" as const;
    default:
      return "neutral" as const;
  }
}

function statusLabel(locale: Locale, status: WorkflowReservation["status"]) {
  const labels: Record<Locale, Record<WorkflowReservation["status"], string>> = {
    en: {
      cancelled: "CANCELLED",
      completed: "COMPLETED",
      confirmed: "CONFIRMED",
      draft: "DRAFT",
      expired: "EXPIRED",
      pending_deposit: "PENDING DEPOSIT"
    },
    vi: {
      cancelled: "ĐÃ HỦY",
      completed: "HOÀN TẤT",
      confirmed: "ĐÃ XÁC NHẬN",
      draft: "NHÁP",
      expired: "HẾT HẠN",
      pending_deposit: "CHỜ CỌC"
    }
  };

  return labels[locale][status] ?? status;
}

function MailIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 18 18" width="18">
      <rect height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2" width="12.8" x="2.6" y="3.5" />
      <path d="m4.1 5.2 4.9 3.9 4.9-3.9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 18 18" width="18">
      <circle cx="7.4" cy="7.4" r="4.8" stroke="currentColor" strokeWidth="1.2" />
      <path d="M11 11l4 4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 18 18" width="18">
      <path d="M9 2.8v7.7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
      <path d="M6.1 8.1 9 11l2.9-2.9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
      <path d="M3.6 14.2h10.8" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
    </svg>
  );
}

export function AdminBookingsPage({ locale, reservations, totalCount }: AdminBookingsPageProps) {
  const rows = reservations;

  return (
    <div className="admin-page admin-bookings">
      <div className="admin-page__hero">
        <div className="admin-page__copy">
          <h1 className="admin-page__title">{localize(locale, { vi: "Đặt phòng", en: "Bookings" })}</h1>
          <p className="admin-page__description">{localize(locale, {
            vi: "Quản lý booking hiện tại, sắp tới và lịch sử đặt phòng.",
            en: "Manage current, upcoming, and past reservations."
          })}</p>
        </div>

        <div className="admin-page__actions">
          <button className="button button--text-light admin-page__secondary-action" type="button">
            <span className="admin-page__action-icon" aria-hidden="true">
              <DownloadIcon />
            </span>
            {localize(locale, { vi: "Xuất CSV", en: "Export CSV" })}
          </button>
          <button className="button button--solid admin-page__primary-action" type="button">
            <span className="admin-page__action-plus" aria-hidden="true">
              +
            </span>
            {localize(locale, { vi: "Thêm đặt phòng", en: "Add booking" })}
          </button>
        </div>
      </div>

      <PortalCard className="admin-bookings__filters">
        <div className="admin-bookings__filter">
          <label className="portal-field__label" htmlFor="booking-search">
            {localize(locale, { vi: "Tìm kiếm", en: "Search" })}
          </label>
          <div className="admin-bookings__input-wrap">
            <span className="admin-bookings__input-icon" aria-hidden="true">
              <SearchIcon />
            </span>
            <input
              className="admin-bookings__input"
              id="booking-search"
              placeholder={localize(locale, { vi: "Mã booking, tên khách...", en: "Booking ID, guest name..." })}
              type="search"
            />
          </div>
        </div>

        <div className="admin-bookings__filter admin-bookings__filter--status">
          <label className="portal-field__label" htmlFor="booking-status">
            {localize(locale, { vi: "Trạng thái", en: "Status" })}
          </label>
          <div className="admin-bookings__select-wrap">
            <select className="admin-bookings__select" id="booking-status" defaultValue="all">
              <option value="all">{localize(locale, { vi: "Tất cả trạng thái", en: "All statuses" })}</option>
              <option value="confirmed">{localize(locale, { vi: "Đã xác nhận", en: "Confirmed" })}</option>
              <option value="pending_deposit">{localize(locale, { vi: "Chờ cọc", en: "Pending deposit" })}</option>
              <option value="cancelled">{localize(locale, { vi: "Đã hủy", en: "Cancelled" })}</option>
            </select>
          </div>
        </div>

        <div className="admin-bookings__filter admin-bookings__filter--dates">
          <label className="portal-field__label" htmlFor="booking-dates">
            {localize(locale, { vi: "Ngày lưu trú", en: "Stay dates" })}
          </label>
          <div className="admin-bookings__date-range" id="booking-dates">
            <span className="admin-bookings__date-range-icon" aria-hidden="true">
              <span>📅</span>
            </span>
            <div className="admin-bookings__date-range-values">
              <span className="admin-bookings__date-value admin-bookings__date-value--active">Oct 12</span>
              <span className="admin-bookings__date-divider" aria-hidden="true">
                →
              </span>
              <span className="admin-bookings__date-value">Oct 18</span>
            </div>
          </div>
        </div>

        <div className="admin-bookings__spacer" aria-hidden="true" />

        <button className="button admin-bookings__columns-button" type="button">
          <span className="admin-page__action-icon" aria-hidden="true">
            <span className="admin-bookings__columns-icon">|||</span>
          </span>
          {localize(locale, { vi: "Cột", en: "Columns" })}
        </button>
      </PortalCard>

      <PortalCard className="admin-bookings__table-card">
        <div className="admin-bookings__table-scroll">
          <table className="admin-bookings__table">
            <thead>
              <tr>
                <th>{localize(locale, { vi: "Mã booking", en: "Booking ID" })}</th>
                <th>{localize(locale, { vi: "Khách hàng", en: "Guest name" })}</th>
                <th>{localize(locale, { vi: "Loại phòng", en: "Room type" })}</th>
                <th>
                  <span className="admin-bookings__th-sort">
                    <span>{localize(locale, { vi: "Ngày ở", en: "Dates" })}</span>
                    <span aria-hidden="true">↓</span>
                  </span>
                </th>
                <th className="admin-bookings__th-center">{localize(locale, { vi: "Trạng thái", en: "Status" })}</th>
                <th className="admin-bookings__th-right">{localize(locale, { vi: "Tổng tiền", en: "Total" })}</th>
                <th className="admin-bookings__th-center">{localize(locale, { vi: "Hành động", en: "Action" })}</th>
              </tr>
            </thead>
            <tbody>
              {rows.length ? (
                rows.map((reservation) => {
                  const status = reservation.status as WorkflowReservation["status"];

                  return (
                    <tr className="admin-bookings__row" key={reservation.id}>
                      <td className={status === "cancelled" ? "admin-bookings__muted" : undefined}>{reservation.booking_code}</td>
                      <td className={status === "cancelled" ? "admin-bookings__muted" : undefined}>{reservation.customer_name}</td>
                      <td className={status === "cancelled" ? "admin-bookings__muted" : undefined}>
                        {locale === "en" ? reservation.primary_room_type_name_en : reservation.primary_room_type_name_vi}
                      </td>
                      <td className={status === "cancelled" ? "admin-bookings__muted" : undefined}>
                        {formatDateRange(locale, reservation.stay_start_at, reservation.stay_end_at)}
                      </td>
                      <td className="admin-bookings__status-cell">
                        <PortalBadge tone={statusTone(status)}>{statusLabel(locale, status)}</PortalBadge>
                      </td>
                      <td className="admin-bookings__total-cell">{formatMoney(locale, reservation.total_amount)}</td>
                      <td className="admin-bookings__action-cell">
                        <button
                          className="admin-bookings__action-button"
                          type="button"
                          title={localize(locale, { vi: "Gửi email cho khách", en: "Email guest" })}
                        >
                          <MailIcon />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td className="admin-bookings__empty-row" colSpan={7}>
                    {localize(locale, {
                      vi: "Chưa có booking nào từ Supabase.",
                      en: "No reservations were returned from Supabase."
                    })}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="admin-bookings__footer">
          <span className="admin-bookings__summary">
            {rows.length
              ? localize(locale, {
                  vi: `Hiển thị 1 đến ${rows.length} trên tổng ${totalCount || rows.length} booking`,
                  en: `Showing 1 to ${rows.length} of ${totalCount || rows.length} entries`
                })
              : localize(locale, {
                  vi: "Chưa có booking nào.",
                  en: "No reservations available."
                })}
          </span>

          <div className="admin-bookings__pagination" aria-label={localize(locale, { vi: "Phân trang", en: "Pagination" })}>
            <button className="admin-bookings__page-button" type="button">
              <span aria-hidden="true">‹</span>
            </button>
            <button className="admin-bookings__page-button admin-bookings__page-button--active" type="button">
              1
            </button>
            <button className="admin-bookings__page-button" type="button">
              2
            </button>
            <button className="admin-bookings__page-button" type="button">
              3
            </button>
            <span className="admin-bookings__pagination-ellipsis" aria-hidden="true">
              …
            </span>
            <button className="admin-bookings__page-button" type="button">
              <span aria-hidden="true">›</span>
            </button>
          </div>
        </div>
      </PortalCard>
    </div>
  );
}
