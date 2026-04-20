import type { Metadata } from "next";

import { AdminContentPagesManager } from "@/components/admin-content-pages-manager";
import { resolveLocale } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";
import { adminManagementCopy } from "@/lib/mock/admin-management";
import { listContentPages } from "@/lib/supabase/queries/content-pages";

type PageProps = {
  searchParams?: Promise<{
    lang?: string;
  }>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);

  return {
    title: locale === "en" ? "Pages & articles" : "Bài viết & trang",
    description: localize(locale, adminManagementCopy.contentPages.description)
  };
}

export default async function AdminContentPagesPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);
  const pages = await listContentPages();

  return (
    <AdminContentPagesManager
      locale={locale}
      pages={pages}
    />
  );
}
