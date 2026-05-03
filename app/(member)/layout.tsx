import type { ReactNode } from "react";
import { Suspense } from "react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { MemberNotificationProvider } from "@/components/member-notifications-provider";
import { resolveLocale } from "@/lib/locale";
import { releaseExpiredHolds, releaseExpiredReservations } from "@/lib/supabase/workflows";

export default async function MemberLayout({
  children,
  params
}: Readonly<{
  children: ReactNode;
  params: Promise<{ lang?: string }>;
}>) {
  const { lang } = await params;
  const locale = resolveLocale(lang);
  if (process.env.NEXT_PHASE !== "phase-production-build") {
    void Promise.allSettled([releaseExpiredHolds(), releaseExpiredReservations()]).then((releaseResults) => {
      if (releaseResults.some((result) => result.status === "rejected")) {
        console.warn("[workflow] Failed to release expired holds/reservations before loading member layout", {
          holds: releaseResults[0].status === "fulfilled",
          reservations: releaseResults[1].status === "fulfilled"
        });
      }
    });
  }

  return (
    <MemberNotificationProvider locale={locale}>
      <Suspense fallback={null}>
        <SiteHeader />
      </Suspense>
      <main className="site-main">{children}</main>
      <Suspense fallback={null}>
        <SiteFooter />
      </Suspense>
    </MemberNotificationProvider>
  );
}
