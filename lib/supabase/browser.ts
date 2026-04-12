import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/lib/supabase/database.types";

const browserSupabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
const browserSupabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.SUPABASE_ANON_KEY ??
  "";

export function createSupabaseBrowserClient() {
  if (!browserSupabaseUrl || !browserSupabasePublishableKey) {
    throw new Error("Supabase browser client requires public URL and publishable key env vars.");
  }

  return createBrowserClient<Database>(browserSupabaseUrl, browserSupabasePublishableKey);
}
