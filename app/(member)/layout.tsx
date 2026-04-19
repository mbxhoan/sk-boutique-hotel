import type { ReactNode } from "react";
import { Suspense } from "react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { releaseExpiredHolds, releaseExpiredReservations } from "@/lib/supabase/workflows";

export default async function MemberLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  if (process.env.NEXT_PHASE !== "phase-production-build") {
    const releaseResults = await Promise.allSettled([releaseExpiredHolds(), releaseExpiredReservations()]);

    if (releaseResults.some((result) => result.status === "rejected")) {
      console.warn("[workflow] Failed to release expired holds/reservations before loading member layout", {
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
      <main className="site-main">{children}</main>
      <Suspense fallback={null}>
        <SiteFooter />
      </Suspense>
    </>
  );
}
