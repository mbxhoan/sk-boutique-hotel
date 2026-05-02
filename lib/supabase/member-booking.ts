import { logAuditEvent } from "@/lib/supabase/audit";
import { updateReservationLifecycle } from "@/lib/supabase/booking-lifecycle";
import type { AvailabilityRequestRow } from "@/lib/supabase/database.types";
import { getAvailabilityRequestById } from "@/lib/supabase/queries/availability-requests";
import { getReservationById } from "@/lib/supabase/queries/reservations";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { canMemberCancelBooking, memberBookingCancelError, type MemberBookingKind } from "@/lib/supabase/member-booking-policy";

function normalizeEmail(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? null;
}

export type CancelMemberBookingInput = {
  actorRole?: string | null;
  actorUserId: string;
  bookingId: string;
  bookingKind: MemberBookingKind;
  customerEmail?: string | null;
  customerId: string;
  reason?: string | null;
};

async function cancelAvailabilityRequestByMember(input: CancelMemberBookingInput) {
  const request = await getAvailabilityRequestById(input.bookingId);

  if (!request) {
    throw new Error(memberBookingCancelError.NOT_FOUND);
  }

  const requestCustomerEmail = normalizeEmail(request.contact_email);
  const customerEmail = normalizeEmail(input.customerEmail);
  const requestOwnedByCustomer = request.customer_id === input.customerId || (requestCustomerEmail && customerEmail === requestCustomerEmail);

  if (!requestOwnedByCustomer) {
    throw new Error(memberBookingCancelError.NOT_OWNED);
  }

  if (!canMemberCancelBooking("request", request.status)) {
    throw new Error(memberBookingCancelError.NOT_CANCELLABLE);
  }

  const now = new Date().toISOString();
  const supabase = createSupabaseServiceClient();

  const { data: updatedRequest, error } = await supabase
    .from("availability_requests")
    .update({
      closed_at: now,
      status: "closed",
      updated_by: input.actorUserId
    })
    .eq("id", request.id)
    .select(
      "id, request_code, branch_id, customer_id, room_type_id, stay_start_at, stay_end_at, guest_count, contact_name, contact_email, contact_phone, note, marketing_consent, preferred_locale, source, status, response_due_at, quoted_nightly_rate, quoted_total_amount, quoted_currency, assigned_to, handled_by, handled_at, closed_at, created_by, updated_by, created_at, updated_at"
    )
    .maybeSingle();

  if (error) {
    throw error;
  }

  await logAuditEvent({
    action: "availability_request.closed_by_member",
    actorRole: input.actorRole ?? "member",
    actorUserId: input.actorUserId,
    availabilityRequestId: request.id,
    branchId: request.branch_id,
    customerId: request.customer_id ?? input.customerId,
    entityId: request.id,
    entityType: "availability_request",
    metadata: {
      next_status: "closed",
      previous_status: request.status
    },
    summary: `Availability request ${request.request_code} was cancelled by the member.`
  });

  return (updatedRequest ?? {
    ...request,
    closed_at: now,
    status: "closed",
    updated_by: input.actorUserId
  }) as AvailabilityRequestRow;
}

async function cancelReservationByMember(input: CancelMemberBookingInput) {
  const reservation = await getReservationById(input.bookingId);

  if (!reservation) {
    throw new Error(memberBookingCancelError.NOT_FOUND);
  }

  if (reservation.customer_id !== input.customerId) {
    throw new Error(memberBookingCancelError.NOT_OWNED);
  }

  if (!canMemberCancelBooking("reservation", reservation.status)) {
    throw new Error(memberBookingCancelError.NOT_CANCELLABLE);
  }

  return updateReservationLifecycle({
    actorRole: input.actorRole ?? "member",
    actorUserId: input.actorUserId,
    reason: input.reason ?? "Cancelled from the member portal.",
    reservationId: reservation.id,
    status: "cancelled"
  });
}

export async function cancelMemberBooking(input: CancelMemberBookingInput) {
  if (input.bookingKind === "request") {
    return cancelAvailabilityRequestByMember(input);
  }

  if (input.bookingKind === "reservation") {
    return cancelReservationByMember(input);
  }

  throw new Error(memberBookingCancelError.INVALID_KIND);
}
