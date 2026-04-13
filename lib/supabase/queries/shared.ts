import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";
import { hasSupabasePublicConfig, hasSupabaseServiceConfig } from "@/lib/supabase/env";
import { createSupabaseReadClient } from "@/lib/supabase/read-client";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export type PublicSupabaseClient = SupabaseClient<Database>;

export async function queryWithFallback<T>(
  query: (client: PublicSupabaseClient) => Promise<T>,
  fallback: T
) {
  if (!hasSupabasePublicConfig()) {
    return fallback;
  }

  try {
    return await query(createSupabaseReadClient());
  } catch {
    return fallback;
  }
}

export async function queryWithServiceFallback<T>(
  query: (client: PublicSupabaseClient) => Promise<T>,
  fallback: T
) {
  if (!hasSupabaseServiceConfig()) {
    return fallback;
  }

  try {
    return await query(createSupabaseServiceClient());
  } catch {
    return fallback;
  }
}

export function sortByDisplayOrder<T extends { sort_order: number; name_en?: string; name_vi?: string }>(
  rows: T[]
) {
  return [...rows].sort((left, right) => {
    if (left.sort_order !== right.sort_order) {
      return left.sort_order - right.sort_order;
    }

    return (left.name_vi ?? left.name_en ?? "").localeCompare(right.name_vi ?? right.name_en ?? "");
  });
}
