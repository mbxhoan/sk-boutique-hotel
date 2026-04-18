"use client";

import Link from "next/link";

import type { Locale } from "@/lib/locale";
import { appendLocaleQuery, translate } from "@/lib/locale";
import { siteInfo } from "@/lib/site-content";

type LocationSectionProps = {
  className?: string;
  id?: string;
  locale: Locale;
};

function mapEmbedUrl(locale: Locale) {
  return `https://www.google.com/maps?q=${encodeURIComponent(translate(locale, siteInfo.address))}&output=embed`;
}

export function LocationSection({ className, id = "vi-tri", locale }: LocationSectionProps) {
  const title = locale === "en" ? "Location" : "Vị trí";
  const description =
    locale === "en"
      ? "Guests can find the hotel quickly, staff can hand over directions cleanly, and the map stays visible wherever the page scrolls."
      : "Khách có thể nhận diện điểm đến nhanh hơn, team vận hành bàn giao hướng đi gọn hơn, và bản đồ luôn nằm trong mạch cuộn của trang.";

  return (
    <section className={`section location-band${className ? ` ${className}` : ""}`} id={id}>
      <div className="section-shell location-band__shell">
        <div className="location-band__copy">
          <p className="location-band__eyebrow">{title}</p>
          <h2 className="location-band__title">{title}</h2>
          <p className="location-band__description">{description}</p>

          <div className="location-band__address">
            <p className="location-band__address-label">{locale === "en" ? "Address" : "Địa chỉ"}</p>
          <p className="location-band__address-value">{translate(locale, siteInfo.address)}</p>
          </div>

          <Link className="button button--solid location-band__cta" href={appendLocaleQuery("/rooms#rooms", locale)}>
            {locale === "en" ? "Choose room" : "Chọn phòng"}
          </Link>
        </div>

        <div className="location-band__map">
          <iframe
            className="location-band__frame"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={mapEmbedUrl(locale)}
            title={locale === "en" ? "Hotel location map" : "Bản đồ vị trí khách sạn"}
          />
        </div>
      </div>
    </section>
  );
}
