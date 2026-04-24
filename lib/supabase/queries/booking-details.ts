import type { CustomerRow } from "@/lib/supabase/database.types";
import { listBranchBankAccounts } from "@/lib/supabase/queries/branch-bank-accounts";
import { listBranches } from "@/lib/supabase/queries/branches";
import { getCustomerByEmail, listCustomersByIds } from "@/lib/supabase/queries/customers";
import { listAuditLogs } from "@/lib/supabase/queries/audit-logs";
import { findAvailableRooms } from "@/lib/supabase/queries/availability";
import { getAvailabilityRequestById, getAvailabilityRequestByRequestCode } from "@/lib/supabase/queries/availability-requests";
import { getLatestPaymentProofByRequestId } from "@/lib/supabase/queries/payment-proofs";
import { listPaymentRequests } from "@/lib/supabase/queries/payment-requests";
import { getPrimaryReservationRoomItemByReservationId } from "@/lib/supabase/queries/reservation-room-items";
import { getReservationByBookingCode, listReservations } from "@/lib/supabase/queries/reservations";
import { getRoomById } from "@/lib/supabase/queries/rooms";
import { listRoomHolds } from "@/lib/supabase/queries/room-holds";
import { listRoomTypes } from "@/lib/supabase/queries/room-types";
import { calculateDepositAmount, calculateRemainingBalance, calculateVerifiedDepositAmount, DEFAULT_BOOKING_DEPOSIT_PERCENT } from "@/lib/supabase/booking-finance";
import { buildPaymentUploadPath, buildVietQrImageUrl } from "@/lib/supabase/payments";
import { releaseExpiredHolds, releaseExpiredReservations } from "@/lib/supabase/workflows";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import type {
  BranchRow,
  PaymentProofRow,
  PaymentRequestRow,
  RoomRow,
  RoomTypeRow
} from "@/lib/supabase/database.types";
import type {
  WorkflowAvailabilityRequest,
  WorkflowAuditLog,
  WorkflowBranchBankAccountOption,
  WorkflowBranchOption,
  WorkflowBookingRow,
  WorkflowPaymentProof,
  WorkflowPaymentRequest,
  WorkflowReservation,
  WorkflowRoomHold,
  WorkflowRoomTypeOption
} from "@/lib/supabase/workflow.types";

function buildMap<T extends { id: string }>(items: T[]) {
  return Object.fromEntries(items.map((item) => [item.id, item])) as Record<string, T>;
}

function calculateNights(startAt: string, endAt: string) {
  const diffMs = new Date(endAt).getTime() - new Date(startAt).getTime();

  if (!Number.isFinite(diffMs) || diffMs <= 0) {
    return 1;
  }

  return Math.max(1, Math.round(diffMs / 86_400_000));
}

function estimateRequestTotal(request: Awaited<ReturnType<typeof getAvailabilityRequestByRequestCode>>, roomTypeMap: Record<string, RoomTypeRow>) {
  if (!request) {
    return 0;
  }

  if (request.quoted_total_amount != null) {
    return request.quoted_total_amount;
  }

  const roomType = roomTypeMap[request.room_type_id];

  if (!roomType) {
    return 0;
  }

  const nightlyRate = roomType.manual_override_price ?? roomType.base_price;
  const nights = calculateNights(request.stay_start_at, request.stay_end_at);

  return nightlyRate * nights + (roomType.weekend_surcharge ?? 0);
}

function mapReservation(
  reservation: Awaited<ReturnType<typeof getReservationByBookingCode>>,
  branchMap: Record<string, BranchRow>,
  customerMap: Record<string, CustomerRow>,
  roomCode: string | null,
  roomTypeMap: Record<string, RoomTypeRow>
): WorkflowReservation | null {
  if (!reservation) {
    return null;
  }

  const branch = branchMap[reservation.branch_id];
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
    room_code: roomCode ?? reservation.booking_code
  };
}

