import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminSignInForm } from "@/components/admin-sign-in-form";
import { PortalBadge } from "@/components/portal-ui";
import { localize, type LocalizedText } from "@/lib/mock/i18n";
import { resolveLocale } from "@/lib/locale";
import { canAccessAdminPortal, getSupabaseUser } from "@/lib/supabase/auth";

type PageProps = {
  searchParams?: Promise<{
    lang?: string;
    next?: string;
  }>;
};

const pageCopy = {
  description: {
    vi: "Portal nội bộ SK Boutique Hotel dùng tài khoản đã seed để thử luồng đăng nhập admin.",
    en: "The internal SK Boutique Hotel portal uses seeded accounts to exercise the admin sign-in flow."
  } satisfies LocalizedText,
  eyebrow: {
    vi: "Đăng nhập nội bộ",
    en: "Internal sign-in"
  } satisfies LocalizedText,
  title: {
    vi: "Truy cập admin portal",
    en: "Access the admin portal"
  } satisfies LocalizedText
} as const;

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);

  return {
    title: locale === "en" ? "Admin sign in" : "Đăng nhập admin",
    description:
      locale === "en" ? pageCopy.description.en : pageCopy.description.vi
  };
}

export default async function AdminSignInPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);
  const user = await getSupabaseUser().catch(() => null);

  if (canAccessAdminPortal(user)) {
    redirect("/admin");
  }

  if (user) {
    redirect("/member");
  }

  return (
    <main className="admin-auth-page">
      <section className="admin-auth-card">
        <PortalBadge tone="accent">{localize(locale, pageCopy.eyebrow)}</PortalBadge>
        <h1 className="admin-auth-card__title">{localize(locale, pageCopy.title)}</h1>
        <p className="admin-auth-card__description">{localize(locale, pageCopy.description)}</p>
        <AdminSignInForm locale={locale} />
      </section>
    </main>
  );
}
