import type {
  BranchBankAccountRow,
  AuditLogRow,
  AvailabilityRequestRow,
  BranchRow,
  CustomerRow,
  PaymentProofRow,
  PaymentRequestRow,
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

export type WorkflowBranchBankAccountOption = BranchBankAccountRow & {
  branch_name_en: string;
  branch_name_vi: string;
};

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

export type WorkflowPaymentRequest = PaymentRequestRow & {
  branch_name_en: string;
  branch_name_vi: string;
  customer_email: string;
  customer_name: string;
  latest_proof_file_name: string | null;
  latest_proof_file_path: string | null;
  latest_proof_id: string | null;
  latest_proof_review_note: string | null;
  latest_proof_status: PaymentProofRow["status"] | null;
  latest_proof_uploaded_at: string | null;
  latest_proof_url: string | null;
  payment_upload_path: string | null;
  qr_image_url: string;
  reservation_booking_code: string;
  reservation_room_code: string;
  room_type_name_en: string | null;
  room_type_name_vi: string | null;
};

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
  customer_email: string;
  customer_name: string;
  primary_room_type_name_en: string;
  primary_room_type_name_vi: string;
  room_code: string | null;
};

export type WorkflowBookingSource = "availability_request" | "reservation";

export type WorkflowBookingRow = {
  booking_code: string;
  branch_id: string;
  branch_name_en: string;
  branch_name_vi: string;
  created_at: string;
  customer_email: string;
  customer_name: string;
  guest_count: number;
  id: string;
  notes: string;
  room_code: string | null;
  room_type_id: string;
  room_type_name_en: string;
  room_type_name_vi: string;
  source: WorkflowBookingSource;
  status: AvailabilityRequestRow["status"] | ReservationRow["status"];
  stay_end_at: string;
  stay_start_at: string;
  total_amount: number;
  updated_at: string;
};

export type WorkflowAuditLog = AuditLogRow & {
  branch_name_en: string | null;
  branch_name_vi: string | null;
  entity_label_en: string;
  entity_label_vi: string;
};

export type WorkflowPaymentProof = PaymentProofRow & {
  branch_name_en: string;
  branch_name_vi: string;
  payment_code: string;
  reservation_booking_code: string;
  reservation_room_code: string;
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

export type WorkflowDashboardRange = "today" | "7d" | "30d";

export type WorkflowSelection = {
  branchId?: string;
  range?: WorkflowDashboardRange;
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
  branch_bank_account_options: WorkflowBranchBankAccountOption[];
  payment_requests: WorkflowPaymentRequest[];
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

export type WorkflowMemberHistoryData = {
  availability_requests: WorkflowAvailabilityRequest[];
  audit_logs: WorkflowAuditLog[];
  branch_options: WorkflowBranchOption[];
  customer: CustomerRow;
  payment_proofs: WorkflowPaymentProof[];
  payment_requests: WorkflowPaymentRequest[];
  reservations: WorkflowReservation[];
  room_type_options: WorkflowRoomTypeOption[];
};
