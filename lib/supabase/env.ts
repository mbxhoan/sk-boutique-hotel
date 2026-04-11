const publicUrlKeys = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL"] as const;
const publicKeyKeys = [
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_ANON_KEY"
] as const;
const serviceKeyKeys = ["SUPABASE_SERVICE_ROLE_KEY"] as const;

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
