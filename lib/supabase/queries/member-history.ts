import type { BranchRow, PaymentProofRow, PaymentRequestRow, ReservationRow, RoomTypeRow } from "@/lib/supabase/database.types";
import { getCustomerByAuthUserId, getCustomerByEmail, listCustomersByEmail } from "@/lib/supabase/queries/customers";
import { listAvailabilityRequests } from "@/lib/supabase/queries/availability-requests";
import { listBranches } from "@/lib/supabase/queries/branches";
import { listAuditLogs } from "@/lib/supabase/queries/audit-logs";
import { listPaymentProofs } from "@/lib/supabase/queries/payment-proofs";
import { listPaymentRequests } from "@/lib/supabase/queries/payment-requests";
import { listReservations } from "@/lib/supabase/queries/reservations";
import { listRoomTypes } from "@/lib/supabase/queries/room-types";
import { queryWithServiceFallback } from "@/lib/supabase/queries/shared";
import { buildPaymentUploadPath, buildVietQrImageUrl } from "@/lib/supabase/payments";
import { releaseExpiredAvailabilityRequests, releaseExpiredHolds, releaseExpiredReservations } from "@/lib/supabase/workflows";
import type {
  WorkflowAvailabilityRequest,
  WorkflowAuditLog,
  WorkflowMemberHistoryData,
  WorkflowPaymentProof,
  WorkflowPaymentRequest,
  WorkflowReservation,
  WorkflowRoomTypeOption
} from "@/lib/supabase/workflow.types";
import type { CustomerRow } from "@/lib/supabase/database.types";

function buildMap<T extends { id: string }>(items: T[]) {
  return Object.fromEntries(items.map((item) => [item.id, item])) as Record<string, T>;
}

function buildLatestProofMap(proofs: PaymentProofRow[]) {
  return proofs.reduce((map, proof) => {
    if (!map[proof.payment_request_id]) {
      map[proof.payment_request_id] = proof;
    }

    return map;
  }, {} as Record<string, PaymentProofRow>);
}

function toReservationView(
  reservation: ReservationRow,
  branchMap: Record<string, BranchRow>,
  roomTypeMap: Record<string, RoomTypeRow>,
  customerName: string,
  customerEmail: string
): WorkflowReservation {
  const branch = branchMap[reservation.branch_id];
  const roomType = roomTypeMap[reservation.primary_room_type_id];

  return {
    ...reservation,
    branch_name_en: branch?.name_en ?? reservation.branch_id,
    branch_name_vi: branch?.name_vi ?? reservation.branch_id,
    customer_email: customerEmail,
    customer_name: customerName,
    primary_room_type_name_en: roomType?.name_en ?? reservation.primary_room_type_id,
    primary_room_type_name_vi: roomType?.name_vi ?? reservation.primary_room_type_id,
    room_code: reservation.booking_code
  };
}

function toPaymentRequestView(
  request: PaymentRequestRow,
  branchMap: Record<string, BranchRow>,
  reservationMap: Record<string, WorkflowReservation>,
  roomTypeMap: Record<string, RoomTypeRow>,
  customerName: string,
  customerEmail: string,
  latestProofMap: Record<string, PaymentProofRow>
): WorkflowPaymentRequest {
  const branch = branchMap[request.branch_id];
  const reservation = reservationMap[request.reservation_id];
  const roomType = reservation ? roomTypeMap[reservation.primary_room_type_id] : null;
  const latestProof = latestProofMap[request.id] ?? null;
  const paymentUploadPath = buildPaymentUploadPath(request);

  return {
    ...request,
    branch_name_en: branch?.name_en ?? request.branch_id,
    branch_name_vi: branch?.name_vi ?? request.branch_id,
    customer_email: customerEmail,
    customer_name: customerName,
    latest_proof_file_name: latestProof?.file_name ?? null,
    latest_proof_file_path: latestProof?.file_path ?? null,
    latest_proof_id: latestProof?.id ?? null,
    latest_proof_review_note: latestProof?.review_note ?? null,
    latest_proof_status: latestProof?.status ?? null,
    latest_proof_url: null,
    latest_proof_uploaded_at: latestProof?.created_at ?? null,
    payment_upload_path: paymentUploadPath,
    qr_image_url: buildVietQrImageUrl(request),
    reservation_booking_code: reservation?.booking_code ?? request.reservation_id,
    reservation_room_code: reservation?.room_code ?? reservation?.booking_code ?? request.reservation_id,
    room_type_name_en: roomType?.name_en ?? null,
    room_type_name_vi: roomType?.name_vi ?? null
  };
}

