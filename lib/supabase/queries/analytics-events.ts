import type { AnalyticsEventRow, AnalyticsEventType } from "@/lib/supabase/database.types";
import { queryWithServiceFallback } from "@/lib/supabase/queries/shared";

const analyticsEventSelect = `
  id, event_type, entity_type, entity_id, page_path, branch_id, room_type_id, reservation_id,
  customer_id, locale, source, metadata, occurred_at, created_at, updated_at
`;

type AnalyticsEventQueryOptions = {
  branchId?: string;
  eventType?: AnalyticsEventType | AnalyticsEventType[];
  since?: string;
  limit?: number;
  roomTypeId?: string;
};

export async function listAnalyticsEvents(options: AnalyticsEventQueryOptions = {}) {
  return queryWithServiceFallback(
    async (client) => {
      let query = client.from("analytics_events").select(analyticsEventSelect);

      if (options.branchId) {
        query = query.eq("branch_id", options.branchId);
      }

      if (options.roomTypeId) {
        query = query.eq("room_type_id", options.roomTypeId);
      }

      if (options.since) {
        query = query.gte("occurred_at", options.since);
      }

      if (options.eventType) {
        if (Array.isArray(options.eventType)) {
          query = query.in("event_type", options.eventType);
        } else {
          query = query.eq("event_type", options.eventType);
        }
      }

      const { data, error } = await query.order("occurred_at", { ascending: false }).limit(options.limit ?? 24);

      if (error) {
        throw error;
      }

      return (data ?? []) as AnalyticsEventRow[];
    },
    [] as AnalyticsEventRow[]
  );
}

export async function countAnalyticsEvents(options: AnalyticsEventQueryOptions = {}) {
  return queryWithServiceFallback(
    async (client) => {
      let query = client.from("analytics_events").select("id", { count: "exact", head: true });

      if (options.branchId) {
        query = query.eq("branch_id", options.branchId);
      }

      if (options.roomTypeId) {
        query = query.eq("room_type_id", options.roomTypeId);
      }

      if (options.since) {
        query = query.gte("occurred_at", options.since);
      }

      if (options.eventType) {
        if (Array.isArray(options.eventType)) {
          query = query.in("event_type", options.eventType);
        } else {
          query = query.eq("event_type", options.eventType);
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
