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
  guestCapacity: number;
  metaFacts: {
    label: LocalizedText;
    value: LocalizedText;
  }[];
  occupancyAdults: number;
  occupancyChildren: number;
  originalPrice: number | null;
  priceVisible: boolean;
  roomTypeId: string;
  slug: string;
  sizeLabel: LocalizedText | null;
  summary: LocalizedText;
  title: LocalizedText;
};

const galleryByRoomSlug: Record<string, string[]> = {
  "family-room": [
    "/assets/room_types/family/1.png", 
    "/assets/room_types/family/2.png", 
    "/assets/room_types/family/3.png", 
    "/assets/room_types/family/4.png",
    "/assets/room_types/family/5.png",
    "/assets/room_types/family/6.png",
    "/assets/room_types/family/7.png",
    "/assets/room_types/family/8.png",
    "/assets/room_types/family/9.png",
  ],
  "superior-room": [
    "/assets/room_types/superior/1.png",
    "/assets/room_types/superior/2.png",
    "/assets/room_types/superior/3.png",
    "/assets/room_types/superior/4.png",
    "/assets/room_types/superior/5.png",
    "/assets/room_types/superior/6.png",
    "/assets/room_types/superior/7.png",
  ],
  "quadruple-room": [
    "/assets/room_types/quadruple/1.png",
    "/assets/room_types/quadruple/2.png",
    "/assets/room_types/quadruple/3.png",
    "/assets/room_types/quadruple/4.png",
    "/assets/room_types/quadruple/5.png",
    "/assets/room_types/quadruple/6.png",
  ]
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

function buildGallery(roomType: RoomTypeRow, overrideGallery?: string[]) {
  if (overrideGallery?.length) {
    return overrideGallery;
  }

  return galleryByRoomSlug[roomType.slug] ?? [
    "/assets/room_types/family/3.png", 
    "/assets/room_types/family/5.png", 
    "/assets/room_types/family/7.png",
    "/assets/room_types/superior/2.png",
    "/assets/room_types/superior/4.png",
    "/assets/room_types/superior/6.png",
    "/assets/room_types/quadruple/2.png",
    "/assets/room_types/quadruple/4.png",
    "/assets/room_types/quadruple/7.png",
  ];
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
  const flexibleCancelDelta = Math.round(price * 0.144);

  return {
    breakfast: [
      {
        delta: 0,
        label: text("Bao gồm bữa sáng", "Breakfast included"),
        note: text("Đã bao gồm trong giá phòng", "Included in the room rate"),
        selected: true
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
      label: text("Người lớn", "Adults"),
      value: text(
        `${roomType.occupancy_adults} người lớn`,
        `${roomType.occupancy_adults} ${roomType.occupancy_adults === 1 ? "adult" : "adults"}`
      )
    },
    {
      label: text("Trẻ em", "Children"),
      value: text(
        `${roomType.occupancy_children} trẻ em`,
        `${roomType.occupancy_children} ${roomType.occupancy_children === 1 ? "child" : "children"}`
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

export function buildRoomCatalogEntry(
  roomType: RoomTypeRow,
  availableRooms: number,
  overrideGallery?: string[]
): RoomCatalogEntry {
  const currentPrice = roomType.manual_override_price ?? roomType.base_price;
  const originalPrice = roomType.manual_override_price != null ? roomType.base_price : null;
  const guestCapacity = roomType.occupancy_adults + roomType.occupancy_children;
  const discountPercent =
    originalPrice && currentPrice
      ? Math.max(0, Math.round((1 - currentPrice / originalPrice) * 100))
      : null;
  const { breakfast, cancellation } = buildPriceOptions(roomType);
  const gallery = buildGallery(roomType, overrideGallery);

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
    gallery,
    galleryBadge: text(
      `Xem ${gallery.length} ảnh`,
      `View ${gallery.length} photos`
    ),
    highlights: localizedArray(roomType.highlights_vi, roomType.highlights_en),
    guestCapacity,
    metaFacts: buildMetaFacts(roomType),
    occupancyAdults: roomType.occupancy_adults,
    occupancyChildren: roomType.occupancy_children,
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
