import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin-shell";
import { canAccessAdminPortal, getSupabaseUser } from "@/lib/supabase/auth";
import { loadAdminNotifications } from "@/lib/supabase/queries/admin-notifications";
import { listBranches } from "@/lib/supabase/queries/branches";

export default async function AdminLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  const user = await getSupabaseUser().catch(() => null);

  if (!canAccessAdminPortal(user)) {
    redirect("/admin/sign-in");
  }

  const [branches, notifications] = await Promise.all([listBranches(), loadAdminNotifications()]);

  return (
    <AdminShell branches={branches} notifications={notifications}>
      {children}
    </AdminShell>
  );
}
