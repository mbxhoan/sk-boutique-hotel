import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";
import { getSupabasePublishableKey, getSupabaseUrl, hasSupabasePublicConfig } from "@/lib/supabase/env";

export function createSupabaseReadClient() {
  if (!hasSupabasePublicConfig()) {
    throw new Error("Supabase read client requires public URL and publishable key env vars.");
  }

  return createClient<Database>(getSupabaseUrl(), getSupabasePublishableKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
