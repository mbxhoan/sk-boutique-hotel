"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

import { AvailabilityCheckBar } from "@/components/availability-check-bar";
import type { Locale } from "@/lib/locale";

type BookingSearchModalProps = {
  locale: Locale;
  onClose: () => void;
  open: boolean;
};

function CloseIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 18 18" width="18">
      <path d="M4.5 4.5L13.5 13.5M13.5 4.5L4.5 13.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
    </svg>
  );
}

export function BookingSearchModal({ locale, onClose, open }: BookingSearchModalProps) {
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
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose, open]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="booking-search-modal" role="presentation">
      <button aria-label={locale === "en" ? "Close booking dialog" : "Đóng cửa sổ đặt phòng"} className="booking-search-modal__backdrop" onClick={onClose} type="button" />

      <div
        aria-labelledby="booking-search-modal-title"
        aria-modal="true"
        className="booking-search-modal__dialog"
        role="dialog"
      >
        <div className="booking-search-modal__head">
          <h2 className="booking-search-modal__title" id="booking-search-modal-title">
            {locale === "en" ? "Choose dates to see rates" : "Chọn ngày để xem giá"}
          </h2>
          <button
            aria-label={locale === "en" ? "Close booking dialog" : "Đóng cửa sổ đặt phòng"}
            className="booking-search-modal__close"
            onClick={onClose}
            type="button"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="booking-search-modal__body">
          <AvailabilityCheckBar className="booking-search-modal__check" layout="stacked" locale={locale} variant="page" />
        </div>
      </div>
    </div>,
    document.body
  );
}
