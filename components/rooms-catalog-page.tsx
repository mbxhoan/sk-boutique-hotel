"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { AvailabilityCheckBar } from "@/components/availability-check-bar";
import { RoomCanvasModal } from "@/components/room-canvas-modal";
import { RoomsImageCarousel } from "@/components/rooms-image-carousel";
import type { Locale } from "@/lib/locale";
import { buildRoomDetailHref, buildRoomsHref, type RoomsSearchState } from "@/lib/room-routes";
import { buildRoomCatalogEntry, formatRoomCurrency, type RoomCatalogEntry } from "@/lib/rooms/catalog";
import { type RoomTypeRow } from "@/lib/supabase/database.types";

type RoomsCatalogPageProps = {
  initialFilters: RoomsSearchState;
  initialRoomSlug?: string | null;
  locale: Locale;
  roomAvailabilityByTypeId: Record<string, number>;
  roomTypes: RoomTypeRow[];
};

function formatCompactPrice(locale: Locale, price: number | null) {
  if (price == null) {
    return null;
  }

  return formatRoomCurrency(locale, price);
}

function RoomCard({
  filters,
  locale,
  activeSlug,
  room
}: {
  activeSlug?: string | null;
  filters: RoomsSearchState;
  locale: Locale;
  room: RoomCatalogEntry;
}) {
  const href = buildRoomDetailHref(room.slug, {
    adults: filters.adults,
    children: filters.children,
    checkin: filters.checkin,
    checkout: filters.checkout,
    lang: locale
  });
  const currentPrice = room.priceVisible ? formatCompactPrice(locale, room.currentPrice) : null;
  const originalPrice = room.priceVisible && room.originalPrice != null ? formatCompactPrice(locale, room.originalPrice) : null;

  return (
    <Link className={`rooms-card__link${room.slug === activeSlug ? " rooms-card__link--active" : ""}`} href={href}>
      <article className="rooms-card">
        <div className="rooms-card__media">
          <Image alt={room.title[locale]} className="rooms-card__image" fill sizes="(max-width: 720px) 92vw, (max-width: 1080px) 44vw, 28vw" src={room.gallery[0]} />

          <span className="rooms-card__badge">{room.galleryBadge[locale]}</span>
        </div>

        <div className="rooms-card__body">
          <div className="rooms-card__top">
            <h2 className="rooms-card__title">{room.title[locale]}</h2>
            <p className="rooms-card__summary">{room.summary[locale]}</p>
          </div>

          <div className="rooms-card__facts">
            <div className="rooms-card__fact">
              <span className="rooms-card__fact-label">{locale === "en" ? "Bed" : "Giường"}</span>
              <strong className="rooms-card__fact-value">{room.bedLabel[locale]}</strong>
            </div>
            {room.metaFacts.map((fact) => (
              <div className="rooms-card__fact" key={fact.label.vi}>
                <span className="rooms-card__fact-label">{fact.label[locale]}</span>
                <strong className="rooms-card__fact-value">{fact.value[locale]}</strong>
              </div>
            ))}
          </div>

          {room.highlights.length ? (
            <div className="rooms-card__tags">
              {room.highlights.slice(0, 3).map((highlight) => (
                <span className="rooms-card__tag" key={highlight.vi}>
                  {highlight[locale]}
                </span>
              ))}
            </div>
          ) : null}

          <p className="rooms-card__availability">{room.availabilityLabel[locale]}</p>

          {room.priceVisible && currentPrice != null ? (
            <div className="rooms-card__price-block">
              {originalPrice ? <span className="rooms-card__original-price">{originalPrice}</span> : null}
              <div className="rooms-card__price-row">
                <strong className="rooms-card__price">{currentPrice}</strong>
                {room.discountPercent ? <span className="rooms-card__discount">-{room.discountPercent}%</span> : null}
              </div>
            </div>
          ) : (
            <div className="rooms-card__price-block">
              <strong className="rooms-card__price">{locale === "en" ? "CTA only" : "Chỉ hiện CTA"}</strong>
            </div>
          )}

          <span className="button button--solid rooms-card__cta">{room.bookingCtaLabel[locale]}</span>
        </div>
      </article>
    </Link>
  );
}

export function RoomsCatalogPage({
  initialFilters,
  initialRoomSlug,
  locale,
  roomAvailabilityByTypeId,
  roomTypes
}: RoomsCatalogPageProps) {
  const router = useRouter();
  const roomEntries = useMemo(
    () => roomTypes.map((roomType) => buildRoomCatalogEntry(roomType, roomAvailabilityByTypeId[roomType.id] ?? 0)),
    [roomAvailabilityByTypeId, roomTypes]
  );
  const activeRoom = roomEntries.find((room) => room.slug === initialRoomSlug) ?? null;
  const closeHref = buildRoomsHref({
    adults: initialFilters.adults,
    checkin: initialFilters.checkin,
    children: initialFilters.children,
    checkout: initialFilters.checkout,
    lang: locale
  });

  return (
    <div className="rooms-page">
      <section className="rooms-hero">
        <div className="rooms-hero__media">
          <Image alt="" aria-hidden="true" className="rooms-hero__image" fill priority sizes="100vw" src="/home/bed1.jpg" />
          <span className="rooms-hero__overlay" aria-hidden="true" />
        </div>

        <div className="section-shell rooms-hero__shell">
          <div className="rooms-panel">
            <div className="rooms-panel__headline">
              <div>
                <p className="rooms-panel__eyebrow">{locale === "en" ? "Room selection" : "Chọn phòng"}</p>
                <h1 className="rooms-panel__title">{locale === "en" ? "Choose your room" : "Chọn phòng của bạn"}</h1>
              </div>
            </div>

            <AvailabilityCheckBar
              initialAdults={initialFilters.adults}
              initialCheckin={initialFilters.checkin}
              initialChildren={initialFilters.children}
              initialCheckout={initialFilters.checkout}
              locale={locale}
              variant="page"
            />
          </div>
        </div>
      </section>

      <section className="rooms-section rooms-section--cards section" id="rooms">
        <div className="section-shell">
          <div className="rooms-grid">
            {roomEntries.map((room) => (
              <RoomCard activeSlug={initialRoomSlug} filters={initialFilters} key={room.slug} locale={locale} room={room} />
            ))}
          </div>
        </div>
      </section>

      <RoomsImageCarousel locale={locale} />

      <RoomCanvasModal
        locale={locale}
        onClose={() => {
          router.replace(closeHref, { scroll: false });
        }}
        open={Boolean(activeRoom)}
        room={activeRoom}
      />
    </div>
  );
}
