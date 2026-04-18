import type { Locale } from "@/lib/locale";
import { defaultLocale } from "@/lib/locale";
import type { CustomerInsert, CustomerRow } from "@/lib/supabase/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { queryWithFallback, queryWithServiceFallback } from "@/lib/supabase/queries/shared";

export type CustomerProfileInput = {
  authUserId: string;
  email: string;
  fullName: string;
  marketingConsent?: boolean | null;
  marketingConsentSource?: string | null;
  notes?: string | null;
  phone?: string | null;
  preferredLocale?: Locale | null;
  source?: string | null;
};

export async function getCustomerByAuthUserId(authUserId: string) {
  return queryWithFallback(
    async (client) => {
      const { data, error } = await client
        .from("customers")
        .select(
          "id, auth_user_id, full_name, email, phone, preferred_locale, marketing_consent, marketing_consent_at, marketing_consent_source, source, notes, last_seen_at, created_at, updated_at"
        )
        .eq("auth_user_id", authUserId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return (data ?? null) as CustomerRow | null;
    },
    null as CustomerRow | null
  );
}

export async function listCustomersByIds(customerIds: string[]) {
  const uniqueIds = [...new Set(customerIds.filter(Boolean))];

  if (!uniqueIds.length) {
    return [] as CustomerRow[];
  }

  return queryWithServiceFallback(
    async (client) => {
      const { data, error } = await client
        .from("customers")
        .select(
          "id, auth_user_id, full_name, email, phone, preferred_locale, marketing_consent, marketing_consent_at, marketing_consent_source, source, notes, last_seen_at, created_at, updated_at"
        )
        .in("id", uniqueIds)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return (data ?? []) as CustomerRow[];
    },
    [] as CustomerRow[]
  );
}

export async function upsertCustomerProfile(input: CustomerProfileInput) {
  const supabase = await createSupabaseServerClient();
  let payload: CustomerInsert = {
    auth_user_id: input.authUserId,
    email: input.email,
    full_name: input.fullName,
    phone: input.phone ?? null,
    preferred_locale: input.preferredLocale ?? defaultLocale
  };

  if (typeof input.marketingConsent === "boolean") {
    payload.marketing_consent = input.marketingConsent;
    payload.marketing_consent_at = input.marketingConsent ? new Date().toISOString() : null;
    payload.marketing_consent_source = input.marketingConsentSource ?? (input.marketingConsent ? "public_form" : null);
  }

  if (typeof input.source === "string" && input.source.length > 0) {
    payload.source = input.source;
  }

  if (typeof input.notes === "string") {
    payload.notes = input.notes;
  }

  const { data, error } = await supabase
    .from("customers")
    .upsert(payload, {
      onConflict: "auth_user_id"
    })
    .select(
      "id, auth_user_id, full_name, email, phone, preferred_locale, marketing_consent, marketing_consent_at, marketing_consent_source, source, notes, last_seen_at, created_at, updated_at"
    )
    .single();

  if (error) {
    throw error;
  }

  return data as CustomerRow;
}

export async function touchCustomerLastSeen(authUserId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("customers")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("auth_user_id", authUserId)
    .select(
      "id, auth_user_id, full_name, email, phone, preferred_locale, marketing_consent, marketing_consent_at, marketing_consent_source, source, notes, last_seen_at, created_at, updated_at"
    )
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as CustomerRow | null;
}
