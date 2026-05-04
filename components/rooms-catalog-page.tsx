"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { AvailabilityCheckBar } from "@/components/availability-check-bar";
import { RoomCanvasModal } from "@/components/room-canvas-modal";
import { RoomsImageCarousel } from "@/components/rooms-image-carousel";
import type { Locale } from "@/lib/locale";
import { buildRoomDetailHref, buildRoomsHref, type RoomsSearchState } from "@/lib/room-routes";
import { buildRoomCatalogEntry, formatRoomCurrency, type RoomCatalogEntry } from "@/lib/rooms/catalog";
import { type RoomTypeRow } from "@/lib/supabase/database.types";
import { formatTeaserCurrencyText } from "@/lib/supabase/content";
import type { PageContent } from "@/lib/site-content";
import { translate } from "@/lib/locale";

type RoomsCatalogPageProps = {
  defaultBranchId: string | null;
  initialFilters: RoomsSearchState;
  initialRoomSlug?: string | null;
  locale: Locale;
  pageContent: PageContent;
  roomCarouselImages: string[];
  roomGalleriesBySlug: Record<string, string[]>;
  roomAvailabilityByTypeId: Record<string, number>;
  roomTypes: RoomTypeRow[];
  roomsHeroImage: string;
};

function formatCompactPrice(locale: Locale, price: number | null) {
  if (price == null) {
    return null;
  }

  return formatRoomCurrency(locale, price);
}

function RoomCard({
  filters,
  guestCount,
  locale,
  activeSlug,
  room
}: {
  activeSlug?: string | null;
  filters: RoomsSearchState;
  guestCount: number;
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
  const isCapacityMatch = room.guestCapacity >= guestCount;
  const isAvailable = room.availableRooms > 0;
  const fitState = isAvailable && isCapacityMatch ? "recommended" : isAvailable ? "soft" : "sold-out";
  const currentPrice = room.priceVisible ? formatCompactPrice(locale, room.currentPrice) : null;
  const teaserPrice = room.priceVisible ? null : formatTeaserCurrencyText(room.currentPrice);
  const originalPrice = room.priceVisible && room.originalPrice != null ? formatCompactPrice(locale, room.originalPrice) : null;
  const adultsLabel =
    locale === "en"
      ? `${room.occupancyAdults} ${room.occupancyAdults === 1 ? "adult" : "adults"}`
      : `${room.occupancyAdults} người lớn`;
  const childrenLabel =
    locale === "en"
      ? `${room.occupancyChildren} ${room.occupancyChildren === 1 ? "child" : "children"}`
      : `${room.occupancyChildren} trẻ em`;
  const capacityLabel =
    locale === "en"
      ? `Up to ${adultsLabel} + ${childrenLabel}`
      : `Tối đa ${adultsLabel} + ${childrenLabel}`;
  const matchLabel =
    fitState === "recommended"
      ? locale === "en"
        ? `Fits your ${guestCount}-guest search`
        : `Phù hợp với nhóm ${guestCount} khách`
      : fitState === "sold-out"
        ? locale === "en"
          ? `Sold out for now`
          : `Tạm hết phòng`
        : locale === "en"
          ? `Works for smaller groups`
          : `Hợp với nhóm nhỏ hơn`;

  return (
    <Link
      className={[
        "rooms-card__link",
        room.slug === activeSlug ? "rooms-card__link--active" : "",
        fitState === "recommended" ? "rooms-card__link--recommended" : "",
        fitState === "soft" ? "rooms-card__link--soft" : "",
        fitState === "sold-out" ? "rooms-card__link--sold-out" : ""
      ]
        .filter(Boolean)
        .join(" ")}
      href={href}
    >
      <article className="rooms-card">
        <div className="rooms-card__media">
          <Image
            alt={room.title[locale]}
            className="rooms-card__image"
            fill
            quality={90}
            sizes="(max-width: 720px) calc(100vw - 2rem), (max-width: 1080px) 44vw, 28vw"
            src={room.gallery[0]}
          />

          <span className="rooms-card__badge">{room.galleryBadge[locale]}</span>
        </div>

        <div className="rooms-card__body">
          <div className="rooms-card__top">
            <h2 className="rooms-card__title">{room.title[locale]}</h2>
            <p className="rooms-card__summary">{room.summary[locale]}</p>
            <p className={`rooms-card__fit rooms-card__fit--${fitState}`}>
              <span>{matchLabel}</span>
              <span aria-hidden="true">•</span>
              <span>{capacityLabel}</span>
            </p>
          </div>

          <div className="rooms-card__facts">
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

          <p className={`rooms-card__availability rooms-card__availability--${fitState}`}>{room.availabilityLabel[locale]}</p>

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
              <strong className="rooms-card__price">{teaserPrice ? teaserPrice[locale] : room.bookingCtaLabel[locale]}</strong>
            </div>
          )}

          <span className={`button button--solid rooms-card__cta${isAvailable ? "" : " rooms-card__cta--sold-out"}`}>
            {isAvailable ? room.bookingCtaLabel[locale] : locale === "en" ? "Sold out" : "Hết phòng"}
          </span>
        </div>
      </article>
    </Link>
  );
}

