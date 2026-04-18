const publicUrlKeys = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL"] as const;
const publicKeyKeys = [
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_ANON_KEY"
] as const;
const paymentUploadTokenSecretKeys = ["PAYMENT_UPLOAD_TOKEN_SECRET"] as const;
const serviceKeyKeys = ["SUPABASE_SERVICE_ROLE_KEY"] as const;
const emailFunctionNameKeys = ["SUPABASE_EMAIL_FUNCTION_NAME"] as const;
const emailFromAddressKeys = ["SUPABASE_EMAIL_FROM_ADDRESS"] as const;
const emailFromNameKeys = ["SUPABASE_EMAIL_FROM_NAME"] as const;
const emailAdminRecipientKeys = ["SUPABASE_EMAIL_ADMIN_TO"] as const;

function getFirstDefinedEnv(keys: readonly string[]) {
  for (const key of keys) {
    const value = process.env[key];

    if (value) {
      return value;
    }
  }

  return null;
}

function requireEnv(keys: readonly string[], label: string) {
  const value = getFirstDefinedEnv(keys);

  if (!value) {
    throw new Error(`Missing Supabase ${label}. Set one of: ${keys.join(", ")}`);
  }

  return value;
}

export function hasSupabasePublicConfig() {
  return Boolean(getFirstDefinedEnv(publicUrlKeys) && getFirstDefinedEnv(publicKeyKeys));
}

export function getSupabaseUrl() {
  return requireEnv(publicUrlKeys, "URL");
}

export function getSupabasePublishableKey() {
  return requireEnv(publicKeyKeys, "publishable key");
}

export function getSupabaseServiceRoleKey() {
  return requireEnv(serviceKeyKeys, "service role key");
}

export function hasSupabaseServiceConfig() {
  return Boolean(getFirstDefinedEnv(serviceKeyKeys));
}

export function getPaymentUploadTokenSecret() {
  return requireEnv(paymentUploadTokenSecretKeys, "payment upload token secret");
}

export function hasPaymentUploadTokenSecret() {
  return Boolean(getFirstDefinedEnv(paymentUploadTokenSecretKeys));
}

export function getSupabaseEmailFunctionName() {
  return getFirstDefinedEnv(emailFunctionNameKeys) ?? "send-email";
}

export function getSupabaseEmailFunctionNames() {
  const configuredName = getFirstDefinedEnv(emailFunctionNameKeys);
  const names = [configuredName ?? "send-email", "resend-email"];

  return Array.from(new Set(names.filter((name) => name.trim().length > 0)));
}

export function getSupabaseEmailFromAddress() {
  return getFirstDefinedEnv(emailFromAddressKeys) ?? "admin@bkhanhxinh.com";
}

export function getSupabaseEmailFromName() {
  return getFirstDefinedEnv(emailFromNameKeys) ?? "SK Boutique Hotel";
}

export function getSupabaseEmailAdminRecipient() {
  return getFirstDefinedEnv(emailAdminRecipientKeys) ?? "admin@bkhanhxinh.com";
}
