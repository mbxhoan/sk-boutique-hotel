import type { Locale } from "@/lib/locale";
import { defaultLocale } from "@/lib/locale";
import type { CustomerInsert, CustomerRow } from "@/lib/supabase/database.types";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { queryWithServiceFallback } from "@/lib/supabase/queries/shared";

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

export type GuestCustomerProfileInput = {
  email: string;
  fullName: string;
  notes?: string | null;
  phone?: string | null;
  preferredLocale?: Locale | null;
  source?: string | null;
};

const customerSelect =
  "id, auth_user_id, full_name, email, phone, preferred_locale, marketing_consent, marketing_consent_at, marketing_consent_source, source, notes, last_seen_at, created_at, updated_at";

export async function getCustomerByAuthUserId(authUserId: string) {
  return queryWithServiceFallback(
    async (client) => {
      const { data, error } = await client.from("customers").select(customerSelect).eq("auth_user_id", authUserId).maybeSingle();

      if (error) {
        throw error;
      }

      return (data ?? null) as CustomerRow | null;
    },
    null as CustomerRow | null
  );
}

export async function getCustomerByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    return null as CustomerRow | null;
  }

  return queryWithServiceFallback(
    async (client) => {
      const { data, error } = await client.from("customers").select(customerSelect).ilike("email", normalizedEmail).maybeSingle();

      if (error) {
        throw error;
      }

      return (data ?? null) as CustomerRow | null;
    },
    null as CustomerRow | null
  );
}

export async function listCustomersByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    return [] as CustomerRow[];
  }

  return queryWithServiceFallback(
    async (client) => {
      const { data, error } = await client.from("customers").select(customerSelect).ilike("email", normalizedEmail);

      if (error) {
        throw error;
      }

      return (data ?? []) as CustomerRow[];
    },
    [] as CustomerRow[]
  );
}

export async function listCustomersByIds(customerIds: string[]) {
  const uniqueIds = [...new Set(customerIds.filter(Boolean))];

  if (!uniqueIds.length) {
    return [] as CustomerRow[];
  }

  return queryWithServiceFallback(
    async (client) => {
      const { data, error } = await client.from("customers").select(customerSelect).in("id", uniqueIds).order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return (data ?? []) as CustomerRow[];
    },
    [] as CustomerRow[]
  );
}

export type CustomerQueryOptions = {
  limit?: number;
  since?: string;
};

export async function listCustomers(options: CustomerQueryOptions = {}) {
  return queryWithServiceFallback(
    async (client) => {
      let query = client.from("customers").select(customerSelect);

      if (options.since) {
        query = query.gte("created_at", options.since);
      }

      const { data, error } = await query.order("created_at", { ascending: false }).limit(options.limit ?? 100);

      if (error) {
        throw error;
      }

      return (data ?? []) as CustomerRow[];
    },
    [] as CustomerRow[]
  );
}

export async function upsertCustomerProfile(input: CustomerProfileInput) {
  const supabase = createSupabaseServiceClient();
  const normalizedEmail = input.email.trim().toLowerCase();
  const payload: CustomerInsert = {
    auth_user_id: input.authUserId,
    email: normalizedEmail,
    full_name: input.fullName,
    phone: input.phone ?? null,
    preferred_locale: input.preferredLocale ?? defaultLocale,
    marketing_consent: typeof input.marketingConsent === "boolean" ? input.marketingConsent : false,
    marketing_consent_at:
      typeof input.marketingConsent === "boolean" ? (input.marketingConsent ? new Date().toISOString() : null) : null,
    marketing_consent_source:
      typeof input.marketingConsent === "boolean"
        ? input.marketingConsent
          ? input.marketingConsentSource ?? "member_portal"
          : null
        : null,
    notes: typeof input.notes === "string" ? input.notes : "",
    source: typeof input.source === "string" && input.source.length > 0 ? input.source : "member_portal"
  };

  const { data: existingByAuthUserId, error: authLookupError } = await supabase
    .from("customers")
    .select(customerSelect)
    .eq("auth_user_id", input.authUserId)
    .maybeSingle();

  if (authLookupError) {
    throw authLookupError;
  }

  if (existingByAuthUserId) {
    const { data, error } = await supabase.from("customers").update(payload).eq("id", existingByAuthUserId.id).select(customerSelect).single();

    if (error) {
      throw error;
    }

    return data as CustomerRow;
  }

  const { data: existingByEmail, error: emailLookupError } = await supabase.from("customers").select(customerSelect).ilike("email", normalizedEmail).maybeSingle();

  if (emailLookupError) {
    throw emailLookupError;
  }

  if (existingByEmail) {
    const { data, error } = await supabase.from("customers").update(payload).eq("id", existingByEmail.id).select(customerSelect).single();

    if (error) {
      throw error;
    }

    return data as CustomerRow;
  }

  const { data, error } = await supabase.from("customers").insert(payload).select(customerSelect).single();

  if (error) {
    throw error;
  }

  return data as CustomerRow;
}

export async function ensureCustomerByEmail(input: GuestCustomerProfileInput) {
  const normalizedEmail = input.email.trim().toLowerCase();

  if (!normalizedEmail) {
    throw new Error("Customer email is required.");
  }

  const existing = await getCustomerByEmail(normalizedEmail);

  if (existing) {
    return existing;
  }

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("customers")
    .insert({
      email: normalizedEmail,
      full_name: input.fullName.trim(),
      marketing_consent: false,
      marketing_consent_at: null,
      marketing_consent_source: null,
      notes: input.notes ?? "",
      phone: input.phone ?? null,
      preferred_locale: input.preferredLocale ?? defaultLocale,
      source: input.source ?? "admin_manual_booking"
    })
    .select(customerSelect)
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
