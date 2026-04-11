import { createSupabaseServerClient } from "@/lib/supabase/server";

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
