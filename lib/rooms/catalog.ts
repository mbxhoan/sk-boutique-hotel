import type { Locale } from "@/lib/locale";
import { translate } from "@/lib/locale";
import type { LocalizedText } from "@/lib/mock/i18n";
import type { RoomTypeRow } from "@/lib/supabase/database.types";
import { formatAreaText, localizedArray, text } from "@/lib/supabase/content";

export type RoomPriceOption = {
  delta: number;
  label: LocalizedText;
  note?: LocalizedText;
  selected?: boolean;
};

export type RoomCatalogEntry = {
  availabilityLabel: LocalizedText;
  availableRooms: number;
  bedLabel: LocalizedText;
  bookingCtaLabel: LocalizedText;
  breakfastOptions: RoomPriceOption[];
  cancellationOptions: RoomPriceOption[];
  currentPrice: number | null;
  description: LocalizedText;
  discountPercent: number | null;
  gallery: string[];
  galleryBadge: LocalizedText;
  highlights: LocalizedText[];
  metaFacts: {
    label: LocalizedText;
    value: LocalizedText;
  }[];
  originalPrice: number | null;
  priceVisible: boolean;
  roomTypeId: string;
  slug: string;
  sizeLabel: LocalizedText | null;
  summary: LocalizedText;
  title: LocalizedText;
};

const galleryByRoomSlug: Record<string, string[]> = {
  "family-room": ["/home/bed1.jpg", "/home/pool3.jpg", "/home/block.jpg", "/home/bed1.jpg"],
  "quadruple-room": ["/home/pool3.jpg", "/home/bed1.jpg", "/home/block.jpg", "/home/pool3.jpg"],
  "superior-room": ["/home/bed1.jpg", "/home/block.jpg", "/home/pool3.jpg", "/home/bed1.jpg"]
};

function formatRoomNumber(locale: Locale, value: number) {
  return new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US", {
    maximumFractionDigits: 0
  }).format(value);
}

export function formatRoomCurrency(locale: Locale, value: number | null | undefined) {
  if (value == null) {
    return null;
  }

  const formatted = new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US", {
    maximumFractionDigits: 0
  }).format(value);

  return locale === "en" ? `${formatted} đ` : `${formatted} đ`;
}

function pickDescription(roomType: RoomTypeRow) {
  return roomType.summary_vi || roomType.description_vi || roomType.story_vi || roomType.name_vi;
}

function pickDescriptionEn(roomType: RoomTypeRow) {
  return roomType.summary_en || roomType.description_en || roomType.story_en || roomType.name_en;
}

function buildGallery(roomType: RoomTypeRow) {
  return galleryByRoomSlug[roomType.slug] ?? ["/home/bed1.jpg", "/home/block.jpg", "/home/pool3.jpg"];
}

function buildAvailabilityLabel(availableRooms: number) {
  if (availableRooms <= 0) {
    return text("Hết phòng", "Sold out");
  }

  if (availableRooms === 1) {
    return text("Chỉ còn 1 phòng", "Only 1 room left");
  }

  return text(
    `Còn ${formatRoomNumber("vi", availableRooms)} phòng`,
    `Only ${formatRoomNumber("en", availableRooms)} rooms left`
  );
}

function buildPriceOptions(roomType: RoomTypeRow) {
  const price = roomType.manual_override_price ?? roomType.base_price;
  const breakfastDelta = Math.round(price * 0.205);
  const flexibleCancelDelta = Math.round(price * 0.144);

  return {
    breakfast: [
      {
        delta: 0,
        label: text("Không có bữa sáng", "No breakfast"),
        selected: true
      },
      {
        delta: breakfastDelta,
        label: text("Bao gồm bữa sáng", "Breakfast included")
      }
    ] satisfies RoomPriceOption[],
    cancellation: [
      {
        delta: 0,
        label: text("Không hoàn tiền", "Non-refundable"),
        selected: true
      },
      {
        delta: flexibleCancelDelta,
        label: text("Hủy miễn phí", "Free cancellation"),
        note: text("Trước 21 thg 4 11:59 CH", "Before Apr 21, 11:59 PM")
      }
    ] satisfies RoomPriceOption[]
  };
}

function buildMetaFacts(roomType: RoomTypeRow) {
  return [
    {
      label: text("Khách", "Guests"),
      value: text(
        `${roomType.occupancy_adults + roomType.occupancy_children} khách`,
        `${roomType.occupancy_adults + roomType.occupancy_children} guests`
      )
    },
    {
      label: text("Diện tích", "Area"),
      value: formatAreaText(roomType.size_sqm) ?? text("-", "-")
    },
    {
      label: text("Giường", "Bed"),
      value: text(roomType.bed_type || "-", translate("en", roomType.bed_type || "-"))
    }
  ];
}

export function buildRoomCatalogEntry(roomType: RoomTypeRow, availableRooms: number): RoomCatalogEntry {
  const currentPrice = roomType.manual_override_price ?? roomType.base_price;
  const originalPrice = roomType.manual_override_price != null ? roomType.base_price : null;
  const discountPercent =
    originalPrice && currentPrice
      ? Math.max(0, Math.round((1 - currentPrice / originalPrice) * 100))
      : null;
  const { breakfast, cancellation } = buildPriceOptions(roomType);

  return {
    availabilityLabel: buildAvailabilityLabel(availableRooms),
    availableRooms,
    bedLabel: text(roomType.bed_type || "-", translate("en", roomType.bed_type || "-")),
    bookingCtaLabel: text("Xem lựa chọn và đặt phòng", "View options and book"),
    breakfastOptions: breakfast,
    cancellationOptions: cancellation,
    currentPrice,
    description: text(pickDescription(roomType), pickDescriptionEn(roomType)),
    discountPercent,
    gallery: buildGallery(roomType),
    galleryBadge: text(
      `Xem ${buildGallery(roomType).length} ảnh`,
      `View ${buildGallery(roomType).length} photos`
    ),
    highlights: localizedArray(roomType.highlights_vi, roomType.highlights_en),
    metaFacts: buildMetaFacts(roomType),
    originalPrice,
    priceVisible: roomType.show_public_price,
    roomTypeId: roomType.id,
    slug: roomType.slug,
    sizeLabel: formatAreaText(roomType.size_sqm),
    summary: text(
      roomType.summary_vi || roomType.description_vi || roomType.story_vi,
      roomType.summary_en || roomType.description_en || roomType.story_en
    ),
    title: text(roomType.name_vi, roomType.name_en)
  };
}

export function buildRoomCatalogEntries(roomTypes: RoomTypeRow[], availableRoomsByTypeId: Record<string, number>) {
  return roomTypes.map((roomType) => buildRoomCatalogEntry(roomType, availableRoomsByTypeId[roomType.id] ?? 0));
}

export function formatRoomPricePrefix(locale: Locale, price: number) {
  const formatted = formatRoomCurrency(locale, price);

  return locale === "en" ? `From ${formatted ?? "-"}` : `Từ ${formatted ?? "-"}`;
}
