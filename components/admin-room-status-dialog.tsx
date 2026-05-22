"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { updateRoomOperationalStatusAction } from "@/app/(admin)/admin/actions";
import { PortalSubmitButton } from "@/components/portal-submit-button";
import type { Locale } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";
import { dateKeyInWindow, type RoomDateWindow, type RoomOperationalOverrideStatus, type RoomOperationalStatus } from "@/lib/rooms/operational-status";

export type RoomStatusScheduleItem = {
  endDate: string;
  id: string;
  note: string;
  startDate: string;
  status: RoomOperationalOverrideStatus;
};

type AdminRoomStatusDialogProps = {
  defaultEndDate: string;
  defaultStartDate: string;
  locale: Locale;
  onClose: () => void;
  open: boolean;
  returnToHref: string;
  roomCode: string;
  roomId: string;
  scheduledStatuses: RoomStatusScheduleItem[];
  status: RoomOperationalStatus;
  windows: RoomDateWindow[];
};

type CloseIconProps = {
  locale: Locale;
  onClose: () => void;
};

function formatDateRange(locale: Locale, startDate: string, endDate: string) {
  const formatter = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "vi-VN", {
    dateStyle: "medium",
    timeZone: "Asia/Ho_Chi_Minh"
  });

  return `${formatter.format(new Date(`${startDate}T00:00:00+07:00`))} → ${formatter.format(new Date(`${endDate}T00:00:00+07:00`))}`;
}

function statusLabel(locale: Locale, status: RoomOperationalStatus) {
  return localize(locale, {
    en: {
      available: "Available",
      cleaning: "Cleaning",
      maintenance: "Maintenance",
      occupied: "Occupied"
    }[status],
    vi: {
      available: "Trống",
      cleaning: "Đang dọn",
      maintenance: "Bảo trì",
      occupied: "Đang ở"
    }[status]
  });
}

function pickInitialWindow(windows: RoomDateWindow[], defaultStartDate: string, defaultEndDate: string) {
  const matchedWindow =
    windows.find((window) => dateKeyInWindow(defaultStartDate, window) && dateKeyInWindow(defaultEndDate, window)) ??
    windows.find((window) => dateKeyInWindow(defaultStartDate, window)) ??
    windows[0] ??
    null;

  if (!matchedWindow) {
    return {
      selectedEndDate: "",
      selectedStartDate: "",
      windowIndex: "-1"
    };
  }

  const selectedStartDate = dateKeyInWindow(defaultStartDate, matchedWindow) ? defaultStartDate : matchedWindow.startDate;
  const selectedEndDate =
    dateKeyInWindow(defaultEndDate, matchedWindow) && defaultEndDate >= selectedStartDate ? defaultEndDate : selectedStartDate;

  return {
    selectedEndDate,
    selectedStartDate,
    windowIndex: String(windows.findIndex((window) => window.startDate === matchedWindow.startDate && window.endDate === matchedWindow.endDate))
  };
}

function CloseButton({ locale, onClose }: CloseIconProps) {
  return (
    <button
      aria-label={locale === "en" ? "Close room status dialog" : "Đóng cửa sổ trạng thái phòng"}
      className="room-status-dialog__close"
      onClick={onClose}
      type="button"
    >
      <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 18 18" width="18">
        <path d="M4.5 4.5L13.5 13.5M13.5 4.5L4.5 13.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
      </svg>
    </button>
  );
}

