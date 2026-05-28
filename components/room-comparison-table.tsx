"use client";

import type { Locale } from "@/lib/locale";
import type { RoomCatalogEntry } from "@/lib/rooms/catalog";

type RoomComparisonTableProps = {
  roomEntries: RoomCatalogEntry[];
  locale: Locale;
};

type RoomTraitValues = {
  capacity: string;
  bed: string;
  balcony: boolean;
  poolView: boolean;
  bathtub: boolean;
  smartTv: string;
};

const STATIC_ROOM_TRAITS: Record<string, {
  vi: Omit<RoomTraitValues, "capacity">;
  en: Omit<RoomTraitValues, "capacity">;
}> = {
  "family-room": {
    vi: {
      bed: "1 King",
      balcony: true,
      poolView: true,
      bathtub: true,
      smartTv: "55\""
    },
    en: {
      bed: "1 King",
      balcony: true,
      poolView: true,
      bathtub: true,
      smartTv: "55\""
    }
  },
  "superior-room": {
    vi: {
      bed: "1 Queen",
      balcony: true,
      poolView: false,
      bathtub: false,
      smartTv: "43\""
    },
    en: {
      bed: "1 Queen",
      balcony: true,
      poolView: false,
      bathtub: false,
      smartTv: "43\""
    }
  },
  "quadruple-room": {
    vi: {
      bed: "2 Đôi",
      balcony: false,
      poolView: false,
      bathtub: false,
      smartTv: "50\""
    },
    en: {
      bed: "2 Double",
      balcony: false,
      poolView: false,
      bathtub: false,
      smartTv: "50\""
    }
  }
};

const translations = {
  vi: {
    eyebrow: "SO SÁNH NHANH",
    title: "Phòng nào cho bạn?",
    subtitle: "Bảng đối chiếu giữa 3 hạng phòng – diện tích, sức chứa, tiện nghi và giá.",
    rowCapacity: "Sức chứa",
    rowBed: "Giường",
    rowBalcony: "Ban công",
    rowPoolView: "View hồ bơi",
    rowBathtub: "Bồn tắm",
    rowSmartTv: "Smart TV",
    rowPrice: "Giá / đêm (đã giảm)"
  },
  en: {
    eyebrow: "QUICK COMPARISON",
    title: "Which room for you?",
    subtitle: "Comparison table between 3 room types – area, capacity, amenities, and price.",
    rowCapacity: "Capacity",
    rowBed: "Beds",
    rowBalcony: "Balcony",
    rowPoolView: "Pool view",
    rowBathtub: "Bathtub",
    rowSmartTv: "Smart TV",
    rowPrice: "Price / night (discounted)"
  }
};

function getRoomTraits(room: RoomCatalogEntry, locale: "vi" | "en"): RoomTraitValues {
  const capacity = `${room.occupancyAdults}+${room.occupancyChildren}`;
  
  const staticTraits = STATIC_ROOM_TRAITS[room.slug];
  if (staticTraits) {
    return {
      capacity,
      ...staticTraits[locale]
    };
  }
  
  const highlights = room.highlights.map(h => h[locale].toLowerCase());
  
  const balcony = highlights.some(h => h.includes("ban công") || h.includes("balcony"));
  const poolView = highlights.some(h => h.includes("hồ bơi") || h.includes("pool view") || h.includes("pool"));
  const bathtub = highlights.some(h => h.includes("bồn tắm") || h.includes("bathtub"));
  
  let smartTv = "—";
  for (const h of highlights) {
    if (h.includes("tv") || h.includes("television")) {
      const match = h.match(/\d+/);
      if (match) {
        smartTv = `${match[0]}"`;
        break;
      }
      smartTv = locale === "en" ? "Yes" : "Có";
    }
  }
  
  return {
    capacity,
    bed: room.bedLabel[locale],
    balcony,
    poolView,
    bathtub,
    smartTv
  };
}

function formatPriceMillions(price: number | null, locale: "vi" | "en"): string {
  if (price == null) return "—";
  const millions = price / 1000000;
  const formatted = new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(millions);
  return `${formatted}M`;
}

function getComparisonRoomName(title: string) {
  const compactTitle = title.replace(/^phòng\s+/i, "").replace(/\s+room$/i, "").trim();
  return compactTitle || title;
}

