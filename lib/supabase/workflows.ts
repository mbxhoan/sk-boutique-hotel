import type {
  AvailabilityRequestRow,
  ReservationRow,
  ReservationStatus,
  RoomHoldRow
} from "@/lib/supabase/database.types";
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

export type ReleasedHoldRow = {
  branch_id: string;
  expires_at: string;
  hold_code: string;
  hold_id: string;
  released_at: string | null;
  room_id: string;
  status: RoomHoldRow["status"];
};

function normalizeTimestamptzInput(value: string) {
  if (/[zZ]$/.test(value) || /[+-]\d{2}:\d{2}$/.test(value)) {
    return value;
  }

  return `${value}:00+07:00`;
}

export async function submitAvailabilityRequest(input: AvailabilityRequestInput) {
  const supabase = createSupabaseServiceClient();
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
    throw error;
  }

  return data as AvailabilityRequestRow;
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
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.rpc("release_expired_holds", {
    p_as_of: input.asOf ? normalizeTimestamptzInput(input.asOf) : new Date().toISOString()
  });

  if (error) {
    throw error;
  }

  return (data ?? []) as ReleasedHoldRow[];
}
