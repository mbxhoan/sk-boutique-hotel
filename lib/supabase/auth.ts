import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

export type AdminPortalRole = "system_admin" | "admin" | "manager" | "staff";

const adminPortalRoles = new Set<AdminPortalRole>(["system_admin", "admin", "manager", "staff"]);

export async function getSupabaseSession() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session;
}

export async function getSupabaseUser() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return data.user;
}

export function getSupabaseUserPortalRole(user: User | null | undefined): AdminPortalRole | null {
  if (!user) {
    return null;
  }

  const appMetadata = user.app_metadata as Record<string, unknown> | null | undefined;
  const role = appMetadata?.role;

  if (typeof role === "string" && adminPortalRoles.has(role as AdminPortalRole)) {
    return role as AdminPortalRole;
  }

  const roles = appMetadata?.roles;

  if (Array.isArray(roles)) {
    for (const candidate of roles) {
      if (typeof candidate === "string" && adminPortalRoles.has(candidate as AdminPortalRole)) {
        return candidate as AdminPortalRole;
      }
    }
  }

  return null;
}

export function canAccessAdminPortal(user: User | null | undefined) {
  return getSupabaseUserPortalRole(user) !== null;
}
