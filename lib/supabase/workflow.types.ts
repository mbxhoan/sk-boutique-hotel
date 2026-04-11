import type {
  AuditLogRow,
  AvailabilityRequestRow,
  BranchRow,
  ReservationRow,
  RoomHoldRow,
  RoomRow,
  RoomTypeRow
} from "@/lib/supabase/database.types";

export type WorkflowStatTone = "default" | "soft" | "accent";

export type WorkflowStatCard = {
  detail_en: string;
  detail_vi: string;
  label_en: string;
  label_vi: string;
  tone: WorkflowStatTone;
  value: string;
};

export type WorkflowBranchOption = Pick<BranchRow, "code" | "id" | "name_en" | "name_vi" | "slug" | "timezone">;

export type WorkflowRoomTypeOption = Pick<
  RoomTypeRow,
  | "base_price"
  | "code"
  | "id"
  | "manual_override_price"
  | "name_en"
  | "name_vi"
  | "show_public_price"
  | "slug"
  | "weekend_surcharge"
>;

export type WorkflowAvailabilityRequest = AvailabilityRequestRow & {
  branch_name_en: string;
  branch_name_vi: string;
  room_type_name_en: string;
  room_type_name_vi: string;
};

export type WorkflowRoomHold = RoomHoldRow & {
  branch_name_en: string;
  branch_name_vi: string;
  room_code: string;
  room_type_name_en: string;
  room_type_name_vi: string;
};

export type WorkflowReservation = ReservationRow & {
  branch_name_en: string;
  branch_name_vi: string;
  primary_room_type_name_en: string;
  primary_room_type_name_vi: string;
  room_code: string;
};

export type WorkflowAuditLog = AuditLogRow & {
  branch_name_en: string | null;
  branch_name_vi: string | null;
  entity_label_en: string;
  entity_label_vi: string;
};

export type WorkflowRoomSuggestion = RoomRow & {
  branch_name_en: string;
  branch_name_vi: string;
  room_type_name_en: string;
  room_type_name_vi: string;
  floor_code: string | null;
  floor_name_en: string | null;
  floor_name_vi: string | null;
};

export type WorkflowSelection = {
  branchId?: string;
  requestId?: string;
  roomTypeId?: string;
  stayEndAt?: string;
  stayStartAt?: string;
  limit?: number;
};

export type WorkflowDashboardData = {
  active_room_holds: WorkflowRoomHold[];
  availability_requests: WorkflowAvailabilityRequest[];
  audit_logs: WorkflowAuditLog[];
  branch_options: WorkflowBranchOption[];
  recent_reservations: WorkflowReservation[];
  room_suggestions: WorkflowRoomSuggestion[];
  room_type_options: WorkflowRoomTypeOption[];
  selected_request: WorkflowAvailabilityRequest | null;
  selected_request_context: {
    branchId: string;
    roomTypeId: string;
    stayEndAt: string;
    stayStartAt: string;
  } | null;
  stats: WorkflowStatCard[];
};
