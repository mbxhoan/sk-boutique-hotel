import type { Metadata } from "next";

import { AdminDashboard } from "@/components/admin-dashboard";
import { resolveLocale } from "@/lib/locale";
import { adminDashboardCopy } from "@/lib/mock/admin-dashboard";

type PageProps = {
  searchParams?: Promise<{
    lang?: string;
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

  return <AdminDashboard locale={locale} />;
}
