import type { Metadata } from "next";

import { MemberDashboard } from "@/components/member-dashboard";
import { resolveLocale } from "@/lib/locale";
import { memberDashboardCopy } from "@/lib/mock/member-dashboard";

type PageProps = {
  searchParams?: Promise<{
    lang?: string;
  }>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);

  return {
    title: locale === "en" ? "Member Portal" : "Cổng thành viên",
    description:
      locale === "en"
        ? memberDashboardCopy.shell.description.en
        : memberDashboardCopy.shell.description.vi
  };
}

export default async function MemberPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);

  return <MemberDashboard locale={locale} />;
}
