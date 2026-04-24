import type { Metadata } from "next";

import { AdminNotificationsPageSection } from "@/components/admin-notifications-center";
import { resolveLocale } from "@/lib/locale";
import { loadAdminNotifications } from "@/lib/supabase/queries/admin-notifications";

type PageProps = {
  searchParams?: Promise<{
    branch?: string;
    lang?: string;
  }>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);

  return {
    title: locale === "en" ? "Admin notifications" : "Thông báo admin",
    description:
      locale === "en"
        ? "Recent booking, deposit, and operational notifications for the admin portal."
        : "Danh sách thông báo gần đây về booking, cọc và vận hành trong admin portal."
  };
}

export default async function AdminNotificationsRoute({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);
  const notifications = await loadAdminNotifications({
    branchId: resolvedSearchParams.branch ?? null,
    limit: 24
  });

  return <AdminNotificationsPageSection items={notifications} locale={locale} />;
}
