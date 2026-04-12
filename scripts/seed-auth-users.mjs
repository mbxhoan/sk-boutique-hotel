#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { authUsersSeed, memberCustomerSeed } from "../supabase/auth-users.seed.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return {};
  }

  const contents = readFileSync(filePath, "utf8");
  const parsed = {};

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const equalsIndex = line.indexOf("=");

    if (equalsIndex === -1) {
      continue;
    }

    const key = line.slice(0, equalsIndex).trim();
    let value = line.slice(equalsIndex + 1).trim();

    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    parsed[key] = value;
  }

  return parsed;
}

function loadEnvFiles() {
  return {
    ...parseEnvFile(join(projectRoot, ".env")),
    ...parseEnvFile(join(projectRoot, ".env.local"))
  };
}

function requireEnv(value, label, locale) {
  if (value) {
    return value;
  }

  const message =
    locale === "vi"
      ? `Thiếu ${label}. Hãy kiểm tra .env.local trước khi seed auth users.`
      : `Missing ${label}. Check .env.local before seeding auth users.`;

  throw new Error(message);
}

function log(locale, vi, en) {
  console.log(locale === "vi" ? vi : en);
}

function isUserNotFound(error) {
  const status = error?.status ?? error?.statusCode;
  const message = String(error?.message ?? "").toLowerCase();
  return status === 404 || message.includes("not found") || message.includes("user not found");
}

async function upsertAuthUser(supabase, seed, locale) {
  const lookup = await supabase.auth.admin.getUserById(seed.id);
  const existingUser = lookup.data?.user ?? null;

  if (lookup.error && !existingUser && !isUserNotFound(lookup.error)) {
    throw lookup.error;
  }

  const attributes = {
    id: seed.id,
    email: seed.email,
    password: seed.password,
    email_confirm: true,
    role: "authenticated",
    app_metadata: seed.appMetadata,
    user_metadata: seed.userMetadata
  };

  if (existingUser) {
    const { error } = await supabase.auth.admin.updateUserById(seed.id, attributes);
    if (error) {
      throw error;
    }

    log(locale, `Cập nhật auth user: ${seed.email}`, `Updated auth user: ${seed.email}`);
    return { id: seed.id, mode: "updated" };
  }

  const { data, error } = await supabase.auth.admin.createUser(attributes);
  if (error) {
    throw error;
  }

  log(locale, `Tạo auth user: ${seed.email}`, `Created auth user: ${seed.email}`);
  return { id: data.user.id, mode: "created" };
}

async function linkMemberCustomer(supabase, authUserId, locale) {
  const updateResult = await supabase
    .from("customers")
    .update({ auth_user_id: authUserId })
    .eq("email", memberCustomerSeed.email)
    .select("id, email, auth_user_id")
    .maybeSingle();

  if (updateResult.error) {
    throw updateResult.error;
  }

  if (updateResult.data) {
    log(
      locale,
      `Đã nối customer member với auth user: ${memberCustomerSeed.email}`,
      `Linked member customer to auth user: ${memberCustomerSeed.email}`
    );
    return;
  }

  const upsertResult = await supabase.from("customers").upsert(
    {
      id: memberCustomerSeed.id,
      auth_user_id: authUserId,
      full_name: memberCustomerSeed.fullName,
      email: memberCustomerSeed.email,
      phone: memberCustomerSeed.phone,
      preferred_locale: memberCustomerSeed.preferredLocale,
      marketing_consent: memberCustomerSeed.marketingConsent,
      marketing_consent_at: new Date().toISOString(),
      marketing_consent_source: memberCustomerSeed.marketingConsentSource,
      source: memberCustomerSeed.source,
      notes: memberCustomerSeed.notes,
      last_seen_at: new Date().toISOString()
    },
    {
      onConflict: "email"
    }
  );

  if (upsertResult.error) {
    throw upsertResult.error;
  }

  log(
    locale,
    `Đã tạo/nối customer member từ script: ${memberCustomerSeed.email}`,
    `Created/linked member customer from script: ${memberCustomerSeed.email}`
  );
}

async function main() {
  const locale = process.argv.includes("--en") ? "en" : "vi";
  const fileEnv = loadEnvFiles();
  const supabaseUrl = requireEnv(
    process.env.SUPABASE_URL ??
      process.env.NEXT_PUBLIC_SUPABASE_URL ??
      fileEnv.SUPABASE_URL ??
      fileEnv.NEXT_PUBLIC_SUPABASE_URL ??
      "",
    locale === "vi" ? "SUPABASE_URL" : "SUPABASE_URL",
    locale
  );
  const supabaseServiceRoleKey = requireEnv(
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? fileEnv.SUPABASE_SERVICE_ROLE_KEY ?? "",
    locale === "vi" ? "SUPABASE_SERVICE_ROLE_KEY" : "SUPABASE_SERVICE_ROLE_KEY",
    locale
  );

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  log(locale, "Bắt đầu seed auth users...", "Starting auth user seed...");

  const seededUsers = [];
  for (const seed of authUsersSeed) {
    const result = await upsertAuthUser(supabase, seed, locale);
    seededUsers.push({ ...seed, ...result });
  }

  const memberSeed = seededUsers.find((item) => item.email === memberCustomerSeed.email);
  if (!memberSeed?.id) {
    throw new Error(
      locale === "vi"
        ? "Không tìm thấy member seed để nối customer."
        : "Could not find the member seed user to link the customer."
    );
  }

  await linkMemberCustomer(supabase, memberSeed.id, locale);

  log(
    locale,
    `Hoàn tất seed auth users. Mật khẩu dev: ${authUsersSeed[0]?.password ?? "SkbhAdmin2026!"}`,
    `Finished auth user seed. Dev password: ${authUsersSeed[0]?.password ?? "SkbhAdmin2026!"}`
  );
}

main().catch((error) => {
  const locale = process.argv.includes("--en") ? "en" : "vi";
  const summary = locale === "vi" ? "Seed auth users thất bại." : "Auth user seed failed.";
  const detail = error instanceof Error ? error.message : String(error ?? "");

  if (detail) {
    console.error(`${summary}\n${locale === "vi" ? "Chi tiết" : "Detail"}: ${detail}`);
  } else {
    console.error(summary);
  }
  process.exitCode = 1;
});
