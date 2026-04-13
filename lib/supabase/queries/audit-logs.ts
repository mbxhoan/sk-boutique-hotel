import type { AuditLogRow } from "@/lib/supabase/database.types";
import { queryWithServiceFallback } from "@/lib/supabase/queries/shared";

const auditLogSelect = `
  id, event_key, action, summary, entity_type, entity_id, branch_id, customer_id,
  room_id, hold_id, reservation_id, availability_request_id, actor_user_id,
  actor_role, metadata, happened_at
`;

type AuditLogQueryOptions = {
  branchId?: string;
  limit?: number;
  since?: string;
};

export async function listAuditLogs(options: AuditLogQueryOptions = {}) {
  return queryWithServiceFallback(
    async (client) => {
      let query = client.from("audit_logs").select(auditLogSelect);

      if (options.branchId) {
        query = query.eq("branch_id", options.branchId);
      }

      if (options.since) {
        query = query.gte("happened_at", options.since);
      }

      const { data, error } = await query.order("happened_at", { ascending: false }).limit(options.limit ?? 10);

      if (error) {
        throw error;
      }

      return (data ?? []) as AuditLogRow[];
    },
    [] as AuditLogRow[]
  );
}

export async function countAuditLogs(options: AuditLogQueryOptions = {}) {
  return queryWithServiceFallback(
    async (client) => {
      let query = client.from("audit_logs").select("id", { count: "exact", head: true });

      if (options.branchId) {
        query = query.eq("branch_id", options.branchId);
      }

      if (options.since) {
        query = query.gte("happened_at", options.since);
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
