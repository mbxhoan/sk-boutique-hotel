import Image from "next/image";
import Link from "next/link";

import type { Locale } from "@/lib/locale";
import { appendLocaleQuery } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";
import type { EventImageRow, EventRow } from "@/lib/supabase/database.types";

function formatEventDate(dateStr: string | null, locale: Locale) {
  if (!dateStr) return null;
  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date(dateStr));
}

export function EventDetailPage({
  event,
  images,
  locale
}: {
  event: EventRow;
  images: EventImageRow[];
  locale: Locale;
}) {
  const title = locale === "vi" ? event.title_vi : event.title_en;
  const description = locale === "vi" ? event.description_vi : event.description_en;
  const dateLabel = formatEventDate(event.event_date, locale);

  return (
    <div className="event-detail-page">
      <section className="hero hero--simple event-detail-hero">
        <div className="section-shell hero__inner">
          <div className="hero__copy">
            <p className="hero__eyebrow">
              <Link href={appendLocaleQuery("/su-kien", locale)}>
                {localize(locale, { vi: "← Sự kiện", en: "← Events" })}
              </Link>
            </p>
            {dateLabel ? <p className="event-detail-hero__date">{dateLabel}</p> : null}
            <h1 className="hero__title">{title}</h1>
            {description ? <p className="hero__description">{description}</p> : null}
          </div>
        </div>
      </section>

      {images.length > 0 ? (
        <section className="section event-gallery-section">
          <div className="section-shell">
            <div className="event-gallery">
              {images.map((img, idx) => {
                const caption = locale === "vi" ? img.caption_vi : img.caption_en;

                return (
                  <figure className="event-gallery__item" key={img.id}>
                    <div className="event-gallery__media">
                      <Image
                        alt={caption || title}
                        className="event-gallery__image"
                        fill
                        loading={idx === 0 ? "eager" : "lazy"}
                        priority={idx === 0}
                        sizes="(min-width: 1080px) 50vw, 100vw"
                        src={img.image_path}
                      />
                    </div>
                    {caption ? <figcaption className="event-gallery__caption">{caption}</figcaption> : null}
                  </figure>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      <section className="section event-detail-cta-section">
        <div className="section-shell">
          <Link className="btn btn--primary" href={appendLocaleQuery("/rooms", locale)}>
            {localize(locale, { vi: "Đặt phòng ngay", en: "Book now" })}
          </Link>
        </div>
      </section>
    </div>
  );
}
