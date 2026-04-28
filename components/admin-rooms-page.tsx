"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { PortalCard } from "@/components/portal-ui";
import type { Locale } from "@/lib/locale";
import { appendLocaleQuery } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";
import type { FloorRow, RoomRow, RoomTypeRow } from "@/lib/supabase/database.types";

type RoomView = RoomRow & {
  display_status: "available" | "blocked" | "cleaning" | "maintenance" | "occupied";
  floor_code: string;
  floor_label: string;
  room_type_name_en: string;
  room_type_name_vi: string;
};

type FloorOption = Pick<FloorRow, "code" | "id" | "name_en" | "name_vi">;
type RoomTypeOption = Pick<RoomTypeRow, "id" | "name_en" | "name_vi">;
type RoomBookingSummary = {
  bookingCode: string;
  customerName: string;
  id: string;
  roomCode: string | null;
  stayEndAt: string;
  stayStartAt: string;
  status: string;
  totalAmount: number;
};

type AdminRoomsPageProps = {
  branchName: string;
  branchId: string | null;
  floorId: string | null;
  floors: FloorOption[];
  locale: Locale;
  rooms: RoomView[];
  selectedRoomId: string | null;
  selectedStartDate: string;
  selectedEndDate: string;
  roomBookings: RoomBookingSummary[];
  roomTypes: RoomTypeOption[];
};

function statusLabel(locale: Locale, status: RoomView["display_status"]) {
  const labels: Record<Locale, Record<RoomView["display_status"], string>> = {
    en: {
      available: "AVAILABLE",
      blocked: "BLOCKED",
      cleaning: "CLEANING",
      maintenance: "MAINTENANCE",
      occupied: "OCCUPIED"
    },
    vi: {
      available: "TRỐNG",
      blocked: "CHẶN",
      cleaning: "ĐANG DỌN",
      maintenance: "BẢO TRÌ",
      occupied: "ĐANG Ở"
    }
  };

  return labels[locale][status];
}

function statusTone(status: RoomView["display_status"]) {
  switch (status) {
    case "available":
      return "available" as const;
    case "occupied":
      return "occupied" as const;
    case "cleaning":
      return "cleaning" as const;
    case "maintenance":
      return "maintenance" as const;
    default:
      return "blocked" as const;
  }
}

function roomCardIcon(status: RoomView["display_status"]) {
  if (status === "maintenance") {
    return "🔧";
  }

  if (status === "occupied") {
    return "🛏";
  }

  if (status === "cleaning") {
    return "🧹";
  }

  return "🛏";
}

function initials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 18 18" width="18">
      <circle cx="7.4" cy="7.4" r="4.8" stroke="currentColor" strokeWidth="1.2" />
      <path d="M11 11l4 4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
    </svg>
  );
}

function buildRoomViews(rooms: RoomView[]) {
  return rooms;
}

function formatDateRange(locale: Locale, startAt: string, endAt: string) {
  const formatter = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "vi-VN", {
    dateStyle: "medium",
    timeZone: "Asia/Ho_Chi_Minh"
  });

  return `${formatter.format(new Date(startAt))} → ${formatter.format(new Date(endAt))}`;
}

function bookingStatusLabel(locale: Locale, status: string) {
  const labels: Record<Locale, Record<string, string>> = {
    en: {
      cancelled: "Cancelled",
      completed: "Completed",
      confirmed: "Confirmed",
      draft: "Draft",
      pending_deposit: "Pending deposit"
    },
    vi: {
      cancelled: "Đã hủy",
      completed: "Hoàn tất",
      confirmed: "Đã xác nhận",
      draft: "Nháp",
      pending_deposit: "Chờ cọc"
    }
  };

  return labels[locale][status] ?? status;
}

