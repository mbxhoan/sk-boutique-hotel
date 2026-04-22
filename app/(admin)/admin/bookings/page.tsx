import type { Metadata } from "next";

import { AdminBookingsPage } from "@/components/admin-bookings-page";
import { resolveLocale } from "@/lib/locale";
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
    title: locale === "en" ? "Bookings" : "Bookings",
    description:
      locale === "en"
        ? "Manage all current, upcoming, and past reservations."
        : "Quản lý toàn bộ booking hiện tại, sắp tới và lịch sử đặt phòng."
  };
}

export default async function AdminBookingsRoute({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);
  const parsedLimit = resolvedSearchParams.limit ? Number(resolvedSearchParams.limit) : 6;

  const dashboard = await loadAdminWorkflowDashboard({
    branchId: resolvedSearchParams.branch,
    limit: Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 6
  });
  const totalCount = await countReservations({
    branchId: resolvedSearchParams.branch
  });

  return <AdminBookingsPage locale={locale} reservations={dashboard.recent_reservations} totalCount={totalCount} />;
}
