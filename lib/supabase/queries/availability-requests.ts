import type {
  AvailabilityRequestRow,
  AvailabilityRequestStatus
} from "@/lib/supabase/database.types";
import { queryWithServiceFallback } from "@/lib/supabase/queries/shared";

const availabilityRequestSelect = `
  id, request_code, customer_id, branch_id, room_type_id, stay_start_at, stay_end_at,
  guest_count, contact_name, contact_email, contact_phone, note, marketing_consent,
  preferred_locale, source, status, response_due_at, quoted_nightly_rate,
  quoted_total_amount, quoted_currency, assigned_to, handled_by, handled_at,
  closed_at, created_by, updated_by, created_at, updated_at
`;

type AvailabilityRequestQueryOptions = {
  branchId?: string;
  contactEmail?: string;
  customerId?: string;
  limit?: number;
  requestCode?: string;
  roomTypeId?: string;
  status?: AvailabilityRequestStatus | AvailabilityRequestStatus[];
};

export async function listAvailabilityRequests(options: AvailabilityRequestQueryOptions = {}) {
  return queryWithServiceFallback(
    async (client) => {
      let query = client.from("availability_requests").select(availabilityRequestSelect);

      if (options.branchId) {
        query = query.eq("branch_id", options.branchId);
      }

      if (options.contactEmail) {
        query = query.ilike("contact_email", options.contactEmail);
      }

      if (options.customerId) {
        query = query.eq("customer_id", options.customerId);
      }

      if (options.requestCode) {
        query = query.eq("request_code", options.requestCode);
      }

      if (options.roomTypeId) {
        query = query.eq("room_type_id", options.roomTypeId);
      }

      if (options.status) {
        if (Array.isArray(options.status)) {
          query = query.in("status", options.status);
        } else {
          query = query.eq("status", options.status);
        }
      }

      const { data, error } = await query
        .order("created_at", { ascending: false })
        .limit(options.limit ?? 12);

      if (error) {
        throw error;
      }

      return (data ?? []) as AvailabilityRequestRow[];
    },
    [] as AvailabilityRequestRow[]
  );
}

export async function getAvailabilityRequestById(requestId: string) {
  return queryWithServiceFallback(
    async (client) => {
      const { data, error } = await client
        .from("availability_requests")
        .select(availabilityRequestSelect)
        .eq("id", requestId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return (data ?? null) as AvailabilityRequestRow | null;
    },
    null as AvailabilityRequestRow | null
  );
}

export async function getAvailabilityRequestByRequestCode(requestCode: string) {
  return queryWithServiceFallback(
    async (client) => {
      const { data, error } = await client
        .from("availability_requests")
        .select(availabilityRequestSelect)
        .eq("request_code", requestCode)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return (data ?? null) as AvailabilityRequestRow | null;
    },
    null as AvailabilityRequestRow | null
  );
}

export async function countAvailabilityRequests(options: AvailabilityRequestQueryOptions = {}) {
  return queryWithServiceFallback(
    async (client) => {
      let query = client.from("availability_requests").select("id", { count: "exact", head: true });

      if (options.branchId) {
        query = query.eq("branch_id", options.branchId);
      }

      if (options.contactEmail) {
        query = query.ilike("contact_email", options.contactEmail);
      }

      if (options.customerId) {
        query = query.eq("customer_id", options.customerId);
      }

      if (options.requestCode) {
        query = query.eq("request_code", options.requestCode);
      }

      if (options.roomTypeId) {
        query = query.eq("room_type_id", options.roomTypeId);
      }

      if (options.status) {
        if (Array.isArray(options.status)) {
          query = query.in("status", options.status);
        } else {
          query = query.eq("status", options.status);
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
