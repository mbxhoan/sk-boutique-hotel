import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";
import { getSupabaseServiceRoleKey, getSupabaseUrl, hasSupabaseServiceConfig } from "@/lib/supabase/env";

export function createSupabaseServiceClient() {
  if (!hasSupabaseServiceConfig()) {
    throw new Error("Supabase service client requires SUPABASE_SERVICE_ROLE_KEY.");
  }

  return createClient<Database>(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
