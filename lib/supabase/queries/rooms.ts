import type { RoomRow, RoomStatus } from "@/lib/supabase/database.types";
import { queryWithFallback } from "@/lib/supabase/queries/shared";

export async function listRoomsByBranchId(branchId: string) {
  return queryWithFallback(
    async (client) => {
      const { data, error } = await client
        .from("rooms")
        .select("id, branch_id, floor_id, room_type_id, code, notes_vi, notes_en, status, is_active, created_at, updated_at")
        .eq("branch_id", branchId)
        .eq("is_active", true)
        .order("code", { ascending: true });

      if (error) {
        throw error;
      }

      return (data ?? []) as RoomRow[];
    },
    [] as RoomRow[]
  );
}

export async function listRoomsByRoomTypeId(roomTypeId: string) {
  return queryWithFallback(
    async (client) => {
      const { data, error } = await client
        .from("rooms")
        .select("id, branch_id, floor_id, room_type_id, code, notes_vi, notes_en, status, is_active, created_at, updated_at")
        .eq("room_type_id", roomTypeId)
        .eq("is_active", true)
        .order("code", { ascending: true });

      if (error) {
        throw error;
      }

      return (data ?? []) as RoomRow[];
    },
    [] as RoomRow[]
  );
}

export async function listRoomsByStatus(status: RoomStatus) {
  return queryWithFallback(
    async (client) => {
      const { data, error } = await client
        .from("rooms")
        .select("id, branch_id, floor_id, room_type_id, code, notes_vi, notes_en, status, is_active, created_at, updated_at")
        .eq("status", status)
        .eq("is_active", true)
        .order("code", { ascending: true });

      if (error) {
        throw error;
      }

      return (data ?? []) as RoomRow[];
    },
    [] as RoomRow[]
  );
}

export async function getRoomById(roomId: string) {
  return queryWithFallback(
    async (client) => {
      const { data, error } = await client
        .from("rooms")
        .select("id, branch_id, floor_id, room_type_id, code, notes_vi, notes_en, status, is_active, created_at, updated_at")
        .eq("id", roomId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return (data ?? null) as RoomRow | null;
    },
    null as RoomRow | null
  );
}
