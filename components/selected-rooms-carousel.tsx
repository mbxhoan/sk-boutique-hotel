"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { AnalyticsLink } from "@/components/analytics-link";
import { PortalSectionHeading } from "@/components/portal-ui";
import { resolveMediaSource, type MediaLookup } from "@/lib/media/library";
import type { Locale } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";
import type { LocalizedText } from "@/lib/mock/i18n";
import type { CmsCollectionItem } from "@/lib/mock/public-cms";

type SelectedRoomsCarouselProps = {
  description: LocalizedText;
  eyebrow: LocalizedText;
  items: CmsCollectionItem[];
  locale: Locale;
  mediaLookup: MediaLookup;
  title: LocalizedText;
};

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg aria-hidden="true" fill="none" height="22" viewBox="0 0 22 22" width="22">
      <path
        d={direction === "left" ? "M13.5 6.5L8.5 11.5L13.5 16.5" : "M8.5 6.5L13.5 11.5L8.5 16.5"}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function SelectedRoomsCarousel({
  description,
  eyebrow,
  items,
  locale,
  mediaLookup,
  title
}: SelectedRoomsCarouselProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollToIndex = (index: number) => {
    const slide = slideRefs.current[index];

    if (!slide) {
      return;
    }

    slide.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center"
    });

    setActiveIndex(index);
  };

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport || items.length <= 1) {
      return;
    }

    const syncActiveIndex = () => {
      const center = viewport.scrollLeft + viewport.clientWidth / 2;
      let bestIndex = 0;
      let bestDistance = Number.POSITIVE_INFINITY;

      slideRefs.current.forEach((slide, index) => {
        if (!slide) {
          return;
        }

        const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
        const distance = Math.abs(slideCenter - center);

        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = index;
        }
      });

      setActiveIndex((current) => (current === bestIndex ? current : bestIndex));
    };

    const onScroll = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(syncActiveIndex);
    };

    syncActiveIndex();
    viewport.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      viewport.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [items.length]);

  if (!items.length) {
    return null;
  }

  return (
    <section className="section cms-section cms-section--cards cms-room-carousel" id="destinations">
      <div className="section-shell">
        <PortalSectionHeading align="center" description={description} eyebrow={eyebrow} locale={locale} title={title} />

        <div className="cms-room-carousel__shell">
          {items.length > 1 ? (
            <button
              aria-label={locale === "en" ? "Previous room" : "Phòng trước"}
              className="cms-room-carousel__nav cms-room-carousel__nav--prev"
              onClick={() => scrollToIndex((activeIndex - 1 + items.length) % items.length)}
              type="button"
            >
              <Chevron direction="left" />
            </button>
          ) : null}

          <div className="cms-room-carousel__viewport" ref={viewportRef}>
            <div className="cms-room-carousel__track">
              {items.map((item, index) => (
                <div
                  className={`cms-room-carousel__slide${index === activeIndex ? " cms-room-carousel__slide--active" : ""}`}
                  key={`${item.href}-${item.title.vi}`}
                  ref={(element) => {
                    slideRefs.current[index] = element;
                  }}
                >
                  <AnalyticsLink
                    className="cms-room-carousel__link"
                    entityId={item.href}
                    entityType="cms_collection_item"
                    eventType="cta_click"
                    href={item.href}
                    locale={locale}
                    metadata={{ title: item.title.vi, section: "selected_rooms" }}
                  >
                    <article className="cms-room-card">
                      {item.image ? (
                        <Image
                          alt={item.imageAlt ? localize(locale, item.imageAlt) : localize(locale, item.title)}
                          className="cms-room-card__image"
                          fill
                          quality={90}
                          sizes="(max-width: 720px) calc(100vw - 2rem), (max-width: 1080px) 44vw, 28vw"
                          src={resolveMediaSource(item.image, mediaLookup) ?? item.image}
                        />
                      ) : null}

                      <span className="cms-room-card__overlay" aria-hidden="true" />

                      <div className="cms-room-card__content">
                        <h3 className="cms-room-card__title">{localize(locale, item.title)}</h3>

                        {item.description ? <p className="cms-room-card__description">{localize(locale, item.description)}</p> : null}

                        {item.meta?.length ? (
                          <ul className="cms-room-card__bullets">
                            {item.meta.map((meta) => (
                              <li className="cms-room-card__bullet" key={meta.vi}>
                                {localize(locale, meta)}
                              </li>
                            ))}
                          </ul>
                        ) : null}

                        <span className="button button--solid cms-room-card__cta">
                          {locale === "en" ? "Explore now" : "Khám phá ngay"}
                        </span>
                      </div>
                    </article>
                  </AnalyticsLink>
                </div>
              ))}
            </div>
          </div>

          {items.length > 1 ? (
            <button
              aria-label={locale === "en" ? "Next room" : "Phòng tiếp theo"}
              className="cms-room-carousel__nav cms-room-carousel__nav--next"
              onClick={() => scrollToIndex((activeIndex + 1) % items.length)}
              type="button"
            >
              <Chevron direction="right" />
            </button>
          ) : null}
        </div>

        {items.length > 1 ? (
          <div className="cms-room-carousel__dots" aria-label={locale === "en" ? "Room carousel navigation" : "Điều hướng carousel phòng"} role="tablist">
            {items.map((item, index) => (
              <button
                aria-label={localize(locale, item.title)}
                aria-selected={index === activeIndex}
                className={`cms-room-carousel__dot${index === activeIndex ? " cms-room-carousel__dot--active" : ""}`}
                key={`${item.href}-dot`}
                onClick={() => scrollToIndex(index)}
                role="tab"
                type="button"
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
