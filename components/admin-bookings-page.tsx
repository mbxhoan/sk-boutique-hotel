"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PortalBadge, PortalCard } from "@/components/portal-ui";
import type { Locale } from "@/lib/locale";
import { appendLocaleQuery } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";
import type { WorkflowBookingRow } from "@/lib/supabase/workflow.types";

type AdminBookingsPageProps = {
  bookings: WorkflowBookingRow[];
  locale: Locale;
  totalCount: number;
};

type BookingColumnKey = "booking_code" | "customer" | "room_code" | "room_type" | "stay_dates" | "status" | "total" | "actions";

type DateRangeState = {
  end: string;
  start: string;
};

const PAGE_SIZE = 8;

const bookingColumns: Array<{
  key: BookingColumnKey;
  label: Record<Locale, string>;
}> = [
  {
    key: "booking_code",
    label: {
      en: "Booking ID",
      vi: "Mã booking"
    }
  },
  {
    key: "customer",
    label: {
      en: "Guest name",
      vi: "Khách hàng"
    }
  },
  {
    key: "room_code",
    label: {
      en: "Room",
      vi: "Phòng"
    }
  },
  {
    key: "room_type",
    label: {
      en: "Room type",
      vi: "Loại phòng"
    }
  },
  {
    key: "stay_dates",
    label: {
      en: "Dates",
      vi: "Ngày ở"
    }
  },
  {
    key: "status",
    label: {
      en: "Status",
      vi: "Trạng thái"
    }
  },
  {
    key: "total",
    label: {
      en: "Total",
      vi: "Tổng tiền"
    }
  },
  {
    key: "actions",
    label: {
      en: "Action",
      vi: "Hành động"
    }
  }
];

const statusLabels: Record<Locale, Record<WorkflowBookingRow["status"], string>> = {
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

const statusOptions: Array<{
  value: WorkflowBookingRow["status"] | "all";
  label: Record<Locale, string>;
}> = [
  {
    value: "all",
    label: {
      en: "All statuses",
      vi: "Tất cả trạng thái"
    }
  },
  ...([
    "new",
    "in_review",
    "quoted",
    "converted",
    "draft",
    "pending_deposit",
    "confirmed",
    "completed",
    "cancelled",
    "closed",
    "rejected",
    "expired"
  ] as const).map((status) => ({
    value: status,
    label: {
      en: statusLabels.en[status],
      vi: statusLabels.vi[status]
    }
  }))
];

function formatMoney(locale: Locale, value: number) {
  return (
    new Intl.NumberFormat(locale === "en" ? "en-US" : "vi-VN", {
      maximumFractionDigits: 0
    }).format(value) + " VND"
  );
}

function formatDateRange(locale: Locale, startAt: string, endAt: string) {
  const formatter = new Intl.DateTimeFormat(locale === "en" ? "en-US" : "vi-VN", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Ho_Chi_Minh"
  });

  return `${formatter.format(new Date(startAt))} - ${formatter.format(new Date(endAt))}`;
}

function formatDateChip(locale: Locale, value: string) {
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "vi-VN", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Ho_Chi_Minh"
  }).format(new Date(`${value}T00:00:00+07:00`));
}

function getLocalDateValue(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh"
  }).format(date);
}

function getInputDateValue(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh"
  }).format(new Date(value));
}

function normalizeDateBoundary(value: string, side: "end" | "start") {
  return new Date(`${value}T${side === "end" ? "23:59:59.999" : "00:00:00"}+07:00`).getTime();
}

