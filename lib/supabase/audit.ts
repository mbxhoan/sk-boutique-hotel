import type { AuditLogRow, Json } from "@/lib/supabase/database.types";
import { toError } from "@/lib/supabase/errors";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export type LogAuditEventInput = {
  action: string;
  actorRole?: string | null;
  actorUserId?: string | null;
  availabilityRequestId?: string | null;
  branchId?: string | null;
  customerId?: string | null;
  entityId?: string | null;
  entityType: string;
  holdId?: string | null;
  metadata?: Json | null;
  reservationId?: string | null;
  roomId?: string | null;
  summary: string;
};

export async function logAuditEvent(input: LogAuditEventInput) {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.rpc("log_audit_event", {
    p_action: input.action,
    p_actor_role: input.actorRole ?? null,
    p_actor_user_id: input.actorUserId ?? null,
    p_availability_request_id: input.availabilityRequestId ?? null,
    p_branch_id: input.branchId ?? null,
    p_customer_id: input.customerId ?? null,
    p_entity_id: input.entityId ?? null,
    p_entity_type: input.entityType,
    p_hold_id: input.holdId ?? null,
    p_metadata: input.metadata ?? {},
    p_reservation_id: input.reservationId ?? null,
    p_room_id: input.roomId ?? null,
    p_summary: input.summary
  });

  if (error) {
    throw toError(error, "Unable to write audit log.");
  }

  return data as AuditLogRow;
}
