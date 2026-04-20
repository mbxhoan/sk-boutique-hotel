import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { MemberHistoryDashboard } from "@/components/member-history-dashboard";
import { MemberDashboard } from "@/components/member-dashboard";
import { MemberPortalSidebar } from "@/components/member-portal-sidebar";
import { appendLocaleQuery, resolveLocale } from "@/lib/locale";
import { memberDashboardCopy } from "@/lib/mock/member-dashboard";
import { getSupabaseSession } from "@/lib/supabase/auth";
import { loadMemberHistoryDashboard } from "@/lib/supabase/queries/member-history";

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
  const session = await getSupabaseSession().catch(() => null);

  if (!session?.user) {
    redirect(appendLocaleQuery("/member/sign-in", locale));
  }

  const data = await loadMemberHistoryDashboard(session.user.id, session.user.email ?? null);

  if (data) {
    return (
      <section className="section">
        <div className="section-shell member-portal-layout">
          <MemberPortalSidebar locale={locale} />
          <div className="member-portal-layout__content">
            <MemberHistoryDashboard data={data} locale={locale} />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="section-shell member-portal-layout">
        <MemberPortalSidebar locale={locale} />
        <div className="member-portal-layout__content">
          <MemberDashboard locale={locale} />
        </div>
      </div>
    </section>
  );
}
