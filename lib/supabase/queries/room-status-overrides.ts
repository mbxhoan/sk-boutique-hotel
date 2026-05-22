import type { RoomStatusOverrideRow, RoomStatusOverrideStatus } from "@/lib/supabase/database.types";
import { queryWithServiceFallback } from "@/lib/supabase/queries/shared";

const roomStatusOverrideSelect = `
  id, room_id, branch_id, status, start_at, end_at, note,
  created_by, updated_by, created_at, updated_at
`;

type RoomStatusOverrideQueryOptions = {
  branchId?: string;
  limit?: number;
  roomId?: string;
  status?: RoomStatusOverrideStatus | RoomStatusOverrideStatus[];
  windowEndAt?: string;
  windowStartAt?: string;
};

export async function listRoomStatusOverrides(options: RoomStatusOverrideQueryOptions = {}) {
  return queryWithServiceFallback(
    async (client) => {
      let query = client.from("room_status_overrides").select(roomStatusOverrideSelect);

      if (options.branchId) {
        query = query.eq("branch_id", options.branchId);
      }

      if (options.roomId) {
        query = query.eq("room_id", options.roomId);
      }

      if (options.status) {
        if (Array.isArray(options.status)) {
          query = query.in("status", options.status);
        } else {
          query = query.eq("status", options.status);
        }
      }

      if (options.windowStartAt) {
        query = query.gt("end_at", options.windowStartAt);
      }

      if (options.windowEndAt) {
        query = query.lt("start_at", options.windowEndAt);
      }

      const { data, error } = await query.order("start_at", { ascending: true }).limit(options.limit ?? 200);

      if (error) {
        throw error;
      }

      return (data ?? []) as RoomStatusOverrideRow[];
    },
    [] as RoomStatusOverrideRow[]
  );
}
