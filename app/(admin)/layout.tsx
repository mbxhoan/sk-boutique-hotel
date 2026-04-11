import type { ReactNode } from "react";
import { Suspense } from "react";

import { AdminShell } from "@/components/admin-shell";

export default function AdminLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <Suspense fallback={null}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