function toPaymentProofView(
  proof: PaymentProofRow,
  requestMap: Record<string, PaymentRequestRow>,
  branchMap: Record<string, BranchRow>,
  reservationMap: Record<string, WorkflowReservation>
): WorkflowPaymentProof {
  const paymentRequest = requestMap[proof.payment_request_id];
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

function toAuditLogView(log: Awaited<ReturnType<typeof listAuditLogs>>[number], branchMap: Record<string, BranchRow>): WorkflowAuditLog {
  const branch = log.branch_id ? branchMap[log.branch_id] : null;
  const entityLabels = {
    availability_request: { en: "Availability request", vi: "Yêu cầu đặt phòng" },
    customer: { en: "Member profile", vi: "Hồ sơ member" },
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

export async function loadMemberHistoryDashboard(authUserId: string, authUserEmail: string | null = null): Promise<WorkflowMemberHistoryData | null> {
  return loadMemberHistoryDashboardByUser(authUserId, authUserEmail);
}

export async function loadMemberHistoryDashboardByUser(authUserId: string, authUserEmail: string | null): Promise<WorkflowMemberHistoryData | null> {
  return queryWithServiceFallback(
    async () => {
      const releaseResults = await Promise.allSettled([
        releaseExpiredAvailabilityRequests(),
        releaseExpiredHolds(),
        releaseExpiredReservations()
      ]);

      if (releaseResults.some((result) => result.status === "rejected")) {
        console.warn("[workflow] Failed to release expired workflow items before loading member history", {
          requests: releaseResults[0].status === "fulfilled",
          holds: releaseResults[1].status === "fulfilled",
          reservations: releaseResults[2].status === "fulfilled"
        });
      }

      const authCustomer = await getCustomerByAuthUserId(authUserId);
      const emailCustomers = authUserEmail ? await listCustomersByEmail(authUserEmail) : [];
      const emailCustomer = emailCustomers[0] ?? null;
      const primaryCustomer = authCustomer ?? emailCustomer ??
        (authUserEmail
          ? ({
              auth_user_id: authUserId,
              created_at: new Date().toISOString(),
              email: authUserEmail,
              full_name: authUserEmail.split("@")[0] || authUserEmail,
              id: authUserId,
              last_seen_at: null,
              marketing_consent: false,
              marketing_consent_at: null,
              marketing_consent_source: null,
              notes: "",
              phone: null,
              preferred_locale: "vi",
              source: "member_portal",
              updated_at: new Date().toISOString()
            } satisfies CustomerRow)
          : null);

      if (!primaryCustomer) {
        return null;
      }

      const customer = primaryCustomer;

      const customerIds = Array.from(
        new Set(
          [primaryCustomer.id, authCustomer?.id, ...emailCustomers.map((c) => c.id)].filter(
            (value): value is string => typeof value === "string" && value.trim().length > 0
          )
        )
      );

      const [branches, roomTypes, customerAvailabilityRequestsByCustomerId, emailAvailabilityRequests, reservationsByCustomerId, paymentRequestsByCustomerId, paymentProofsByCustomerId, auditLogsByCustomerId] =
        await Promise.all([
          listBranches(),
          listRoomTypes(),
          Promise.all(customerIds.map((customerId) => listAvailabilityRequests({ customerId, limit: 8 }))),
          authUserEmail ? listAvailabilityRequests({ contactEmail: authUserEmail, limit: 8 }) : Promise.resolve([] as WorkflowAvailabilityRequest[]),
          Promise.all(customerIds.map((customerId) => listReservations({ customerId, limit: 8 }))),
          Promise.all(customerIds.map((customerId) => listPaymentRequests({ customerId, limit: 8 }))),
          Promise.all(customerIds.map((customerId) => listPaymentProofs({ customerId, limit: 16 }))),
          Promise.all(customerIds.map((customerId) => listAuditLogs({ customerId, limit: 12 })))
        ]);

      const customerAvailabilityRequests = customerAvailabilityRequestsByCustomerId.flat();
      const reservations = reservationsByCustomerId.flat();
      const paymentRequests = paymentRequestsByCustomerId.flat();
      const paymentProofs = paymentProofsByCustomerId.flat();
      const auditLogs = auditLogsByCustomerId.flat();

      const availabilityRequests = (() => {
        const merged = new Map<string, WorkflowAvailabilityRequest>();

        for (const request of [...customerAvailabilityRequests, ...emailAvailabilityRequests]) {
          merged.set(request.id, request as WorkflowAvailabilityRequest);
        }

        return [...merged.values()];
      })();

      const branchMap = buildMap(branches);
      const roomTypeMap = buildMap(roomTypes);
      const reservationViewMap = Object.fromEntries(
        reservations.map((reservation) => [
          reservation.id,
          toReservationView(reservation, branchMap, roomTypeMap, customer.full_name, customer.email)
        ])
      ) as Record<string, WorkflowReservation>;
      const latestProofMap = buildLatestProofMap(paymentProofs);
      const paymentRequestMap = Object.fromEntries(paymentRequests.map((request) => [request.id, request])) as Record<
        string,
        PaymentRequestRow
      >;

      return {
        availability_requests: availabilityRequests as WorkflowAvailabilityRequest[],
        audit_logs: auditLogs.map((log) => toAuditLogView(log, branchMap)),
        branch_options: branches,
        customer,
        payment_proofs: paymentProofs.map((proof) => toPaymentProofView(proof, paymentRequestMap, branchMap, reservationViewMap)),
        payment_requests: paymentRequests.map((request) =>
          toPaymentRequestView(request, branchMap, reservationViewMap, roomTypeMap, customer.full_name, customer.email, latestProofMap)
        ),
        reservations: Object.values(reservationViewMap),
        room_type_options: roomTypes as WorkflowRoomTypeOption[]
      };
    },
    null as WorkflowMemberHistoryData | null
  );
}
