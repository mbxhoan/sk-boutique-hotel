import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/lib/supabase/database.types";
import { getSupabasePublishableKey, getSupabaseUrl, hasSupabasePublicConfig } from "@/lib/supabase/env";

export function createSupabaseBrowserClient() {
  if (!hasSupabasePublicConfig()) {
    throw new Error("Supabase browser client requires public URL and publishable key env vars.");
  }

  return createBrowserClient<Database>(getSupabaseUrl(), getSupabasePublishableKey());
}
