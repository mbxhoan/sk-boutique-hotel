import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { MemberHistoryDashboard } from "@/components/member-history-dashboard";
import { MemberPortalSidebar } from "@/components/member-portal-sidebar";
import { appendLocaleQuery, resolveLocale } from "@/lib/locale";
import { memberDashboardCopy } from "@/lib/mock/member-dashboard";
import type { CustomerRow } from "@/lib/supabase/database.types";
import { getSupabaseSession } from "@/lib/supabase/auth";
import { loadMemberHistoryDashboard } from "@/lib/supabase/queries/member-history";
import type { WorkflowMemberHistoryData } from "@/lib/supabase/workflow.types";

type PageProps = {
  searchParams?: Promise<{
    lang?: string;
  }>;
};

function buildEmptyMemberHistoryData(
  authUserId: string,
  authUserEmail: string | null,
  authUserFullName: string | null,
  locale: "vi" | "en"
): WorkflowMemberHistoryData {
  const now = new Date().toISOString();
  const email = authUserEmail ?? `${authUserId}@guest.local`;
  const fullName = authUserFullName ?? (authUserEmail ? authUserEmail.split("@")[0] || authUserId : authUserId);

  const customer = {
    auth_user_id: authUserId,
    created_at: now,
    email,
    full_name: fullName,
    id: authUserId,
    last_seen_at: null,
    marketing_consent: false,
    marketing_consent_at: null,
    marketing_consent_source: null,
    notes: "",
    phone: null,
    preferred_locale: locale,
    source: "member_portal",
    updated_at: now
  } satisfies CustomerRow;

  return {
    availability_requests: [],
    audit_logs: [],
    branch_options: [],
    customer,
    payment_proofs: [],
    payment_requests: [],
    reservations: [],
    room_type_options: []
  };
}

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

  const data = (await loadMemberHistoryDashboard(session.user.id, session.user.email ?? null)) ?? buildEmptyMemberHistoryData(
    session.user.id,
    session.user.email ?? null,
    typeof session.user.user_metadata?.full_name === "string" ? session.user.user_metadata.full_name : null,
    locale
  );

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
