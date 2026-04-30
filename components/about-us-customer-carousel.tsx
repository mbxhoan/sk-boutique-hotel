"use client";

import Image from "next/image";
import { useMemo } from "react";

import type { Locale } from "@/lib/locale";

type AboutCustomerCarouselProps = {
  images: string[];
  locale: Locale;
};

function pickRandomImages(images: string[], limit: number) {
  if (images.length <= limit) {
    return images;
  }

  const result = [...images];

  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result.slice(0, limit);
}

export function AboutCustomerCarousel({ images, locale }: AboutCustomerCarouselProps) {
  const galleryImages = useMemo(() => pickRandomImages(images, 3), [images]);

  if (!galleryImages.length) {
    return null;
  }

  return (
    <div
      aria-label={locale === "en" ? "Customer moments gallery" : "Bộ sưu tập ảnh khách hàng"}
      className="about-us-carousel"
    >
      <div className="about-us-carousel__gallery">
        {galleryImages.map((src, index) => {
          const alt = locale === "en" ? `Customer photo ${index + 1}` : `Ảnh khách hàng ${index + 1}`;

          return (
            <figure className="about-us-carousel__item" key={src}>
              <Image
                alt={alt}
                className="about-us-carousel__image"
                fill
                priority={index === 0}
                sizes="(min-width: 1200px) 360px, (min-width: 780px) 30vw, 100vw"
                src={src}
              />
            </figure>
          );
        })}
      </div>
    </div>
  );
}
