import type {
  AvailabilityRequestRow,
  AvailabilityRequestStatus,
  ReservationRow,
  ReservationStatus,
  RoomHoldRow,
  RoomRow
} from "@/lib/supabase/database.types";
import { logAuditEvent } from "@/lib/supabase/audit";
import { calculateDepositAmount } from "@/lib/supabase/booking-finance";
import { hasSupabaseServiceConfig } from "@/lib/supabase/env";
import { toError } from "@/lib/supabase/errors";
import { getCustomerByEmail } from "@/lib/supabase/queries/customers";
import { listReservations } from "@/lib/supabase/queries/reservations";
import { listRoomTypes } from "@/lib/supabase/queries/room-types";
import { createPaymentRequest } from "@/lib/supabase/payments";
import { sendAvailabilityRequestEmails } from "@/lib/supabase/email";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export type AvailabilityRequestInput = {
  branchId: string;
  contactEmail: string;
  contactName: string;
  contactPhone?: string | null;
  createdBy?: string | null;
  guestCount?: number;
  marketingConsent?: boolean;
  note?: string;
  preferredLocale?: "en" | "vi";
  quotedCurrency?: string;
  quotedNightlyRate?: number | null;
  quotedTotalAmount?: number | null;
  roomTypeId: string;
  source?: string;
  stayEndAt: string;
  stayStartAt: string;
};

export type HoldRoomInput = {
  actorRole?: string | null;
  availabilityRequestId?: string | null;
  branchId: string;
  createdBy?: string | null;
  customerId?: string | null;
  heldBy?: string | null;
  holdMinutes?: number;
  notes?: string;
  roomId: string;
  roomTypeId: string;
  stayEndAt: string;
  stayStartAt: string;
};

export type CreateReservationInput = {
  actorRole?: string | null;
  availabilityRequestId?: string | null;
  basePrice?: number;
  branchId: string;
  createdBy?: string | null;
  customerId?: string | null;
  depositAmount?: number;
  guestCount?: number;
  holdId?: string | null;
  manualOverridePrice?: number | null;
  nightlyRate?: number;
  notes?: string;
  expiresAt?: string | null;
  primaryRoomTypeId: string;
  roomId: string;
  status?: ReservationStatus;
  stayEndAt: string;
  stayStartAt: string;
  totalAmount?: number;
  weekendSurcharge?: number;
};

export type ReleaseExpiredHoldsInput = {
  asOf?: string;
};

export type ReleaseExpiredAvailabilityRequestsInput = {
  asOf?: string;
};

export type ReleaseExpiredReservationsInput = {
  asOf?: string;
};

export type ReleasedAvailabilityRequestRow = {
  branch_id: string;
  customer_id: string | null;
  expired_at: string;
  request_code: string;
  request_id: string;
  response_due_at: string;
  status: AvailabilityRequestStatus;
};

export type ConfirmAvailabilityRequestInput = {
  actorRole?: string | null;
  actorUserId?: string | null;
  availabilityRequestId: string;
  branchBankAccountId?: string | null;
  depositAmount?: number | null;
  depositPercent?: number | null;
  guestCount?: number;
  expiresAt?: string | null;
  notes?: string;
  roomId: string;
  roomTypeId: string;
  stayEndAt: string;
  stayStartAt: string;
};

export type ReleasedHoldRow = {
  branch_id: string;
  expires_at: string;
  hold_code: string;
  hold_id: string;
  released_at: string | null;
  room_id: string;
  status: RoomHoldRow["status"];
};

export type ReleasedReservationRow = {
  booking_code: string;
  branch_id: string;
  customer_id: string;
  expires_at: string;
  released_at: string | null;
  reservation_id: string;
  status: ReservationStatus;
};

function normalizeTimestamptzInput(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return `${value}T00:00:00+07:00`;
  }

  if (/[zZ]$/.test(value) || /[+-]\d{2}:\d{2}$/.test(value)) {
    return value;
  }

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    return `${value}:00+07:00`;
  }

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(value)) {
    return `${value}+07:00`;
  }

  return value;
}

function calculateNights(stayStartAt: string, stayEndAt: string) {
  const start = new Date(stayStartAt);
  const end = new Date(stayEndAt);
  const diffMs = end.getTime() - start.getTime();

  if (!Number.isFinite(diffMs) || diffMs <= 0) {
    return 1;
  }

  return Math.max(1, Math.round(diffMs / 86_400_000));
}

function normalizeQuotedAmount(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return null;
  }

  return Number(value.toFixed(2));
}

