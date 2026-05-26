"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import type { Locale } from "@/lib/locale";
import { appendLocaleQuery } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";
import { formatRoomCurrency, type RoomCatalogEntry } from "@/lib/rooms/catalog";
import { formatTeaserCurrencyText } from "@/lib/supabase/content";
import { siteInfo } from "@/lib/site-content";

type RoomPreviewPageProps = {
  facebookUrl: string;
  locale: Locale;
  room: RoomCatalogEntry;
};

function CheckIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="16" viewBox="0 0 16 16" width="16">
      <path d="M12.5 4.75L6.75 11.25L3.5 8.25" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg aria-hidden="true" fill="none" height="20" viewBox="0 0 20 20" width="20">
      <path
        d={direction === "left" ? "M12.5 4.75L7.25 10L12.5 15.25" : "M7.5 4.75L12.75 10L7.5 15.25"}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function roomAmenities(locale: Locale) {
  return locale === "en"
    ? ["Alarm clock", "Safe", "Hair dryer", "Minibar", "Flat-screen TV", "Fridge", "Wi-Fi"]
    : ["Đồng hồ báo thức", "Két an toàn", "Máy sấy tóc", "Minibar", "TV màn hình phẳng", "Tủ lạnh", "Wi-Fi"];
}

export function RoomPreviewPage({ facebookUrl, locale, room }: RoomPreviewPageProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const currentImage = room.gallery[activeImageIndex] ?? room.gallery[0];
  const priceLabel = room.priceVisible
    ? formatRoomCurrency(locale, room.currentPrice)
    : formatTeaserCurrencyText(room.currentPrice)?.[locale];

  return (
    <div className="room-preview-page">
      {/* Back nav */}
      <div className="room-preview-page__nav">
        <div className="section-shell">
          <Link className="room-preview-page__back" href={appendLocaleQuery("/rooms", locale)}>
            ← {localize(locale, { vi: "Tất cả phòng", en: "All rooms" })}
          </Link>
        </div>
      </div>

      {/* Gallery */}
      <div className="room-preview-page__gallery">
        <div className="room-preview-page__gallery-main">
          {currentImage ? (
            <Image
              alt={room.title[locale]}
              className="room-preview-page__gallery-image"
              fill
              priority
              quality={90}
              sizes="(max-width: 960px) 100vw, 900px"
              src={currentImage}
            />
          ) : null}

          {room.gallery.length > 1 ? (
            <>
              <button
                aria-label={localize(locale, { vi: "Ảnh trước", en: "Previous photo" })}
                className="room-preview-page__gallery-nav room-preview-page__gallery-nav--prev"
                onClick={() => setActiveImageIndex((i) => (i - 1 + room.gallery.length) % room.gallery.length)}
                type="button"
              >
                <ArrowIcon direction="left" />
              </button>
              <button
                aria-label={localize(locale, { vi: "Ảnh tiếp theo", en: "Next photo" })}
                className="room-preview-page__gallery-nav room-preview-page__gallery-nav--next"
                onClick={() => setActiveImageIndex((i) => (i + 1) % room.gallery.length)}
                type="button"
              >
                <ArrowIcon direction="right" />
              </button>
              <span className="room-preview-page__gallery-badge">
                {activeImageIndex + 1}/{room.gallery.length}
              </span>
            </>
          ) : null}
        </div>

        {room.gallery.length > 1 ? (
          <div className="room-preview-page__thumbs">
            {room.gallery.map((image, index) => (
              <button
                aria-label={localize(locale, { vi: `Chọn ảnh ${index + 1}`, en: `Select photo ${index + 1}` })}
                className={`room-preview-page__thumb${index === activeImageIndex ? " room-preview-page__thumb--active" : ""}`}
                key={`${room.slug}-${image}-${index}`}
                onClick={() => setActiveImageIndex(index)}
                type="button"
              >
                <Image alt="" aria-hidden="true" className="room-preview-page__thumb-image" fill sizes="96px" src={image} />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {/* Content */}
      <div className="section-shell">
        <div className="room-preview-page__body">
          {/* Left: info */}
          <div className="room-preview-page__info">
            <h1 className="room-preview-page__title">{room.title[locale]}</h1>
            <p className="room-preview-page__summary">{room.summary[locale]}</p>

            {room.highlights.length > 0 ? (
              <div className="room-preview-page__chips">
                {room.highlights.map((h) => (
                  <span className="room-preview-page__chip" key={h.vi}>{h[locale]}</span>
                ))}
              </div>
            ) : null}

            <div className="room-preview-page__facts">
              {room.metaFacts.map((fact) => (
                <div className="room-preview-page__fact" key={fact.label.vi}>
                  <span className="room-preview-page__fact-label">{fact.label[locale]}</span>
                  <strong className="room-preview-page__fact-value">{fact.value[locale]}</strong>
                </div>
              ))}
            </div>

            <div className="room-preview-page__amenities">
              <h3 className="room-preview-page__section-title">
                {localize(locale, { vi: "Tiện nghi phòng", en: "Room amenities" })}
              </h3>
              <div className="room-preview-page__amenity-grid">
                {roomAmenities(locale).map((amenity) => (
                  <div className="room-preview-page__amenity" key={amenity}>
                    <span className="room-preview-page__amenity-icon"><CheckIcon /></span>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: price + CTA */}
          <aside className="room-preview-page__sidebar">
            <div className="room-preview-page__price-card">
              {priceLabel ? (
                <div className="room-preview-page__price">
                  <span className="room-preview-page__price-from">
                    {localize(locale, { vi: "Từ", en: "From" })}
                  </span>
                  <strong className="room-preview-page__price-amount">{priceLabel}</strong>
                  <span className="room-preview-page__price-unit">
                    /{localize(locale, { vi: "đêm", en: "night" })}
                  </span>
                </div>
              ) : null}

              <p className="room-preview-page__cta-note">
                {localize(locale, {
                  vi: "Để đặt phòng, vui lòng liên hệ qua Facebook.",
                  en: "To book, please contact us via Facebook."
                })}
              </p>

              <a
                className="btn btn--primary room-preview-page__cta-btn"
                href={facebookUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                {localize(locale, { vi: "Liên hệ Facebook", en: "Contact on Facebook" })}
              </a>

              <Link
                className="btn btn--ghost room-preview-page__all-rooms-btn"
                href={appendLocaleQuery("/rooms", locale)}
              >
                {localize(locale, { vi: "Xem tất cả phòng", en: "View all rooms" })}
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
