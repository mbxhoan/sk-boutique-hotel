import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { MemberAuthPage } from "@/components/member-auth-page";
import { MemberAuthForm } from "@/components/member-auth-form";
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
    <MemberAuthPage
      description={pageCopy.description}
      eyebrow={pageCopy.eyebrow}
      locale={locale}
      nextHref={nextHref}
      routePath="/member/sign-up"
      title={pageCopy.title}
    >
      <MemberAuthForm locale={locale} mode="sign-up" />
    </MemberAuthPage>
  );
}
