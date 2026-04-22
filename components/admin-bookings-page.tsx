import { PortalBadge, PortalCard } from "@/components/portal-ui";
import type { Locale } from "@/lib/locale";
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
    currency: "USD",
    maximumFractionDigits: 2,
    style: "currency"
  }).format(value);
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
      pending_deposit: "PENDING"
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
  const rows =
    reservations.length > 0
      ? reservations
      : [
          {
            booking_code: "#BK-1042",
            branch_name_en: "Central Branch",
            branch_name_vi: "Central Branch",
            customer_email: "eleanor@example.com",
            customer_name: "Eleanor Vance",
            id: "demo-1",
            nightly_rate: 1250000,
            total_amount: 1250000,
            deposit_amount: 250000,
            primary_room_type_name_en: "Deluxe Suite",
            primary_room_type_name_vi: "Deluxe Suite",
            room_code: "101",
            stay_end_at: "2026-04-15T12:00:00.000Z",
            stay_start_at: "2026-04-12T12:00:00.000Z",
            status: "confirmed"
          },
          {
            booking_code: "#BK-1043",
            branch_name_en: "Central Branch",
            branch_name_vi: "Central Branch",
            customer_email: "marcus@example.com",
            customer_name: "Marcus Sterling",
            id: "demo-2",
            nightly_rate: 480000,
            total_amount: 480000,
            deposit_amount: 120000,
            primary_room_type_name_en: "Premium King",
            primary_room_type_name_vi: "Premium King",
            room_code: "102",
            stay_end_at: "2026-04-14T12:00:00.000Z",
            stay_start_at: "2026-04-13T12:00:00.000Z",
            status: "pending_deposit"
          },
          {
            booking_code: "#BK-1044",
            branch_name_en: "Central Branch",
            branch_name_vi: "Central Branch",
            customer_email: "sarah@example.com",
            customer_name: "Sarah Jenkins",
            id: "demo-3",
            nightly_rate: 890000,
            total_amount: 890000,
            deposit_amount: 180000,
            primary_room_type_name_en: "Standard Double",
            primary_room_type_name_vi: "Standard Double",
            room_code: "103",
            stay_end_at: "2026-04-18T12:00:00.000Z",
            stay_start_at: "2026-04-14T12:00:00.000Z",
            status: "confirmed"
          },
          {
            booking_code: "#BK-1045",
            branch_name_en: "Central Branch",
            branch_name_vi: "Central Branch",
            customer_email: "david@example.com",
            customer_name: "David Chen",
            id: "demo-4",
            nightly_rate: 0,
            total_amount: 0,
            deposit_amount: 0,
            primary_room_type_name_en: "Executive Suite",
            primary_room_type_name_vi: "Executive Suite",
            room_code: "104",
            stay_end_at: "2026-04-20T12:00:00.000Z",
            stay_start_at: "2026-04-15T12:00:00.000Z",
            status: "cancelled"
          },
          {
            booking_code: "#BK-1046",
            branch_name_en: "Central Branch",
            branch_name_vi: "Central Branch",
            customer_email: "elena@example.com",
            customer_name: "Elena Rodriguez",
            id: "demo-5",
            nightly_rate: 420000,
            total_amount: 420000,
            deposit_amount: 120000,
            primary_room_type_name_en: "Deluxe Suite",
            primary_room_type_name_vi: "Deluxe Suite",
            room_code: "105",
            stay_end_at: "2026-04-17T12:00:00.000Z",
            stay_start_at: "2026-04-16T12:00:00.000Z",
            status: "confirmed"
          },
          {
            booking_code: "#BK-1047",
            branch_name_en: "Central Branch",
            branch_name_vi: "Central Branch",
            customer_email: "james@example.com",
            customer_name: "James Wilson",
            id: "demo-6",
            nightly_rate: 760000,
            total_amount: 760000,
            deposit_amount: 140000,
            primary_room_type_name_en: "Standard Double",
            primary_room_type_name_vi: "Standard Double",
            room_code: "106",
            stay_end_at: "2026-04-22T12:00:00.000Z",
            stay_start_at: "2026-04-18T12:00:00.000Z",
            status: "pending_deposit"
          }
        ];

  return (
    <div className="admin-page admin-bookings">
      <div className="admin-page__hero">
        <div className="admin-page__copy">
          <h1 className="admin-page__title">{locale === "en" ? "Bookings" : "Bookings"}</h1>
          <p className="admin-page__description">
            {locale === "en"
              ? "Manage all current, upcoming, and past reservations."
              : "Quản lý toàn bộ booking hiện tại, sắp tới và lịch sử đặt phòng."}
          </p>
        </div>

        <div className="admin-page__actions">
          <button className="button button--text-light admin-page__secondary-action" type="button">
            <span className="admin-page__action-icon" aria-hidden="true">
              <DownloadIcon />
            </span>
            {locale === "en" ? "Export CSV" : "Export CSV"}
          </button>
          <button className="button button--solid admin-page__primary-action" type="button">
            <span className="admin-page__action-plus" aria-hidden="true">
              +
            </span>
            {locale === "en" ? "Add Booking" : "Add Booking"}
          </button>
        </div>
      </div>

      <PortalCard className="admin-bookings__filters">
        <div className="admin-bookings__filter">
          <label className="portal-field__label" htmlFor="booking-search">
            {locale === "en" ? "Search" : "Search"}
          </label>
          <div className="admin-bookings__input-wrap">
            <span className="admin-bookings__input-icon" aria-hidden="true">
              <SearchIcon />
            </span>
            <input
              className="admin-bookings__input"
              id="booking-search"
              placeholder={locale === "en" ? "Booking ID, Guest Name..." : "Booking ID, Guest Name..."}
              type="search"
            />
          </div>
        </div>

        <div className="admin-bookings__filter admin-bookings__filter--status">
          <label className="portal-field__label" htmlFor="booking-status">
            {locale === "en" ? "Status" : "Status"}
          </label>
          <div className="admin-bookings__select-wrap">
            <select className="admin-bookings__select" id="booking-status" defaultValue="all">
              <option value="all">{locale === "en" ? "All Statuses" : "All Statuses"}</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending_deposit">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="admin-bookings__filter admin-bookings__filter--dates">
          <label className="portal-field__label" htmlFor="booking-dates">
            {locale === "en" ? "Stay Dates" : "Stay Dates"}
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
          {locale === "en" ? "Columns" : "Columns"}
        </button>
      </PortalCard>

      <PortalCard className="admin-bookings__table-card">
        <div className="admin-bookings__table-scroll">
          <table className="admin-bookings__table">
            <thead>
              <tr>
                <th>{locale === "en" ? "Booking ID" : "Booking ID"}</th>
                <th>{locale === "en" ? "Guest Name" : "Guest Name"}</th>
                <th>{locale === "en" ? "Room Type" : "Room Type"}</th>
                <th>
                  <span className="admin-bookings__th-sort">
                    <span>{locale === "en" ? "Dates" : "Dates"}</span>
                    <span aria-hidden="true">↓</span>
                  </span>
                </th>
                <th className="admin-bookings__th-center">{locale === "en" ? "Status" : "Status"}</th>
                <th className="admin-bookings__th-right">{locale === "en" ? "Total" : "Total"}</th>
                <th className="admin-bookings__th-center">{locale === "en" ? "Action" : "Action"}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((reservation) => {
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
                      <button className="admin-bookings__action-button" type="button" title={locale === "en" ? "Email guest" : "Email guest"}>
                        <MailIcon />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="admin-bookings__footer">
          <span className="admin-bookings__summary">
            {locale === "en"
              ? `Showing 1 to ${Math.min(rows.length, 6)} of ${totalCount || rows.length} entries`
              : `Showing 1 to ${Math.min(rows.length, 6)} of ${totalCount || rows.length} entries`}
          </span>

          <div className="admin-bookings__pagination" aria-label={locale === "en" ? "Pagination" : "Pagination"}>
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
