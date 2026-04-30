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
  const { data, error } = await supabase
    .from("audit_logs")
    .insert({
      action: input.action,
      actor_role: input.actorRole ?? null,
      actor_user_id: input.actorUserId ?? null,
      availability_request_id: input.availabilityRequestId ?? null,
      branch_id: input.branchId ?? null,
      customer_id: input.customerId ?? null,
      entity_id: input.entityId ?? null,
      entity_type: input.entityType,
      hold_id: input.holdId ?? null,
      metadata: input.metadata ?? {},
      reservation_id: input.reservationId ?? null,
      room_id: input.roomId ?? null,
      summary: input.summary
    })
    .select("*")
    .single();

  if (error) {
    throw toError(error, "Unable to write audit log.");
  }

  return data as AuditLogRow;
}
