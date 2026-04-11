import type { RoomRow } from "@/lib/supabase/database.types";
import { queryWithServiceFallback } from "@/lib/supabase/queries/shared";

export type RoomSuggestionInput = {
  branchId?: string;
  limit?: number;
  roomTypeId?: string;
  stayEndAt?: string;
  stayStartAt?: string;
};

export async function findAvailableRooms(input: RoomSuggestionInput = {}) {
  return queryWithServiceFallback(
    async (client) => {
      const { data, error } = await client.rpc("find_available_rooms", {
        p_branch_id: input.branchId ?? null,
        p_limit: input.limit ?? 12,
        p_room_type_id: input.roomTypeId ?? null,
        p_stay_end_at: input.stayEndAt ?? null,
        p_stay_start_at: input.stayStartAt ?? null
      });

      if (error) {
        throw error;
      }

      return (data ?? []) as RoomRow[];
    },
    [] as RoomRow[]
  );
}
