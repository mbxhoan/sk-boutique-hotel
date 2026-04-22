import type { Metadata } from "next";

import { AdminBookingsPage } from "@/components/admin-bookings-page";
import { resolveLocale } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";
import { loadAdminWorkflowDashboard } from "@/lib/supabase/queries/operations";
import { countReservations } from "@/lib/supabase/queries/reservations";

type PageProps = {
  searchParams?: Promise<{
    branch?: string;
    lang?: string;
    limit?: string;
  }>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);

  return {
    title: localize(locale, { vi: "Đặt phòng", en: "Bookings" }),
    description: localize(locale, {
      vi: "Quản lý booking hiện tại, sắp tới và lịch sử đặt phòng.",
      en: "Manage current, upcoming, and past reservations."
    })
  };
}

export default async function AdminBookingsRoute({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);
  const parsedLimit = resolvedSearchParams.limit ? Number(resolvedSearchParams.limit) : 20;

  const dashboard = await loadAdminWorkflowDashboard({
    branchId: resolvedSearchParams.branch,
    limit: Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 20
  });
  const totalCount = await countReservations({
    branchId: resolvedSearchParams.branch
  });

  return <AdminBookingsPage locale={locale} reservations={dashboard.recent_reservations} totalCount={totalCount} />;
}