export function AdminRoomsPage({
  branchName,
  branchId,
  floorId,
  floors,
  locale,
  rooms,
  selectedRoomId,
  selectedStartDate,
  selectedEndDate,
  roomBookings,
  roomTypes
}: AdminRoomsPageProps) {
  const resolvedRooms = buildRoomViews(rooms);
  const [searchQuery, setSearchQuery] = useState("");
  const [roomTypeFilter, setRoomTypeFilter] = useState("all");
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedFloor = floors.find((floor) => floor.id === floorId) ?? floors[0] ?? null;
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const bookedCountByFloor = resolvedRooms.reduce((map, room) => {
    if (room.display_status === "occupied") {
      map[room.floor_id] = (map[room.floor_id] ?? 0) + 1;
    }

    return map;
  }, {} as Record<string, number>);

  useEffect(() => {
    setSearchQuery("");
    setRoomTypeFilter("all");
  }, [branchId]);

  function buildCurrentHref(nextParams: Record<string, string | null | undefined>) {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(nextParams)) {
      if (value && value.length > 0) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }

    const query = params.toString();
    return `${pathname}${query ? `?${query}` : ""}`;
  }

  const filteredRooms = resolvedRooms.filter((room) => {
    const matchesSearch =
      !normalizedSearch ||
      [room.code, room.room_type_name_en, room.room_type_name_vi, room.notes_en, room.notes_vi, room.floor_code, room.floor_label]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    const matchesRoomType = roomTypeFilter === "all" || room.room_type_id === roomTypeFilter;

    return matchesSearch && matchesRoomType;
  });
  const visibleRooms = selectedFloor ? filteredRooms.filter((room) => room.floor_id === selectedFloor.id) : filteredRooms;
  const gridRooms = selectedFloor ? visibleRooms : filteredRooms;
  const selectedRoom = gridRooms.find((room) => room.id === selectedRoomId) ?? gridRooms[0] ?? null;
  const selectedFloorLabel = selectedFloor
    ? locale === "en"
      ? selectedFloor.name_en ?? selectedFloor.code
      : selectedFloor.name_vi ?? selectedFloor.code
    : branchName;

  function buildFloorHref(floor: FloorOption) {
    const params = new URLSearchParams();

    if (branchId) {
      params.set("branch", branchId);
    }

    params.set("floor", floor.id);
    params.set("start", selectedStartDate);
    params.set("end", selectedEndDate);

    if (locale === "en") {
      params.set("lang", "en");
    }

    return `?${params.toString()}`;
  }

  function buildRoomHref(room: RoomView) {
    const params = new URLSearchParams();

    if (branchId) {
      params.set("branch", branchId);
    }

    params.set("floor", room.floor_id);
    params.set("room", room.id);
    params.set("start", selectedStartDate);
    params.set("end", selectedEndDate);

    if (locale === "en") {
      params.set("lang", "en");
    }

    return `?${params.toString()}`;
  }

  return (
    <div className="admin-page admin-rooms">
      <div className="admin-page__hero admin-page__hero--rooms">
        <div className="admin-page__copy">
          <h1 className="admin-page__title">{localize(locale, { vi: "Phòng & sơ đồ tầng", en: "Room availability & floor plan" })}</h1>
          <p className="admin-page__description">
            {localize(locale, {
              vi: "Quản lý phòng vật lý và trạng thái thời gian thực.",
              en: "Manage physical rooms and real-time statuses."
            })}
          </p>
        </div>

        <div className="admin-rooms__floor-tabs" role="tablist" aria-label={localize(locale, { vi: "Các tầng", en: "Floors" })}>
          {floors.map((floor) => {
            const active = floor.id === selectedFloor?.id;

            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={`admin-rooms__floor-tab${active ? " admin-rooms__floor-tab--active" : ""}`}
                href={buildFloorHref(floor)}
                key={floor.id}
              >
                <span>{locale === "en" ? floor.name_en || floor.code : floor.name_vi || floor.code}</span>
                {bookedCountByFloor[floor.id] ? (
                  <span className="admin-rooms__floor-tab-count" aria-label={localize(locale, { vi: `${bookedCountByFloor[floor.id]} phòng đang được đặt`, en: `${bookedCountByFloor[floor.id]} booked room(s)` })}>
                    {bookedCountByFloor[floor.id]}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      </div>

      <PortalCard className="admin-rooms__filter-card">
        <div className="admin-rooms__filter-group">
          <div className="admin-rooms__filter">
            <label className="portal-field__label" htmlFor="room-search">
              {localize(locale, { vi: "Tìm kiếm", en: "Search" })}
            </label>
            <div className="admin-rooms__input-wrap">
              <span className="admin-rooms__input-icon" aria-hidden="true">
                <SearchIcon />
              </span>
              <input
                className="admin-rooms__input"
                id="room-search"
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={localize(locale, { vi: "Số phòng hoặc loại phòng...", en: "Room # or type..." })}
                value={searchQuery}
                type="search"
              />
            </div>
          </div>

            <div className="admin-rooms__divider" aria-hidden="true" />

          <div className="admin-rooms__filter admin-rooms__filter--view">
            <label className="portal-field__label" htmlFor="room-view">
              {localize(locale, { vi: "Xem", en: "View" })}
            </label>
            <div className="admin-rooms__select-wrap">
              <select className="admin-rooms__select" id="room-view" onChange={(event) => setRoomTypeFilter(event.target.value)} value={roomTypeFilter}>
                <option value="all">{localize(locale, { vi: "Tất cả loại", en: "All categories" })}</option>
                {roomTypes.map((roomType) => (
                  <option key={roomType.id} value={roomType.id}>
                    {locale === "en" ? roomType.name_en : roomType.name_vi}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="admin-rooms__divider" aria-hidden="true" />

          <div className="admin-rooms__filter admin-rooms__filter--date">
            <label className="portal-field__label" htmlFor="room-date-start">
              {localize(locale, { vi: "Từ ngày", en: "From date" })}
            </label>
            <div className="admin-rooms__date-grid">
              <label className="admin-rooms__date-field" htmlFor="room-date-start">
                <span className="admin-rooms__date-field-label">{localize(locale, { vi: "Từ", en: "From" })}</span>
                <input
                  className="admin-rooms__input"
                  id="room-date-start"
                  onChange={(event) => {
                    const nextStart = event.target.value;
                    router.push(buildCurrentHref({ start: nextStart, end: nextStart > selectedEndDate ? nextStart : selectedEndDate }));
                  }}
                  value={selectedStartDate}
                  type="date"
                />
              </label>
              <label className="admin-rooms__date-field" htmlFor="room-date-end">
                <span className="admin-rooms__date-field-label">{localize(locale, { vi: "Đến", en: "To" })}</span>
                <input
                  className="admin-rooms__input"
                  id="room-date-end"
                  onChange={(event) => {
                    const nextEnd = event.target.value;
                    router.push(buildCurrentHref({ start: selectedStartDate > nextEnd ? nextEnd : selectedStartDate, end: nextEnd }));
                  }}
                  value={selectedEndDate}
                  type="date"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="admin-rooms__legend" aria-label={localize(locale, { vi: "Chú giải trạng thái", en: "Status legend" })}>
          <span className="admin-rooms__legend-item">
            <span className="admin-rooms__legend-dot admin-rooms__legend-dot--occupied" />
            {localize(locale, { vi: "Đang ở", en: "Occupied" })}
          </span>
          <span className="admin-rooms__legend-item">
            <span className="admin-rooms__legend-dot admin-rooms__legend-dot--blocked" />
            {localize(locale, { vi: "Chặn", en: "Blocked" })}
          </span>
          <span className="admin-rooms__legend-item">
            <span className="admin-rooms__legend-dot admin-rooms__legend-dot--available" />
            {localize(locale, { vi: "Trống", en: "Available" })}
          </span>
          <span className="admin-rooms__legend-item">
            <span className="admin-rooms__legend-dot admin-rooms__legend-dot--cleaning" />
            {localize(locale, { vi: "Đang dọn", en: "Cleaning" })}
          </span>
          <span className="admin-rooms__legend-item">
            <span className="admin-rooms__legend-dot admin-rooms__legend-dot--maintenance" />
            {localize(locale, { vi: "Bảo trì", en: "Maintenance" })}
          </span>
        </div>
      </PortalCard>

      <div className="admin-rooms__body">
        <PortalCard className="admin-rooms__grid-card">
          {gridRooms.length ? (
            <div className="admin-rooms__grid">
              {gridRooms.map((room) => {
                const active = room.id === selectedRoom?.id;

                return (
                  <Link
                    className={`admin-room-card admin-room-card--${statusTone(room.display_status)}${active ? " admin-room-card--active" : ""}`}
                    href={buildRoomHref(room)}
                    key={room.id}
                  >
                    <div className="admin-room-card__top">
                      <span className="admin-room-card__number">{room.code}</span>
                      <span className="admin-room-card__icon" aria-hidden="true">
                        {roomCardIcon(room.display_status)}
                      </span>
                    </div>
                    <div className="admin-room-card__type">{locale === "en" ? room.room_type_name_en : room.room_type_name_vi}</div>
                    <div className="admin-room-card__footer">
                      <span className="admin-room-card__status">{statusLabel(locale, room.display_status)}</span>
                      <span className="admin-room-card__status-icon" aria-hidden="true">
                        {room.display_status === "occupied" ? "👤" : room.display_status === "maintenance" ? "🔧" : room.display_status === "cleaning" ? "🧹" : ""}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="admin-rooms__empty-state">
              <p className="admin-rooms__empty-title">
                {localize(locale, {
                  vi: normalizedSearch || roomTypeFilter !== "all" ? "Không có phòng khớp bộ lọc" : selectedFloor ? "Tầng này chưa có phòng" : "Chưa có dữ liệu phòng",
                  en: normalizedSearch || roomTypeFilter !== "all" ? "No rooms match the current filters" : selectedFloor ? "No rooms on this floor" : "No room data yet"
                })}
              </p>
              <p className="admin-rooms__empty-copy">
                {localize(locale, {
                  vi: normalizedSearch || roomTypeFilter !== "all"
                    ? "Hãy thử xóa bộ lọc hoặc đổi từ khóa tìm kiếm."
                    : selectedFloor
                      ? "Supabase chưa trả về phòng nào cho tầng này."
                      : "Supabase chưa trả về phòng nào cho chi nhánh này.",
                  en: normalizedSearch || roomTypeFilter !== "all"
                    ? "Try clearing the filters or changing the search term."
                    : selectedFloor
                      ? "Supabase has not returned any rooms for this floor."
                      : "Supabase has not returned any rooms for this branch."
                })}
              </p>
            </div>
          )}
        </PortalCard>

        <PortalCard className="admin-rooms__inspector">
          <div className="admin-rooms__inspector-bar" />
          <div className="admin-rooms__inspector-head">
            <div>
              <p className="admin-rooms__eyebrow">{localize(locale, { vi: "Phòng được chọn", en: "Selected room" })}</p>
              <h2 className="admin-rooms__selected-number">
                {selectedRoom?.code ?? localize(locale, { vi: "Chưa có", en: "N/A" })}{" "}
                <span className="admin-rooms__selected-icon" aria-hidden="true">
                  {selectedRoom ? roomCardIcon(selectedRoom.display_status) : "🛏"}
                </span>
              </h2>
              <p className="admin-rooms__selected-copy">
                {selectedRoom
                  ? `${locale === "en" ? selectedRoom.room_type_name_en : selectedRoom.room_type_name_vi} • ${selectedFloorLabel}`
                  : `${branchName}`}
              </p>
            </div>
            <span className={`admin-rooms__status-pill admin-rooms__status-pill--${statusTone(selectedRoom?.display_status ?? "available")}`}>
              {selectedRoom ? statusLabel(locale, selectedRoom.display_status) : statusLabel(locale, "available")}
            </span>
          </div>

          <div className="admin-rooms__guest-card">
            <div className="admin-rooms__guest-avatar">{selectedRoom ? initials(selectedRoom.code) : "JD"}</div>
            <div className="admin-rooms__guest-copy">
              <p className="admin-rooms__guest-name">
                {locale === "en"
                  ? selectedRoom?.notes_en?.split("\n")[0] || selectedRoom?.notes_vi?.split("\n")[0] || localize(locale, { vi: "Chưa có ghi chú", en: "No notes yet" })
                  : selectedRoom?.notes_vi?.split("\n")[0] || selectedRoom?.notes_en?.split("\n")[0] || localize(locale, { vi: "Chưa có ghi chú", en: "No notes yet" })}
              </p>
              <p className="admin-rooms__guest-detail">
                {selectedRoom?.display_status === "occupied"
                  ? localize(locale, {
                      vi: "Trả phòng: ngày mai, 11:00 sáng",
                      en: "Checkout: tomorrow, 11:00 AM"
                    })
                  : localize(locale, {
                      vi: "Ghi chú phòng và ngữ cảnh housekeeping",
                      en: "Room notes and housekeeping context"
                    })}
              </p>
            </div>
          </div>

          <div className="admin-rooms__status-section">
            <p className="admin-rooms__section-title">{localize(locale, { vi: "Cập nhật trạng thái", en: "Update room status" })}</p>
            <div className="admin-rooms__status-grid">
              <button
                className={`admin-rooms__status-button${selectedRoom?.display_status === "available" ? " admin-rooms__status-button--selected" : ""}`}
                type="button"
              >
                <span className="admin-rooms__status-dot admin-rooms__status-dot--available" />
                {localize(locale, { vi: "Trống", en: "Available" })}
              </button>
              <button
                className={`admin-rooms__status-button${selectedRoom?.display_status === "occupied" ? " admin-rooms__status-button--selected" : ""}`}
                type="button"
              >
                <span className="admin-rooms__status-dot admin-rooms__status-dot--occupied" />
                {localize(locale, { vi: "Đang ở", en: "Occupied" })}
              </button>
              <button
                className={`admin-rooms__status-button${selectedRoom?.display_status === "cleaning" ? " admin-rooms__status-button--selected" : ""}`}
                type="button"
              >
                <span className="admin-rooms__status-dot admin-rooms__status-dot--cleaning" />
                {localize(locale, { vi: "Đang dọn", en: "Cleaning" })}
              </button>
              <button
                className={`admin-rooms__status-button${selectedRoom?.display_status === "maintenance" ? " admin-rooms__status-button--selected" : ""}`}
                type="button"
              >
                <span className="admin-rooms__status-dot admin-rooms__status-dot--maintenance" />
                {localize(locale, { vi: "Bảo trì", en: "Maintenance" })}
              </button>
            </div>
          </div>

          <div className="admin-rooms__notes-section">
            <p className="admin-rooms__section-title">{localize(locale, { vi: "Ghi chú housekeeping", en: "Housekeeping notes" })}</p>
            <textarea
              className="admin-rooms__notes"
              defaultValue={locale === "en" ? selectedRoom?.notes_en ?? selectedRoom?.notes_vi ?? "" : selectedRoom?.notes_vi ?? selectedRoom?.notes_en ?? ""}
              placeholder={localize(locale, { vi: "Thêm ghi chú tại đây...", en: "Add notes here..." })}
            />
          </div>

          <button className="button button--solid admin-rooms__save" type="button">
            {localize(locale, { vi: "LƯU THAY ĐỔI", en: "SAVE CHANGES" })}
          </button>

          <div className="admin-rooms__booking-history">
            <div className="admin-rooms__section-head">
              <p className="admin-rooms__section-title">{localize(locale, { vi: "Booking trong khoảng lọc", en: "Bookings in range" })}</p>
              <span className="admin-rooms__booking-count">{roomBookings.length}</span>
            </div>
            {roomBookings.length ? (
              <ol className="admin-rooms__booking-list">
                {roomBookings.map((booking) => (
                  <li className="admin-rooms__booking-item" key={booking.id}>
                    <div className="admin-rooms__booking-main">
                      <div>
                        <Link className="admin-rooms__booking-link" href={appendLocaleQuery(`/admin/bookings/${encodeURIComponent(booking.bookingCode)}`, locale)}>
                          {booking.bookingCode}
                        </Link>
                        <p className="admin-rooms__booking-meta">
                          {booking.customerName}
                          {booking.roomCode ? ` • ${booking.roomCode}` : ""}
                        </p>
                      </div>
                      <span className={`admin-rooms__booking-status admin-rooms__booking-status--${booking.status}`}>
                        {bookingStatusLabel(locale, booking.status)}
                      </span>
                    </div>
                    <p className="admin-rooms__booking-range">{formatDateRange(locale, booking.stayStartAt, booking.stayEndAt)}</p>
                    <p className="admin-rooms__booking-amount">
                      {new Intl.NumberFormat(locale === "en" ? "en-US" : "vi-VN", { maximumFractionDigits: 0 }).format(booking.totalAmount)} VND
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="admin-rooms__booking-empty">
                {localize(locale, {
                  vi: "Không có booking nào trong khoảng ngày đã lọc cho phòng này.",
                  en: "No bookings were found for this room in the selected date range."
                })}
              </p>
            )}
          </div>
        </PortalCard>
      </div>
    </div>
  );
}
