import type { BranchRow, FloorRow, ReservationRoomItemRow, RoomRow, RoomTypeRow } from "@/lib/supabase/database.types";
import { listBranches } from "@/lib/supabase/queries/branches";
import { listRoomTypes } from "@/lib/supabase/queries/room-types";
import { queryWithServiceFallback } from "@/lib/supabase/queries/shared";
import { countAuditLogs, listAuditLogs } from "@/lib/supabase/queries/audit-logs";
import { countAvailabilityRequests, getAvailabilityRequestById, listAvailabilityRequests } from "@/lib/supabase/queries/availability-requests";
import { findAvailableRooms } from "@/lib/supabase/queries/availability";
import { countRoomHolds, countExpiringRoomHolds, listRoomHolds } from "@/lib/supabase/queries/room-holds";
import { countReservations, listReservations } from "@/lib/supabase/queries/reservations";
import type { WorkflowAvailabilityRequest, WorkflowAuditLog, WorkflowBranchOption, WorkflowDashboardData, WorkflowReservation, WorkflowRoomHold, WorkflowRoomSuggestion, WorkflowRoomTypeOption, WorkflowSelection, WorkflowStatCard } from "@/lib/supabase/workflow.types";

const roomSelect = `
  id, branch_id, floor_id, room_type_id, code, notes_vi, notes_en, status, is_active, created_at, updated_at
`;

const floorSelect = `
  id, branch_id, code, level_number, name_vi, name_en, notes_vi, notes_en, sort_order, is_active, created_at, updated_at
`;

const reservationRoomItemSelect = `
  reservation_id, room_id
`;

function buildMap<T extends { id: string }>(items: T[]) {
  return Object.fromEntries(items.map((item) => [item.id, item])) as Record<string, T>;
}

function labelForEntity(entityType: string) {
  switch (entityType) {
    case "availability_request":
      return {
        vi: "Yêu cầu availability",
        en: "Availability request"
      };
    case "room_hold":
      return {
        vi: "Hold phòng",
        en: "Room hold"
      };
    case "reservation":
      return {
        vi: "Đặt phòng",
        en: "Reservation"
      };
    default:
      return {
        vi: entityType,
        en: entityType
      };
  }
}

function toAvailabilityRequestView(
  request: Awaited<ReturnType<typeof listAvailabilityRequests>>[number],
  branchMap: Record<string, BranchRow>,
  roomTypeMap: Record<string, RoomTypeRow>
): WorkflowAvailabilityRequest {
  const branch = branchMap[request.branch_id];
  const roomType = roomTypeMap[request.room_type_id];

  return {
    ...request,
    branch_name_en: branch?.name_en ?? request.branch_id,
    branch_name_vi: branch?.name_vi ?? request.branch_id,
    room_type_name_en: roomType?.name_en ?? request.room_type_id,
    room_type_name_vi: roomType?.name_vi ?? request.room_type_id
  };
}

function toRoomHoldView(
  hold: Awaited<ReturnType<typeof listRoomHolds>>[number],
  branchMap: Record<string, BranchRow>,
  roomMap: Record<string, RoomRow>,
  roomTypeMap: Record<string, RoomTypeRow>
): WorkflowRoomHold {
  const branch = branchMap[hold.branch_id];
  const room = roomMap[hold.room_id];
  const roomType = roomTypeMap[hold.room_type_id];

  return {
    ...hold,
    branch_name_en: branch?.name_en ?? hold.branch_id,
    branch_name_vi: branch?.name_vi ?? hold.branch_id,
    room_code: room?.code ?? hold.room_id,
    room_type_name_en: roomType?.name_en ?? hold.room_type_id,
    room_type_name_vi: roomType?.name_vi ?? hold.room_type_id
  };
}

function toReservationView(
  reservation: Awaited<ReturnType<typeof listReservations>>[number],
  branchMap: Record<string, BranchRow>,
  roomMap: Record<string, RoomRow>,
  roomTypeMap: Record<string, RoomTypeRow>,
  reservationRoomItemMap: Record<string, string>
): WorkflowReservation {
  const branch = branchMap[reservation.branch_id];
  const roomId = reservationRoomItemMap[reservation.id];
  const room = roomId ? roomMap[roomId] : null;
  const roomType = roomTypeMap[reservation.primary_room_type_id];

  return {
    ...reservation,
    branch_name_en: branch?.name_en ?? reservation.branch_id,
    branch_name_vi: branch?.name_vi ?? reservation.branch_id,
    primary_room_type_name_en: roomType?.name_en ?? reservation.primary_room_type_id,
    primary_room_type_name_vi: roomType?.name_vi ?? reservation.primary_room_type_id,
    room_code: room?.code ?? reservation.id
  };
}

