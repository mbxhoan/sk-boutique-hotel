import type { ReactNode } from "react";
import { Suspense } from "react";

import { MarketingBottomSections } from "@/components/marketing-bottom-sections";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function MarketingLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
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
