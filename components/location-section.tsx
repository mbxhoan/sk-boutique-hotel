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
  return `https://www.google.com/maps?q=${encodeURIComponent(translate(locale, siteInfo.gg_map_address))}&output=embed`;
}

function PinIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="14" viewBox="0 0 14 14" width="14">
      <path
        d="M7 12.5C7 12.5 11.5 8.55 11.5 5.5C11.5 3.01 9.49 1 7 1C4.51 1 2.5 3.01 2.5 5.5C2.5 8.55 7 12.5 7 12.5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.2"
      />
      <circle cx="7" cy="5.5" r="1.4" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function LocationSection({ className, id = "vi-tri", locale }: LocationSectionProps) {
  const eyebrow = locale === "en" ? "20-minute drive from the city center." : "Cách trung tâm 20 phút chạy xe";
  const title = locale === "en" ? "Location" : "Vị trí";
  const locationName = locale === "en" ? "Phu Quoc" : "Phú Quốc";
  const fullAddress = translate(locale, siteInfo.address);

  return (
    <section className={`section location-band${className ? ` ${className}` : ""}`} id={id}>
      <div className="location-band__layout">
        <div className="location-band__map">
          <iframe
            className="location-band__frame"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={mapEmbedUrl(locale)}
            title={locale === "en" ? "Hotel location map" : "Bản đồ vị trí khách sạn"}
          />
        </div>

        <div className="location-band__shell">
          <div className="location-band__card">
            <div className="location-band__heading">
              <h2 className="location-band__title">{title}</h2>
              <p className="location-band__eyebrow">{eyebrow}</p>
            </div>

            <ul className="location-band__list">
              <li className="location-band__list-item">
                <span className="location-band__list-name">{locationName}</span>
                <span className="location-band__list-pin" aria-hidden="true">
                  <PinIcon />
                </span>
              </li>
            </ul>

            <p className="location-band__address">{fullAddress}</p>

            <Link className="button button--solid location-band__cta" href={appendLocaleQuery("/rooms#rooms", locale)}>
              {locale === "en" ? "Choose room" : "Chọn phòng"}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
