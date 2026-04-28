import type { ReservationRoomItemRow, ReservationRoomItemStatus } from "@/lib/supabase/database.types";
import { queryWithServiceFallback } from "@/lib/supabase/queries/shared";

const reservationRoomItemSelect = `
  id, reservation_id, room_id, room_type_id, sort_order, nightly_rate,
  total_amount, stay_start_at, stay_end_at, stay_window, notes, status,
  created_at, updated_at
`;

type ReservationRoomItemQueryOptions = {
  reservationId?: string;
  status?: ReservationRoomItemStatus | ReservationRoomItemStatus[];
};

export async function listReservationRoomItems(options: ReservationRoomItemQueryOptions = {}) {
  return queryWithServiceFallback(
    async (client) => {
      let query = client.from("reservation_room_items").select(reservationRoomItemSelect);

      if (options.reservationId) {
        query = query.eq("reservation_id", options.reservationId);
      }

      if (options.status) {
        if (Array.isArray(options.status)) {
          query = query.in("status", options.status);
        } else {
          query = query.eq("status", options.status);
        }
      }

      const { data, error } = await query.order("sort_order", { ascending: true });

      if (error) {
        throw error;
      }

      return (data ?? []) as ReservationRoomItemRow[];
    },
    [] as ReservationRoomItemRow[]
  );
}

export async function getPrimaryReservationRoomItemByReservationId(reservationId: string) {
  return queryWithServiceFallback(
    async (client) => {
      const { data, error } = await client
        .from("reservation_room_items")
        .select(reservationRoomItemSelect)
        .eq("reservation_id", reservationId)
        .order("sort_order", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return (data ?? null) as ReservationRoomItemRow | null;
    },
    null as ReservationRoomItemRow | null
  );
}
