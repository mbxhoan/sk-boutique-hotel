"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import type { Locale } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";
import type { EventRow } from "@/lib/supabase/database.types";
import { appendLocaleQuery } from "@/lib/locale";

function getYear(dateStr: string | null): number | null {
  if (!dateStr) return null;
  return new Date(dateStr).getFullYear();
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 18 18" width="18">
      <path d="M4.5 4.5L13.5 13.5M13.5 4.5L4.5 13.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
    </svg>
  );
}

function EventImageLightbox({
  alt,
  onClose,
  src
}: {
  alt: string;
  onClose: () => void;
  src: string;
}) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="events-lightbox" role="presentation">
      <button
        aria-label="Đóng ảnh"
        className="events-lightbox__backdrop"
        onClick={onClose}
        type="button"
      />
      <section
        aria-label="Xem ảnh sự kiện"
        aria-modal="true"
        className="events-lightbox__dialog"
        role="dialog"
      >
        <div className="events-lightbox__head">
          <span className="events-lightbox__title">{alt}</span>
          <button
            aria-label="Đóng"
            className="events-lightbox__close"
            onClick={onClose}
            type="button"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="events-lightbox__media">
          <Image
            alt={alt}
            className="events-lightbox__image"
            fill
            priority
            quality={90}
            sizes="(max-width: 960px) 100vw, 92vw"
            src={src}
          />
        </div>
      </section>
    </div>
  );
}

export function EventsPage({ events, locale }: { events: EventRow[]; locale: Locale }) {
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

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

      <section className="section events-timeline-section">
        <div className="section-shell">
          {events.length === 0 ? (
            <p className="events-timeline__empty">
              {localize(locale, { vi: "Chưa có sự kiện nào.", en: "No events yet." })}
            </p>
          ) : (
            <div className="events-timeline">
              {events.map((event, index) => {
                const title = locale === "vi" ? event.title_vi : event.title_en;
                const description = locale === "vi" ? event.description_vi : event.description_en;
                const year = getYear(event.event_date);
                const href = appendLocaleQuery(`/su-kien/${event.slug}`, locale);
                const isFlip = index % 2 !== 0;
                const showDetail = event.show_detail_link;

                const thumbImg = event.cover_image_path ? (
                  <div className="events-timeline__thumb">
                    <Image
                      alt={title}
                      className="events-timeline__thumb-img"
                      fill
                      loading="lazy"
                      sizes="(max-width: 640px) 40vw, 340px"
                      src={event.cover_image_path}
                    />
                  </div>
                ) : (
                  <div className="events-timeline__thumb events-timeline__thumb--empty" />
                );

                const thumbNode = event.cover_image_path ? (
                  <button
                    aria-label={localize(locale, { vi: "Xem ảnh lớn", en: "View enlarged photo" })}
                    className="events-timeline__thumb-btn"
                    onClick={() => setLightbox({ src: event.cover_image_path!, alt: title })}
                    type="button"
                  >
                    {thumbImg}
                  </button>
                ) : thumbImg;

                const mediaCol = (
                  <div className="events-timeline__media">
                    {year && <span className="events-timeline__year">{year}</span>}
                    {thumbNode}
                  </div>
                );

                const textCol = (
                  <div className="events-timeline__text">
                    <h2 className="events-timeline__title">
                      {showDetail ? <Link href={href}>{title}</Link> : title}
                    </h2>
                    {description ? (
                      <p className="events-timeline__description">{description}</p>
                    ) : null}
                    {showDetail ? (
                      <Link className="events-timeline__cta" href={href}>
                        {localize(locale, { vi: "Xem chi tiết →", en: "View details →" })}
                      </Link>
                    ) : null}
                  </div>
                );

                return (
                  <article
                    className={`events-timeline__item${isFlip ? " events-timeline__item--flip" : ""}`}
                    key={event.id}
                  >
                    {mediaCol}
                    <div className="events-timeline__spine">
                      <div className="events-timeline__dot" />
                    </div>
                    {textCol}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {lightbox ? (
        <EventImageLightbox
          alt={lightbox.alt}
          onClose={() => setLightbox(null)}
          src={lightbox.src}
        />
      ) : null}
    </div>
  );
}
