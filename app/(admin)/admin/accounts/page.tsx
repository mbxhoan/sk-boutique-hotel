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
    title: locale === "en" ? "Accounts" : "Tài khoản nội bộ",
    description: localize(locale, adminManagementCopy.accounts.description)
  };
}

export default async function AdminAccountsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);

  return (
    <AdminManagementPage
      actions={
        <Link className="button button--text-light" href={appendLocaleQuery("/admin/roles", locale)}>
          {locale === "en" ? "Open roles" : "Mở phân quyền"}
        </Link>
      }
      locale={locale}
      page={adminManagementCopy.accounts}
    />
  );
}
