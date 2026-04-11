import type { PaymentRequestRow, PaymentRequestStatus } from "@/lib/supabase/database.types";
import { queryWithServiceFallback } from "@/lib/supabase/queries/shared";

const paymentRequestSelect = `
  id, payment_code, reservation_id, branch_id, customer_id, branch_bank_account_id,
  bank_name, bank_bin, account_name, account_number, amount, currency,
  transfer_content, note, source, status, public_upload_link_expires_at,
  proof_uploaded_at, verified_at, rejected_at, rejected_reason,
  confirmation_email_sent_at, confirmation_email_to, confirmation_pdf_generated_at,
  confirmation_pdf_path, created_by, updated_by, created_at, updated_at
`;

type PaymentRequestQueryOptions = {
  branchId?: string;
  customerId?: string;
  limit?: number;
  reservationId?: string;
  status?: PaymentRequestStatus | PaymentRequestStatus[];
};

export async function listPaymentRequests(options: PaymentRequestQueryOptions = {}) {
  return queryWithServiceFallback(
    async (client) => {
      let query = client.from("payment_requests").select(paymentRequestSelect);

      if (options.branchId) {
        query = query.eq("branch_id", options.branchId);
      }

      if (options.customerId) {
        query = query.eq("customer_id", options.customerId);
      }

      if (options.reservationId) {
        query = query.eq("reservation_id", options.reservationId);
      }

      if (options.status) {
        if (Array.isArray(options.status)) {
          query = query.in("status", options.status);
        } else {
          query = query.eq("status", options.status);
        }
      }

      const { data, error } = await query.order("created_at", { ascending: false }).limit(options.limit ?? 12);

      if (error) {
        throw error;
      }

      return (data ?? []) as PaymentRequestRow[];
    },
    [] as PaymentRequestRow[]
  );
}

export async function getPaymentRequestById(paymentRequestId: string) {
  return queryWithServiceFallback(
    async (client) => {
      const { data, error } = await client
        .from("payment_requests")
        .select(paymentRequestSelect)
        .eq("id", paymentRequestId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return (data ?? null) as PaymentRequestRow | null;
    },
    null as PaymentRequestRow | null
  );
}

export async function countPaymentRequests(options: PaymentRequestQueryOptions = {}) {
  return queryWithServiceFallback(
    async (client) => {
      let query = client.from("payment_requests").select("id", { count: "exact", head: true });

      if (options.branchId) {
        query = query.eq("branch_id", options.branchId);
      }

      if (options.customerId) {
        query = query.eq("customer_id", options.customerId);
      }

      if (options.reservationId) {
        query = query.eq("reservation_id", options.reservationId);
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
