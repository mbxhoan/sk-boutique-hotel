import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { getContentPageSeedRows } from "../lib/supabase/content-pages.seed-data.ts";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(rootDir, "supabase", "seed-content-pages.sql");

function sqlLiteral(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function jsonLiteral(value) {
  return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
}

function renderRow(row) {
  return `(
  ${sqlLiteral(row.slug)},
  ${sqlLiteral(row.page_type)},
  ${sqlLiteral(row.title_vi)},
  ${sqlLiteral(row.title_en)},
  ${sqlLiteral(row.description_vi)},
  ${sqlLiteral(row.description_en)},
  ${jsonLiteral(row.content_json)},
  ${row.sort_order},
  ${row.is_published}
)`;
}

async function main() {
  const rows = getContentPageSeedRows();
  const sql = `-- Generated from lib/supabase/content-pages.seed-data.ts
-- Keep this file in sync with the current homepage, editorial pages, and news content.

insert into public.content_pages (
  slug,
  page_type,
  title_vi,
  title_en,
  description_vi,
  description_en,
  content_json,
  sort_order,
  is_published
) values
${rows.map(renderRow).join(",\n")}
on conflict (slug) do update set
  page_type = excluded.page_type,
  title_vi = excluded.title_vi,
  title_en = excluded.title_en,
  description_vi = excluded.description_vi,
  description_en = excluded.description_en,
  content_json = excluded.content_json,
  sort_order = excluded.sort_order,
  is_published = excluded.is_published,
  updated_at = now();
`;

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, sql, "utf8");
  console.log(`Wrote ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
