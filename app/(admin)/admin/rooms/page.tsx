import type { Metadata } from "next";

import { AdminRoomsPage } from "@/components/admin-rooms-page";
import { resolveLocale } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";
import { listBranches } from "@/lib/supabase/queries/branches";
import { listCustomersByIds } from "@/lib/supabase/queries/customers";
import { listFloorsByBranchId } from "@/lib/supabase/queries/floors";
import { listReservationRoomItems } from "@/lib/supabase/queries/reservation-room-items";
import { listRoomHolds } from "@/lib/supabase/queries/room-holds";
import { listRoomTypes } from "@/lib/supabase/queries/room-types";
import { listReservations } from "@/lib/supabase/queries/reservations";
import { listRoomsByBranchId } from "@/lib/supabase/queries/rooms";

type PageProps = {
  searchParams?: Promise<{
    branch?: string;
    date?: string;
    end?: string;
    floor?: string;
    lang?: string;
    room?: string;
    start?: string;
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

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return startOfDay(next);
}

function isStayWithinRange(stayStartAt: string, stayEndAt: string, rangeStart: Date, rangeEnd: Date) {
  const rangeStartMs = startOfDay(rangeStart).getTime();
  const rangeEndMs = addDays(rangeEnd, 1).getTime();
  const stayStart = new Date(stayStartAt).getTime();
  const stayEnd = new Date(stayEndAt).getTime();

  return stayStart < rangeEndMs && stayEnd > rangeStartMs;
}

function formatDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function normalizeDateRange(startValue?: string | null, endValue?: string | null) {
  const today = startOfDay(new Date());
  const fallbackStart = parseDateKey(startValue) ?? parseDateKey(endValue) ?? today;
  const fallbackEnd = parseDateKey(endValue) ?? parseDateKey(startValue) ?? fallbackStart;
  const start = fallbackStart <= fallbackEnd ? fallbackStart : fallbackEnd;
  const end = fallbackStart <= fallbackEnd ? fallbackEnd : fallbackStart;

  return {
    end,
    start
  };
}

export default async function AdminRoomsRoute({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);
  const selectedRange = normalizeDateRange(resolvedSearchParams.start ?? resolvedSearchParams.date, resolvedSearchParams.end ?? resolvedSearchParams.date);
  const branches = await listBranches();
  const selectedBranch = branches.find((branch) => branch.id === resolvedSearchParams.branch) ?? branches[0] ?? null;
  const roomTypes = await listRoomTypes();
  const reservations = selectedBranch ? await listReservations({ branchId: selectedBranch.id, limit: 1000 }) : [];
  const [floors, rooms, reservationItems, roomHolds] = selectedBranch
    ? await Promise.all([
        listFloorsByBranchId(selectedBranch.id),
        listRoomsByBranchId(selectedBranch.id),
        listReservationRoomItems(),
        listRoomHolds({ branchId: selectedBranch.id, limit: 1000, status: ["active", "converted"] })
      ])
    : [[], [], [], []];
  const roomIdSet = new Set(rooms.map((room) => room.id));
  const customerRows = await listCustomersByIds(reservations.map((reservation) => reservation.customer_id));
  const customerMap = Object.fromEntries(customerRows.map((customer) => [customer.id, customer.full_name])) as Record<string, string>;
  const reservationRoomMap = reservationItems.reduce<Record<string, string>>((map, item) => {
    if (!map[item.reservation_id] && item.room_id) {
      map[item.reservation_id] = item.room_id;
    }

    return map;
  }, {});
  const bookedRoomIds = new Set(
    reservations
      .filter((reservation) => reservation.status !== "cancelled")
      .filter((reservation) => {
        const roomId = reservationRoomMap[reservation.id];

        return Boolean(roomId) && roomIdSet.has(roomId) && isStayWithinRange(reservation.stay_start_at, reservation.stay_end_at, selectedRange.start, selectedRange.end);
      })
      .map((reservation) => reservationRoomMap[reservation.id])
      .filter((roomId): roomId is string => typeof roomId === "string" && roomId.length > 0)
  );
  const heldRoomIds = new Set(
    roomHolds.filter((hold) => hold.room_id && isStayWithinRange(hold.stay_start_at, hold.stay_end_at, selectedRange.start, selectedRange.end)).map((hold) => hold.room_id)
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
  const selectedRoomBookings = selectedRoomId
    ? reservations
        .map((reservation) => {
          const roomId = reservationRoomMap[reservation.id];
          const room = roomId ? rooms.find((item) => item.id === roomId) ?? null : null;

          if (!roomId || roomId !== selectedRoomId) {
            return null;
          }

          if (reservation.status === "cancelled" || !isStayWithinRange(reservation.stay_start_at, reservation.stay_end_at, selectedRange.start, selectedRange.end)) {
            return null;
          }

          return {
            bookingCode: reservation.booking_code,
            customerName: customerMap[reservation.customer_id] ?? reservation.customer_id,
            id: reservation.id,
            roomCode: room?.code ?? null,
            stayEndAt: reservation.stay_end_at,
            stayStartAt: reservation.stay_start_at,
            status: reservation.status,
            totalAmount: reservation.total_amount
          };
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
        .sort((left, right) => {
          const startDiff = new Date(left.stayStartAt).getTime() - new Date(right.stayStartAt).getTime();

          if (startDiff !== 0) {
            return startDiff;
          }

          return new Date(left.stayEndAt).getTime() - new Date(right.stayEndAt).getTime();
        })
    : [];

  return (
    <AdminRoomsPage
      branchName={branchLabel}
      branchId={selectedBranch?.id ?? null}
      floorId={selectedFloorId}
      floors={floors}
      locale={locale}
      selectedEndDate={formatDateKey(selectedRange.end)}
      selectedStartDate={formatDateKey(selectedRange.start)}
      roomTypes={roomTypes}
      rooms={roomViews}
      selectedRoomId={selectedRoomId}
      roomBookings={selectedRoomBookings}
    />
  );
}
