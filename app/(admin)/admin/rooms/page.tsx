import type { Metadata } from "next";

import { AdminRoomsPage } from "@/components/admin-rooms-page";
import { resolveLocale } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";
import {
  addHotelDays,
  buildAvailableDateWindows,
  buildDayRangeTimestamps,
  getTodayHotelDateKey,
  normalizeDateWindow,
  ROOM_STATUS_LOOKAHEAD_DAYS,
  timestampWindowToDateWindow,
  type RoomDateWindow,
  type RoomOperationalOverrideStatus
} from "@/lib/rooms/operational-status";
import { listBranches } from "@/lib/supabase/queries/branches";
import { listCustomersByIds } from "@/lib/supabase/queries/customers";
import { listFloorsByBranchId } from "@/lib/supabase/queries/floors";
import { listReservationRoomItems } from "@/lib/supabase/queries/reservation-room-items";
import { listRoomHolds } from "@/lib/supabase/queries/room-holds";
import { listRoomStatusOverrides } from "@/lib/supabase/queries/room-status-overrides";
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

function isTimestampWindowOverlapping(stayStartAt: string, stayEndAt: string, rangeStartAt: string, rangeEndAt: string) {
  const rangeStartMs = new Date(rangeStartAt).getTime();
  const rangeEndMs = new Date(rangeEndAt).getTime();
  const stayStart = new Date(stayStartAt).getTime();
  const stayEnd = new Date(stayEndAt).getTime();

  return stayStart < rangeEndMs && stayEnd > rangeStartMs;
}

function pickDisplayOverride(
  overrides: Array<{
    end_at: string;
    start_at: string;
    status: RoomOperationalOverrideStatus;
  }>,
  rangeStartAt: string,
  rangeEndAt: string
) {
  const overlapping = overrides.filter((override) => isTimestampWindowOverlapping(override.start_at, override.end_at, rangeStartAt, rangeEndAt));

  if (!overlapping.length) {
    return null;
  }

  const selectedStartMs = new Date(rangeStartAt).getTime();
  const currentOverride =
    overlapping.find((override) => {
      const startMs = new Date(override.start_at).getTime();
      const endMs = new Date(override.end_at).getTime();

      return startMs <= selectedStartMs && endMs > selectedStartMs;
    }) ?? null;

  if (currentOverride) {
    return currentOverride;
  }

  return [...overlapping].sort((left, right) => new Date(left.start_at).getTime() - new Date(right.start_at).getTime())[0] ?? null;
}