function toAuditLogView(
  log: Awaited<ReturnType<typeof listAuditLogs>>[number],
  branchMap: Record<string, BranchRow>
): WorkflowAuditLog {
  const branch = log.branch_id ? branchMap[log.branch_id] : null;
  const entityLabel = labelForEntity(log.entity_type);

  return {
    ...log,
    branch_name_en: branch?.name_en ?? null,
    branch_name_vi: branch?.name_vi ?? null,
    entity_label_en: entityLabel.en,
    entity_label_vi: entityLabel.vi
  };
}

function toSuggestionView(
  room: RoomRow,
  branchMap: Record<string, BranchRow>,
  roomTypeMap: Record<string, RoomTypeRow>,
  floorMap: Record<string, FloorRow>
): WorkflowRoomSuggestion {
  const branch = branchMap[room.branch_id];
  const roomType = roomTypeMap[room.room_type_id];
  const floor = floorMap[room.floor_id];

  return {
    ...room,
    branch_name_en: branch?.name_en ?? room.branch_id,
    branch_name_vi: branch?.name_vi ?? room.branch_id,
    room_type_name_en: roomType?.name_en ?? room.room_type_id,
    room_type_name_vi: roomType?.name_vi ?? room.room_type_id,
    floor_code: floor?.code ?? null,
    floor_name_en: floor?.name_en ?? null,
    floor_name_vi: floor?.name_vi ?? null
  };
}

async function listActiveRooms() {
  return queryWithServiceFallback(
    async (client) => {
      const { data, error } = await client
        .from("rooms")
        .select(roomSelect)
        .eq("is_active", true)
        .order("code", { ascending: true });

      if (error) {
        throw error;
      }

      return (data ?? []) as RoomRow[];
    },
    [] as RoomRow[]
  );
}

async function listActiveFloors() {
  return queryWithServiceFallback(
    async (client) => {
      const { data, error } = await client
        .from("floors")
        .select(floorSelect)
        .eq("is_active", true)
        .order("branch_id", { ascending: true })
        .order("level_number", { ascending: true });

      if (error) {
        throw error;
      }

      return (data ?? []) as FloorRow[];
    },
    [] as FloorRow[]
  );
}

async function listReservationRoomItems() {
  return queryWithServiceFallback(
    async (client) => {
      const { data, error } = await client
        .from("reservation_room_items")
        .select(reservationRoomItemSelect)
        .eq("status", "active")
        .order("reservation_id", { ascending: true });

      if (error) {
        throw error;
      }

      return (data ?? []) as Pick<ReservationRoomItemRow, "reservation_id" | "room_id">[];
    },
    [] as Pick<ReservationRoomItemRow, "reservation_id" | "room_id">[]
  );
}

function getVietnamStartOfDayIso(date = new Date()) {
  const offsetMs = 7 * 60 * 60 * 1000;
  const localDate = new Date(date.getTime() + offsetMs);
  const startUtc = Date.UTC(localDate.getUTCFullYear(), localDate.getUTCMonth(), localDate.getUTCDate()) - offsetMs;
  return new Date(startUtc).toISOString();
}

