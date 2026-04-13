import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin-shell";
import { canAccessAdminPortal, getSupabaseUser } from "@/lib/supabase/auth";

export default async function AdminLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  const user = await getSupabaseUser().catch(() => null);

  if (!canAccessAdminPortal(user)) {
    redirect("/admin/sign-in");
  }

  return <AdminShell>{children}</AdminShell>;
}
