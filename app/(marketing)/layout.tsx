import type { ReactNode } from "react";
import { Suspense } from "react";

import { MarketingBottomSections } from "@/components/marketing-bottom-sections";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { releaseExpiredHolds, releaseExpiredReservations } from "@/lib/supabase/workflows";

export default async function MarketingLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  if (process.env.NEXT_PHASE !== "phase-production-build") {
    const releaseResults = await Promise.allSettled([releaseExpiredHolds(), releaseExpiredReservations()]);

    if (releaseResults.some((result) => result.status === "rejected")) {
      console.warn("[workflow] Failed to release expired holds/reservations before loading marketing layout", {
        holds: releaseResults[0].status === "fulfilled",
        reservations: releaseResults[1].status === "fulfilled"
      });
    }
  }

  return (
    <>
      <Suspense fallback={null}>
        <SiteHeader />
      </Suspense>
      <main className="site-main">
        {children}
        <Suspense fallback={null}>
          <MarketingBottomSections />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <SiteFooter />
      </Suspense>
    </>
  );
}
