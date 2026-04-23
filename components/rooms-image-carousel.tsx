"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import type { Locale } from "@/lib/locale";

type RoomsImageCarouselProps = {
  images?: string[];
  autoPlayInterval?: number;
  locale?: Locale;
};

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
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

export function RoomsImageCarousel({ autoPlayInterval = 3000, images = [], locale = "vi" }: RoomsImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const total = images.length;

  useEffect(() => {
    if (total <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % total);
    }, autoPlayInterval);

    return () => {
      window.clearInterval(timer);
    };
  }, [autoPlayInterval, total]);

  if (!total) {
    return null;
  }

  return (
    <section className="section rooms-image-carousel" aria-label={locale === "en" ? "Room image slider" : "Carousel ảnh phòng"}>
      <div className="section-shell">
        <div className="rooms-image-carousel__frame">
          {total > 1 ? (
            <button
              aria-label={locale === "en" ? "Previous image" : "Ảnh trước"}
              className="rooms-image-carousel__nav rooms-image-carousel__nav--prev"
              onClick={() => setActiveIndex((current) => (current - 1 + total) % total)}
              type="button"
            >
              <ArrowIcon direction="left" />
            </button>
          ) : null}

          <div className="rooms-image-carousel__viewport">
            {images.map((image, index) => {
              const isActive = index === activeIndex;

              return (
                <div
                  aria-hidden={!isActive}
                  className={`rooms-image-carousel__slide${isActive ? " rooms-image-carousel__slide--active" : ""}`}
                  key={`${image}-${index}`}
                >
                  <Image
                    alt=""
                    aria-hidden="true"
                    className="rooms-image-carousel__image"
                    fill
                    quality={90}
                    priority={index === 0}
                    sizes="(max-width: 720px) calc(100vw - 2rem), (max-width: 1280px) calc(100vw - 3rem), 1280px"
                    src={image}
                  />
                </div>
              );
            })}
          </div>

          {total > 1 ? (
            <button
              aria-label={locale === "en" ? "Next image" : "Ảnh tiếp theo"}
              className="rooms-image-carousel__nav rooms-image-carousel__nav--next"
              onClick={() => setActiveIndex((current) => (current + 1) % total)}
              type="button"
            >
              <ArrowIcon direction="right" />
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
