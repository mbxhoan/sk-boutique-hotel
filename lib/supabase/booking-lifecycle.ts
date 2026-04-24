import { logAuditEvent } from "@/lib/supabase/audit";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export type ReservationLifecycleStatus = "cancelled" | "completed";

export type UpdateReservationLifecycleInput = {
  actorRole?: string | null;
  actorUserId?: string | null;
  reason?: string | null;
  reservationId: string;
  status: ReservationLifecycleStatus;
};

function appendLifecycleNote(currentNotes: string, label: string, reason?: string | null) {
  const trimmedReason = reason?.trim();
  const nextLine = trimmedReason ? `${label}: ${trimmedReason}` : label;

  if (!currentNotes.trim()) {
    return nextLine;
  }

  return `${currentNotes.trim()}\n${nextLine}`;
}

export async function updateReservationLifecycle(input: UpdateReservationLifecycleInput) {
  const supabase = createSupabaseServiceClient();
  const { data: reservation, error: reservationError } = await supabase
    .from("reservations")
    .select(
      "id, booking_code, availability_request_id, hold_id, branch_id, customer_id, status, notes, cancelled_at, completed_at"
    )
    .eq("id", input.reservationId)
    .maybeSingle();

  if (reservationError) {
    throw reservationError;
  }

  if (!reservation) {
    throw new Error("Booking was not found.");
  }

  const now = new Date().toISOString();

  if (input.status === "cancelled") {
    const reason = input.reason?.trim();

    if (!reason) {
      throw new Error("Cancellation reason is required.");
    }

    if (["cancelled", "completed", "expired"].includes(reservation.status)) {
      throw new Error("This booking can no longer be cancelled.");
    }

    const { error: reservationUpdateError } = await supabase
      .from("reservations")
      .update({
        cancelled_at: now,
        expires_at: null,
        notes: appendLifecycleNote(reservation.notes, "Cancellation reason", reason),
        status: "cancelled",
        updated_by: input.actorUserId ?? null
      })
      .eq("id", reservation.id);

    if (reservationUpdateError) {
      throw reservationUpdateError;
    }

    const { error: roomItemsError } = await supabase
      .from("reservation_room_items")
      .update({
        notes: appendLifecycleNote("", "Reservation cancelled", reason),
        status: "cancelled"
      })
      .eq("reservation_id", reservation.id)
      .eq("status", "active");

    if (roomItemsError) {
      throw roomItemsError;
    }

    const { error: paymentRequestError } = await supabase
      .from("payment_requests")
      .update({
        rejected_at: now,
        rejected_reason: reason,
        status: "cancelled",
        updated_by: input.actorUserId ?? null
      })
      .eq("reservation_id", reservation.id)
      .in("status", ["sent", "pending_verification"]);

    if (paymentRequestError) {
      throw paymentRequestError;
    }

    await logAuditEvent({
      action: "reservation.cancelled",
      actorRole: input.actorRole ?? "staff",
      actorUserId: input.actorUserId ?? null,
      branchId: reservation.branch_id,
      customerId: reservation.customer_id,
      entityId: reservation.id,
      entityType: "reservation",
      holdId: reservation.hold_id,
      reservationId: reservation.id,
      availabilityRequestId: reservation.availability_request_id,
      summary: `Booking ${reservation.booking_code} was cancelled. Reason: ${reason}`,
      metadata: {
        next_status: "cancelled",
        previous_status: reservation.status,
        reason
      }
    });

    return {
      ...reservation,
      cancelled_at: now,
      status: "cancelled"
    };
  }

  if (reservation.status !== "confirmed") {
    throw new Error("Only confirmed bookings can be completed.");
  }

  const completionNote = input.reason?.trim() ?? "";
  const { error: reservationUpdateError } = await supabase
    .from("reservations")
    .update({
      completed_at: now,
      expires_at: null,
      notes: completionNote ? appendLifecycleNote(reservation.notes, "Completion note", completionNote) : reservation.notes,
      status: "completed",
      updated_by: input.actorUserId ?? null
    })
    .eq("id", reservation.id);

  if (reservationUpdateError) {
    throw reservationUpdateError;
  }

  const { error: roomItemsError } = await supabase
    .from("reservation_room_items")
    .update({
      notes: completionNote ? appendLifecycleNote("", "Reservation completed", completionNote) : "Reservation completed",
      status: "released"
    })
    .eq("reservation_id", reservation.id)
    .eq("status", "active");

  if (roomItemsError) {
    throw roomItemsError;
  }

  await logAuditEvent({
    action: "reservation.completed",
    actorRole: input.actorRole ?? "staff",
    actorUserId: input.actorUserId ?? null,
    branchId: reservation.branch_id,
    customerId: reservation.customer_id,
    entityId: reservation.id,
    entityType: "reservation",
    holdId: reservation.hold_id,
    reservationId: reservation.id,
    availabilityRequestId: reservation.availability_request_id,
    summary: `Booking ${reservation.booking_code} was marked as completed.`,
    metadata: {
      next_status: "completed",
      previous_status: reservation.status,
      reason: completionNote || null
    }
  });

  return {
    ...reservation,
    completed_at: now,
    status: "completed"
  };
}