export function RoomsCatalogPage({
  defaultBranchId,
  initialFilters,
  initialRoomSlug,
  locale,
  pageContent,
  roomCarouselImages,
  roomGalleriesBySlug,
  roomAvailabilityByTypeId,
  roomTypes,
  roomsHeroImage
}: RoomsCatalogPageProps) {
  const router = useRouter();
  const roomEntries = useMemo(
    () =>
      roomTypes.map((roomType) =>
        buildRoomCatalogEntry(roomType, roomAvailabilityByTypeId[roomType.id] ?? 0, roomGalleriesBySlug[roomType.slug])
      ),
    [roomAvailabilityByTypeId, roomGalleriesBySlug, roomTypes]
  );
  const [visibleRoomSlug, setVisibleRoomSlug] = useState<string | null>(initialRoomSlug ?? null);
  const activeRoom = roomEntries.find((room) => room.slug === visibleRoomSlug) ?? null;
  const guestCount = Math.max(1, (initialFilters.adults ?? 2) + (initialFilters.children ?? 0));
  const closeHref = buildRoomsHref({
    adults: initialFilters.adults,
    checkin: initialFilters.checkin,
    children: initialFilters.children,
    checkout: initialFilters.checkout,
    lang: locale
  });

  useEffect(() => {
    setVisibleRoomSlug(initialRoomSlug ?? null);
  }, [initialRoomSlug]);

  return (
    <div className="rooms-page">
      <section className="rooms-hero">
        <div className="rooms-hero__media">
          <Image alt="" aria-hidden="true" className="rooms-hero__image" fill priority sizes="100vw" src={roomsHeroImage} />
          <span className="rooms-hero__overlay" aria-hidden="true" />
        </div>

        <div className="section-shell rooms-hero__shell">
          <div className="rooms-panel">
            <div className="rooms-panel__headline">
              <div>
                <p className="rooms-panel__eyebrow">{translate(locale, pageContent.hero.eyebrow)}</p>
                <h1 className="rooms-panel__title">{translate(locale, pageContent.hero.title)}</h1>
                <p className="rooms-panel__description">{translate(locale, pageContent.hero.description)}</p>
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
              <RoomCard
                activeSlug={initialRoomSlug}
                filters={initialFilters}
                guestCount={guestCount}
                key={room.slug}
                locale={locale}
                room={room}
              />
            ))}
          </div>
        </div>
      </section>

      <RoomsImageCarousel images={roomCarouselImages} locale={locale} />

      <RoomCanvasModal
        bookingContext={{
          branchId: defaultBranchId ?? "",
          guestCount,
          stayEndAt: initialFilters.checkout ?? "",
          stayStartAt: initialFilters.checkin ?? ""
        }}
        locale={locale}
        onClose={() => {
          setVisibleRoomSlug(null);
          router.replace(closeHref, { scroll: false });
        }}
        open={Boolean(activeRoom)}
        room={activeRoom}
      />
    </div>
  );
}
