import type { CustomerProfileInput } from "@/lib/supabase/queries/customers";
import { getCustomerByAuthUserId, getCustomerByEmail, upsertCustomerProfile } from "@/lib/supabase/queries/customers";
import { logAuditEvent } from "@/lib/supabase/audit";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CustomerRow } from "@/lib/supabase/database.types";
import type { Locale } from "@/lib/locale";

export const memberProfileUpdateError = {
  EMAIL_ALREADY_USED: "member_profile_email_already_used",
  MEMBER_PROFILE_REQUIRED: "member_profile_required"
} as const;

type MemberProfileSnapshot = {
  email: string;
  full_name: string;
  marketing_consent: boolean;
  marketing_consent_source: string | null;
  phone: string | null;
  preferred_locale: Locale;
  source: string | null;
};

export type SyncMemberProfileInput = {
  actorRole?: string | null;
  actorUserId: string;
  authUserId: string;
  email: string;
  fullName: string;
  marketingConsent?: boolean | null;
  phone: string | null;
  preferredLocale: Locale;
  source?: string | null;
};

export type SyncMemberProfileResult = {
  changed: boolean;
  changedFields: string[];
  customer: CustomerRow;
  previousCustomer: CustomerRow | null;
};

function normalizePhone(value: string | null) {
  const trimmed = value?.trim() ?? "";

  return trimmed.length > 0 ? trimmed : null;
}

function buildSnapshot(customer: CustomerRow): MemberProfileSnapshot {
  return {
    email: customer.email.trim().toLowerCase(),
    full_name: customer.full_name.trim(),
    marketing_consent: customer.marketing_consent,
    marketing_consent_source: customer.marketing_consent_source,
    phone: normalizePhone(customer.phone),
    preferred_locale: customer.preferred_locale,
    source: customer.source ?? null
  };
}

function buildNextSnapshot(input: SyncMemberProfileInput & { marketingConsent: boolean }): MemberProfileSnapshot {
  return {
    email: input.email.trim().toLowerCase(),
    full_name: input.fullName.trim(),
    marketing_consent: input.marketingConsent,
    marketing_consent_source: input.marketingConsent ? (input.source?.trim() || "member_portal") : null,
    phone: normalizePhone(input.phone),
    preferred_locale: input.preferredLocale,
    source: input.source?.trim() || "member_portal"
  };
}

function diffProfileChanges(
  before: MemberProfileSnapshot,
  after: MemberProfileSnapshot
) {
  const changedFields: string[] = [];

  for (const field of ["email", "full_name", "marketing_consent", "phone", "preferred_locale"] as const) {
    if (before[field] !== after[field]) {
      changedFields.push(field);
    }
  }

  return changedFields;
}

async function writeAuditLogSafely(
  input: Parameters<typeof logAuditEvent>[0]
) {
  try {
    await logAuditEvent(input);
  } catch (error) {
    console.warn("[member-profile] Failed to write profile audit log", error);
  }
}

export async function syncMemberProfile(input: SyncMemberProfileInput): Promise<SyncMemberProfileResult> {
  const previousCustomer = await getCustomerByAuthUserId(input.authUserId);
  const duplicateCustomer = await getCustomerByEmail(input.email);

  if (duplicateCustomer && duplicateCustomer.auth_user_id !== input.authUserId) {
    throw new Error(memberProfileUpdateError.EMAIL_ALREADY_USED);
  }

  const source = input.source?.trim() || "member_portal";
  const resolvedMarketingConsent =
    typeof input.marketingConsent === "boolean" ? input.marketingConsent : previousCustomer?.marketing_consent ?? false;
  const shouldTouchMarketingConsent =
    !previousCustomer || previousCustomer.marketing_consent !== resolvedMarketingConsent;
  const customerInput: CustomerProfileInput = {
    authUserId: input.authUserId,
    email: input.email,
    fullName: input.fullName,
    phone: input.phone,
    preferredLocale: input.preferredLocale
  };

  if (!previousCustomer && source) {
    customerInput.source = source;
  }

  if (shouldTouchMarketingConsent) {
    customerInput.marketingConsent = resolvedMarketingConsent;

    if (resolvedMarketingConsent) {
      customerInput.marketingConsentSource = source;
    }
  }

  const nextSnapshot = buildNextSnapshot({
    ...input,
    marketingConsent: resolvedMarketingConsent,
    source
  });

  if (previousCustomer) {
    const changedFields = diffProfileChanges(buildSnapshot(previousCustomer), nextSnapshot);

    if (changedFields.length === 0) {
      return {
        changed: false,
        changedFields,
        customer: previousCustomer,
        previousCustomer
      };
    }

    const customer = await upsertCustomerProfile(customerInput);
    const supabase = await createSupabaseServerClient();

    await supabase.auth
      .updateUser({
        data: {
          full_name: customer.full_name,
          locale: customer.preferred_locale,
          phone: customer.phone
        }
      })
      .catch(() => null);

    await writeAuditLogSafely({
      action: "customer.profile_updated",
      actorRole: input.actorRole ?? "member",
      actorUserId: input.actorUserId,
      customerId: customer.id,
      entityId: customer.id,
      entityType: "customer",
      metadata: {
        changed_fields: changedFields,
        next_profile: buildSnapshot(customer),
        previous_profile: buildSnapshot(previousCustomer),
        source
      },
      summary: `Member profile for ${customer.full_name} was updated.`
    });

    return {
      changed: true,
      changedFields,
      customer,
      previousCustomer
    };
  }

  const customer = await upsertCustomerProfile(customerInput);
  const supabase = await createSupabaseServerClient();

  await supabase.auth
    .updateUser({
      data: {
        full_name: customer.full_name,
        locale: customer.preferred_locale,
        phone: customer.phone
      }
    })
    .catch(() => null);

  await writeAuditLogSafely({
    action: "customer.profile_created",
    actorRole: input.actorRole ?? "member",
    actorUserId: input.actorUserId,
    customerId: customer.id,
    entityId: customer.id,
    entityType: "customer",
    metadata: {
      changed_fields: ["email", "full_name", "marketing_consent", "phone", "preferred_locale"],
      next_profile: buildSnapshot(customer),
      previous_profile: null,
      source
    },
    summary: `Member profile for ${customer.full_name} was created.`
  });

  return {
    changed: true,
    changedFields: ["email", "full_name", "marketing_consent", "phone", "preferred_locale"],
    customer,
    previousCustomer: null
  };
}
