import type { ReactNode } from "react";
import { Suspense } from "react";

import { MarketingBottomSections } from "@/components/marketing-bottom-sections";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { releaseExpiredHolds, releaseExpiredReservations } from "@/lib/supabase/workflows";
import { loadHomePageCopy } from "@/lib/supabase/queries/content-pages";

export default async function MarketingLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  const homePageCopyPromise = loadHomePageCopy();

  if (process.env.NEXT_PHASE !== "phase-production-build") {
    void Promise.allSettled([releaseExpiredHolds(), releaseExpiredReservations()]).then((releaseResults) => {
      if (releaseResults.some((result) => result.status === "rejected")) {
        console.warn("[workflow] Failed to release expired holds/reservations before loading marketing layout", {
          holds: releaseResults[0].status === "fulfilled",
          reservations: releaseResults[1].status === "fulfilled"
        });
      }
    });
  }

  const homePageCopy = await homePageCopyPromise;

  return (
    <>
      <Suspense fallback={null}>
        <SiteHeader />
      </Suspense>
      <main className="site-main">
        {children}
        <Suspense fallback={null}>
          <MarketingBottomSections copy={homePageCopy.marketingShell} />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <SiteFooter />
      </Suspense>
    </>
  );
}
