import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { MemberAuthForm } from "@/components/member-auth-form";
import { LogoMark } from "@/components/logo-mark";
import { appendLocaleQuery, resolveLocale } from "@/lib/locale";
import { localize, type LocalizedText } from "@/lib/mock/i18n";
import { getSupabaseUser } from "@/lib/supabase/auth";

type PageProps = {
  searchParams?: Promise<{
    lang?: string;
    next?: string;
  }>;
};

const pageCopy = {
  description: {
    vi: "Tạo tài khoản nhanh để hệ thống lưu lịch sử và dùng chung với luồng booking manual-first.",
    en: "Create a quick account so the system can keep your history and support the manual-first booking flow."
  } satisfies LocalizedText,
  eyebrow: {
    vi: "Cổng thành viên",
    en: "Member portal"
  } satisfies LocalizedText,
  title: {
    vi: "Đăng ký tài khoản thành viên",
    en: "Create a member account"
  } satisfies LocalizedText
} as const;

function buildMemberLocaleHref(pathname: string, locale: "vi" | "en", next?: string) {
  const url = new URL(pathname, "https://sk-boutique-hotel.local");

  if (next?.startsWith("/")) {
    url.searchParams.set("next", next);
  }

  return appendLocaleQuery(`${url.pathname}${url.search}${url.hash}`, locale);
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);

  return {
    title: locale === "en" ? "Member sign up" : "Đăng ký thành viên",
    description: localize(locale, pageCopy.description)
  };
}

export default async function MemberSignUpPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);
  const nextHref = resolvedSearchParams.next?.startsWith("/") ? resolvedSearchParams.next : "/member";
  const user = await getSupabaseUser().catch(() => null);

  if (user) {
    redirect(appendLocaleQuery(nextHref, locale));
  }

  return (
    <main className="admin-auth-page">
      <section className="admin-auth-card">
        <div className="admin-auth-card__topbar">
          <LogoMark className="site-header__logo" href={appendLocaleQuery("/", locale)} priority />
          <div className="admin-auth-card__locale-switch" aria-label={locale === "en" ? "Language switch" : "Chuyển ngôn ngữ"}>
            <Link
              className={`admin-auth-card__locale-link${locale === "vi" ? " admin-auth-card__locale-link--active" : ""}`}
              href={buildMemberLocaleHref("/member/sign-up", "vi", nextHref)}
            >
              VI
            </Link>
            <Link
              className={`admin-auth-card__locale-link${locale === "en" ? " admin-auth-card__locale-link--active" : ""}`}
              href={buildMemberLocaleHref("/member/sign-up", "en", nextHref)}
            >
              EN
            </Link>
          </div>
        </div>

        <p className="portal-shell__eyebrow">{localize(locale, pageCopy.eyebrow)}</p>
        <h1 className="admin-auth-card__title">{localize(locale, pageCopy.title)}</h1>
        <p className="admin-auth-card__description">{localize(locale, pageCopy.description)}</p>
        <MemberAuthForm locale={locale} mode="sign-up" />
      </section>
    </main>
  );
}
