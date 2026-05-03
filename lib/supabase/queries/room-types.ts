import {
  findRoomPageBySlug,
  getRoomStaticParams as getMockRoomStaticParams,
  roomCollectionPageCopy
} from "@/lib/mock/public-cms";
import type { CmsCollectionItem, CmsPageCopy } from "@/lib/mock/public-cms";
import { buildRoomDetailHref } from "@/lib/room-routes";
import { translate } from "@/lib/locale";
import type { RoomTypeInsert, RoomTypeRow } from "@/lib/supabase/database.types";
import { formatAreaText, formatCurrencyText, formatTeaserCurrencyText, text } from "@/lib/supabase/content";
import { queryWithServiceFallback, sortByDisplayOrder } from "@/lib/supabase/queries/shared";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

const roomCollectionTemplate = roomCollectionPageCopy;
const roomTypeSelect =
  "id, slug, code, name_vi, name_en, summary_vi, summary_en, description_vi, description_en, story_vi, story_en, highlights_vi, highlights_en, occupancy_adults, occupancy_children, size_sqm, bed_type, base_price, weekend_surcharge, manual_override_price, show_public_price, cover_image_path, seo_title_vi, seo_title_en, seo_description_vi, seo_description_en, is_active, sort_order, created_at, updated_at";

function pickRoomDescription(roomType: RoomTypeRow) {
  return roomType.summary_vi || roomType.description_vi || roomType.story_vi;
}

function pickRoomDescriptionEn(roomType: RoomTypeRow) {
  return roomType.summary_en || roomType.description_en || roomType.story_en;
}

function toRoomCard(roomType: RoomTypeRow): CmsCollectionItem {
  const price = roomType.manual_override_price ?? roomType.base_price;
  const priceMeta = roomType.show_public_price
    ? formatCurrencyText(price) ?? text("Từ 0", "From 0")
    : formatTeaserCurrencyText(price) ?? text("Chỉ từ 0", "From 0");

  return {
    href: buildRoomDetailHref(roomType.slug),
    eyebrow: text("Phòng", "Room"),
    title: text(roomType.name_vi, roomType.name_en),
    description: text(pickRoomDescription(roomType), pickRoomDescriptionEn(roomType)),
    meta: [
      text(
        `${roomType.occupancy_adults + roomType.occupancy_children} khách`,
        `${roomType.occupancy_adults + roomType.occupancy_children} guests`
      ),
      formatAreaText(roomType.size_sqm) ?? text(roomType.bed_type || "-", translate("en", roomType.bed_type || "-")),
      priceMeta
    ],
    tone: roomType.sort_order % 2 === 0 ? "paper" : "gold"
  };
}

function patchRoomCollectionPage(roomTypes: RoomTypeRow[]): CmsPageCopy {
  if (!roomTypes.length) {
    return roomCollectionTemplate;
  }

  const items = sortByDisplayOrder(roomTypes).map(toRoomCard);

  return {
    ...roomCollectionTemplate,
    sections: roomCollectionTemplate.sections.map((section) => {
      if (section.kind === "cards" && section.id === "room-cards") {
        return {
          ...section,
          items
        };
      }

      if (section.kind === "stats" && section.id === "features") {
        return {
          ...section,
          items: section.items.map((item, index) => {
            if (index === 0) {
              return {
                ...item,
                value: `${roomTypes.length}`
              };
            }

            if (index === 2) {
              return {
                ...item,
                value: "VI/EN"
              };
            }

            return item;
          })
        };
      }

      return section;
    })
  };
}

function toRelatedRoomCards(roomTypes: RoomTypeRow[], currentSlug: string) {
  return sortByDisplayOrder(roomTypes)
    .filter((roomType) => roomType.slug !== currentSlug)
    .slice(0, 4)
    .map(toRoomCard);
}