async function assertRoomsAvailable(
  supabase: ReturnType<typeof createSupabaseServiceClient>,
  input: Pick<AvailabilityRequestInput, "branchId" | "roomTypeId" | "stayEndAt" | "stayStartAt">
) {
  const { data, error } = await supabase.rpc("find_available_rooms", {
    p_branch_id: input.branchId,
    p_limit: 1,
    p_room_type_id: input.roomTypeId,
    p_stay_end_at: normalizeTimestamptzInput(input.stayEndAt),
    p_stay_start_at: normalizeTimestamptzInput(input.stayStartAt)
  });

  if (error) {
    throw new Error(error.message ?? "Unable to check room availability.");
  }

  if (!((data ?? []) as RoomRow[]).length) {
    throw new Error("No rooms are available for the selected stay window.");
  }
}

export async function submitAvailabilityRequest(input: AvailabilityRequestInput) {
  const supabase = createSupabaseServiceClient();
  await assertRoomsAvailable(supabase, input);
  const { data, error } = await supabase.rpc("submit_availability_request", {
    p_branch_id: input.branchId,
    p_contact_email: input.contactEmail,
    p_contact_name: input.contactName,
    p_contact_phone: input.contactPhone ?? null,
    p_created_by: input.createdBy ?? null,
    p_guest_count: input.guestCount ?? 1,
    p_marketing_consent: input.marketingConsent ?? false,
    p_note: input.note ?? "",
    p_preferred_locale: input.preferredLocale ?? "vi",
    p_quoted_currency: input.quotedCurrency ?? "VND",
    p_quoted_nightly_rate: normalizeQuotedAmount(input.quotedNightlyRate),
    p_quoted_total_amount: normalizeQuotedAmount(input.quotedTotalAmount),
    p_room_type_id: input.roomTypeId,
    p_source: input.source ?? "admin_console",
    p_stay_end_at: normalizeTimestamptzInput(input.stayEndAt),
    p_stay_start_at: normalizeTimestamptzInput(input.stayStartAt)
  });

  if (error) {
    throw new Error(error.message ?? "Unable to create booking request.");
  }

  const request = data as AvailabilityRequestRow;

  try {
    await sendAvailabilityRequestEmails(request);
  } catch (emailError) {
    console.warn("[email] Failed to send availability request notifications", {
      error: emailError,
      requestCode: request.request_code
    });
  }

  return request;
}

