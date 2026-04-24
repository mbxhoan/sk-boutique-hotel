import type { Metadata } from "next";

import { AdminRoomsPage } from "@/components/admin-rooms-page";
import { resolveLocale } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";
import { listBranches } from "@/lib/supabase/queries/branches";
import { listFloorsByBranchId } from "@/lib/supabase/queries/floors";
import { listRoomHolds } from "@/lib/supabase/queries/room-holds";
import { listReservationRoomItems } from "@/lib/supabase/queries/reservation-room-items";
import { listRoomTypes } from "@/lib/supabase/queries/room-types";
import { listRoomsByBranchId } from "@/lib/supabase/queries/rooms";

type PageProps = {
  searchParams?: Promise<{
    branch?: string;
    date?: string;
    floor?: string;
    lang?: string;
    room?: string;
  }>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);

  return {
    title: localize(locale, { vi: "Quản lý phòng", en: "Room management" }),
    description: localize(locale, {
      vi: "Quản lý phòng vật lý và trạng thái thời gian thực.",
      en: "Manage physical rooms and live statuses."
    })
  };
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseDateKey(value?: string | null) {
  if (!value) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00`);

  return Number.isNaN(parsed.getTime()) ? null : startOfDay(parsed);
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return startOfDay(next);
}

function isDateWithinStay(date: Date, stayStartAt: string, stayEndAt: string) {
  const dayStart = startOfDay(date).getTime();
  const dayEnd = addDays(date, 1).getTime();
  const stayStart = new Date(stayStartAt).getTime();
  const stayEnd = new Date(stayEndAt).getTime();

  return stayStart < dayEnd && stayEnd > dayStart;
}

export default async function AdminRoomsRoute({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);
  const today = startOfDay(new Date());
  const selectedDate = (() => {
    const parsed = parseDateKey(resolvedSearchParams.date);

    if (!parsed || parsed < today) {
      return today;
    }

    return parsed;
  })();
  const branches = await listBranches();
  const selectedBranch = branches.find((branch) => branch.id === resolvedSearchParams.branch) ?? branches[0] ?? null;
  const roomTypes = await listRoomTypes();
  const [floors, rooms, reservationItems, roomHolds] = selectedBranch
    ? await Promise.all([
        listFloorsByBranchId(selectedBranch.id),
        listRoomsByBranchId(selectedBranch.id),
        listReservationRoomItems({ status: "active" }),
        listRoomHolds({ branchId: selectedBranch.id, limit: 1000, status: ["active", "converted"] })
      ])
    : [[], [], [], []];
  const roomIdSet = new Set(rooms.map((room) => room.id));
  const bookedRoomIds = new Set(
    reservationItems
      .filter((reservationItem) => roomIdSet.has(reservationItem.room_id) && isDateWithinStay(selectedDate, reservationItem.stay_start_at, reservationItem.stay_end_at))
      .map((reservationItem) => reservationItem.room_id)
  );
  const heldRoomIds = new Set(
    roomHolds.filter((hold) => hold.room_id && isDateWithinStay(selectedDate, hold.stay_start_at, hold.stay_end_at)).map((hold) => hold.room_id)
  );
  const roomViews = rooms.map((room) => {
    const floor = floors.find((item) => item.id === room.floor_id) ?? null;
    const roomType = roomTypes.find((item) => item.id === room.room_type_id) ?? null;
    const derivedStatus =
      room.status === "maintenance"
        ? ("maintenance" as const)
        : room.status === "blocked"
          ? ("blocked" as const)
          : bookedRoomIds.has(room.id)
            ? ("occupied" as const)
            : heldRoomIds.has(room.id) || room.status === "held"
              ? ("blocked" as const)
              : room.status === "booked"
                ? ("occupied" as const)
                : ("available" as const);

    return {
      ...room,
      display_status: derivedStatus,
      floor_code: floor?.code ?? room.floor_id,
      floor_label: locale === "en" ? floor?.name_en ?? room.floor_id : floor?.name_vi ?? room.floor_id,
      room_type_name_en: roomType?.name_en ?? room.room_type_id,
      room_type_name_vi: roomType?.name_vi ?? room.room_type_id
    };
  });

  const selectedFloorId = resolvedSearchParams.floor ?? floors[0]?.id ?? null;
  const selectedRoomId = resolvedSearchParams.room ?? roomViews.find((room) => room.floor_id === selectedFloorId)?.id ?? roomViews[0]?.id ?? null;
  const branchLabel = selectedBranch ? (locale === "en" ? selectedBranch.name_en : selectedBranch.name_vi) : locale === "en" ? "No branch selected" : "Chưa chọn chi nhánh";

  return (
    <AdminRoomsPage
      branchName={branchLabel}
      branchId={selectedBranch?.id ?? null}
      floorId={selectedFloorId}
      floors={floors}
      locale={locale}
      selectedDate={dateKey(selectedDate)}
      minimumDate={dateKey(today)}
      roomTypes={roomTypes}
      rooms={roomViews}
      selectedRoomId={selectedRoomId}
    />
  );
}
