import type { BranchBankAccountRow } from "@/lib/supabase/database.types";
import { queryWithServiceFallback } from "@/lib/supabase/queries/shared";

const branchBankAccountSelect = `
  id, branch_id, bank_name, bank_bin, account_name, account_number,
  account_label, qr_provider, is_default, is_active, sort_order, created_at, updated_at
`;

type BranchBankAccountQueryOptions = {
  branchId?: string;
  limit?: number;
  onlyActive?: boolean;
};

export async function listBranchBankAccounts(options: BranchBankAccountQueryOptions = {}) {
  return queryWithServiceFallback(
    async (client) => {
      let query = client.from("branch_bank_accounts").select(branchBankAccountSelect);

      if (options.branchId) {
        query = query.eq("branch_id", options.branchId);
      }

      if (options.onlyActive ?? true) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query
        .order("is_default", { ascending: false })
        .order("sort_order", { ascending: true })
        .limit(options.limit ?? 20);

      if (error) {
        throw error;
      }

      return (data ?? []) as BranchBankAccountRow[];
    },
    [] as BranchBankAccountRow[]
  );
}

export async function getBranchBankAccountById(branchBankAccountId: string) {
  return queryWithServiceFallback(
    async (client) => {
      const { data, error } = await client
        .from("branch_bank_accounts")
        .select(branchBankAccountSelect)
        .eq("id", branchBankAccountId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return (data ?? null) as BranchBankAccountRow | null;
    },
    null as BranchBankAccountRow | null
  );
}
