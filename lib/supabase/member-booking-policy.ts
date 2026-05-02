import type { AvailabilityRequestStatus, ReservationStatus } from "@/lib/supabase/database.types";

export type MemberBookingKind = "request" | "reservation";

export type MemberBookingStatus = AvailabilityRequestStatus | ReservationStatus;

export const memberBookingCancelError = {
  INVALID_KIND: "member_booking_invalid_kind",
  MEMBER_PROFILE_REQUIRED: "member_booking_member_profile_required",
  NOT_CANCELLABLE: "member_booking_not_cancellable",
  NOT_FOUND: "member_booking_not_found",
  NOT_OWNED: "member_booking_not_owned"
} as const;

const cancellableRequestStatuses = new Set<AvailabilityRequestStatus>(["new", "in_review", "quoted"]);
const cancellableReservationStatuses = new Set<ReservationStatus>(["draft", "pending_deposit"]);

export function canMemberCancelBooking(kind: MemberBookingKind, status: MemberBookingStatus) {
  return kind === "request"
    ? cancellableRequestStatuses.has(status as AvailabilityRequestStatus)
    : cancellableReservationStatuses.has(status as ReservationStatus);
}