function patchRoomDetailPage(roomType: RoomTypeRow, roomTypes: RoomTypeRow[], fallbackPage: CmsPageCopy) {
  const relatedRooms = toRelatedRoomCards(roomTypes, roomType.slug);
  const publicPrice = roomType.manual_override_price ?? roomType.base_price;
  const priceLabel = roomType.show_public_price
    ? formatCurrencyText(publicPrice) ?? text("Từ 0", "From 0")
    : formatTeaserCurrencyText(publicPrice) ?? text("Chỉ từ 0", "From 0");

  return {
    ...fallbackPage,
    seo: {
      title: text(roomType.seo_title_vi || roomType.name_vi, roomType.seo_title_en || roomType.name_en),
      description: text(
        roomType.seo_description_vi || pickRoomDescription(roomType),
        roomType.seo_description_en || pickRoomDescriptionEn(roomType)
      )
    },
    sections: fallbackPage.sections.map((section) => {
      if (section.kind === "hero" && section.id === "hero") {
        return {
          ...section,
          title: text(roomType.name_vi, roomType.name_en),
          description: text(pickRoomDescription(roomType), pickRoomDescriptionEn(roomType)),
          bullets: (roomType.highlights_vi.length || roomType.highlights_en.length)
            ? roomType.highlights_vi.map((item, index) =>
                text(item, roomType.highlights_en[index] ?? roomType.highlights_vi[index] ?? item)
              )
            : section.bullets,
              frame: {
            ...section.frame,
            chips: [
              roomType.code,
              text(roomType.bed_type || "Room type", translate("en", roomType.bed_type || "Room type")),
              roomType.show_public_price ? text("Từ giá", "From pricing") : text("Chỉ từ", "From")
            ]
          }
        };
      }

      if (section.kind === "stats" && section.id === "facts") {
        return {
          ...section,
          title: text("Những trường dữ liệu chính cho room type", "Key room type fields"),
          description: text(
            roomType.description_vi || roomType.summary_vi || roomType.story_vi,
            roomType.description_en || roomType.summary_en || roomType.story_en
          ),
          items: [
            {
              value: text(
                `${roomType.occupancy_adults + roomType.occupancy_children} khách`,
                `${roomType.occupancy_adults + roomType.occupancy_children} guests`
              ),
              label: text("Khách", "Guests"),
              detail: text("Sức chứa cho lưu trú ngắn ngày.", "Capacity for short stays."),
              tone: "paper" as const
            },
            {
              value: formatAreaText(roomType.size_sqm) ?? text("-", "-"),
              label: text("Diện tích", "Area"),
              detail: text("Một giá trị rõ để hiển thị trong CMS.", "A clear value for CMS display."),
              tone: "gold" as const
            },
            {
              value: text(roomType.bed_type || "-", translate("en", roomType.bed_type || "-")),
              label: text("Bed", "Bed"),
              detail: text("Bed type có thể chỉnh theo inventory.", "Bed type can vary by inventory."),
              tone: "ink" as const
            },
            {
              value: priceLabel,
              label: text("Public price", "Public price"),
              detail: text(
                roomType.show_public_price ? "Có thể hiển thị công khai." : "Có thể ẩn để hiển thị giá chỉ từ.",
                roomType.show_public_price ? "Can be shown publicly." : "Can be hidden to show a teaser price."
              ),
              tone: "paper" as const
            }
          ]
        };
      }

      if (section.kind === "locale-zones" && section.id === "zones") {
        return {
          ...section,
          title: text("Vùng nội dung song ngữ cho room detail", "Bilingual content zones for the room detail"),
          description: text(
            "Room content có thể map trực tiếp sang cột VI/EN trong CMS.",
            "Room content can map directly into VI/EN columns in the CMS."
          ),
          zones: {
            vi: {
              ...section.zones.vi,
              eyebrow: text("Nội dung VI", "VI content"),
              title: text("Mô tả tiếng Việt", "Vietnamese copy"),
              description: text(
                roomType.description_vi || roomType.summary_vi || roomType.story_vi,
                roomType.description_vi || roomType.summary_vi || roomType.story_vi
              ),
              bullets: roomType.highlights_vi.length
                ? roomType.highlights_vi.map((item) => text(item, item))
                : section.zones.vi.bullets,
              note: text(roomType.story_vi || roomType.summary_vi || "", roomType.story_vi || roomType.summary_vi || "")
            },
            en: {
              ...section.zones.en,
              eyebrow: text("EN content", "EN content"),
              title: text("English copy", "English copy"),
              description: text(
                roomType.description_en || roomType.summary_en || roomType.story_en,
                roomType.description_en || roomType.summary_en || roomType.story_en
              ),
              bullets: roomType.highlights_en.length
                ? roomType.highlights_en.map((item) => text(item, item))
                : section.zones.en.bullets,
              note: text(roomType.story_en || roomType.summary_en || "", roomType.story_en || roomType.summary_en || "")
            }
          }
        };
      }

      if (section.kind === "split" && section.id === "amenities") {
        return {
          ...section,
          title: text(roomType.name_vi, roomType.name_en),
          description: text(
            roomType.story_vi || roomType.description_vi || roomType.summary_vi,
            roomType.story_en || roomType.description_en || roomType.summary_en
          ),
          bullets: [
            text(roomType.bed_type || "Bed type", roomType.bed_type || "Bed type"),
            text(
              roomType.show_public_price ? "Public price visible." : "Teaser price mode.",
              roomType.show_public_price ? "Public price visible." : "Teaser price mode."
            ),
            text(
              roomType.manual_override_price != null ? "Manual override supported." : "Base price supported.",
              roomType.manual_override_price != null ? "Manual override supported." : "Base price supported."
            )
          ]
        };
      }

      if (section.kind === "cards" && section.id === "related") {
        return {
          ...section,
          items: relatedRooms.length ? relatedRooms : section.items
        };
      }

      if (section.kind === "band" && section.id === "cta") {
        return {
          ...section,
          title: text(`Giữ ${roomType.name_vi}`, `Hold ${roomType.name_en}`),
          description: text(
            "Flow này dừng ở hold và xác minh thủ công, đúng phase 1.",
            "The flow stops at hold and manual verification, exactly as phase 1 requires."
          )
        };
      }

      return section;
    })
  };
}

