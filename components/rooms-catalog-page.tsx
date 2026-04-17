"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { AvailabilityCheckBar } from "@/components/availability-check-bar";
import { RoomCanvasModal } from "@/components/room-canvas-modal";
import type { Locale } from "@/lib/locale";
import { appendLocaleQuery } from "@/lib/locale";
import { buildRoomDetailHref, buildRoomsHref, type RoomsSearchState } from "@/lib/room-routes";
import {
  buildRoomCatalogEntry,
  formatRoomCurrency,
  formatRoomPricePrefix,
  type RoomCatalogEntry
} from "@/lib/rooms/catalog";
import { type RoomTypeRow } from "@/lib/supabase/database.types";

type RoomsCatalogPageProps = {
  initialFilters: RoomsSearchState;
  initialRoomSlug?: string | null;
  locale: Locale;
  roomAvailabilityByTypeId: Record<string, number>;
  roomTypes: RoomTypeRow[];
};

type TabItem = {
  href: string;
  label: string;
};

function ShareIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 18 18" width="18">
      <path
        d="M6.25 9.75L11.75 6.75M6.25 8.25L11.75 5.25M6.25 9.75L11.75 12.75M5.5 8.75C6.4665 8.75 7.25 7.9665 7.25 7C7.25 6.0335 6.4665 5.25 5.5 5.25C4.5335 5.25 3.75 6.0335 3.75 7C3.75 7.9665 4.5335 8.75 5.5 8.75ZM12.5 5.75C13.4665 5.75 14.25 4.9665 14.25 4C14.25 3.0335 13.4665 2.25 12.5 2.25C11.5335 2.25 10.75 3.0335 10.75 4C10.75 4.9665 11.5335 5.75 12.5 5.75ZM12.5 15.75C13.4665 15.75 14.25 14.9665 14.25 14C14.25 13.0335 13.4665 12.25 12.5 12.25C11.5335 12.25 10.75 13.0335 10.75 14C10.75 14.9665 11.5335 15.75 12.5 15.75Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.4"
      />
    </svg>
  );
}

function formatCompactPrice(locale: Locale, price: number | null) {
  if (price == null) {
    return null;
  }

  return formatRoomCurrency(locale, price);
}

function buildTabs(locale: Locale): TabItem[] {
  return locale === "en"
    ? [
        { href: "#rooms", label: "Rooms" },
        { href: "#ve-khach-san", label: "About hotel" },
        { href: "#bo-suu-tap", label: "Collection" },
        { href: "#tien-ich", label: "Amenities" },
        { href: "#vi-tri", label: "Location" },
        { href: "#chinh-sach", label: "Policies" }
      ]
    : [
        { href: "#rooms", label: "Phòng" },
        { href: "#ve-khach-san", label: "Về khách sạn" },
        { href: "#bo-suu-tap", label: "Bộ sưu tập" },
        { href: "#tien-ich", label: "Tiện ích" },
        { href: "#vi-tri", label: "Vị trí" },
        { href: "#chinh-sach", label: "Chính sách" }
      ];
}

