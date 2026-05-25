import Image from "next/image";
import Link from "next/link";

import type { Locale } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";
import type { EventRow } from "@/lib/supabase/database.types";
import { appendLocaleQuery } from "@/lib/locale";

function formatEventDate(dateStr: string | null, locale: Locale) {
  if (!dateStr) return null;
  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date(dateStr));
}

export function EventsPage({ events, locale }: { events: EventRow[]; locale: Locale }) {
  return (
    <div className="events-page">
      <section className="hero hero--simple events-hero">
        <div className="section-shell hero__inner">
          <div className="hero__copy">
            <p className="hero__eyebrow">
              {localize(locale, { vi: "SỰ KIỆN", en: "EVENTS" })}
            </p>
            <h1 className="hero__title">
              {localize(locale, { vi: "Những khoảnh khắc đáng nhớ", en: "Memorable Moments" })}
            </h1>
            <p className="hero__description">
              {localize(locale, {
                vi: "Khám phá các sự kiện và hoạt động đặc biệt tại SK Boutique Hotel.",
                en: "Discover special events and activities at SK Boutique Hotel."
              })}
            </p>
          </div>
        </div>
      </section>

      <section className="section events-list-section">
        <div className="section-shell">
          {events.length === 0 ? (
            <p className="events-list__empty">
              {localize(locale, { vi: "Chưa có sự kiện nào.", en: "No events yet." })}
            </p>
          ) : (
            <div className="events-grid">
              {events.map((event) => {
                const title = locale === "vi" ? event.title_vi : event.title_en;
                const description = locale === "vi" ? event.description_vi : event.description_en;
                const dateLabel = formatEventDate(event.event_date, locale);
                const href = appendLocaleQuery(`/su-kien/${event.slug}`, locale);

                return (
                  <article className="event-card" key={event.id}>
                    {event.cover_image_path ? (
                      <Link className="event-card__media-link" href={href}>
                        <div className="event-card__media">
                          <Image
                            alt={title}
                            className="event-card__image"
                            fill
                            loading="lazy"
                            sizes="(min-width: 1080px) 33vw, (min-width: 720px) 50vw, 100vw"
                            src={event.cover_image_path}
                          />
                        </div>
                      </Link>
                    ) : null}

                    <div className="event-card__body">
                      {dateLabel ? (
                        <p className="event-card__date">{dateLabel}</p>
                      ) : null}
                      <h2 className="event-card__title">
                        <Link href={href}>{title}</Link>
                      </h2>
                      {description ? (
                        <p className="event-card__description">{description}</p>
                      ) : null}
                      <Link className="event-card__cta" href={href}>
                        {localize(locale, { vi: "Xem chi tiết →", en: "View details →" })}
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
