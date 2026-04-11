import type { RoomHoldRow, RoomHoldStatus } from "@/lib/supabase/database.types";
import { queryWithServiceFallback } from "@/lib/supabase/queries/shared";

const roomHoldSelect = `
  id, hold_code, availability_request_id, reservation_id, customer_id, branch_id,
  room_type_id, room_id, stay_start_at, stay_end_at, expires_at, status,
  release_reason, notes, held_by, converted_at, released_at, created_by,
  updated_by, created_at, updated_at
`;

type RoomHoldQueryOptions = {
  branchId?: string;
  limit?: number;
  status?: RoomHoldStatus | RoomHoldStatus[];
};

export async function listRoomHolds(options: RoomHoldQueryOptions = {}) {
  return queryWithServiceFallback(
    async (client) => {
      let query = client.from("room_holds").select(roomHoldSelect);

      if (options.branchId) {
        query = query.eq("branch_id", options.branchId);
      }

      if (options.status) {
        if (Array.isArray(options.status)) {
          query = query.in("status", options.status);
        } else {
          query = query.eq("status", options.status);
        }
      }

      const { data, error } = await query.order("expires_at", { ascending: true }).limit(options.limit ?? 12);

      if (error) {
        throw error;
      }

      return (data ?? []) as RoomHoldRow[];
    },
    [] as RoomHoldRow[]
  );
}

export async function countRoomHolds(options: RoomHoldQueryOptions = {}) {
  return queryWithServiceFallback(
    async (client) => {
      let query = client.from("room_holds").select("id", { count: "exact", head: true });

      if (options.branchId) {
        query = query.eq("branch_id", options.branchId);
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

export async function countExpiringRoomHolds(windowMinutes = 30) {
  return queryWithServiceFallback(
    async (client) => {
      const cutoff = new Date(Date.now() + windowMinutes * 60_000).toISOString();
      const { count, error } = await client
        .from("room_holds")
        .select("id", { count: "exact", head: true })
        .eq("status", "active")
        .lte("expires_at", cutoff);

      if (error) {
        throw error;
      }

      return count ?? 0;
    },
    0
  );
}