export async function listRoomTypes(options: { includeInactive?: boolean } = {}) {
  return queryWithServiceFallback(
    async (client) => {
      let query = client.from("room_types").select(roomTypeSelect);

      if (!options.includeInactive) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query.order("sort_order", { ascending: true }).order("name_vi", { ascending: true });

      if (error) {
        throw error;
      }

      return (data ?? []) as RoomTypeRow[];
    },
    [] as RoomTypeRow[]
  );
}

async function getRoomTypeBySlug(slug: string) {
  return queryWithServiceFallback(
    async (client) => {
      const { data, error } = await client
        .from("room_types")
        .select(roomTypeSelect)
        .eq("slug", slug)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return (data ?? null) as RoomTypeRow | null;
    },
    null as RoomTypeRow | null
  );
}

export async function getRoomTypeById(roomTypeId: string) {
  return queryWithServiceFallback(
    async (client) => {
      const { data, error } = await client.from("room_types").select(roomTypeSelect).eq("id", roomTypeId).maybeSingle();

      if (error) {
        throw error;
      }

      return (data ?? null) as RoomTypeRow | null;
    },
    null as RoomTypeRow | null
  );
}

export async function upsertRoomType(input: RoomTypeInsert) {
  const client = createSupabaseServiceClient();
  const { data, error } = await client.from("room_types").upsert(input, { onConflict: "id" }).select(roomTypeSelect).single();

  if (error) {
    throw error;
  }

  return data as RoomTypeRow;
}

export async function loadRoomCollectionPageCopy() {
  const roomTypes = await listRoomTypes();
  return patchRoomCollectionPage(roomTypes);
}

export async function loadRoomDetailPageCopy(slug: string) {
  const roomType = await getRoomTypeBySlug(slug);
  const fallbackPage = findRoomPageBySlug(slug);

  if (!roomType) {
    return fallbackPage;
  }

  if (!fallbackPage) {
    return null;
  }

  const roomTypes = await listRoomTypes();
  return patchRoomDetailPage(roomType, roomTypes, fallbackPage);
}

export async function getRoomStaticParams() {
  const roomTypes = await listRoomTypes();

  if (!roomTypes.length) {
    return getMockRoomStaticParams();
  }

  return sortByDisplayOrder(roomTypes).map((roomType) => ({ slug: roomType.slug }));
}
