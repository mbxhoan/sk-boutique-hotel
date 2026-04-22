import Link from "next/link";

import { PortalCard } from "@/components/portal-ui";
import type { Locale } from "@/lib/locale";
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

type AdminRoomsPageProps = {
  branchName: string;
  floorId: string | null;
  floors: FloorOption[];
  locale: Locale;
  rooms: RoomView[];
  selectedRoomId: string | null;
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

export function AdminRoomsPage({
  branchName,
  floorId,
  floors,
  locale,
  rooms,
  selectedRoomId,
  roomTypes
}: AdminRoomsPageProps) {
  const resolvedRooms = buildRoomViews(rooms);
  const selectedFloor = floors.find((floor) => floor.id === floorId) ?? floors[0] ?? null;

  const visibleRooms = selectedFloor ? resolvedRooms.filter((room) => room.floor_id === selectedFloor.id) : resolvedRooms;
  const fallbackRooms = visibleRooms.length ? visibleRooms : resolvedRooms;
  const selectedRoom =
    fallbackRooms.find((room) => room.id === selectedRoomId) ?? fallbackRooms[0] ?? resolvedRooms.find((room) => room.id === selectedRoomId) ?? resolvedRooms[0] ?? null;

  function buildFloorHref(floor: FloorOption) {
    return `?floor=${floor.id}${locale === "en" ? "&lang=en" : ""}`;
  }

  function buildRoomHref(room: RoomView) {
    return `?floor=${room.floor_id}&room=${room.id}${locale === "en" ? "&lang=en" : ""}`;
  }

  return (
    <div className="admin-page admin-rooms">
      <div className="admin-page__hero admin-page__hero--rooms">
        <div className="admin-page__copy">
          <h1 className="admin-page__title">{locale === "en" ? "Room Availability & Floor Plan" : "Room Availability & Floor Plan"}</h1>
          <p className="admin-page__description">
            {locale === "en"
              ? "Manage physical inventory and real-time statuses."
              : "Quản lý phòng vật lý và trạng thái thời gian thực."}
          </p>
        </div>

        <div className="admin-rooms__floor-tabs" role="tablist" aria-label={locale === "en" ? "Floors" : "Floors"}>
          {floors.map((floor) => {
            const active = floor.id === selectedFloor?.id;

            return (
                <Link
                  className={`admin-rooms__floor-tab${active ? " admin-rooms__floor-tab--active" : ""}`}
                  href={buildFloorHref(floor)}
                  key={floor.id}
                >
                  {floor.name_en || floor.code}
              </Link>
            );
          })}
        </div>
      </div>

      <PortalCard className="admin-rooms__filter-card">
        <div className="admin-rooms__filter-group">
          <div className="admin-rooms__filter">
            <label className="portal-field__label" htmlFor="room-search">
              {locale === "en" ? "Search" : "Search"}
            </label>
            <div className="admin-rooms__input-wrap">
              <span className="admin-rooms__input-icon" aria-hidden="true">
                <SearchIcon />
              </span>
              <input className="admin-rooms__input" id="room-search" placeholder={locale === "en" ? "Room # or Type..." : "Room # or Type..."} type="search" />
            </div>
          </div>

          <div className="admin-rooms__divider" aria-hidden="true" />

          <div className="admin-rooms__filter admin-rooms__filter--view">
            <label className="portal-field__label" htmlFor="room-view">
              {locale === "en" ? "View" : "View"}
            </label>
            <div className="admin-rooms__select-wrap">
              <select className="admin-rooms__select" id="room-view" defaultValue="all">
                <option value="all">{locale === "en" ? "All Categories" : "All Categories"}</option>
                {roomTypes.slice(0, 4).map((roomType) => (
                  <option key={roomType.id} value={roomType.id}>
                    {locale === "en" ? roomType.name_en : roomType.name_vi}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="admin-rooms__legend" aria-label={locale === "en" ? "Status legend" : "Status legend"}>
          <span className="admin-rooms__legend-item">
            <span className="admin-rooms__legend-dot admin-rooms__legend-dot--occupied" />
            {locale === "en" ? "Occupied" : "Occupied"}
          </span>
          <span className="admin-rooms__legend-item">
            <span className="admin-rooms__legend-dot admin-rooms__legend-dot--available" />
            {locale === "en" ? "Available" : "Available"}
          </span>
          <span className="admin-rooms__legend-item">
            <span className="admin-rooms__legend-dot admin-rooms__legend-dot--cleaning" />
            {locale === "en" ? "Cleaning" : "Cleaning"}
          </span>
          <span className="admin-rooms__legend-item">
            <span className="admin-rooms__legend-dot admin-rooms__legend-dot--maintenance" />
            {locale === "en" ? "Maintenance" : "Maintenance"}
          </span>
        </div>
      </PortalCard>

      <div className="admin-rooms__body">
        <PortalCard className="admin-rooms__grid-card">
          <div className="admin-rooms__grid">
            {fallbackRooms.map((room) => {
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
        </PortalCard>

        <PortalCard className="admin-rooms__inspector">
          <div className="admin-rooms__inspector-bar" />
          <div className="admin-rooms__inspector-head">
            <div>
              <p className="admin-rooms__eyebrow">{locale === "en" ? "Selected Room" : "Selected Room"}</p>
              <h2 className="admin-rooms__selected-number">
                {selectedRoom?.code ?? "101"}{" "}
                <span className="admin-rooms__selected-icon" aria-hidden="true">
                  {selectedRoom ? roomCardIcon(selectedRoom.display_status) : "🛏"}
                </span>
              </h2>
              <p className="admin-rooms__selected-copy">
                {selectedRoom
                  ? `${locale === "en" ? selectedRoom.room_type_name_en : selectedRoom.room_type_name_vi} • ${selectedFloor?.name_en ?? selectedFloor?.code ?? ""}`
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
              <p className="admin-rooms__guest-name">{selectedRoom?.notes_en?.split("\n")[0] || selectedRoom?.notes_vi?.split("\n")[0] || (locale === "en" ? "John Doe" : "John Doe")}</p>
              <p className="admin-rooms__guest-detail">
                {selectedRoom?.display_status === "occupied"
                  ? locale === "en"
                    ? "Checkout: Tomorrow, 11:00 AM"
                    : "Checkout: Tomorrow, 11:00 AM"
                  : locale === "en"
                    ? "Room notes and housekeeping context"
                    : "Room notes and housekeeping context"}
              </p>
            </div>
          </div>

          <div className="admin-rooms__status-section">
            <p className="admin-rooms__section-title">{locale === "en" ? "Update Room Status" : "Update Room Status"}</p>
            <div className="admin-rooms__status-grid">
              <button
                className={`admin-rooms__status-button${selectedRoom?.display_status === "available" ? " admin-rooms__status-button--selected" : ""}`}
                type="button"
              >
                <span className="admin-rooms__status-dot admin-rooms__status-dot--available" />
                {locale === "en" ? "Available" : "Available"}
              </button>
              <button
                className={`admin-rooms__status-button${selectedRoom?.display_status === "occupied" ? " admin-rooms__status-button--selected" : ""}`}
                type="button"
              >
                <span className="admin-rooms__status-dot admin-rooms__status-dot--occupied" />
                {locale === "en" ? "Occupied" : "Occupied"}
              </button>
              <button
                className={`admin-rooms__status-button${selectedRoom?.display_status === "cleaning" ? " admin-rooms__status-button--selected" : ""}`}
                type="button"
              >
                <span className="admin-rooms__status-dot admin-rooms__status-dot--cleaning" />
                {locale === "en" ? "Cleaning" : "Cleaning"}
              </button>
              <button
                className={`admin-rooms__status-button${selectedRoom?.display_status === "maintenance" ? " admin-rooms__status-button--selected" : ""}`}
                type="button"
              >
                <span className="admin-rooms__status-dot admin-rooms__status-dot--maintenance" />
                {locale === "en" ? "Maintenance" : "Maintenance"}
              </button>
            </div>
          </div>

          <div className="admin-rooms__notes-section">
            <p className="admin-rooms__section-title">{locale === "en" ? "Housekeeping Notes" : "Housekeeping Notes"}</p>
            <textarea className="admin-rooms__notes" defaultValue={selectedRoom?.notes_en ?? selectedRoom?.notes_vi ?? ""} placeholder={locale === "en" ? "Add notes here..." : "Add notes here..."} />
          </div>

          <button className="button button--solid admin-rooms__save" type="button">
            {locale === "en" ? "SAVE CHANGES" : "SAVE CHANGES"}
          </button>
        </PortalCard>
      </div>
    </div>
  );
}
