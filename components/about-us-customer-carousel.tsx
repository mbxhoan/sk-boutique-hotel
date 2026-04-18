"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import type { Locale } from "@/lib/locale";

type AboutCustomerCarouselProps = {
  images: string[];
  locale: Locale;
};

function slideLabel(locale: Locale, index: number, total: number) {
  return locale === "en" ? `Slide ${index + 1} of ${total}` : `Ảnh ${index + 1} trên ${total}`;
}

export function AboutCustomerCarousel({ images, locale }: AboutCustomerCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = images.length;

  useEffect(() => {
    if (paused || total <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setCurrent((previous) => (previous + 1) % total);
    }, 3000);

    return () => {
      window.clearInterval(timer);
    };
  }, [paused, total]);

  if (!total) {
    return null;
  }

  return (
    <div
      aria-label={locale === "en" ? "Customer moments carousel" : "Carousel ảnh khách hàng"}
      aria-roledescription="carousel"
      className="about-us-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="about-us-carousel__viewport">
        <div className="about-us-carousel__track" style={{ transform: `translate3d(-${current * 100}%, 0, 0)` }}>
          {images.map((src, index) => {
            const alt = locale === "en" ? `Customer photo ${index + 1}` : `Ảnh khách hàng ${index + 1}`;

            return (
              <figure
                aria-hidden={index !== current}
                aria-label={slideLabel(locale, index, total)}
                className="about-us-carousel__slide"
                key={src}
                role="group"
                aria-roledescription="slide"
              >
                <Image
                  alt={alt}
                  className="about-us-carousel__image"
                  fill
                  priority={index === 0}
                  sizes="(min-width: 1200px) 1180px, (min-width: 780px) calc(100vw - 3rem), calc(100vw - 2rem)"
                  src={src}
                />
              </figure>
            );
          })}
        </div>
      </div>

      {total > 1 ? (
        <div aria-label={locale === "en" ? "Select customer slide" : "Chọn ảnh khách hàng"} className="about-us-carousel__dots" role="tablist">
          {images.map((_, index) => (
            <button
              aria-label={locale === "en" ? `Go to slide ${index + 1}` : `Đi tới ảnh ${index + 1}`}
              aria-selected={index === current}
              className={`about-us-carousel__dot${index === current ? " about-us-carousel__dot--active" : ""}`}
              key={`about-us-carousel-dot-${index}`}
              onClick={() => setCurrent(index)}
              role="tab"
              type="button"
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