export async function loadAdminWorkflowDashboard(selection: WorkflowSelection = {}): Promise<WorkflowDashboardData> {
  const [branches, roomTypes, rooms, floors, reservationRoomItems, requests, holds, reservations, auditLogs] = await Promise.all([
    listBranches(),
    listRoomTypes(),
    listActiveRooms(),
    listActiveFloors(),
    listReservationRoomItems(),
    listAvailabilityRequests({ limit: 8 }),
    listRoomHolds({ limit: 8, status: ["active", "converted", "expired"] }),
    listReservations({ limit: 8 }),
    listAuditLogs({ limit: 10, since: getVietnamStartOfDayIso() })
  ]);

  const branchMap = buildMap(branches);
  const roomTypeMap = buildMap(roomTypes);
  const roomMap = buildMap(rooms);
  const floorMap = buildMap(floors);
  const reservationRoomItemMap = Object.fromEntries(
    reservationRoomItems
      .filter((item) => Boolean(item.reservation_id) && Boolean(item.room_id))
      .map((item) => [item.reservation_id, item.room_id])
  ) as Record<string, string>;

  const availabilityRequests = requests.map((request) => toAvailabilityRequestView(request, branchMap, roomTypeMap));
  const activeRoomHolds = holds.map((hold) => toRoomHoldView(hold, branchMap, roomMap, roomTypeMap));
  const recentReservations = reservations.map((reservation) =>
    toReservationView(reservation, branchMap, roomMap, roomTypeMap, reservationRoomItemMap)
  );
  const recentAuditLogs = auditLogs.map((log) => toAuditLogView(log, branchMap));

  const selectedRequest = selection.requestId
    ? availabilityRequests.find((request) => request.id === selection.requestId) ??
      (await getAvailabilityRequestById(selection.requestId).then((row) =>
        row ? toAvailabilityRequestView(row, branchMap, roomTypeMap) : null
      )) ??
      null
    : null;

  const selectedContext = selectedRequest
    ? {
        branchId: selectedRequest.branch_id,
        roomTypeId: selectedRequest.room_type_id,
        stayEndAt: selectedRequest.stay_end_at,
        stayStartAt: selectedRequest.stay_start_at
      }
    : selection.branchId && selection.roomTypeId && selection.stayStartAt && selection.stayEndAt
      ? {
          branchId: selection.branchId,
          roomTypeId: selection.roomTypeId,
          stayEndAt: selection.stayEndAt,
          stayStartAt: selection.stayStartAt
        }
      : null;

  const suggestions = selectedContext
    ? (await findAvailableRooms({
        branchId: selectedContext.branchId,
        limit: selection.limit ?? 6,
        roomTypeId: selectedContext.roomTypeId,
        stayEndAt: selectedContext.stayEndAt,
        stayStartAt: selectedContext.stayStartAt
      })).map((room) => toSuggestionView(room, branchMap, roomTypeMap, floorMap))
    : [];

  const openRequestCount = await countAvailabilityRequests({
    status: ["new", "in_review", "quoted"]
  });
  const activeHoldCount = await countRoomHolds({ status: "active" });
  const expiringHoldCount = await countExpiringRoomHolds(30);
  const pendingReservationCount = await countReservations({ status: ["draft", "pending_deposit"] });
  const auditTodayCount = await countAuditLogs({ since: getVietnamStartOfDayIso() });

  const stats: WorkflowStatCard[] = [
    {
      detail_en: "Availability requests waiting for staff review.",
      detail_vi: "Yêu cầu availability đang chờ staff xử lý.",
      label_en: "Open requests",
      label_vi: "Request mở",
      tone: "default",
      value: `${openRequestCount}`
    },
    {
      detail_en: "Rooms that are currently held.",
      detail_vi: "Phòng đang ở trạng thái hold.",
      label_en: "Active holds",
      label_vi: "Hold đang mở",
      tone: "soft",
      value: `${activeHoldCount}`
    },
    {
      detail_en: "Holds expiring within the next 30 minutes.",
      detail_vi: "Hold sắp hết hạn trong 30 phút tới.",
      label_en: "Expiring holds",
      label_vi: "Hold sắp hết",
      tone: "accent",
      value: `${expiringHoldCount}`
    },
    {
      detail_en: "Draft and pending deposit reservations.",
      detail_vi: "Reservation bản nháp hoặc chờ deposit.",
      label_en: "Pending reservations",
      label_vi: "Reservation chờ",
      tone: "soft",
      value: `${pendingReservationCount}`
    },
    {
      detail_en: "Audit entries created today.",
      detail_vi: "Audit entry trong ngày.",
      label_en: "Audit entries",
      label_vi: "Audit trong ngày",
      tone: "default",
      value: `${auditTodayCount}`
    }
  ];

  return {
    active_room_holds: activeRoomHolds,
    availability_requests: availabilityRequests,
    audit_logs: recentAuditLogs,
    branch_options: branches,
    recent_reservations: recentReservations,
    room_suggestions: suggestions,
    room_type_options: roomTypes,
    selected_request: selectedRequest,
    selected_request_context: selectedContext,
    stats
  };
}