function getInitialDateRange(bookings: WorkflowBookingRow[]): DateRangeState {
  if (!bookings.length) {
    const today = getLocalDateValue(new Date());

    return {
      end: today,
      start: today
    };
  }

  const sortedStartDates = [...bookings].sort((left, right) => new Date(left.stay_start_at).getTime() - new Date(right.stay_start_at).getTime());
  const earliestStart = getInputDateValue(sortedStartDates[0].stay_start_at);
  const latestEnd = getInputDateValue(
    [...bookings].sort((left, right) => new Date(right.stay_end_at).getTime() - new Date(left.stay_end_at).getTime())[0].stay_end_at
  );

  return {
    end: latestEnd,
    start: earliestStart
  };
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

function sourceLabel(locale: Locale, source: WorkflowBookingRow["source"]) {
  return localize(locale, {
    vi: source === "reservation" ? "Đặt phòng" : "Yêu cầu",
    en: source === "reservation" ? "Reservation" : "Request"
  });
}

function matchesSearch(row: WorkflowBookingRow, searchTerm: string) {
  if (!searchTerm) {
    return true;
  }

  const haystack = [
    row.booking_code,
    row.customer_name,
    row.customer_email,
    row.room_code ?? "",
    row.branch_name_en,
    row.branch_name_vi,
    row.room_type_name_en,
    row.room_type_name_vi,
    row.notes,
    row.source
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(searchTerm);
}

function getPaginationWindow(currentPage: number, totalPages: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
  return Array.from({ length: 5 }, (_, index) => start + index);
}

function escapeCsv(value: string) {
  return `"${value.replaceAll("\"", "\"\"")}"`;
}

function buildCsv(rows: WorkflowBookingRow[], locale: Locale) {
  const headers = [
    localize(locale, { vi: "Mã booking", en: "Booking ID" }),
    localize(locale, { vi: "Khách hàng", en: "Guest name" }),
    localize(locale, { vi: "Email", en: "Email" }),
    localize(locale, { vi: "Phòng", en: "Room" }),
    localize(locale, { vi: "Loại phòng", en: "Room type" }),
    localize(locale, { vi: "Ngày ở", en: "Stay dates" }),
    localize(locale, { vi: "Trạng thái", en: "Status" }),
    localize(locale, { vi: "Tổng tiền", en: "Total" })
  ];

  const lines = rows.map((row) =>
    [
      escapeCsv(row.booking_code),
      escapeCsv(row.customer_name),
      escapeCsv(row.customer_email),
      escapeCsv(row.room_code ?? "—"),
      escapeCsv(locale === "en" ? row.room_type_name_en : row.room_type_name_vi),
      escapeCsv(formatDateRange(locale, row.stay_start_at, row.stay_end_at)),
      escapeCsv(statusLabels[locale][row.status]),
      escapeCsv(formatMoney(locale, row.total_amount))
    ].join(",")
  );

  return [headers.map(escapeCsv).join(","), ...lines].join("\n");
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

function ColumnsIcon() {
  return <span className="admin-bookings__columns-icon">|||</span>;
}

function BookingMobileCard({
  booking,
  locale,
  visibleColumns
}: {
  booking: WorkflowBookingRow;
  locale: Locale;
  visibleColumns: Record<BookingColumnKey, boolean>;
}) {
  const tone = statusTone(booking.status);
  const bookingHref = buildBookingDetailHref(locale, booking.booking_code);

  return (
    <article className={`admin-bookings__mobile-card admin-bookings__mobile-card--${tone}`}>
      <div className="admin-bookings__mobile-card-head">
        <div className="admin-bookings__mobile-card-copy">
          {visibleColumns.booking_code ? <p className="admin-bookings__mobile-card-eyebrow">{localize(locale, { vi: "Mã booking", en: "Booking ID" })}</p> : null}
          {visibleColumns.booking_code ? (
            <Link className="admin-bookings__mobile-card-code" href={bookingHref}>
              {booking.booking_code}
            </Link>
          ) : null}
          <p className={`admin-bookings__source-pill admin-bookings__source-pill--${booking.source === "reservation" ? "reservation" : "request"}`}>
            {sourceLabel(locale, booking.source)}
          </p>
        </div>

        {visibleColumns.status ? (
          <PortalBadge tone={tone}>{statusLabel(locale, booking.status)}</PortalBadge>
        ) : null}
      </div>

      <div className="admin-bookings__mobile-divider" />

      {visibleColumns.customer ? (
        <div className="admin-bookings__mobile-block">
          <p className="admin-bookings__mobile-label">{localize(locale, { vi: "Khách hàng", en: "Guest" })}</p>
          <p className={`admin-bookings__mobile-value${tone === "neutral" ? " admin-bookings__muted" : ""}`}>{booking.customer_name}</p>
          <p className="admin-bookings__mobile-meta">{booking.customer_email}</p>
        </div>
      ) : null}

      <div className="admin-bookings__mobile-grid">
        {visibleColumns.room_type ? (
          <div className="admin-bookings__mobile-block">
            <p className="admin-bookings__mobile-label">{localize(locale, { vi: "Loại phòng", en: "Room type" })}</p>
            <p className="admin-bookings__mobile-value">{locale === "en" ? booking.room_type_name_en : booking.room_type_name_vi}</p>
          </div>
        ) : null}

        {visibleColumns.room_code ? (
          <div className="admin-bookings__mobile-block">
            <p className="admin-bookings__mobile-label">{localize(locale, { vi: "Phòng", en: "Room" })}</p>
            <p className="admin-bookings__mobile-value">{booking.room_code ?? "—"}</p>
          </div>
        ) : null}

        {visibleColumns.stay_dates ? (
          <div className="admin-bookings__mobile-block">
            <p className="admin-bookings__mobile-label">{localize(locale, { vi: "Ngày ở", en: "Dates" })}</p>
            <p className={`admin-bookings__mobile-value${tone === "neutral" ? " admin-bookings__muted" : ""}`}>
              {formatDateRange(locale, booking.stay_start_at, booking.stay_end_at)}
            </p>
          </div>
        ) : null}

        {visibleColumns.total ? (
          <div className="admin-bookings__mobile-block">
            <p className="admin-bookings__mobile-label">{localize(locale, { vi: "Tổng tiền", en: "Total" })}</p>
            <p className="admin-bookings__mobile-value admin-bookings__mobile-value--total">{formatMoney(locale, booking.total_amount)}</p>
          </div>
        ) : null}
      </div>

      {visibleColumns.actions ? (
        <div className="admin-bookings__mobile-actions">
          <Link className="admin-bookings__action-button" href={bookingHref} title={localize(locale, { vi: "Mở chi tiết", en: "Open details" })}>
            →
          </Link>
          {booking.customer_email.includes("@") ? (
            <a
              className="admin-bookings__action-button"
              href={`mailto:${booking.customer_email}`}
              rel="noreferrer"
              title={localize(locale, { vi: "Gửi email cho khách", en: "Email guest" })}
            >
              <MailIcon />
            </a>
          ) : (
            <button
              className="admin-bookings__action-button"
              disabled
              type="button"
              title={localize(locale, { vi: "Không có email hợp lệ", en: "No valid email" })}
            >
              <MailIcon />
            </button>
          )}
        </div>
      ) : null}
    </article>
  );
}

function statusLabel(locale: Locale, status: WorkflowBookingRow["status"]) {
  return statusLabels[locale][status] ?? status;
}

function buildBookingDetailHref(locale: Locale, bookingCode: string) {
  return appendLocaleQuery(`/admin/bookings/${encodeURIComponent(bookingCode)}`, locale);
}

export function AdminBookingsPage({ bookings, locale, totalCount }: AdminBookingsPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<WorkflowBookingRow["status"] | "all">("all");
  const [dateRange, setDateRange] = useState<DateRangeState>(() => getInitialDateRange(bookings));
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleColumns, setVisibleColumns] = useState<Record<BookingColumnKey, boolean>>({
          actions: true,
          booking_code: true,
          customer: true,
          room_code: true,
          room_type: true,
          stay_dates: true,
          status: true,
          total: true
  });
  const bookingsSignature = bookings.map((booking) => booking.id).join("|");

  useEffect(() => {
    setSearchQuery("");
    setStatusFilter("all");
    setDateRange(getInitialDateRange(bookings));
    setCurrentPage(1);
  }, [bookingsSignature]);

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const startBoundary = normalizeDateBoundary(dateRange.start, "start");
  const endBoundary = normalizeDateBoundary(dateRange.end, "end");

  const filteredRows = bookings.filter((row) => {
    const bookingStart = new Date(row.stay_start_at).getTime();
    const bookingEnd = new Date(row.stay_end_at).getTime();

    return (
      (statusFilter === "all" || row.status === statusFilter) &&
      matchesSearch(row, normalizedSearch) &&
      bookingEnd >= startBoundary &&
      bookingStart <= endBoundary
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageRows = filteredRows.slice((safeCurrentPage - 1) * PAGE_SIZE, safeCurrentPage * PAGE_SIZE);
  const visibleColumnKeys = bookingColumns.filter((column) => visibleColumns[column.key]);
  const visibleColumnCount = Math.max(1, visibleColumnKeys.length);
  const pageNumbers = getPaginationWindow(safeCurrentPage, totalPages);
  function handleSearchChange(value: string) {
    setSearchQuery(value);
    setCurrentPage(1);
  }

  function handleStatusChange(value: WorkflowBookingRow["status"] | "all") {
    setStatusFilter(value);
    setCurrentPage(1);
  }

  function handleStartDateChange(value: string) {
    setDateRange((current) => {
      const nextEnd = current.end < value ? value : current.end;

      return {
        end: nextEnd,
        start: value
      };
    });
    setCurrentPage(1);
  }

  function handleEndDateChange(value: string) {
    setDateRange((current) => {
      const nextStart = current.start > value ? value : current.start;

      return {
        end: value,
        start: nextStart
      };
    });
    setCurrentPage(1);
  }

  function exportCsv() {
    if (!filteredRows.length) {
      return;
    }

    const csv = buildCsv(filteredRows, locale);
    const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `sk-boutique-bookings-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  const totalBookingsCount = bookings.length;
  const confirmedRevenue = bookings
    .filter((row) => row.status === "confirmed" || row.status === "completed")
    .reduce((sum, row) => sum + (row.total_amount ?? 0), 0);
  const pendingRevenue = bookings
    .filter((row) => row.status === "pending_deposit" || row.status === "draft" || row.status === "in_review" || row.status === "new" || row.status === "quoted")
    .reduce((sum, row) => sum + (row.total_amount ?? 0), 0);
  const confirmedCount = bookings.filter((row) => row.status === "confirmed" || row.status === "completed").length;
  const pendingCount = bookings.filter((row) => ["pending_deposit", "draft", "in_review", "new", "quoted"].includes(row.status as string)).length;
  const cancelledCount = bookings.filter((row) => ["cancelled", "rejected", "expired", "closed"].includes(row.status as string)).length;

  const statsCards = [
    {
      label: localize(locale, { vi: "Tổng đặt phòng", en: "Total bookings" }),
      value: `${totalBookingsCount}`,
      detail: localize(locale, {
        vi: `${confirmedCount} đã xác nhận · ${pendingCount} đang treo · ${cancelledCount} đã hủy`,
        en: `${confirmedCount} confirmed · ${pendingCount} in progress · ${cancelledCount} cancelled`
      }),
      tone: "default" as const
    },
    {
      label: localize(locale, { vi: "Doanh thu đã xác nhận", en: "Confirmed revenue" }),
      value: formatMoney(locale, confirmedRevenue),
      detail: localize(locale, {
        vi: `${confirmedCount} booking đã xác nhận hoặc hoàn tất`,
        en: `${confirmedCount} confirmed or completed bookings`
      }),
      tone: "accent" as const
    },
    {
      label: localize(locale, { vi: "Doanh thu đang treo", en: "Pending revenue" }),
      value: formatMoney(locale, pendingRevenue),
      detail: localize(locale, {
        vi: `${pendingCount} booking chưa thanh toán đủ`,
        en: `${pendingCount} bookings awaiting payment`
      }),
      tone: "soft" as const
    },
    {
      label: localize(locale, { vi: "Booking đang xử lý", en: "Active in workflow" }),
      value: `${pendingCount}`,
      detail: localize(locale, {
        vi: "Yêu cầu mới, đang xem xét, chờ cọc.",
        en: "New requests, in review, pending deposit."
      }),
      tone: "default" as const
    }
  ];

  return (
    <div className="admin-page admin-bookings">
      <div className="admin-page__hero">
        <div className="admin-page__copy">
          <h1 className="admin-page__title">{localize(locale, { vi: "Đặt phòng", en: "Bookings" })}</h1>
          <p className="admin-page__description">
            {localize(locale, {
              vi: "Quản lý booking, yêu cầu lưu trú và lịch sử từ Supabase.",
              en: "Manage bookings, stay requests, and history from Supabase."
            })}
          </p>
        </div>

        <div className="admin-page__actions">
          <button className="button button--text-light admin-page__secondary-action" onClick={exportCsv} type="button">
            <span className="admin-page__action-icon" aria-hidden="true">
              <DownloadIcon />
            </span>
            {localize(locale, { vi: "Xuất CSV", en: "Export CSV" })}
          </button>
          <button className="button button--solid admin-page__primary-action" type="button" title={localize(locale, { vi: "Tính năng tạo mới đang được kết nối", en: "Create flow is being wired" })}>
            <span className="admin-page__action-plus" aria-hidden="true">
              +
            </span>
            {localize(locale, { vi: "Thêm đặt phòng", en: "Add booking" })}
          </button>
        </div>
      </div>

      <div className="admin-bookings__stats">
        {statsCards.map((card) => (
          <div className={`admin-bookings__stat admin-bookings__stat--${card.tone}`} key={card.label}>
            <p className="admin-bookings__stat-label">{card.label}</p>
            <p className="admin-bookings__stat-value">{card.value}</p>
            <p className="admin-bookings__stat-detail">{card.detail}</p>
          </div>
        ))}
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
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder={localize(locale, { vi: "Mã booking, tên khách...", en: "Booking ID, guest name..." })}
              value={searchQuery}
              type="search"
            />
          </div>
        </div>

        <div className="admin-bookings__filter admin-bookings__filter--status">
          <label className="portal-field__label" htmlFor="booking-status">
            {localize(locale, { vi: "Trạng thái", en: "Status" })}
          </label>
          <div className="admin-bookings__select-wrap">
            <select
              className="admin-bookings__select"
              id="booking-status"
              onChange={(event) => handleStatusChange(event.target.value as WorkflowBookingRow["status"] | "all")}
              value={statusFilter}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label[locale]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <details className="admin-bookings__date-menu">
          <summary className="admin-bookings__date-range-button">
            <label className="portal-field__label" htmlFor="booking-dates">
              {localize(locale, { vi: "Ngày lưu trú", en: "Stay dates" })}
            </label>
            <div className="admin-bookings__date-range" id="booking-dates">
              <span className="admin-bookings__date-range-icon" aria-hidden="true">
                <span>📅</span>
              </span>
              <div className="admin-bookings__date-range-values">
                <span className="admin-bookings__date-value admin-bookings__date-value--active">{formatDateChip(locale, dateRange.start)}</span>
                <span className="admin-bookings__date-divider" aria-hidden="true">
                  →
                </span>
                <span className="admin-bookings__date-value">{formatDateChip(locale, dateRange.end)}</span>
              </div>
            </div>
          </summary>
          <div className="admin-bookings__date-panel">
            <label className="admin-bookings__date-field">
              <span className="admin-bookings__date-field-label">{localize(locale, { vi: "Từ ngày", en: "From" })}</span>
              <input className="admin-bookings__date-input" onChange={(event) => handleStartDateChange(event.target.value)} type="date" value={dateRange.start} />
            </label>
            <label className="admin-bookings__date-field">
              <span className="admin-bookings__date-field-label">{localize(locale, { vi: "Đến ngày", en: "To" })}</span>
              <input className="admin-bookings__date-input" onChange={(event) => handleEndDateChange(event.target.value)} type="date" value={dateRange.end} />
            </label>
          </div>
        </details>

        <div className="admin-bookings__spacer" aria-hidden="true" />

        <details className="admin-bookings__columns-menu">
          <summary className="button admin-bookings__columns-button">
            <span className="admin-page__action-icon" aria-hidden="true">
              <ColumnsIcon />
            </span>
            {localize(locale, { vi: "Cột", en: "Columns" })}
          </summary>
          <div className="admin-bookings__columns-panel" role="menu">
            {bookingColumns.map((column) => (
              <label className="admin-bookings__column-toggle" key={column.key}>
                <input
                  checked={visibleColumns[column.key]}
                  onChange={() =>
                    setVisibleColumns((current) => ({
                      ...current,
                      [column.key]: !current[column.key]
                    }))
                  }
                  type="checkbox"
                />
                <span>{column.label[locale]}</span>
              </label>
            ))}
            <button
              className="admin-bookings__columns-reset"
              onClick={() =>
                setVisibleColumns({
                  actions: true,
                  booking_code: true,
                  customer: true,
                  room_code: true,
                  room_type: true,
                  stay_dates: true,
                  status: true,
                  total: true
                })
              }
              type="button"
            >
              {localize(locale, { vi: "Khôi phục", en: "Reset" })}
            </button>
          </div>
        </details>
      </PortalCard>

      <PortalCard className="admin-bookings__table-card">
        <div className="admin-bookings__table-scroll">
          <table className="admin-bookings__table">
            <thead>
              <tr>
                {visibleColumns.booking_code ? <th>{localize(locale, { vi: "Mã booking", en: "Booking ID" })}</th> : null}
                {visibleColumns.customer ? <th>{localize(locale, { vi: "Khách hàng", en: "Guest name" })}</th> : null}
                {visibleColumns.room_code ? <th>{localize(locale, { vi: "Phòng", en: "Room" })}</th> : null}
                {visibleColumns.room_type ? <th>{localize(locale, { vi: "Loại phòng", en: "Room type" })}</th> : null}
                {visibleColumns.stay_dates ? (
                  <th>
                    <span className="admin-bookings__th-sort">
                      <span>{localize(locale, { vi: "Ngày ở", en: "Dates" })}</span>
                      <span aria-hidden="true">↓</span>
                    </span>
                  </th>
                ) : null}
                {visibleColumns.status ? <th className="admin-bookings__th-center">{localize(locale, { vi: "Trạng thái", en: "Status" })}</th> : null}
                {visibleColumns.total ? <th className="admin-bookings__th-right">{localize(locale, { vi: "Tổng tiền", en: "Total" })}</th> : null}
                {visibleColumns.actions ? <th className="admin-bookings__th-center">{localize(locale, { vi: "Hành động", en: "Action" })}</th> : null}
              </tr>
            </thead>
            <tbody>
              {pageRows.length ? (
                pageRows.map((booking) => {
                  const tone = statusTone(booking.status);

                  return (
                    <tr className="admin-bookings__row" key={booking.id}>
                      {visibleColumns.booking_code ? (
                        <td>
                          <Link className="admin-bookings__detail-link" href={buildBookingDetailHref(locale, booking.booking_code)}>
                            <div className="admin-bookings__primary-value">{booking.booking_code}</div>
                            <div className={`admin-bookings__source-pill admin-bookings__source-pill--${booking.source === "reservation" ? "reservation" : "request"}`}>
                              {sourceLabel(locale, booking.source)}
                            </div>
                          </Link>
                        </td>
                      ) : null}
                      {visibleColumns.customer ? (
                        <td>
                          <div className={tone === "neutral" ? "admin-bookings__muted" : undefined}>{booking.customer_name}</div>
                          <div className="admin-bookings__secondary-value">{booking.customer_email}</div>
                        </td>
                      ) : null}
                      {visibleColumns.room_code ? (
                        <td>
                          <div className="admin-bookings__primary-value">{booking.room_code ?? "—"}</div>
                          <div className="admin-bookings__secondary-value">
                            {booking.room_code ? localize(locale, { vi: "Phòng cụ thể", en: "Assigned room" }) : localize(locale, { vi: "Chưa phân phòng", en: "Unassigned" })}
                          </div>
                        </td>
                      ) : null}
                      {visibleColumns.room_type ? (
                        <td className={tone === "neutral" ? "admin-bookings__muted" : undefined}>
                          {locale === "en" ? booking.room_type_name_en : booking.room_type_name_vi}
                        </td>
                      ) : null}
                      {visibleColumns.stay_dates ? (
                        <td className={tone === "neutral" ? "admin-bookings__muted" : undefined}>{formatDateRange(locale, booking.stay_start_at, booking.stay_end_at)}</td>
                      ) : null}
                      {visibleColumns.status ? (
                        <td className="admin-bookings__status-cell">
                          <PortalBadge tone={tone}>{statusLabel(locale, booking.status)}</PortalBadge>
                        </td>
                      ) : null}
                      {visibleColumns.total ? <td className="admin-bookings__total-cell">{formatMoney(locale, booking.total_amount)}</td> : null}
                      {visibleColumns.actions ? (
                        <td className="admin-bookings__action-cell">
                          <Link
                            className="admin-bookings__action-button"
                            href={buildBookingDetailHref(locale, booking.booking_code)}
                            title={localize(locale, { vi: "Mở chi tiết", en: "Open details" })}
                          >
                            →
                          </Link>
                          {booking.customer_email.includes("@") ? (
                            <a
                              className="admin-bookings__action-button"
                              href={`mailto:${booking.customer_email}`}
                              rel="noreferrer"
                              title={localize(locale, { vi: "Gửi email cho khách", en: "Email guest" })}
                            >
                              <MailIcon />
                            </a>
                          ) : (
                            <button
                              className="admin-bookings__action-button"
                              disabled
                              type="button"
                              title={localize(locale, { vi: "Không có email hợp lệ", en: "No valid email" })}
                            >
                              <MailIcon />
                            </button>
                          )}
                        </td>
                      ) : null}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td className="admin-bookings__empty-row" colSpan={visibleColumnCount}>
                    {localize(locale, {
                      vi: "Không có booking nào khớp bộ lọc hiện tại.",
                      en: "No bookings match the current filters."
                    })}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </PortalCard>

      <div className="admin-bookings__mobile-list" aria-label={localize(locale, { vi: "Danh sách booking", en: "Booking cards" })}>
        {pageRows.length ? (
          pageRows.map((booking) => (
            <BookingMobileCard booking={booking} key={booking.id} locale={locale} visibleColumns={visibleColumns} />
          ))
        ) : (
          <PortalCard className="admin-bookings__mobile-empty" tone="soft">
            <p className="admin-bookings__empty-row">
              {localize(locale, {
                vi: "Không có booking nào khớp bộ lọc hiện tại.",
                en: "No bookings match the current filters."
              })}
            </p>
          </PortalCard>
        )}
      </div>

      <div className="admin-bookings__footer">
          <span className="admin-bookings__summary">
            {localize(locale, {
              vi: `Hiển thị ${pageRows.length ? (safeCurrentPage - 1) * PAGE_SIZE + 1 : 0} đến ${Math.min(safeCurrentPage * PAGE_SIZE, filteredRows.length)} trên tổng ${totalCount} booking`,
              en: `Showing ${pageRows.length ? (safeCurrentPage - 1) * PAGE_SIZE + 1 : 0} to ${Math.min(safeCurrentPage * PAGE_SIZE, filteredRows.length)} of ${totalCount} bookings`
            })}
          </span>

          <div className="admin-bookings__pagination" aria-label={localize(locale, { vi: "Phân trang", en: "Pagination" })}>
            <button
              className="admin-bookings__page-button"
              disabled={safeCurrentPage <= 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              type="button"
            >
              <span aria-hidden="true">‹</span>
            </button>
            {pageNumbers.map((page) => (
              <button
                className={`admin-bookings__page-button${page === safeCurrentPage ? " admin-bookings__page-button--active" : ""}`}
                key={page}
                onClick={() => setCurrentPage(page)}
                type="button"
              >
                {page}
              </button>
            ))}
            <button
              className="admin-bookings__page-button"
              disabled={safeCurrentPage >= totalPages}
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              type="button"
            >
              <span aria-hidden="true">›</span>
            </button>
          </div>
        </div>
    </div>
  );
}
