import type { ReservationRow, ReservationStatus } from "@/lib/supabase/database.types";
import { queryWithServiceFallback } from "@/lib/supabase/queries/shared";

const reservationSelect = `
  id, booking_code, availability_request_id, hold_id, customer_id, branch_id,
  primary_room_type_id, stay_start_at, stay_end_at, guest_count, status,
  base_price, weekend_surcharge, manual_override_price, nightly_rate,
  total_amount, deposit_amount, expires_at, source, notes, confirmed_at,
  cancelled_at, completed_at, created_by, updated_by, created_at, updated_at
`;

type ReservationQueryOptions = {
  branchId?: string;
  customerId?: string;
  limit?: number;
  status?: ReservationStatus | ReservationStatus[];
};

export async function listReservations(options: ReservationQueryOptions = {}) {
  return queryWithServiceFallback(
    async (client) => {
      let query = client.from("reservations").select(reservationSelect);

      if (options.branchId) {
        query = query.eq("branch_id", options.branchId);
      }

      if (options.customerId) {
        query = query.eq("customer_id", options.customerId);
      }

      if (options.status) {
        if (Array.isArray(options.status)) {
          query = query.in("status", options.status);
        } else {
          query = query.eq("status", options.status);
        }
      }

      const { data, error } = await query.order("created_at", { ascending: false }).limit(options.limit ?? 12);

      if (error) {
        throw error;
      }

      return (data ?? []) as ReservationRow[];
    },
    [] as ReservationRow[]
  );
}

export async function countReservations(options: ReservationQueryOptions = {}) {
  return queryWithServiceFallback(
    async (client) => {
      let query = client.from("reservations").select("id", { count: "exact", head: true });

      if (options.branchId) {
        query = query.eq("branch_id", options.branchId);
      }

      if (options.customerId) {
        query = query.eq("customer_id", options.customerId);
      }

      if (options.status) {
        if (Array.isArray(options.status)) {
          query = query.in("status", options.status);
        } else {
          query = query.eq("status", options.status);
        }
      }

      const { count, error } = await query;

      if (error) {
        throw error;
      }

      return count ?? 0;
    },
    0
  );
}
