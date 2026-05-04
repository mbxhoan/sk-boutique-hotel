import type { RoomTypeClosureRow } from "@/lib/supabase/database.types";
import { queryWithServiceFallback } from "@/lib/supabase/queries/shared";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

const closureSelect =
  "id, room_type_id, branch_id, start_at, end_at, status, reason, cancelled_at, cancelled_by, created_by, updated_by, created_at, updated_at";

export async function listActiveClosures(roomTypeId?: string) {
  return queryWithServiceFallback(
    async (client) => {
      let query = client
        .from("room_type_closures")
        .select(closureSelect)
        .eq("status", "active")
        .order("start_at", { ascending: true });

      if (roomTypeId) {
        query = query.eq("room_type_id", roomTypeId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data ?? []) as RoomTypeClosureRow[];
    },
    [] as RoomTypeClosureRow[]
  );
}

export async function listClosuresByRoomType(roomTypeId: string, limit = 30) {
  return queryWithServiceFallback(
    async (client) => {
      const { data, error } = await client
        .from("room_type_closures")
        .select(closureSelect)
        .eq("room_type_id", roomTypeId)
        .order("start_at", { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return (data ?? []) as RoomTypeClosureRow[];
    },
    [] as RoomTypeClosureRow[]
  );
}

export async function listClosureOverlaps(input: {
  branchId?: string | null;
  stayStartAt: string;
  stayEndAt: string;
}) {
  return queryWithServiceFallback(
    async (client) => {
      const { data, error } = await client.rpc("list_room_type_closure_overlaps", {
        p_branch_id: input.branchId ?? null,
        p_stay_end_at: input.stayEndAt,
        p_stay_start_at: input.stayStartAt
      });

      if (error) {
        throw error;
      }

      return (data ?? []) as { room_type_id: string; branch_id: string | null }[];
    },
    [] as { room_type_id: string; branch_id: string | null }[]
  );
}

export async function createRoomTypeClosure(input: {
  roomTypeId: string;
  branchId?: string | null;
  startAt: string;
  endAt: string;
  reason?: string;
  createdBy?: string | null;
}) {
  const client = createSupabaseServiceClient();
  const { data, error } = await client.rpc("create_room_type_closure", {
    p_room_type_id: input.roomTypeId,
    p_branch_id: input.branchId ?? null,
    p_start_at: input.startAt,
    p_end_at: input.endAt,
    p_reason: input.reason ?? "",
    p_created_by: input.createdBy ?? null
  });

  if (error) {
    throw error;
  }

  return data as RoomTypeClosureRow;
}

export async function cancelRoomTypeClosure(input: { closureId: string; cancelledBy?: string | null }) {
  const client = createSupabaseServiceClient();
  const { data, error } = await client.rpc("cancel_room_type_closure", {
    p_closure_id: input.closureId,
    p_cancelled_by: input.cancelledBy ?? null
  });

  if (error) {
    throw error;
  }

  return data as RoomTypeClosureRow;
}
