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

function readBearerToken(authorization: string | null) {
  if (!authorization) {
    return null;
  }

  const [scheme, ...tokenParts] = authorization.trim().split(/\s+/);

  if (scheme?.toLowerCase() !== "bearer" || tokenParts.length === 0) {
    return null;
  }

  const token = tokenParts.join(" ").trim();

  return token.length > 0 ? token : null;
}

export async function getSupabaseRequestUser(request: Request) {
  const supabase = await createSupabaseServerClient();
  const accessToken = readBearerToken(request.headers.get("authorization"));

  if (accessToken) {
    try {
      const { data, error } = await supabase.auth.getUser(accessToken);

      if (!error && data.user) {
        return data.user;
      }
    } catch {
      // Fall back to the server session below if the bearer token is missing or stale.
    }
  }

  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session?.user ?? null;
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
