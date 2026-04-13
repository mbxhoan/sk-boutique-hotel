import Link from "next/link";
import type { Metadata } from "next";

import { AdminManagementPage } from "@/components/admin-management-page";
import { appendLocaleQuery, resolveLocale } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";
import { adminManagementCopy } from "@/lib/mock/admin-management";

type PageProps = {
  searchParams?: Promise<{
    lang?: string;
  }>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);

  return {
    title: locale === "en" ? "Pages & posts" : "Bài viết & trang",
    description: localize(locale, adminManagementCopy.contentPages.description)
  };
}

export default async function AdminContentPagesPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);

  return (
    <AdminManagementPage
      actions={
        <Link className="button button--text-light" target="_blank" href={appendLocaleQuery("/", locale)}>
          {locale === "en" ? "View public site" : "Xem website"}
        </Link>
      }
      locale={locale}
      page={adminManagementCopy.contentPages}
    />
  );
}
