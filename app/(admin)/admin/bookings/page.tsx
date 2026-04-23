import type { Metadata } from "next";

import { AdminBookingsPage } from "@/components/admin-bookings-page";
import { resolveLocale } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";
import { listAvailabilityRequests } from "@/lib/supabase/queries/availability-requests";
import { listBranches } from "@/lib/supabase/queries/branches";
import { listCustomersByIds } from "@/lib/supabase/queries/customers";
import { listReservations } from "@/lib/supabase/queries/reservations";
import { listRoomTypes } from "@/lib/supabase/queries/room-types";
import type { AvailabilityRequestRow, BranchRow, ReservationRow, RoomTypeRow } from "@/lib/supabase/database.types";
import type { WorkflowBookingRow } from "@/lib/supabase/workflow.types";

type PageProps = {
  searchParams?: Promise<{
    branch?: string;
    lang?: string;
  }>;
};

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

function estimateRequestTotal(request: AvailabilityRequestRow, roomTypeMap: Record<string, RoomTypeRow>) {
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
  reservation: ReservationRow,
  branchMap: Record<string, BranchRow>,
  roomTypeMap: Record<string, RoomTypeRow>,
  customerMap: Record<string, { email: string; full_name: string }>
): WorkflowBookingRow {
  const branch = branchMap[reservation.branch_id];
  const roomType = roomTypeMap[reservation.primary_room_type_id];
  const customer = customerMap[reservation.customer_id];

  return {
    booking_code: reservation.booking_code,
    branch_id: reservation.branch_id,
    branch_name_en: branch?.name_en ?? reservation.branch_id,
    branch_name_vi: branch?.name_vi ?? reservation.branch_id,
    created_at: reservation.created_at,
    customer_email: customer?.email ?? "",
    customer_name: customer?.full_name ?? reservation.customer_id,
    guest_count: reservation.guest_count,
    id: reservation.id,
    notes: reservation.notes,
    room_type_id: reservation.primary_room_type_id,
    room_type_name_en: roomType?.name_en ?? reservation.primary_room_type_id,
    room_type_name_vi: roomType?.name_vi ?? reservation.primary_room_type_id,
    source: "reservation",
    status: reservation.status,
    stay_end_at: reservation.stay_end_at,
    stay_start_at: reservation.stay_start_at,
    total_amount: reservation.total_amount,
    updated_at: reservation.updated_at
  };
}

function mapAvailabilityRequest(
  request: AvailabilityRequestRow,
  branchMap: Record<string, BranchRow>,
  roomTypeMap: Record<string, RoomTypeRow>
): WorkflowBookingRow {
  const branch = branchMap[request.branch_id];
  const roomType = roomTypeMap[request.room_type_id];

  return {
    booking_code: request.request_code,
    branch_id: request.branch_id,
    branch_name_en: branch?.name_en ?? request.branch_id,
    branch_name_vi: branch?.name_vi ?? request.branch_id,
    created_at: request.created_at,
    customer_email: request.contact_email,
    customer_name: request.contact_name,
    guest_count: request.guest_count,
    id: request.id,
    notes: request.note,
    room_type_id: request.room_type_id,
    room_type_name_en: roomType?.name_en ?? request.room_type_id,
    room_type_name_vi: roomType?.name_vi ?? request.room_type_id,
    source: "availability_request",
    status: request.status,
    stay_end_at: request.stay_end_at,
    stay_start_at: request.stay_start_at,
    total_amount: estimateRequestTotal(request, roomTypeMap),
    updated_at: request.updated_at
  };
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);

  return {
    title: localize(locale, { vi: "Đặt phòng", en: "Bookings" }),
    description: localize(locale, {
      vi: "Quản lý yêu cầu đặt phòng, booking và lịch sử lưu trú.",
      en: "Manage booking requests, reservations, and stay history."
    })
  };
}

export default async function AdminBookingsRoute({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);
  const branchId = resolvedSearchParams.branch || undefined;

  const [branches, roomTypes, requests, reservations] = await Promise.all([
    listBranches(),
    listRoomTypes(),
    listAvailabilityRequests({ branchId, limit: 1000 }),
    listReservations({ branchId, limit: 1000 })
  ]);

  const branchMap = buildMap(branches);
  const roomTypeMap = buildMap(roomTypes);
  const reservationMap = new Map(reservations.filter((reservation) => reservation.availability_request_id).map((reservation) => [reservation.availability_request_id as string, reservation]));
  const customerIds = reservations.map((reservation) => reservation.customer_id);
  const customerRows = await listCustomersByIds(customerIds);
  const customerMap = Object.fromEntries(customerRows.map((customer) => [customer.id, { email: customer.email, full_name: customer.full_name }])) as Record<
    string,
    { email: string; full_name: string }
  >;

  const bookingRows: WorkflowBookingRow[] = [
    ...reservations.map((reservation) => mapReservation(reservation, branchMap, roomTypeMap, customerMap)),
    ...requests
      .filter((request) => !reservationMap.has(request.id))
      .map((request) => mapAvailabilityRequest(request, branchMap, roomTypeMap))
  ].sort((left, right) => {
    const stayStartDiff = new Date(right.stay_start_at).getTime() - new Date(left.stay_start_at).getTime();

    if (stayStartDiff !== 0) {
      return stayStartDiff;
    }

    return new Date(right.created_at).getTime() - new Date(left.created_at).getTime();
  });

  return <AdminBookingsPage locale={locale} bookings={bookingRows} totalCount={bookingRows.length} />;
}
