import type { PaymentProofRow, PaymentProofStatus } from "@/lib/supabase/database.types";
import { queryWithServiceFallback } from "@/lib/supabase/queries/shared";

const paymentProofSelect = `
  id, payment_request_id, customer_id, uploaded_by_user_id, file_bucket, file_path,
  file_name, mime_type, file_size, uploaded_via, note, status, reviewed_at,
  reviewed_by, review_note, created_at, updated_at
`;

type PaymentProofQueryOptions = {
  customerId?: string;
  limit?: number;
  paymentRequestId?: string;
  status?: PaymentProofStatus | PaymentProofStatus[];
};

export async function listPaymentProofs(options: PaymentProofQueryOptions = {}) {
  return queryWithServiceFallback(
    async (client) => {
      let query = client.from("payment_proofs").select(paymentProofSelect);

      if (options.customerId) {
        query = query.eq("customer_id", options.customerId);
      }

      if (options.paymentRequestId) {
        query = query.eq("payment_request_id", options.paymentRequestId);
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

      return (data ?? []) as PaymentProofRow[];
    },
    [] as PaymentProofRow[]
  );
}

export async function getLatestPaymentProofByRequestId(paymentRequestId: string) {
  return queryWithServiceFallback(
    async (client) => {
      const { data, error } = await client
        .from("payment_proofs")
        .select(paymentProofSelect)
        .eq("payment_request_id", paymentRequestId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return (data ?? null) as PaymentProofRow | null;
    },
    null as PaymentProofRow | null
  );
}
