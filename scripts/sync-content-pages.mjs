#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { getContentPageSeedRows } from "../lib/supabase/content-pages.seed-data.ts";

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

function requireEnv(value, label) {
  if (value) {
    return value;
  }
  throw new Error(`Missing ${label}. Check .env.local.`);
}

async function main() {
  const fileEnv = loadEnvFiles();
  const supabaseUrl = requireEnv(
    process.env.SUPABASE_URL ??
      process.env.NEXT_PUBLIC_SUPABASE_URL ??
      fileEnv.SUPABASE_URL ??
      fileEnv.NEXT_PUBLIC_SUPABASE_URL ??
      "",
    "SUPABASE_URL"
  );
  const supabaseServiceRoleKey = requireEnv(
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? fileEnv.SUPABASE_SERVICE_ROLE_KEY ?? "",
    "SUPABASE_SERVICE_ROLE_KEY"
  );

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.log("Fetching content pages seed rows...");
  const rows = getContentPageSeedRows();

  console.log(`Upserting ${rows.length} content pages to Database...`);
  for (const row of rows) {
    const { error } = await supabase
      .from("content_pages")
      .upsert({
        slug: row.slug,
        page_type: row.page_type,
        title_vi: row.title_vi,
        title_en: row.title_en,
        description_vi: row.description_vi,
        description_en: row.description_en,
        content_json: row.content_json,
        sort_order: row.sort_order,
        is_published: row.is_published,
        updated_at: new Date().toISOString()
      }, { onConflict: "slug" });

    if (error) {
      throw error;
    }
    console.log(`Successfully upserted: ${row.slug}`);
  }

  console.log("Done syncing content pages!");
}

main().catch((error) => {
  console.error("Sync content pages failed:", error);
  process.exit(1);
});
