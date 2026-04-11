import type { ReactNode } from "react";
import { Suspense } from "react";

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
      <main className="site-main">{children}</main>
      <Suspense fallback={null}>
        <SiteFooter />
      </Suspense>
    </>
  );
}