function buildSections(locale: Locale) {
  return locale === "en"
    ? {
        about: {
          description:
            "Boutique stays feel right when the room story is clear, the language is calm, and the booking flow stays manual-first.",
          title: "Why this room page feels editorial"
        },
        collection: {
          description: "A small visual collection with room and hotel scenes to keep the page premium and calm.",
          title: "Room collection"
        },
        location: {
          description: "The public site can surface one polished branch story while keeping the operational details hidden in the back office.",
          title: "Location and access"
        },
        policies: {
          bullets: ["Hold expiry defaults to 30 minutes.", "Payment is manual in phase 1.", "Booking confirmation follows staff verification."],
          title: "Phase 1 policies"
        }
      }
    : {
        about: {
          description:
            "Một trang phòng sẽ hợp hơn khi câu chuyện hạng phòng rõ ràng, ngôn ngữ chậm rãi, và luồng đặt giữ vẫn manual-first.",
          title: "Vì sao trang phòng này đi theo editorial"
        },
        collection: {
          description: "Một bộ ảnh nhỏ đủ để giữ nhịp sang, nhẹ và không làm người xem rối mắt.",
          title: "Bộ sưu tập phòng"
        },
        location: {
          description: "Trang công khai chỉ cần kể một câu chuyện chi nhánh thật gọn, còn vận hành chi tiết để team xử lý phía sau.",
          title: "Vị trí và tiếp cận"
        },
        policies: {
          bullets: ["Hold tự hết hạn sau 30 phút.", "Thanh toán giai đoạn này là thủ công.", "Xác nhận booking chỉ gửi sau khi staff kiểm tra."],
          title: "Chính sách phase 1"
        }
      };
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
          <span className="rooms-card__nav rooms-card__nav--prev" aria-hidden="true">
            <svg fill="none" height="18" viewBox="0 0 18 18" width="18">
              <path d="M11.25 4.75L6.75 9L11.25 13.25" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
            </svg>
          </span>
          <span className="rooms-card__nav rooms-card__nav--next" aria-hidden="true">
            <svg fill="none" height="18" viewBox="0 0 18 18" width="18">
              <path d="M6.75 4.75L11.25 9L6.75 13.25" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
            </svg>
          </span>
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

function GalleryStrip({ locale }: { locale: Locale }) {
  const images = ["/home/bed1.jpg", "/home/pool3.jpg", "/home/block.jpg"];

  return (
    <div className="rooms-collection__strip">
      {images.map((image, index) => (
        <article className="rooms-collection__tile" key={`${image}-${index}`}>
          <Image alt="" aria-hidden="true" className="rooms-collection__tile-image" fill sizes="(max-width: 720px) 92vw, 320px" src={image} />
          <div className="rooms-collection__tile-overlay" />
          <p className="rooms-collection__tile-title">{locale === "en" ? ["Signature suite", "Water detail", "Quiet light"][index] : ["Phòng signature", "Chi tiết nước", "Ánh sáng dịu"][index]}</p>
        </article>
      ))}
    </div>
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
  const sections = buildSections(locale);
  const tabs = buildTabs(locale);
  const lowestPublicPrice = roomEntries
    .filter((room) => room.priceVisible && room.currentPrice != null)
    .reduce<number | null>((lowest, room) => {
      if (lowest == null) {
        return room.currentPrice;
      }

      return Math.min(lowest, room.currentPrice ?? lowest);
    }, null);
  const shareHref = buildRoomsHref({
    adults: initialFilters.adults,
    checkin: initialFilters.checkin,
    children: initialFilters.children,
    checkout: initialFilters.checkout,
    lang: locale
  });
  const closeHref = buildRoomsHref({
    adults: initialFilters.adults,
    checkin: initialFilters.checkin,
    children: initialFilters.children,
    checkout: initialFilters.checkout,
    lang: locale
  });
  const [shareState, setShareState] = useState<"idle" | "copied" | "shared">("idle");

  const handleShare = async () => {
    const shareUrl = new URL(appendLocaleQuery(shareHref, locale), window.location.origin).toString();

    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          url: shareUrl
        });
        setShareState("shared");
        return;
      } catch {
        // Fall back to clipboard below.
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareState("copied");
      window.setTimeout(() => setShareState("idle"), 1400);
    } catch {
      setShareState("idle");
    }
  };

  return (
    <div className="rooms-page">
      <section className="rooms-hero">
        <div className="rooms-hero__media">
          <Image alt="" aria-hidden="true" className="rooms-hero__image" fill priority sizes="100vw" src="/home/bed1.jpg" />
          <span className="rooms-hero__overlay" aria-hidden="true" />
        </div>

        <div className="section-shell rooms-hero__shell">
          <div className="rooms-panel">
            <div className="rooms-panel__topbar">
              <nav className="rooms-panel__tabs" aria-label={locale === "en" ? "Room page sections" : "Các mục trang phòng"}>
                {tabs.map((tab) => (
                  <Link className={`rooms-panel__tab${tab.href === "#rooms" ? " rooms-panel__tab--active" : ""}`} href={tab.href} key={tab.href}>
                    {tab.label}
                  </Link>
                ))}
              </nav>

              <div className="rooms-panel__summary">
                <span className="rooms-panel__price-prefix">
                  {lowestPublicPrice != null ? formatRoomPricePrefix(locale, lowestPublicPrice) : locale === "en" ? "CTA only" : "Chỉ hiện CTA"}
                </span>
                <Link className="button button--solid rooms-panel__book" href="#rooms">
                  {locale === "en" ? "Choose room" : "Chọn phòng"}
                </Link>
                <button className="rooms-panel__share" onClick={handleShare} type="button">
                  <ShareIcon />
                  <span>{shareState === "copied" ? (locale === "en" ? "Copied" : "Đã sao chép") : shareState === "shared" ? (locale === "en" ? "Shared" : "Đã chia sẻ") : locale === "en" ? "Share" : "Chia sẻ"}</span>
                </button>
              </div>
            </div>

            <div className="rooms-panel__headline">
              <div>
                <p className="rooms-panel__eyebrow">{locale === "en" ? "Room selection" : "Chọn phòng"}</p>
                <h1 className="rooms-panel__title">{locale === "en" ? "Choose your room" : "Chọn phòng của bạn"}</h1>
              </div>
              <button className="rooms-panel__share rooms-panel__share--desktop" onClick={handleShare} type="button">
                <ShareIcon />
                <span>{locale === "en" ? "Share" : "Chia sẻ"}</span>
              </button>
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
          <div className="rooms-section__head">
            <div>
              <p className="rooms-section__eyebrow">{locale === "en" ? "Rooms" : "Phòng"}</p>
              <h2 className="rooms-section__title">{locale === "en" ? "Room types ready to compare" : "Các hạng phòng để so sánh"}</h2>
            </div>
            <p className="rooms-section__description">
              {locale === "en"
                ? "The page stays manual-first: filters set the dates, the grid shows public room types, and the canvas opens in place."
                : "Trang giữ đúng tinh thần manual-first: bộ lọc chốt ngày, lưới hiển thị các hạng phòng public, và popup mở ngay tại chỗ."}
            </p>
          </div>

          <div className="rooms-grid">
            {roomEntries.map((room) => (
              <RoomCard activeSlug={initialRoomSlug} filters={initialFilters} key={room.slug} locale={locale} room={room} />
            ))}
          </div>
        </div>
      </section>

      <section className="rooms-section section" id="ve-khach-san">
        <div className="section-shell rooms-story">
          <div className="rooms-story__copy">
            <p className="rooms-story__eyebrow">{locale === "en" ? "About the hotel" : "Về khách sạn"}</p>
            <h2 className="rooms-story__title">{sections.about.title}</h2>
            <p className="rooms-story__description">{sections.about.description}</p>

            <div className="rooms-story__stats">
              {[
                locale === "en" ? ["Room types", String(roomEntries.length)] : ["Hạng phòng", String(roomEntries.length)],
                locale === "en" ? ["Hold SLA", "30 min"] : ["SLA giữ phòng", "30 phút"],
                locale === "en" ? ["Payment", "Manual"] : ["Thanh toán", "Thủ công"]
              ].map(([label, value]) => (
                <article className="rooms-story__stat" key={label}>
                  <p className="rooms-story__stat-label">{label}</p>
                  <p className="rooms-story__stat-value">{value}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="rooms-story__visual">
            <Image alt="" aria-hidden="true" className="rooms-story__image" fill sizes="(max-width: 720px) 100vw, 560px" src="/home/block.jpg" />
            <div className="rooms-story__visual-overlay" />
          </div>
        </div>
      </section>

      <section className="rooms-section section" id="bo-suu-tap">
        <div className="section-shell">
          <div className="rooms-section__head">
            <div>
              <p className="rooms-section__eyebrow">{locale === "en" ? "Collection" : "Bộ sưu tập"}</p>
              <h2 className="rooms-section__title">{sections.collection.title}</h2>
            </div>
            <p className="rooms-section__description">{sections.collection.description}</p>
          </div>

          <GalleryStrip locale={locale} />
        </div>
      </section>

      <section className="rooms-section section" id="tien-ich">
        <div className="section-shell">
          <div className="rooms-section__head">
            <div>
              <p className="rooms-section__eyebrow">{locale === "en" ? "Amenities" : "Tiện ích"}</p>
              <h2 className="rooms-section__title">{locale === "en" ? "Hotel comforts that feel calm" : "Tiện ích làm nên nhịp nghỉ dịu"}</h2>
            </div>
            <p className="rooms-section__description">
              {locale === "en"
                ? "The room detail modal surfaces practical amenities, breakfast choices, and flexible cancellation in one place."
                : "Popup chi tiết phòng gom tiện nghi thực tế, lựa chọn bữa ăn và tuỳ chọn hủy bỏ vào cùng một chỗ."}
            </p>
          </div>

          <div className="rooms-amenities">
            {[
              locale === "en" ? "Wi-Fi miễn phí" : "Wi-Fi miễn phí",
              locale === "en" ? "Minibar" : "Minibar",
              locale === "en" ? "Flat-screen TV" : "TV màn hình phẳng",
              locale === "en" ? "Private bathroom" : "Phòng tắm riêng",
              locale === "en" ? "Tea / coffee maker" : "Máy pha trà / cà phê",
              locale === "en" ? "Hair dryer" : "Máy sấy tóc"
            ].map((item) => (
              <div className="rooms-amenities__item" key={item}>
                <span className="rooms-amenities__icon" aria-hidden="true">
                  <svg fill="none" height="16" viewBox="0 0 16 16" width="16">
                    <path d="M12.5 4.75L6.75 11.25L3.5 8.25" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                  </svg>
                </span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rooms-section section" id="vi-tri">
        <div className="section-shell rooms-location">
          <div className="rooms-location__copy">
            <p className="rooms-section__eyebrow">{locale === "en" ? "Location" : "Vị trí"}</p>
            <h2 className="rooms-section__title">{sections.location.title}</h2>
            <p className="rooms-section__description">{sections.location.description}</p>

            <div className="rooms-location__card">
              <p className="rooms-location__label">{locale === "en" ? "Address" : "Địa chỉ"}</p>
              <p className="rooms-location__value">
                {locale === "en"
                  ? "Marina complex, Phu Quoc, An Giang"
                  : "Khu nghỉ dưỡng phức hợp Marina, Phú Quốc, An Giang"}
              </p>
              <p className="rooms-location__note">
                {locale === "en"
                  ? "The public page can keep the address tidy while staff handle the operational map and room allocation behind the scenes."
                  : "Trang công khai giữ địa chỉ gọn gàng, còn team vận hành lo bản đồ và phân phòng ở phía sau."}
              </p>
            </div>
          </div>

          <div className="rooms-location__visual">
            <Image alt="" aria-hidden="true" className="rooms-location__image" fill sizes="(max-width: 720px) 100vw, 520px" src="/home/pool3.jpg" />
          </div>
        </div>
      </section>

      <section className="rooms-section section" id="chinh-sach">
        <div className="section-shell">
          <div className="rooms-section__head">
            <div>
              <p className="rooms-section__eyebrow">{locale === "en" ? "Policies" : "Chính sách"}</p>
              <h2 className="rooms-section__title">{sections.policies.title}</h2>
            </div>
            <p className="rooms-section__description">
              {locale === "en"
                ? "Manual verification stays visible so the public booking flow never pretends to be instant."
                : "Luồng xác minh thủ công luôn được giữ rõ, để khách không lầm tưởng đây là booking tự động tức thì."}
            </p>
          </div>

          <div className="rooms-policy">
            {sections.policies.bullets.map((bullet) => (
              <article className="rooms-policy__item" key={bullet}>
                <p className="rooms-policy__text">{bullet}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

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