function mapAvailabilityRequest(
  request: Awaited<ReturnType<typeof getAvailabilityRequestByRequestCode>>,
  branchMap: Record<string, BranchRow>,
  roomTypeMap: Record<string, RoomTypeRow>
): WorkflowAvailabilityRequest | null {
  if (!request) {
    return null;
  }

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

function mapRoomHold(
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

function mapPaymentRequest(
  request: PaymentRequestRow,
  branchMap: Record<string, BranchRow>,
  reservationMap: Record<string, WorkflowReservation>,
  customerMap: Record<string, CustomerRow>,
  paymentProofMap: Record<string, PaymentProofRow>,
  roomTypeMap: Record<string, RoomTypeRow>
): WorkflowPaymentRequest {
  const branch = branchMap[request.branch_id];
  const reservation = reservationMap[request.reservation_id];
  const roomType = reservation ? roomTypeMap[reservation.primary_room_type_id] : null;
  const latestProof = paymentProofMap[request.id] ?? null;
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
    latest_proof_uploaded_at: latestProof?.created_at ?? null,
    latest_proof_url: null,
    payment_upload_path: buildPaymentUploadPath(request),
    qr_image_url: buildVietQrImageUrl(request),
    reservation_booking_code: reservation?.booking_code ?? request.reservation_id,
    reservation_room_code: reservation?.room_code ?? reservation?.booking_code ?? request.reservation_id,
    room_type_name_en: roomType?.name_en ?? null,
    room_type_name_vi: roomType?.name_vi ?? null
  };
}

function mapPaymentProof(
  proof: PaymentProofRow,
  branchMap: Record<string, BranchRow>,
  paymentRequestMap: Record<string, PaymentRequestRow>,
  reservationMap: Record<string, WorkflowReservation>
): WorkflowPaymentProof {
  const paymentRequest = paymentRequestMap[proof.payment_request_id];
  const reservation = paymentRequest ? reservationMap[paymentRequest.reservation_id] : null;
  const branch = paymentRequest ? branchMap[paymentRequest.branch_id] : null;

  return {
    ...proof,
    branch_name_en: branch?.name_en ?? paymentRequest?.branch_id ?? proof.customer_id,
    branch_name_vi: branch?.name_vi ?? paymentRequest?.branch_id ?? proof.customer_id,
    payment_code: paymentRequest?.payment_code ?? proof.payment_request_id,
    reservation_booking_code: reservation?.booking_code ?? paymentRequest?.reservation_id ?? proof.payment_request_id,
    reservation_room_code: reservation?.room_code ?? reservation?.booking_code ?? paymentRequest?.reservation_id ?? proof.payment_request_id
  };
}

function mapAuditLog(
  log: Awaited<ReturnType<typeof listAuditLogs>>[number],
  branchMap: Record<string, BranchRow>
): WorkflowAuditLog {
  const branch = log.branch_id ? branchMap[log.branch_id] : null;
  const entityLabels = {
    availability_request: { en: "Availability request", vi: "Yêu cầu đặt phòng" },
    payment_request: { en: "Payment request", vi: "Yêu cầu cọc" },
    reservation: { en: "Reservation", vi: "Reservation" },
    room_hold: { en: "Room hold", vi: "Hold phòng" }
  } as const;

  const entityLabel = entityLabels[log.entity_type as keyof typeof entityLabels] ?? {
    en: log.entity_type,
    vi: log.entity_type
  };

  return {
    ...log,
    branch_name_en: branch?.name_en ?? null,
    branch_name_vi: branch?.name_vi ?? null,
    entity_label_en: entityLabel.en,
    entity_label_vi: entityLabel.vi
  };
}

function mapRoomSuggestion(
  room: RoomRow,
  branchMap: Record<string, BranchRow>,
  roomTypeMap: Record<string, RoomTypeRow>
) {
  const branch = branchMap[room.branch_id];
  const roomType = roomTypeMap[room.room_type_id];

  return {
    ...room,
    branch_name_en: branch?.name_en ?? room.branch_id,
    branch_name_vi: branch?.name_vi ?? room.branch_id,
    room_type_name_en: roomType?.name_en ?? room.room_type_id,
    room_type_name_vi: roomType?.name_vi ?? room.room_type_id
  };
}

export type BookingDetailRoomSuggestion = ReturnType<typeof mapRoomSuggestion>;

export type BookingDetailFinancialSummary = {
  active_payment_request_id: string | null;
  default_deposit_amount: number;
  default_deposit_percentage: number;
  pending_deposit_amount: number;
  remaining_balance_amount: number;
  requested_deposit_amount: number;
  total_amount: number;
  verified_deposit_amount: number;
};

export type BookingDetailData = {
  audit_logs: WorkflowAuditLog[];
  branch_bank_accounts: WorkflowBranchBankAccountOption[];
  branch_options: WorkflowBranchOption[];
  booking: WorkflowBookingRow;
  customer: CustomerRow | null;
  financial_summary: BookingDetailFinancialSummary;
  payment_proofs: WorkflowPaymentProof[];
  payment_requests: WorkflowPaymentRequest[];
  request: WorkflowAvailabilityRequest | null;
  reservation: WorkflowReservation | null;
  room_code: string | null;
  room_holds: WorkflowRoomHold[];
  room_suggestions: BookingDetailRoomSuggestion[];
  room_type: WorkflowRoomTypeOption | null;
  room_type_options: WorkflowRoomTypeOption[];
};

export async function loadBookingDetailByCode(bookingCode: string): Promise<BookingDetailData | null> {
  await Promise.allSettled([releaseExpiredHolds(), releaseExpiredReservations()]);

  const [branches, roomTypes, reservationByCode, requestByCode] = await Promise.all([
    listBranches(),
    listRoomTypes(),
    getReservationByBookingCode(bookingCode),
    getAvailabilityRequestByRequestCode(bookingCode)
  ]);

  const branchMap = buildMap(branches);
  const roomTypeMap = buildMap(roomTypes);

  let reservation = reservationByCode;
  let request = requestByCode;

  if (!request && reservation?.availability_request_id) {
    request = await getAvailabilityRequestById(reservation.availability_request_id);
  }

  if (!reservation && request) {
    const relatedReservation = await listReservations({ availabilityRequestId: request.id, limit: 1 });
    reservation = relatedReservation[0] ?? null;
  }

  if (!request && reservation?.availability_request_id) {
    request = await getAvailabilityRequestById(reservation.availability_request_id);
  }

  if (!reservation && !request) {
    return null;
  }

  const branchId = reservation?.branch_id ?? request?.branch_id ?? null;
  const customerIds = [reservation?.customer_id, request?.customer_id].filter((value): value is string => Boolean(value));
  const customerRows = await listCustomersByIds(customerIds);
  const emailCustomer = request?.contact_email ? await getCustomerByEmail(request.contact_email) : null;
  const customerMap = buildMap([...customerRows, ...(emailCustomer ? [emailCustomer] : [])]);
  const customer =
    (reservation ? customerMap[reservation.customer_id] ?? null : request?.customer_id ? customerMap[request.customer_id] ?? null : null) ??
    emailCustomer;
  const roomItem = reservation ? await getPrimaryReservationRoomItemByReservationId(reservation.id) : null;
  const room = roomItem ? await getRoomById(roomItem.room_id) : null;

  const mappedReservation = mapReservation(reservation, branchMap, customerMap, room?.code ?? roomItem?.room_id ?? null, roomTypeMap);
  const mappedRequest = mapAvailabilityRequest(request, branchMap, roomTypeMap);
  const booking = mappedReservation
    ? ({
        booking_code: mappedReservation.booking_code,
        branch_id: mappedReservation.branch_id,
        branch_name_en: mappedReservation.branch_name_en,
        branch_name_vi: mappedReservation.branch_name_vi,
        created_at: mappedReservation.created_at,
        customer_email: mappedReservation.customer_email,
        customer_name: mappedReservation.customer_name,
        guest_count: mappedReservation.guest_count,
        id: mappedReservation.id,
        notes: mappedReservation.notes,
        room_type_id: mappedReservation.primary_room_type_id,
        room_type_name_en: mappedReservation.primary_room_type_name_en,
        room_type_name_vi: mappedReservation.primary_room_type_name_vi,
        source: "reservation" as const,
        status: mappedReservation.status,
        stay_end_at: mappedReservation.stay_end_at,
        stay_start_at: mappedReservation.stay_start_at,
        total_amount: mappedReservation.total_amount,
        updated_at: mappedReservation.updated_at
      } satisfies WorkflowBookingRow)
    : mappedRequest
      ? ({
          booking_code: mappedRequest.request_code,
          branch_id: mappedRequest.branch_id,
          branch_name_en: mappedRequest.branch_name_en,
          branch_name_vi: mappedRequest.branch_name_vi,
          created_at: mappedRequest.created_at,
          customer_email: mappedRequest.contact_email,
          customer_name: mappedRequest.contact_name,
          guest_count: mappedRequest.guest_count,
          id: mappedRequest.id,
          notes: mappedRequest.note,
          room_type_id: mappedRequest.room_type_id,
          room_type_name_en: mappedRequest.room_type_name_en,
          room_type_name_vi: mappedRequest.room_type_name_vi,
          source: "availability_request" as const,
          status: mappedRequest.status,
          stay_end_at: mappedRequest.stay_end_at,
          stay_start_at: mappedRequest.stay_start_at,
          total_amount: estimateRequestTotal(mappedRequest, roomTypeMap),
          updated_at: mappedRequest.updated_at
        } satisfies WorkflowBookingRow)
      : null;

  if (!booking) {
    return null;
  }

  const [reservationHolds, requestHolds] = await Promise.all([
    reservation ? listRoomHolds({ limit: 10, reservationId: reservation.id }) : Promise.resolve([] as WorkflowRoomHold[]),
    request ? listRoomHolds({ availabilityRequestId: request.id, limit: 10 }) : Promise.resolve([] as WorkflowRoomHold[])
  ]);
  const roomMap = Object.fromEntries(
    [room].filter(Boolean).map((item) => [item!.id, item!])
  ) as Record<string, RoomRow>;
  const roomHolds = [...reservationHolds, ...requestHolds]
    .reduce((map, hold) => {
      if (!map.has(hold.id)) {
        map.set(hold.id, mapRoomHold(hold, branchMap, roomMap, roomTypeMap));
      }

      return map;
    }, new Map<string, WorkflowRoomHold>())
    .values();

  const roomHoldList = Array.from(roomHolds);
  const activeRoomHold = roomHoldList[0] ?? null;
  const roomCode = room?.code ?? activeRoomHold?.room_code ?? null;

  const paymentRequests = reservation ? await listPaymentRequests({ limit: 10, reservationId: reservation.id }) : [];
  const paymentProofRows = await Promise.all(paymentRequests.map((paymentRequest) => getLatestPaymentProofByRequestId(paymentRequest.id)));
  const paymentProofMap = Object.fromEntries(
    paymentProofRows.filter(Boolean).map((proof) => [proof!.payment_request_id, proof!] as const)
  ) as Record<string, PaymentProofRow>;
  const reservationMap = mappedReservation ? { [mappedReservation.id]: mappedReservation } : {};
  const paymentRequestMap = Object.fromEntries(paymentRequests.map((item) => [item.id, item])) as Record<string, PaymentRequestRow>;

  const paymentRequestViews = paymentRequests.map((paymentRequest) =>
    mapPaymentRequest(paymentRequest, branchMap, reservationMap, customerMap, paymentProofMap, roomTypeMap)
  );
  const paymentProofViews = paymentProofRows.filter(Boolean).map((proof) =>
    mapPaymentProof(proof!, branchMap, paymentRequestMap, reservationMap)
  );

  const [auditByReservation, auditByRequest, auditByHold] = await Promise.all([
    reservation ? listAuditLogs({ limit: 10, reservationId: reservation.id }) : Promise.resolve([] as Awaited<ReturnType<typeof listAuditLogs>>),
    request ? listAuditLogs({ limit: 10, availabilityRequestId: request.id }) : Promise.resolve([] as Awaited<ReturnType<typeof listAuditLogs>>),
    activeRoomHold ? listAuditLogs({ limit: 10, holdId: activeRoomHold.id }) : Promise.resolve([] as Awaited<ReturnType<typeof listAuditLogs>>)
  ]);

  const auditLogs = [...auditByReservation, ...auditByRequest, ...auditByHold]
    .reduce((map, log) => {
      if (!map.has(log.id)) {
        map.set(log.id, mapAuditLog(log, branchMap));
      }

      return map;
    }, new Map<string, WorkflowAuditLog>())
    .values();

  const branchBankAccounts = branchId ? await listBranchBankAccounts({ branchId, limit: 20 }) : [];
  const branchBankAccountOptions = branchBankAccounts.map((account) => ({
    ...account,
    branch_name_en: branchMap[account.branch_id]?.name_en ?? account.branch_id,
    branch_name_vi: branchMap[account.branch_id]?.name_vi ?? account.branch_id
  }));
  const selectedRoomType = roomTypeMap[booking.room_type_id] ?? null;
  const roomSuggestions =
    !reservation && branchId
      ? (
          await findAvailableRooms({
            branchId,
            limit: 36,
            stayEndAt: booking.stay_end_at,
            stayStartAt: booking.stay_start_at
          })
        ).map((availableRoom) => mapRoomSuggestion(availableRoom, branchMap, roomTypeMap))
      : [];
  const totalAmount = booking.total_amount;
  const verifiedDepositAmount = calculateVerifiedDepositAmount(paymentRequestViews);
  const activePaymentRequest =
    paymentRequestViews.find((paymentRequest) => ["pending_verification", "sent"].includes(paymentRequest.status)) ??
    paymentRequestViews[0] ??
    null;
  const supabase = createSupabaseServiceClient();

  for (const pr of paymentRequestViews) {
    if (pr.latest_proof_file_path) {
      const { data } = await supabase.storage.from("payment-proofs").createSignedUrl(pr.latest_proof_file_path, 3600);
      pr.latest_proof_url = data?.signedUrl ?? null;
    }
  }

  const defaultDepositAmount = calculateDepositAmount({
    totalAmount
  });
  const requestedDepositAmount =
    reservation?.deposit_amount && reservation.deposit_amount > 0
      ? reservation.deposit_amount
      : activePaymentRequest?.amount ?? defaultDepositAmount;
  const pendingDepositAmount = activePaymentRequest?.status === "verified" ? 0 : activePaymentRequest?.amount ?? 0;

  return {
    audit_logs: Array.from(auditLogs),
    branch_bank_accounts: branchBankAccountOptions,
    branch_options: branches.map((branch) => ({
      code: branch.code,
      id: branch.id,
      name_en: branch.name_en,
      name_vi: branch.name_vi,
      slug: branch.slug,
      timezone: branch.timezone
    })),
    booking,
    customer,
    financial_summary: {
      active_payment_request_id: activePaymentRequest?.id ?? null,
      default_deposit_amount: defaultDepositAmount,
      default_deposit_percentage: DEFAULT_BOOKING_DEPOSIT_PERCENT,
      pending_deposit_amount: pendingDepositAmount,
      remaining_balance_amount: calculateRemainingBalance(totalAmount, verifiedDepositAmount),
      requested_deposit_amount: requestedDepositAmount,
      total_amount: totalAmount,
      verified_deposit_amount: verifiedDepositAmount
    },
    payment_proofs: paymentProofViews,
    payment_requests: paymentRequestViews,
    request: mappedRequest,
    reservation: mappedReservation,
    room_code: roomCode,
    room_holds: roomHoldList,
    room_suggestions: roomSuggestions,
    room_type: selectedRoomType
      ? {
          base_price: selectedRoomType.base_price,
          code: selectedRoomType.code,
          id: selectedRoomType.id,
          manual_override_price: selectedRoomType.manual_override_price,
          name_en: selectedRoomType.name_en,
          name_vi: selectedRoomType.name_vi,
          show_public_price: selectedRoomType.show_public_price,
          slug: selectedRoomType.slug,
          weekend_surcharge: selectedRoomType.weekend_surcharge
        }
      : null,
    room_type_options: roomTypes.map((roomType) => ({
      base_price: roomType.base_price,
      code: roomType.code,
      id: roomType.id,
      manual_override_price: roomType.manual_override_price,
      name_en: roomType.name_en,
      name_vi: roomType.name_vi,
      show_public_price: roomType.show_public_price,
      slug: roomType.slug,
      weekend_surcharge: roomType.weekend_surcharge
    }))
  };
}
