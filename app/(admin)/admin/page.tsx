import type { Metadata } from "next";

import { AdminDashboard } from "@/components/admin-dashboard";
import { resolveLocale } from "@/lib/locale";
import { adminDashboardCopy } from "@/lib/mock/admin-dashboard";
import { getSupabaseEmailAdminRecipient, hasSupabaseServiceConfig } from "@/lib/supabase/env";
import { loadAdminWorkflowDashboard } from "@/lib/supabase/queries/operations";

type PageProps = {
  searchParams?: Promise<{
    branch?: string;
    limit?: string;
    lang?: string;
    range?: string;
    request?: string;
    roomType?: string;
    stayEndAt?: string;
    stayStartAt?: string;
  }>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);

  return {
    title: locale === "en" ? "Admin Console" : "Bảng điều khiển admin",
    description:
      locale === "en"
        ? adminDashboardCopy.shell.description.en
        : adminDashboardCopy.shell.description.vi
  };
}

export default async function AdminPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);
  const range = resolvedSearchParams.range === "today" || resolvedSearchParams.range === "30d" ? resolvedSearchParams.range : "7d";
  const parsedLimit = resolvedSearchParams.limit ? Number(resolvedSearchParams.limit) : null;
  const dashboard = await loadAdminWorkflowDashboard({
    branchId: resolvedSearchParams.branch,
    limit: parsedLimit != null && Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : undefined,
    range,
    requestId: resolvedSearchParams.request,
    roomTypeId: resolvedSearchParams.roomType,
    stayEndAt: resolvedSearchParams.stayEndAt,
    stayStartAt: resolvedSearchParams.stayStartAt
  });

  return (
    <AdminDashboard
      canOperate={hasSupabaseServiceConfig()}
      data={dashboard}
      locale={locale}
      range={range}
      searchParams={resolvedSearchParams}
      testEmailDefaultRecipient={getSupabaseEmailAdminRecipient()}
    />
  );
}