export default async function AdminRoomsRoute({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);
  const selectedRange = normalizeDateWindow(resolvedSearchParams.start ?? resolvedSearchParams.date, resolvedSearchParams.end ?? resolvedSearchParams.date);
  const selectedRangeTimestamps = buildDayRangeTimestamps(selectedRange.startDate, selectedRange.endDate);

  if (!selectedRangeTimestamps) {
    throw new Error("Selected room date range is invalid.");
  }

  const branches = await listBranches();
  const selectedBranch = branches.find((branch) => branch.id === resolvedSearchParams.branch) ?? branches[0] ?? null;
  const roomTypes = await listRoomTypes();
  const reservations = selectedBranch ? await listReservations({ branchId: selectedBranch.id, limit: 1000 }) : [];
  const todayDate = getTodayHotelDateKey();
  const modalMinDate = selectedRange.startDate < todayDate ? todayDate : selectedRange.startDate;
  const modalMaxDate = addHotelDays(modalMinDate, ROOM_STATUS_LOOKAHEAD_DAYS) ?? modalMinDate;
  const fetchWindowStartDate = selectedRange.startDate < modalMinDate ? selectedRange.startDate : modalMinDate;
  const fetchWindowEndDate = selectedRange.endDate > modalMaxDate ? selectedRange.endDate : modalMaxDate;
  const fetchWindowTimestamps = buildDayRangeTimestamps(fetchWindowStartDate, fetchWindowEndDate);
  const [floors, rooms, reservationItems, roomHolds, roomStatusOverrides] = selectedBranch
    ? await Promise.all([
        listFloorsByBranchId(selectedBranch.id),
        listRoomsByBranchId(selectedBranch.id),
        listReservationRoomItems(),
        listRoomHolds({ branchId: selectedBranch.id, limit: 1000, status: ["active", "converted"] }),
        fetchWindowTimestamps
          ? listRoomStatusOverrides({
              branchId: selectedBranch.id,
              limit: 1000,
              windowEndAt: fetchWindowTimestamps.endAt,
              windowStartAt: fetchWindowTimestamps.startAt
            })
          : Promise.resolve([] as Awaited<ReturnType<typeof listRoomStatusOverrides>>)
      ])
    : [[], [], [], [], []];
  const roomIdSet = new Set(rooms.map((room) => room.id));
  const customerRows = await listCustomersByIds(reservations.map((reservation) => reservation.customer_id));
  const customerMap = Object.fromEntries(customerRows.map((customer) => [customer.id, customer.full_name])) as Record<string, string>;
  const reservationRoomMap = reservationItems.reduce<Record<string, string>>((map, item) => {
    if (!map[item.reservation_id] && item.room_id) {
      map[item.reservation_id] = item.room_id;
    }

    return map;
  }, {});
  const roomStatusOverridesByRoomId = roomStatusOverrides.reduce<Record<string, typeof roomStatusOverrides>>((map, override) => {
    const existing = map[override.room_id] ?? [];
    existing.push(override);
    map[override.room_id] = existing;

    return map;
  }, {});
  const bookedRoomIds = new Set(
    reservations
      .filter((reservation) => reservation.status !== "cancelled")
      .filter((reservation) => {
        const roomId = reservationRoomMap[reservation.id];

        return (
          Boolean(roomId) &&
          roomIdSet.has(roomId) &&
          isTimestampWindowOverlapping(reservation.stay_start_at, reservation.stay_end_at, selectedRangeTimestamps.startAt, selectedRangeTimestamps.endAt)
        );
      })
      .map((reservation) => reservationRoomMap[reservation.id])
      .filter((roomId): roomId is string => typeof roomId === "string" && roomId.length > 0)
  );
  const heldRoomIds = new Set(
    roomHolds
      .filter(
        (hold) =>
          hold.room_id &&
          isTimestampWindowOverlapping(hold.stay_start_at, hold.stay_end_at, selectedRangeTimestamps.startAt, selectedRangeTimestamps.endAt)
      )
      .map((hold) => hold.room_id)
  );
  const roomViews = rooms.map((room) => {
    const floor = floors.find((item) => item.id === room.floor_id) ?? null;
    const roomType = roomTypes.find((item) => item.id === room.room_type_id) ?? null;
    const displayOverride = pickDisplayOverride(
      (roomStatusOverridesByRoomId[room.id] ?? []).map((override) => ({
        end_at: override.end_at,
        start_at: override.start_at,
        status: override.status
      })),
      selectedRangeTimestamps.startAt,
      selectedRangeTimestamps.endAt
    );
    const derivedStatus =
      room.status === "maintenance"
        ? ("maintenance" as const)
        : room.status === "blocked"
          ? ("blocked" as const)
          : displayOverride?.status === "maintenance"
            ? ("maintenance" as const)
          : bookedRoomIds.has(room.id)
            ? ("occupied" as const)
            : displayOverride?.status === "occupied"
              ? ("occupied" as const)
            : heldRoomIds.has(room.id) || room.status === "held"
              ? ("blocked" as const)
              : displayOverride?.status === "cleaning"
                ? ("cleaning" as const)
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
  const selectedRoomStatusSchedules = (selectedRoomId ? roomStatusOverridesByRoomId[selectedRoomId] ?? [] : [])
    .map((override) => {
      const dateWindow = timestampWindowToDateWindow(override.start_at, override.end_at);

      if (!dateWindow) {
        return null;
      }

      return {
        endDate: dateWindow.endDate,
        id: override.id,
        note: override.note,
        startDate: dateWindow.startDate,
        status: override.status
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .sort((left, right) => left.startDate.localeCompare(right.startDate));
  const selectedRoomBlockingWindows: RoomDateWindow[] = [];

  if (selectedRoomId) {
    for (const reservation of reservations) {
      if (reservation.status === "cancelled") {
        continue;
      }

      if (reservationRoomMap[reservation.id] !== selectedRoomId) {
        continue;
      }

      const window = timestampWindowToDateWindow(reservation.stay_start_at, reservation.stay_end_at);

      if (window) {
        selectedRoomBlockingWindows.push(window);
      }
    }

    for (const hold of roomHolds) {
      if (hold.room_id !== selectedRoomId || hold.status !== "active") {
        continue;
      }

      const window = timestampWindowToDateWindow(hold.stay_start_at, hold.stay_end_at);

      if (window) {
        selectedRoomBlockingWindows.push(window);
      }
    }

    for (const override of roomStatusOverridesByRoomId[selectedRoomId] ?? []) {
      const window = timestampWindowToDateWindow(override.start_at, override.end_at);

      if (window) {
        selectedRoomBlockingWindows.push(window);
      }
    }
  }

  const statusAssignmentWindows = buildAvailableDateWindows({
    blockedWindows: selectedRoomBlockingWindows,
    maxDate: modalMaxDate,
    minDate: modalMinDate
  });
  const statusClearWindows = selectedRoomStatusSchedules.map((schedule) => ({
    endDate: schedule.endDate,
    startDate: schedule.startDate
  }));
  const selectedRoomBookings = selectedRoomId
    ? reservations
        .map((reservation) => {
          const roomId = reservationRoomMap[reservation.id];
          const room = roomId ? rooms.find((item) => item.id === roomId) ?? null : null;

          if (!roomId || roomId !== selectedRoomId) {
            return null;
          }

          if (
            reservation.status === "cancelled" ||
            !isTimestampWindowOverlapping(reservation.stay_start_at, reservation.stay_end_at, selectedRangeTimestamps.startAt, selectedRangeTimestamps.endAt)
          ) {
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
      selectedEndDate={selectedRange.endDate}
      selectedStartDate={selectedRange.startDate}
      selectedRoomStatusSchedules={selectedRoomStatusSchedules}
      roomTypes={roomTypes}
      rooms={roomViews}
      selectedRoomId={selectedRoomId}
      statusAssignmentWindows={statusAssignmentWindows}
      statusClearWindows={statusClearWindows}
      roomBookings={selectedRoomBookings}
    />
  );
}
