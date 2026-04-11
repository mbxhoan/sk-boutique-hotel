import type { ReactNode } from "react";
import { Suspense } from "react";

import { MemberShell } from "@/components/member-shell";

export default function MemberLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <Suspense fallback={null}>
      <MemberShell>{children}</MemberShell>
    </Suspense>
  );
}