export function RoomComparisonTable({ roomEntries, locale }: RoomComparisonTableProps) {
  const t = translations[locale];

  const roomsWithTraits = roomEntries.map(room => ({
    room,
    traits: getRoomTraits(room, locale)
  }));

  if (!roomsWithTraits.length) {
    return null;
  }

  return (
    <section className="section room-comparison">
      <div className="section-shell">
        <div className="room-comparison__header">
          <div className="room-comparison__title-block">
            <p className="room-comparison__eyebrow">{t.eyebrow}</p>
            <h2 className="room-comparison__title">{t.title}</h2>
          </div>
          <p className="room-comparison__subtitle">{t.subtitle}</p>
        </div>

        <div className="room-comparison__table-container">
          <table className="room-comparison__table">
            <colgroup>
              <col className="room-comparison__col room-comparison__col--feature" />
              {roomsWithTraits.map(({ room }) => (
                <col className="room-comparison__col room-comparison__col--room" key={room.roomTypeId} />
              ))}
            </colgroup>
            <thead>
              <tr>
                <th className="room-comparison__cell room-comparison__th" aria-label="Room features header"></th>
                {roomsWithTraits.map(({ room }) => (
                  <th key={room.roomTypeId} className="room-comparison__cell room-comparison__th" scope="col">
                    <span className="room-comparison__th-title">{getComparisonRoomName(room.title[locale])}</span>
                    <span className="room-comparison__th-size">{room.sizeLabel ? room.sizeLabel[locale] : "—"}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="room-comparison__cell room-comparison__row-label">{t.rowCapacity}</td>
                {roomsWithTraits.map(({ room, traits }) => (
                  <td key={room.roomTypeId} className="room-comparison__cell room-comparison__td-value">
                    {traits.capacity}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="room-comparison__cell room-comparison__row-label">{t.rowBed}</td>
                {roomsWithTraits.map(({ room, traits }) => (
                  <td key={room.roomTypeId} className="room-comparison__cell room-comparison__td-value">
                    {traits.bed}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="room-comparison__cell room-comparison__row-label">{t.rowBalcony}</td>
                {roomsWithTraits.map(({ room, traits }) => (
                  <td key={room.roomTypeId} className="room-comparison__cell room-comparison__td-value">
                    {traits.balcony ? (
                      <span className="room-comparison__check" aria-label="Yes">✓</span>
                    ) : (
                      <span className="room-comparison__dash" aria-hidden="true">—</span>
                    )}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="room-comparison__cell room-comparison__row-label">{t.rowPoolView}</td>
                {roomsWithTraits.map(({ room, traits }) => (
                  <td key={room.roomTypeId} className="room-comparison__cell room-comparison__td-value">
                    {traits.poolView ? (
                      <span className="room-comparison__check" aria-label="Yes">✓</span>
                    ) : (
                      <span className="room-comparison__dash" aria-hidden="true">—</span>
                    )}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="room-comparison__cell room-comparison__row-label">{t.rowBathtub}</td>
                {roomsWithTraits.map(({ room, traits }) => (
                  <td key={room.roomTypeId} className="room-comparison__cell room-comparison__td-value">
                    {traits.bathtub ? (
                      <span className="room-comparison__check" aria-label="Yes">✓</span>
                    ) : (
                      <span className="room-comparison__dash" aria-hidden="true">—</span>
                    )}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="room-comparison__cell room-comparison__row-label">{t.rowSmartTv}</td>
                {roomsWithTraits.map(({ room, traits }) => (
                  <td key={room.roomTypeId} className="room-comparison__cell room-comparison__td-value">
                    {traits.smartTv}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="room-comparison__cell room-comparison__row-label">{t.rowPrice}</td>
                {roomsWithTraits.map(({ room }) => {
                  const displayPrice = room.priceVisible && room.currentPrice != null
                    ? formatPriceMillions(room.currentPrice, locale)
                    : (locale === "en" ? "Contact" : "Liên hệ");
                  return (
                    <td key={room.roomTypeId} className="room-comparison__cell room-comparison__td-value room-comparison__price">
                      {displayPrice}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
