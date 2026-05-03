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
  // Look up by id first (stable across email changes).
  const lookupById = await supabase
    .from("customers")
    .select("id, email, auth_user_id")
    .eq("id", memberCustomerSeed.id)
    .maybeSingle();

  if (lookupById.error) {
    throw lookupById.error;
  }

  if (lookupById.data) {
    if (lookupById.data.auth_user_id === authUserId) {
      log(
        locale,
        `Customer member đã link sẵn (id ${memberCustomerSeed.id}, email ${lookupById.data.email}).`,
        `Member customer already linked (id ${memberCustomerSeed.id}, email ${lookupById.data.email}).`
      );
      return;
    }

    const { error } = await supabase
      .from("customers")
      .update({ auth_user_id: authUserId })
      .eq("id", memberCustomerSeed.id);

    if (error) {
      throw error;
    }

    log(
      locale,
      `Đã nối customer member theo id (${memberCustomerSeed.id}, email ${lookupById.data.email}).`,
      `Linked member customer by id (${memberCustomerSeed.id}, email ${lookupById.data.email}).`
    );
    return;
  }

  // Fallback: try by email (in case id was changed but email still matches).
  const lookupByEmail = await supabase
    .from("customers")
    .select("id, email, auth_user_id")
    .eq("email", memberCustomerSeed.email)
    .maybeSingle();

  if (lookupByEmail.error) {
    throw lookupByEmail.error;
  }

  if (lookupByEmail.data) {
    const { error } = await supabase
      .from("customers")
      .update({ auth_user_id: authUserId })
      .eq("id", lookupByEmail.data.id);

    if (error) {
      throw error;
    }

    log(
      locale,
      `Đã nối customer member theo email: ${memberCustomerSeed.email} (id ${lookupByEmail.data.id}).`,
      `Linked member customer by email: ${memberCustomerSeed.email} (id ${lookupByEmail.data.id}).`
    );
    return;
  }

  // No existing row — insert fresh.
  const { error: insertError } = await supabase.from("customers").insert({
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
  });

  if (insertError) {
    throw insertError;
  }

  log(
    locale,
    `Đã tạo customer member từ script: ${memberCustomerSeed.email}`,
    `Created member customer from script: ${memberCustomerSeed.email}`
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

function describeError(error) {
  if (!error) {
    return "";
  }

  if (error instanceof Error) {
    return error.stack || error.message;
  }

  if (typeof error === "object") {
    const parts = [];
    if (error.message) parts.push(`message: ${error.message}`);
    if (error.code) parts.push(`code: ${error.code}`);
    if (error.status ?? error.statusCode) parts.push(`status: ${error.status ?? error.statusCode}`);
    if (error.details) parts.push(`details: ${error.details}`);
    if (error.hint) parts.push(`hint: ${error.hint}`);
    if (parts.length) return parts.join("\n");
    try {
      return JSON.stringify(error, null, 2);
    } catch {
      return String(error);
    }
  }

  return String(error);
}

main().catch((error) => {
  const locale = process.argv.includes("--en") ? "en" : "vi";
  const summary = locale === "vi" ? "Seed auth users thất bại." : "Auth user seed failed.";
  const detail = describeError(error);

  if (detail) {
    console.error(`${summary}\n${locale === "vi" ? "Chi tiết" : "Detail"}: ${detail}`);
  } else {
    console.error(summary);
  }
  process.exitCode = 1;
});