export async function confirmAvailabilityRequest(input: ConfirmAvailabilityRequestInput) {
  const supabase = createSupabaseServiceClient();
  const { data: request, error: requestError } = await supabase
    .from("availability_requests")
    .select(
      "id, request_code, branch_id, customer_id, room_type_id, stay_start_at, stay_end_at, guest_count, contact_name, contact_email, contact_phone, note, marketing_consent, preferred_locale, source, status, response_due_at, quoted_nightly_rate, quoted_total_amount, quoted_currency, assigned_to, handled_by, handled_at, closed_at, created_by, updated_by, created_at, updated_at"
    )
    .eq("id", input.availabilityRequestId)
    .maybeSingle();

  if (requestError) {
    throw new Error(requestError.message ?? "Unable to load availability request.");
  }

  if (!request) {
    throw new Error("Availability request not found.");
  }

  if (["closed", "rejected", "expired"].includes(request.status)) {
    throw new Error("This booking request can no longer be confirmed.");
  }

  const existingReservations = await listReservations({
    availabilityRequestId: request.id,
    limit: 10
  });
  const activeReservation = existingReservations.find((reservation) =>
    ["draft", "pending_deposit", "confirmed"].includes(reservation.status)
  );

  if (activeReservation) {
    throw new Error("This booking request already has an active reservation.");
  }

  const { data: roomType, error: roomTypeError } = await supabase
    .from("room_types")
    .select("id, base_price, manual_override_price, weekend_surcharge")
    .eq("id", input.roomTypeId)
    .maybeSingle();

  if (roomTypeError) {
    throw new Error(roomTypeError.message ?? "Unable to load selected room type.");
  }

  if (!roomType) {
    throw new Error("Selected room type was not found.");
  }

  const customerId = request.customer_id ?? (await getCustomerByEmail(request.contact_email))?.id ?? null;

  if (!customerId) {
    throw new Error("Unable to resolve customer for this request.");
  }

  const stayStartAt = normalizeTimestamptzInput(input.stayStartAt);
  const stayEndAt = normalizeTimestamptzInput(input.stayEndAt);
  const nights = calculateNights(stayStartAt, stayEndAt);
  const quotedNightlyRate =
    normalizeQuotedAmount(request.quoted_nightly_rate) ??
    (() => {
      const quotedTotalAmount = normalizeQuotedAmount(request.quoted_total_amount);

      if (quotedTotalAmount != null && nights > 0) {
        return Number((quotedTotalAmount / nights).toFixed(2));
      }

      return null;
    })();
  const nightlyRate = quotedNightlyRate ?? roomType.manual_override_price ?? roomType.base_price;
  const totalAmount =
    normalizeQuotedAmount(request.quoted_total_amount) ??
    Number((nightlyRate * nights + roomType.weekend_surcharge).toFixed(2));
  const depositAmount = calculateDepositAmount({
    depositAmount: input.depositAmount,
    depositPercent: input.depositPercent,
    totalAmount
  });
  const guestCount = Math.max(1, Number.isFinite(input.guestCount ?? request.guest_count) ? Number(input.guestCount ?? request.guest_count) : 1);
  const notes = input.notes?.trim() || request.note || "";
  const now = new Date().toISOString();

  const { error: requestUpdateError } = await supabase
    .from("availability_requests")
    .update({
      customer_id: customerId,
      guest_count: guestCount,
      handled_at: now,
      handled_by: input.actorUserId ?? request.handled_by ?? null,
      note: notes,
      quoted_currency: request.quoted_currency ?? "VND",
      quoted_nightly_rate: nightlyRate,
      quoted_total_amount: totalAmount,
      room_type_id: input.roomTypeId,
      stay_end_at: stayEndAt,
      stay_start_at: stayStartAt,
      status: "quoted",
      updated_by: input.actorUserId ?? request.updated_by ?? null
    })
    .eq("id", request.id);

  if (requestUpdateError) {
    throw new Error(requestUpdateError.message ?? "Unable to update availability request before confirmation.");
  }

  const reservation = await createReservation({
    actorRole: input.actorRole ?? "staff",
    availabilityRequestId: request.id,
    basePrice: roomType.base_price,
    branchId: request.branch_id,
    createdBy: input.actorUserId ?? null,
    customerId,
    depositAmount,
    guestCount,
    manualOverridePrice: roomType.manual_override_price,
    nightlyRate,
    notes,
    expiresAt: input.expiresAt ?? request.response_due_at ?? null,
    primaryRoomTypeId: input.roomTypeId,
    roomId: input.roomId,
    status: "pending_deposit",
    stayEndAt,
    stayStartAt,
    totalAmount,
    weekendSurcharge: roomType.weekend_surcharge
  });

  const paymentRequest = await createPaymentRequest({
    amount: depositAmount || totalAmount,
    branchBankAccountId: input.branchBankAccountId ?? null,
    createdBy: input.actorUserId ?? null,
    note: notes,
    reservationId: reservation.id,
    source: "admin_console"
  });

  await logAuditEvent({
    action: "availability_request.confirmed",
    actorRole: input.actorRole ?? "staff",
    actorUserId: input.actorUserId ?? null,
    availabilityRequestId: request.id,
    branchId: request.branch_id,
    customerId,
    entityId: reservation.id,
    entityType: "reservation",
    reservationId: reservation.id,
    summary: `Availability request ${request.request_code} confirmed and converted to reservation ${reservation.booking_code}.`,
    metadata: {
      booking_code: reservation.booking_code,
      payment_code: paymentRequest.payment_code,
      room_id: input.roomId,
      room_type_id: input.roomTypeId
    }
  });

  return {
    availability_request: request,
    payment_request: paymentRequest,
    reservation
  };
}

export type UpdateAvailabilityRequestStatusInput = {
  actorRole?: string | null;
  actorUserId?: string | null;
  availabilityRequestId: string;
  note?: string | null;
  status: AvailabilityRequestStatus;
};

export async function updateAvailabilityRequestStatus(input: UpdateAvailabilityRequestStatusInput) {
  const supabase = createSupabaseServiceClient();
  const { data: request, error: requestError } = await supabase
    .from("availability_requests")
    .select("id, request_code, branch_id, customer_id, status, handled_by, handled_at, closed_at")
    .eq("id", input.availabilityRequestId)
    .maybeSingle();

  if (requestError) {
    throw new Error(requestError.message ?? "Unable to load availability request.");
  }

  if (!request) {
    throw new Error("Availability request not found.");
  }

  const now = new Date().toISOString();
  const updates: Partial<
    Pick<AvailabilityRequestRow, "closed_at" | "handled_at" | "handled_by" | "status" | "updated_by">
  > = {
    status: input.status,
    updated_by: input.actorUserId ?? null
  };

  if (input.status === "new") {
    updates.handled_by = null;
    updates.handled_at = null;
    updates.closed_at = null;
  } else if (input.status === "closed" || input.status === "rejected") {
    updates.handled_by = input.actorUserId ?? request.handled_by ?? null;
    updates.handled_at = request.handled_at ?? now;
    updates.closed_at = now;
  } else {
    updates.handled_by = input.actorUserId ?? request.handled_by ?? null;
    updates.handled_at = now;
    updates.closed_at = null;
  }

  const { data: updated, error: updateError } = await supabase
    .from("availability_requests")
    .update(updates)
    .eq("id", input.availabilityRequestId)
    .select("id, request_code, branch_id, customer_id, status, handled_by, handled_at, closed_at")
    .maybeSingle();

  if (updateError) {
    throw new Error(updateError.message ?? "Unable to update availability request status.");
  }

  await logAuditEvent({
    action: `availability_request.status.${input.status}`,
    actorRole: input.actorRole ?? null,
    actorUserId: input.actorUserId ?? null,
    availabilityRequestId: request.id,
    branchId: request.branch_id,
    customerId: request.customer_id,
    entityId: request.id,
    entityType: "availability_request",
    metadata: {
      next_status: input.status,
      note: input.note ?? null,
      previous_status: request.status
    },
    summary: `Availability request ${request.request_code} moved from ${request.status} to ${input.status}`
  });

  return (updated ?? request) as AvailabilityRequestRow;
}

