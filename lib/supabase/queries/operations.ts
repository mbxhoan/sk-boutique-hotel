import type {
  BranchRow,
  FloorRow,
  PaymentProofRow,
  PaymentRequestRow,
  ReservationRoomItemRow,
  ReservationRow,
  RoomRow,
  RoomTypeRow
} from "@/lib/supabase/database.types";
import { listBranchBankAccounts } from "@/lib/supabase/queries/branch-bank-accounts";
import { listBranches } from "@/lib/supabase/queries/branches";
import { listCustomersByIds } from "@/lib/supabase/queries/customers";
import { listPaymentProofs } from "@/lib/supabase/queries/payment-proofs";
import { countPaymentRequests, listPaymentRequests } from "@/lib/supabase/queries/payment-requests";
import { listRoomTypes } from "@/lib/supabase/queries/room-types";
import { queryWithServiceFallback } from "@/lib/supabase/queries/shared";
import { countAuditLogs, listAuditLogs } from "@/lib/supabase/queries/audit-logs";
import { countAnalyticsEvents } from "@/lib/supabase/queries/analytics-events";
import { countAvailabilityRequests, getAvailabilityRequestById, listAvailabilityRequests } from "@/lib/supabase/queries/availability-requests";
import { findAvailableRooms } from "@/lib/supabase/queries/availability";
import { countRoomHolds, countExpiringRoomHolds, listRoomHolds } from "@/lib/supabase/queries/room-holds";
import { countReservations, listReservations } from "@/lib/supabase/queries/reservations";
import { buildPaymentUploadPath, buildVietQrImageUrl } from "@/lib/supabase/payments";
import { releaseExpiredHolds, releaseExpiredReservations } from "@/lib/supabase/workflows";
import type {
  WorkflowAvailabilityRequest,
  WorkflowAuditLog,
  WorkflowBranchBankAccountOption,
  WorkflowBranchOption,
  WorkflowDashboardData,
  WorkflowPaymentRequest,
  WorkflowReservation,
  WorkflowRoomHold,
  WorkflowRoomSuggestion,
  WorkflowRoomTypeOption,
  WorkflowSelection,
  WorkflowStatCard
} from "@/lib/supabase/workflow.types";

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
  reservationRoomItemMap: Record<string, string>,
  customerMap: Record<string, { email: string; full_name: string }>
): WorkflowReservation {
  const branch = branchMap[reservation.branch_id];
  const roomId = reservationRoomItemMap[reservation.id];
  const room = roomId ? roomMap[roomId] : null;
  const roomType = roomTypeMap[reservation.primary_room_type_id];
  const customer = customerMap[reservation.customer_id];

  return {
    ...reservation,
    branch_name_en: branch?.name_en ?? reservation.branch_id,
    branch_name_vi: branch?.name_vi ?? reservation.branch_id,
    customer_email: customer?.email ?? reservation.customer_id,
    customer_name: customer?.full_name ?? reservation.customer_id,
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

function toPaymentRequestView(
  request: Awaited<ReturnType<typeof listPaymentRequests>>[number],
  branchMap: Record<string, BranchRow>,
  roomTypeMap: Record<string, RoomTypeRow>,
  latestProofMap: Record<string, PaymentProofRow>,
  reservationMap: Record<string, ReservationRow>,
  customerMap: Record<string, { email: string; full_name: string }>
): WorkflowPaymentRequest {
  const branch = branchMap[request.branch_id];
  const reservation = reservationMap[request.reservation_id];
  const roomType = reservation ? roomTypeMap[reservation.primary_room_type_id] : null;
  const latestProof = latestProofMap[request.id] ?? null;
  const customer = customerMap[request.customer_id];

  return {
    ...request,
    branch_name_en: branch?.name_en ?? request.branch_id,
    branch_name_vi: branch?.name_vi ?? request.branch_id,
    customer_email: customer?.email ?? request.customer_id,
    customer_name: customer?.full_name ?? request.customer_id,
    latest_proof_file_name: latestProof?.file_name ?? null,
    latest_proof_file_path: latestProof?.file_path ?? null,
    latest_proof_id: latestProof?.id ?? null,
    latest_proof_review_note: latestProof?.review_note ?? null,
    latest_proof_status: latestProof?.status ?? null,
    latest_proof_url: null,
    latest_proof_uploaded_at: latestProof?.created_at ?? null,
    payment_upload_path: buildPaymentUploadPath(request),
    qr_image_url: buildVietQrImageUrl(request),
    reservation_booking_code: reservation?.booking_code ?? request.reservation_id,
    reservation_room_code: reservation?.booking_code ?? request.reservation_id,
    room_type_name_en: roomType?.name_en ?? null,
    room_type_name_vi: roomType?.name_vi ?? null
  };
}

function toPaymentProofView(
  proof: PaymentProofRow,
  branchMap: Record<string, BranchRow>,
  paymentRequestMap: Record<string, PaymentRequestRow>,
  reservationMap: Record<string, ReservationRow>
) {
  const paymentRequest = paymentRequestMap[proof.payment_request_id];
  const reservation = paymentRequest ? reservationMap[paymentRequest.reservation_id] : null;
  const branch = paymentRequest ? branchMap[paymentRequest.branch_id] : null;

  return {
    ...proof,
    branch_name_en: branch?.name_en ?? paymentRequest?.branch_id ?? proof.customer_id,
    branch_name_vi: branch?.name_vi ?? paymentRequest?.branch_id ?? proof.customer_id,
    payment_code: paymentRequest?.payment_code ?? proof.payment_request_id,
    reservation_booking_code: reservation?.booking_code ?? paymentRequest?.reservation_id ?? proof.payment_request_id,
    reservation_room_code: reservation?.booking_code ?? paymentRequest?.reservation_id ?? proof.payment_request_id
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

async function listActiveRooms(branchId?: string) {
  return queryWithServiceFallback(
    async (client) => {
      let query = client.from("rooms").select(roomSelect).eq("is_active", true);

      if (branchId) {
        query = query.eq("branch_id", branchId);
      }

      const { data, error } = await query.order("code", { ascending: true });

      if (error) {
        throw error;
      }

      return (data ?? []) as RoomRow[];
    },
    [] as RoomRow[]
  );
}

async function listActiveFloors(branchId?: string) {
  return queryWithServiceFallback(
    async (client) => {
      let query = client.from("floors").select(floorSelect).eq("is_active", true);

      if (branchId) {
        query = query.eq("branch_id", branchId);
      }

      const { data, error } = await query.order("branch_id", { ascending: true }).order("level_number", { ascending: true });

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

function getDashboardWindowSince(range: WorkflowSelection["range"]) {
  if (range === "7d") {
    return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  }

  if (range === "30d") {
    return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  }

  return getVietnamStartOfDayIso();
}

export async function loadAdminWorkflowDashboard(selection: WorkflowSelection = {}): Promise<WorkflowDashboardData> {
  const releaseResults = await Promise.allSettled([releaseExpiredHolds(), releaseExpiredReservations()]);

  if (releaseResults.some((result) => result.status === "rejected")) {
    console.warn("[workflow] Failed to release expired holds/reservations before loading admin dashboard", {
      holds: releaseResults[0].status === "fulfilled",
      reservations: releaseResults[1].status === "fulfilled"
    });
  }

  const dashboardWindowSince = getDashboardWindowSince(selection.range);
  const branchFilterId = selection.branchId ?? undefined;
  const [branches, roomTypes, rooms, floors, reservationRoomItems, requests, holds, reservations, auditLogs, bankAccounts, paymentRequests, paymentProofs] = await Promise.all([
    listBranches(),
    listRoomTypes(),
    listActiveRooms(branchFilterId),
    listActiveFloors(branchFilterId),
    listReservationRoomItems(),
    listAvailabilityRequests({ branchId: branchFilterId, limit: 8 }),
    listRoomHolds({ branchId: branchFilterId, limit: 8, status: ["active", "converted", "expired"] }),
    listReservations({ branchId: branchFilterId, limit: 200, since: dashboardWindowSince }),
    listAuditLogs({ branchId: branchFilterId, limit: 10, since: dashboardWindowSince }),
    listBranchBankAccounts({ branchId: branchFilterId, limit: 20 }),
    listPaymentRequests({ branchId: branchFilterId, limit: 12 }),
    listPaymentProofs({ limit: 20 })
  ]);

  const branchMap = buildMap(branches);
  const roomTypeMap = buildMap(roomTypes);
  const roomMap = buildMap(rooms);
  const floorMap = buildMap(floors);
  const reservationMap = buildMap(reservations);
  const reservationRoomItemMap = Object.fromEntries(
    reservationRoomItems
      .filter((item) => Boolean(item.reservation_id) && Boolean(item.room_id))
      .map((item) => [item.reservation_id, item.room_id])
  ) as Record<string, string>;
  const latestPaymentProofMap = Object.fromEntries(
    paymentProofs
      .filter((proof) => Boolean(proof.payment_request_id))
      .reduce((map, proof) => {
        if (!map.has(proof.payment_request_id)) {
          map.set(proof.payment_request_id, proof);
        }
        return map;
      }, new Map<string, PaymentProofRow>())
      .values()
      .map((proof) => [proof.payment_request_id, proof] as const)
  ) as Record<string, PaymentProofRow>;
  const customerRows = await listCustomersByIds([
    ...paymentRequests.map((request) => request.customer_id),
    ...reservations.map((reservation) => reservation.customer_id)
  ]);
  const customerMap = Object.fromEntries(
    customerRows.map((customer) => [customer.id, { email: customer.email, full_name: customer.full_name }])
  ) as Record<string, { email: string; full_name: string }>;

  const availabilityRequests = requests.map((request) => toAvailabilityRequestView(request, branchMap, roomTypeMap));
  const activeRoomHolds = holds.map((hold) => toRoomHoldView(hold, branchMap, roomMap, roomTypeMap));
  const recentReservations = reservations.map((reservation) =>
    toReservationView(reservation, branchMap, roomMap, roomTypeMap, reservationRoomItemMap, customerMap)
  );
  const recentAuditLogs = auditLogs.map((log) => toAuditLogView(log, branchMap));
  const branchBankAccountOptions = bankAccounts.map((account) => ({
    ...account,
    branch_name_en: branchMap[account.branch_id]?.name_en ?? account.branch_id,
    branch_name_vi: branchMap[account.branch_id]?.name_vi ?? account.branch_id
  }));
  const paymentRequestViews = paymentRequests.map((request) =>
    toPaymentRequestView(request, branchMap, roomTypeMap, latestPaymentProofMap, reservationMap, customerMap)
  );

  const explicitSelectionContext =
    selection.branchId && selection.roomTypeId && selection.stayStartAt && selection.stayEndAt
      ? {
          branchId: selection.branchId,
          roomTypeId: selection.roomTypeId,
          stayEndAt: selection.stayEndAt,
          stayStartAt: selection.stayStartAt
        }
      : null;

  const selectedRequest = selection.requestId
    ? availabilityRequests.find((request) => request.id === selection.requestId) ??
      (await getAvailabilityRequestById(selection.requestId).then((row) =>
        row ? toAvailabilityRequestView(row, branchMap, roomTypeMap) : null
      )) ??
      (explicitSelectionContext ? null : availabilityRequests[0] ?? null)
    : explicitSelectionContext
      ? null
      : availabilityRequests[0] ?? null;

  const selectedContext = selectedRequest
    ? {
        branchId: selectedRequest.branch_id,
        roomTypeId: selectedRequest.room_type_id,
        stayEndAt: selectedRequest.stay_end_at,
        stayStartAt: selectedRequest.stay_start_at
      }
    : explicitSelectionContext;

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
    branchId: branchFilterId,
    status: ["new", "in_review", "quoted"]
  });
  const activeHoldCount = await countRoomHolds({ branchId: branchFilterId, status: "active" });
  const expiringHoldCount = await countExpiringRoomHolds(30, branchFilterId);
  const pendingReservationCount = await countReservations({ branchId: branchFilterId, since: dashboardWindowSince, status: ["draft", "pending_deposit"] });
  const pendingPaymentCount = await countPaymentRequests({ branchId: branchFilterId, status: ["sent", "pending_verification"] });
  const verifiedPaymentCount = await countPaymentRequests({ branchId: branchFilterId, status: "verified" });
  const auditWindowCount = await countAuditLogs({ branchId: branchFilterId, since: dashboardWindowSince });
  const analyticsWindowSince = dashboardWindowSince;
  const pageViewCount = await countAnalyticsEvents({ branchId: branchFilterId, eventType: "page_view", since: analyticsWindowSince });
  const roomViewCount = await countAnalyticsEvents({ branchId: branchFilterId, eventType: "room_view", since: analyticsWindowSince });
  const branchViewCount = await countAnalyticsEvents({ branchId: branchFilterId, eventType: "branch_view", since: analyticsWindowSince });
  const ctaClickCount = await countAnalyticsEvents({ branchId: branchFilterId, eventType: "cta_click", since: analyticsWindowSince });

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
      detail_en: "Draft and pending deposit reservations in the selected period.",
      detail_vi: "Reservation bản nháp hoặc chờ deposit trong khoảng đã chọn.",
      label_en: "Pending reservations",
      label_vi: "Reservation chờ",
      tone: "soft",
      value: `${pendingReservationCount}`
    },
    {
      detail_en: "Deposit requests waiting for manual verification in the selected period.",
      detail_vi: "Payment request chờ verify trong khoảng đã chọn.",
      label_en: "Payment pending",
      label_vi: "Chờ payment",
      tone: "default",
      value: `${pendingPaymentCount}`
    },
    {
      detail_en: "Confirmed payments processed in the selected period.",
      detail_vi: "Payment đã xác nhận trong khoảng đã chọn.",
      label_en: "Verified payments",
      label_vi: "Payment đã duyệt",
      tone: "accent",
      value: `${verifiedPaymentCount}`
    },
    {
      detail_en: "Audit entries created in the selected period.",
      detail_vi: "Audit entry trong khoảng đã chọn.",
      label_en: "Audit entries",
      label_vi: "Nhật ký audit",
      tone: "default",
      value: `${auditWindowCount}`
    },
    {
      detail_en: "Public page views tracked in the selected period.",
      detail_vi: "Lượt xem public page trong khoảng đã chọn.",
      label_en: "Page views",
      label_vi: "Lượt xem",
      tone: "soft",
      value: `${pageViewCount}`
    },
    {
      detail_en: "Room detail interest tracked in the selected period.",
      detail_vi: "Lượt xem chi tiết phòng trong khoảng đã chọn.",
      label_en: "Room views",
      label_vi: "Xem phòng",
      tone: "accent",
      value: `${roomViewCount}`
    },
    {
      detail_en: "Branch interest tracked in the selected period.",
      detail_vi: "Lượt xem chi nhánh trong khoảng đã chọn.",
      label_en: "Branch views",
      label_vi: "Xem chi nhánh",
      tone: "soft",
      value: `${branchViewCount}`
    },
    {
      detail_en: "Tracked CTA clicks in the selected period.",
      detail_vi: "Số click CTA trong khoảng đã chọn.",
      label_en: "CTA clicks",
      label_vi: "CTA click",
      tone: "default",
      value: `${ctaClickCount}`
    }
  ];

  return {
    active_room_holds: activeRoomHolds,
    availability_requests: availabilityRequests,
    audit_logs: recentAuditLogs,
    branch_options: branches,
    branch_bank_account_options: branchBankAccountOptions,
    payment_requests: paymentRequestViews,
    recent_reservations: recentReservations,
    room_suggestions: suggestions,
    room_type_options: roomTypes,
    selected_request: selectedRequest,
    selected_request_context: selectedContext,
    stats
  };
}
