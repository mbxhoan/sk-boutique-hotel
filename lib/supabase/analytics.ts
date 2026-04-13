import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { hasSupabaseServiceConfig } from "@/lib/supabase/env";
import type { AnalyticsEventType, Json } from "@/lib/supabase/database.types";

export type TrackAnalyticsEventInput = {
  branchId?: string | null;
  customerId?: string | null;
  entityId?: string | null;
  entityType?: string;
  eventType: AnalyticsEventType;
  locale?: string;
  metadata?: Record<string, unknown>;
  pagePath?: string;
  reservationId?: string | null;
  roomTypeId?: string | null;
  source?: string;
};

export async function trackAnalyticsEvent(input: TrackAnalyticsEventInput) {
  if (!hasSupabaseServiceConfig()) {
    return null;
  }

  const supabase = createSupabaseServiceClient();

  const { data, error } = await supabase
    .from("analytics_events")
    .insert({
      branch_id: input.branchId ?? null,
      customer_id: input.customerId ?? null,
      entity_id: input.entityId ?? null,
      entity_type: input.entityType ?? "",
      event_type: input.eventType,
      locale: input.locale ?? "vi",
      metadata: (input.metadata ?? {}) as Json,
      occurred_at: new Date().toISOString(),
      page_path: input.pagePath ?? "",
      reservation_id: input.reservationId ?? null,
      room_type_id: input.roomTypeId ?? null,
      source: input.source ?? "website"
    })
    .select("id")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ?? null;
}