export function AdminRoomStatusDialog({
  defaultEndDate,
  defaultStartDate,
  locale,
  onClose,
  open,
  returnToHref,
  roomCode,
  roomId,
  scheduledStatuses,
  status,
  windows
}: AdminRoomStatusDialogProps) {
  const windowOptions = useMemo(
    () =>
      windows.map((window, index) => ({
        label: formatDateRange(locale, window.startDate, window.endDate),
        value: String(index),
        window
      })),
    [locale, windows]
  );
  const initialSelection = useMemo(() => pickInitialWindow(windows, defaultStartDate, defaultEndDate), [defaultEndDate, defaultStartDate, windows]);
  const [windowIndex, setWindowIndex] = useState(initialSelection.windowIndex);
  const [selectedStartDate, setSelectedStartDate] = useState(initialSelection.selectedStartDate);
  const [selectedEndDate, setSelectedEndDate] = useState(initialSelection.selectedEndDate);
  const activeWindow =
    windowIndex !== "-1" ? windowOptions.find((option) => option.value === windowIndex)?.window ?? null : null;

  useEffect(() => {
    if (!open) {
      return;
    }

    setWindowIndex(initialSelection.windowIndex);
    setSelectedStartDate(initialSelection.selectedStartDate);
    setSelectedEndDate(initialSelection.selectedEndDate);
  }, [initialSelection, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, open]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  const hasWindowOptions = Boolean(activeWindow);
  const actionCopy =
    status === "available"
      ? {
          description: localize(locale, {
            vi: "Chọn khoảng ngày cần bỏ trạng thái thủ công để phòng quay về Trống nếu không có booking hoặc hold.",
            en: "Choose the date range to clear manual status so the room returns to Available when no booking or hold exists."
          }),
          empty: localize(locale, {
            vi: "Chưa có lịch trạng thái thủ công nào để đưa phòng về Trống.",
            en: "There is no manual status schedule to clear for this room."
          }),
          submit: localize(locale, { vi: "Đưa về Trống", en: "Reset to available" })
        }
      : {
          description: localize(locale, {
            vi: "Chỉ có thể chọn trong các khoảng ngày đang trống để không đè lên booking, hold hoặc lịch trạng thái khác của phòng.",
            en: "Only free date windows can be chosen so the status never overlaps a booking, hold, or another manual room status."
          }),
          empty: localize(locale, {
            vi: "Không còn khoảng ngày trống hợp lệ trong tầm nhìn hiện tại của phòng này.",
            en: "No valid free date window remains in the current look-ahead window for this room."
          }),
          submit: localize(locale, { vi: "Lưu lịch trạng thái", en: "Save room status" })
        };

  return createPortal(
    <div className="room-status-dialog" role="presentation">
      <button
        aria-label={locale === "en" ? "Close room status dialog" : "Đóng cửa sổ trạng thái phòng"}
        className="room-status-dialog__backdrop"
        onClick={onClose}
        type="button"
      />

      <div aria-labelledby="room-status-dialog-title" aria-modal="true" className="room-status-dialog__card" role="dialog">
        <header className="room-status-dialog__head">
          <div>
            <p className="room-status-dialog__eyebrow">{locale === "en" ? "Room operational status" : "Lịch trạng thái phòng"}</p>
            <h3 className="room-status-dialog__title" id="room-status-dialog-title">
              {roomCode} • {statusLabel(locale, status)}
            </h3>
            <p className="room-status-dialog__copy">{actionCopy.description}</p>
          </div>

          <CloseButton locale={locale} onClose={onClose} />
        </header>

        <div className="room-status-dialog__body">
          {hasWindowOptions ? (
            <form action={updateRoomOperationalStatusAction} className="portal-form room-status-dialog__form">
              <input name="endDate" type="hidden" value={selectedEndDate} />
              <input name="locale" type="hidden" value={locale} />
              <input name="returnTo" type="hidden" value={returnToHref} />
              <input name="roomId" type="hidden" value={roomId} />
              <input name="startDate" type="hidden" value={selectedStartDate} />
              <input name="targetStatus" type="hidden" value={status} />

              <label className="portal-field">
                <span className="portal-field__label">{localize(locale, { vi: "Khoảng ngày hợp lệ", en: "Allowed date window" })}</span>
                <select
                  className="portal-field__control"
                  name="windowIndex"
                  onChange={(event) => {
                    const nextIndex = event.target.value;
                    const nextWindow = windowOptions.find((option) => option.value === nextIndex)?.window ?? null;

                    setWindowIndex(nextIndex);
                    setSelectedStartDate(nextWindow?.startDate ?? "");
                    setSelectedEndDate(nextWindow?.startDate ?? "");
                  }}
                  value={windowIndex}
                >
                  {windowOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="portal-grid portal-grid--two">
                <label className="portal-field">
                  <span className="portal-field__label">{localize(locale, { vi: "Từ ngày", en: "From date" })}</span>
                  <input
                    className="portal-field__control"
                    max={activeWindow?.endDate}
                    min={activeWindow?.startDate}
                    onChange={(event) => {
                      const nextStartDate = event.target.value;
                      setSelectedStartDate(nextStartDate);

                      if (!selectedEndDate || selectedEndDate < nextStartDate) {
                        setSelectedEndDate(nextStartDate);
                      }
                    }}
                    type="date"
                    value={selectedStartDate}
                  />
                </label>

                <label className="portal-field">
                  <span className="portal-field__label">{localize(locale, { vi: "Đến ngày", en: "To date" })}</span>
                  <input
                    className="portal-field__control"
                    max={activeWindow?.endDate}
                    min={selectedStartDate || activeWindow?.startDate}
                    onChange={(event) => setSelectedEndDate(event.target.value)}
                    type="date"
                    value={selectedEndDate}
                  />
                </label>
              </div>

              <div className="room-status-dialog__window-meta">
                <span>{localize(locale, { vi: "Khoảng đang chọn", en: "Selected span" })}</span>
                <strong>{selectedStartDate && selectedEndDate ? formatDateRange(locale, selectedStartDate, selectedEndDate) : "—"}</strong>
              </div>

              <PortalSubmitButton className="button button--solid" pendingLabel={localize(locale, { vi: "Đang lưu...", en: "Saving..." })}>
                {actionCopy.submit}
              </PortalSubmitButton>
            </form>
          ) : (
            <div className="room-status-dialog__empty">
              <p>{actionCopy.empty}</p>
            </div>
          )}

          {scheduledStatuses.length ? (
            <div className="room-status-dialog__schedule">
              <div className="room-status-dialog__schedule-head">
                <p className="room-status-dialog__schedule-title">{localize(locale, { vi: "Lịch trạng thái đã có", en: "Existing status schedule" })}</p>
                <span className="room-status-dialog__schedule-count">{scheduledStatuses.length}</span>
              </div>
              <ol className="room-status-dialog__schedule-list">
                {scheduledStatuses.slice(0, 4).map((item) => (
                  <li className="room-status-dialog__schedule-item" key={item.id}>
                    <div>
                      <p className="room-status-dialog__schedule-label">{statusLabel(locale, item.status)}</p>
                      <p className="room-status-dialog__schedule-range">{formatDateRange(locale, item.startDate, item.endDate)}</p>
                    </div>
                    {item.note ? <p className="room-status-dialog__schedule-note">{item.note}</p> : null}
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  );
}
