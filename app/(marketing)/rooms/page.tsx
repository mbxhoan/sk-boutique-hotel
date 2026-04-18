import type { Metadata } from "next";

import { PageViewTracker } from "@/components/page-view-tracker";
import { RoomsCatalogPage } from "@/components/rooms-catalog-page";
import { resolveLocale } from "@/lib/locale";
import { parseRoomsSearchParams } from "@/lib/room-routes";
import { listBranches } from "@/lib/supabase/queries/branches";
import { listRoomTypes } from "@/lib/supabase/queries/room-types";
import { listRoomsByRoomTypeId } from "@/lib/supabase/queries/rooms";

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

  const roomAvailabilityByTypeId = Object.fromEntries(
    await Promise.all(
      roomTypes.map(async (roomType) => {
        const rooms = await listRoomsByRoomTypeId(roomType.id);
        const availableRooms = rooms.filter((room) => room.status === "available").length;

        return [roomType.id, availableRooms] as const;
      })
    )
  );

  const defaultFilters = getDefaultFilters();
  const initialFilters = {
    adults: resolvedSearchParams.adults ?? defaultFilters.adults,
    checkin: resolvedSearchParams.checkin ?? defaultFilters.checkin,
    children: resolvedSearchParams.children ?? defaultFilters.children,
    checkout: resolvedSearchParams.checkout ?? defaultFilters.checkout,
    lang: resolvedSearchParams.lang,
    room: resolvedSearchParams.room
  };

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
        roomAvailabilityByTypeId={roomAvailabilityByTypeId}
        roomTypes={roomTypes}
      />
    </>
  );
}
