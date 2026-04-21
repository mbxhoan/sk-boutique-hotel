import type { Metadata } from "next";

import { PageViewTracker } from "@/components/page-view-tracker";
import { RoomsCatalogPage } from "@/components/rooms-catalog-page";
import { resolveLocale } from "@/lib/locale";
import { parseRoomsSearchParams } from "@/lib/room-routes";
import { loadMediaCollectionImageUrls } from "@/lib/supabase/queries/media";
import { listBranches } from "@/lib/supabase/queries/branches";
import { findAvailableRooms } from "@/lib/supabase/queries/availability";
import { listRoomTypes } from "@/lib/supabase/queries/room-types";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getDefaultFilters() {
  const today = new Date();
  const tomorrow = new Date(today);

  tomorrow.setDate(today.getDate() + 1);

  return {
    adults: 2,
    checkin: dateKey(today),
    children: 0,
    checkout: dateKey(tomorrow)
  };
}

const roomsHeroFallback = ["/home/bed1.jpg", "/home/pool3.jpg", "/home/block.jpg"];
const roomsCarouselFallback = ["/home/bed1.jpg", "/home/pool3.jpg", "/home/block.jpg"];
const roomGalleryFallbacks: Record<string, string[]> = {
  "family-room": ["/home/bed1.jpg", "/home/pool3.jpg", "/home/block.jpg", "/home/bed1.jpg"],
  "quadruple-room": ["/home/pool3.jpg", "/home/bed1.jpg", "/home/block.jpg", "/home/pool3.jpg"],
  "superior-room": ["/home/bed1.jpg", "/home/block.jpg", "/home/pool3.jpg", "/home/bed1.jpg"]
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolvedSearchParams = parseRoomsSearchParams((await searchParams) ?? undefined);
  const locale = resolveLocale(resolvedSearchParams.lang);

  return {
    title: locale === "en" ? "Choose your room" : "Chọn phòng của bạn",
    description:
      locale === "en"
        ? "View room types, check dates, and open the room canvas without leaving the listing."
        : "Xem các hạng phòng, kiểm tra ngày và mở popup chi tiết ngay trên trang danh sách."
  };
}

export default async function RoomsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = parseRoomsSearchParams((await searchParams) ?? undefined);
  const locale = resolveLocale(resolvedSearchParams.lang);
  const branches = await listBranches();
  const roomTypes = await listRoomTypes();
  const activeRoomType = resolvedSearchParams.room
    ? roomTypes.find((roomType) => roomType.slug === resolvedSearchParams.room)
  : null;
  const defaultBranchId = branches[0]?.id ?? null;
  const defaultFilters = getDefaultFilters();
  const initialFilters = {
    adults: resolvedSearchParams.adults ?? defaultFilters.adults,
    checkin: resolvedSearchParams.checkin ?? defaultFilters.checkin,
    children: resolvedSearchParams.children ?? defaultFilters.children,
    checkout: resolvedSearchParams.checkout ?? defaultFilters.checkout,
    lang: resolvedSearchParams.lang,
    room: resolvedSearchParams.room
  };

  const availableRooms = defaultBranchId
    ? await findAvailableRooms({
        branchId: defaultBranchId,
        stayEndAt: initialFilters.checkout,
        stayStartAt: initialFilters.checkin
      })
    : [];
  const roomAvailabilityByTypeId = availableRooms.reduce<Record<string, number>>((accumulator, room) => {
    accumulator[room.room_type_id] = (accumulator[room.room_type_id] ?? 0) + 1;

    return accumulator;
  }, {});
  const [roomsHeroImage, roomCarouselImages, familyGallery, superiorGallery, quadrupleGallery] = await Promise.all([
    loadMediaCollectionImageUrls("rooms-hero", roomsHeroFallback, 1).then((images) => images[0] ?? roomsHeroFallback[0]),
    loadMediaCollectionImageUrls("rooms-gallery", roomsCarouselFallback, 12),
    loadMediaCollectionImageUrls("room-family", roomGalleryFallbacks["family-room"], 4),
    loadMediaCollectionImageUrls("room-superior", roomGalleryFallbacks["superior-room"], 4),
    loadMediaCollectionImageUrls("room-quadruple", roomGalleryFallbacks["quadruple-room"], 4)
  ]);

  return (
    <>
      <PageViewTracker eventType="page_view" locale={locale} pagePath="/rooms" entityType="room_collection" />
      {activeRoomType ? (
        <PageViewTracker
          entityId={activeRoomType.slug}
          entityType="room_type"
          eventType="room_view"
          locale={locale}
          pagePath="/rooms"
        />
      ) : null}
      <RoomsCatalogPage
        defaultBranchId={defaultBranchId}
        initialFilters={initialFilters}
        initialRoomSlug={activeRoomType?.slug ?? null}
        locale={locale}
        roomCarouselImages={roomCarouselImages}
        roomGalleriesBySlug={{
          "family-room": familyGallery,
          "quadruple-room": quadrupleGallery,
          "superior-room": superiorGallery
        }}
        roomAvailabilityByTypeId={roomAvailabilityByTypeId}
        roomTypes={roomTypes}
        roomsHeroImage={roomsHeroImage}
      />
    </>
  );
}
