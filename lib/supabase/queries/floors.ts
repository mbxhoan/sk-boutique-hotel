import type { FloorRow } from "@/lib/supabase/database.types";
import { queryWithServiceFallback } from "@/lib/supabase/queries/shared";

export async function listFloorsByBranchId(branchId: string) {
  return queryWithServiceFallback(
    async (client) => {
      const { data, error } = await client
        .from("floors")
        .select("id, branch_id, code, level_number, name_vi, name_en, notes_vi, notes_en, sort_order, is_active, created_at, updated_at")
        .eq("branch_id", branchId)
        .eq("is_active", true)
        .order("level_number", { ascending: true })
        .order("sort_order", { ascending: true });

      if (error) {
        throw error;
      }

      return (data ?? []) as FloorRow[];
    },
    [] as FloorRow[]
  );
}

export async function getFloorById(floorId: string) {
  return queryWithServiceFallback(
    async (client) => {
      const { data, error } = await client
        .from("floors")
        .select("id, branch_id, code, level_number, name_vi, name_en, notes_vi, notes_en, sort_order, is_active, created_at, updated_at")
        .eq("id", floorId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return (data ?? null) as FloorRow | null;
    },
    null as FloorRow | null
  );
}
