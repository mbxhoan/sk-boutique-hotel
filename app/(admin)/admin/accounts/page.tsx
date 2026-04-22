import Link from "next/link";
import type { Metadata } from "next";

import { AdminAccountsPage } from "@/components/admin-accounts-page";
import { appendLocaleQuery, resolveLocale } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";
import { listCustomers } from "@/lib/supabase/queries/customers";

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
    description: localize(locale, {
      vi: "Danh sách khách hàng và tài khoản member thật đang hoạt động trong hệ thống.",
      en: "Real customers and member accounts active in the system."
    })
  };
}

export default async function AdminAccountsPageRoute({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);
  const customers = await listCustomers({ limit: 200 });

  return (
    <AdminAccountsPage
      actions={
        <Link className="button button--text-light" href={appendLocaleQuery("/admin/roles", locale)}>
          {locale === "en" ? "Open roles" : "Mở phân quyền"}
        </Link>
      }
      locale={locale}
      customers={customers}
    />
  );
}
