"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnalyticsLink } from "@/components/analytics-link";
import type { Locale } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";
import type { CmsHeroSlide, CmsActionTone } from "@/lib/mock/public-cms";

type HeroCarouselProps = {
  autoPlayInterval?: number;
  locale: Locale;
  slides: CmsHeroSlide[];
};

const actionVariantMap: Record<CmsActionTone, "solid" | "ghost" | "text"> = {
  solid: "solid",
  ghost: "ghost",
  text: "text",
};

export function HeroCarousel({
  autoPlayInterval = 6000,
  locale,
  slides,
}: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = slides.length;

  const goTo = useCallback(
    (index: number) => {
      setCurrent(((index % total) + total) % total);
    },
    [total]
  );

  const goNext = useCallback(() => goTo(current + 1), [current, goTo]);
  const goPrev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    if (isPaused || total <= 1) return;

    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % total);
    }, autoPlayInterval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, total, autoPlayInterval]);

  if (!slides.length) return null;

  return (
    <section
      className="hero-carousel"
      aria-roledescription="carousel"
      aria-label="Hero slideshow"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="hero-carousel__viewport">
        {slides.map((slide, index) => {
          const isActive = index === current;
          return (
            <div
              key={`slide-${index}`}
              className={`hero-carousel__slide${isActive ? " hero-carousel__slide--active" : ""}`}
              aria-hidden={!isActive}
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${index + 1} of ${total}`}
            >
              <Image
                src={slide.image}
                alt={localize(locale, slide.title)}
                fill
                sizes="100vw"
                className="hero-carousel__image"
                priority={index === 0}
                quality={85}
              />

              <div className="hero-carousel__overlay" aria-hidden="true" />

              <div className="hero-carousel__content">
                <div className="hero-carousel__content-inner">
                  <p className="hero-carousel__eyebrow">
                    {localize(locale, slide.eyebrow)}
                  </p>
                  <h1 className="hero-carousel__title">
                    {localize(locale, slide.title)}
                  </h1>
                  <p className="hero-carousel__description">
                    {localize(locale, slide.description)}
                  </p>

                  <div className="hero-carousel__actions">
                    <AnalyticsLink
                      className={`button button--${actionVariantMap[slide.actions.primary.tone ?? "solid"]} hero-carousel__cta`}
                      eventType="cta_click"
                      href={slide.actions.primary.href}
                      locale={locale}
                      metadata={{ slide: index, tone: slide.actions.primary.tone ?? "solid" }}
                    >
                      {localize(locale, slide.actions.primary.label)}
                    </AnalyticsLink>
                    {slide.actions.secondary ? (
                      <AnalyticsLink
                        className={`button button--${actionVariantMap[slide.actions.secondary.tone ?? "ghost"]} hero-carousel__cta hero-carousel__cta--secondary`}
                        eventType="cta_click"
                        href={slide.actions.secondary.href}
                        locale={locale}
                        metadata={{ slide: index, tone: slide.actions.secondary.tone ?? "ghost" }}
                      >
                        {localize(locale, slide.actions.secondary.label)}
                      </AnalyticsLink>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation arrows */}
      {total > 1 ? (
        <>
          <button
            type="button"
            className="hero-carousel__nav hero-carousel__nav--prev"
            onClick={goPrev}
            aria-label="Previous slide"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            className="hero-carousel__nav hero-carousel__nav--next"
            onClick={goNext}
            aria-label="Next slide"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </button>
        </>
      ) : null}

      {/* Dot indicators */}
      {total > 1 ? (
        <div className="hero-carousel__dots" role="tablist" aria-label="Slide navigation">
          {slides.map((_, index) => (
            <button
              key={`dot-${index}`}
              type="button"
              className={`hero-carousel__dot${index === current ? " hero-carousel__dot--active" : ""}`}
              role="tab"
              aria-selected={index === current}
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => goTo(index)}
            />
          ))}
        </div>
      ) : null}

      {/* Progress bar */}
      {total > 1 ? (
        <div className="hero-carousel__progress" aria-hidden="true">
          <div
            className="hero-carousel__progress-bar"
            style={{
              animationDuration: `${autoPlayInterval}ms`,
              animationPlayState: isPaused ? "paused" : "running",
            }}
            key={current}
          />
        </div>
      ) : null}
    </section>
  );
}
