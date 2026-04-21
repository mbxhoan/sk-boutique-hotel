import type {
  AvailabilityRequestRow,
  AvailabilityRequestStatus,
  ReservationRow,
  ReservationStatus,
  RoomHoldRow,
  RoomRow
} from "@/lib/supabase/database.types";
import { logAuditEvent } from "@/lib/supabase/audit";
import { hasSupabaseServiceConfig } from "@/lib/supabase/env";
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

export type ReleaseExpiredReservationsInput = {
  asOf?: string;
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
    throw error;
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
    throw error;
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
    throw error;
  }

  return (data ?? []) as ReleasedHoldRow[];
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
    throw error;
  }

  return (data ?? []) as ReleasedReservationRow[];
}