export async function holdRoom(input: HoldRoomInput) {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.rpc("create_room_hold", {
    p_actor_role: input.actorRole ?? null,
    p_availability_request_id: input.availabilityRequestId ?? null,
    p_branch_id: input.branchId,
    p_created_by: input.createdBy ?? null,
    p_customer_id: input.customerId ?? null,
    p_held_by: input.heldBy ?? null,
    p_hold_minutes: input.holdMinutes ?? 30,
    p_metadata: {},
    p_notes: input.notes ?? "",
    p_room_id: input.roomId,
    p_room_type_id: input.roomTypeId,
    p_stay_end_at: normalizeTimestamptzInput(input.stayEndAt),
    p_stay_start_at: normalizeTimestamptzInput(input.stayStartAt)
  });

  if (error) {
    throw toError(error, "Unable to create room hold.");
  }

  return data as RoomHoldRow;
}

export async function createReservation(input: CreateReservationInput) {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.rpc("create_reservation", {
    p_actor_role: input.actorRole ?? null,
    p_availability_request_id: input.availabilityRequestId ?? null,
    p_base_price: input.basePrice ?? 0,
    p_branch_id: input.branchId,
    p_created_by: input.createdBy ?? null,
    p_customer_id: input.customerId ?? null,
    p_deposit_amount: input.depositAmount ?? 0,
    p_guest_count: input.guestCount ?? 1,
    p_hold_id: input.holdId ?? null,
    p_manual_override_price: input.manualOverridePrice ?? null,
    p_metadata: {},
    p_expires_at: input.expiresAt ? normalizeTimestamptzInput(input.expiresAt) : null,
    p_nightly_rate: input.nightlyRate ?? 0,
    p_notes: input.notes ?? "",
    p_primary_room_type_id: input.primaryRoomTypeId,
    p_room_id: input.roomId,
    p_status: input.status ?? "pending_deposit",
    p_stay_end_at: normalizeTimestamptzInput(input.stayEndAt),
    p_stay_start_at: normalizeTimestamptzInput(input.stayStartAt),
    p_total_amount: input.totalAmount ?? 0,
    p_weekend_surcharge: input.weekendSurcharge ?? 0
  });

  if (error) {
    throw toError(error, "Unable to create booking.");
  }

  return data as ReservationRow;
}

export async function releaseExpiredHolds(input: ReleaseExpiredHoldsInput = {}) {
  if (!hasSupabaseServiceConfig()) {
    return [];
  }

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.rpc("release_expired_holds", {
    p_as_of: input.asOf ? normalizeTimestamptzInput(input.asOf) : new Date().toISOString()
  });

  if (error) {
    throw toError(error, "Unable to release expired holds.");
  }

  return (data ?? []) as ReleasedHoldRow[];
}

export async function releaseExpiredAvailabilityRequests(input: ReleaseExpiredAvailabilityRequestsInput = {}) {
  if (!hasSupabaseServiceConfig()) {
    return [];
  }

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.rpc("release_expired_availability_requests", {
    p_as_of: input.asOf ? normalizeTimestamptzInput(input.asOf) : new Date().toISOString()
  });

  if (error) {
    throw toError(error, "Unable to release expired booking requests.");
  }

  return (data ?? []) as ReleasedAvailabilityRequestRow[];
}

export async function releaseExpiredReservations(input: ReleaseExpiredReservationsInput = {}) {
  if (!hasSupabaseServiceConfig()) {
    return [];
  }

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.rpc("release_expired_reservations", {
    p_as_of: input.asOf ? normalizeTimestamptzInput(input.asOf) : new Date().toISOString()
  });

  if (error) {
    throw toError(error, "Unable to release expired bookings.");
  }

  return (data ?? []) as ReleasedReservationRow[];
}
