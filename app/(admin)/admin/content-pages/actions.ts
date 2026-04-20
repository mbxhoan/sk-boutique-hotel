"use server";

import { revalidatePath } from "next/cache";

import type { Json } from "@/lib/supabase/database.types";
import { deleteContentPage, upsertContentPage } from "@/lib/supabase/queries/content-pages";

function readRequiredString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Missing required field: ${key}`);
  }

  return value.trim();
}

function readOptionalString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

function readOptionalNumber(formData: FormData, key: string) {
  const value = formData.get(key);

  if (value == null || value === "") {
    return null;
  }

  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid numeric field: ${key}`);
  }

  return parsed;
}

function readBoolean(formData: FormData, key: string) {
  const value = formData.get(key);

  return value === "true" || value === "on";
}

function normalizeSlug(value: string) {
  if (!value.startsWith("/")) {
    return `/${value}`;
  }

  return value;
}

export async function saveContentPageAction(formData: FormData) {
  const rawContent = readOptionalString(formData, "contentJson") ?? "{}";

  try {
    JSON.parse(rawContent);
  } catch {
    throw new Error("Invalid content JSON.");
  }

  const id = readOptionalString(formData, "id") ?? crypto.randomUUID();
  const slug = normalizeSlug(readRequiredString(formData, "slug"));
  const pageType = readRequiredString(formData, "pageType") as "home" | "page" | "collection" | "detail";
  const payload = {
    content_json: JSON.parse(rawContent) as Json,
    description_en: readRequiredString(formData, "descriptionEn"),
    description_vi: readRequiredString(formData, "descriptionVi"),
    id,
    is_published: readBoolean(formData, "isPublished"),
    page_type: pageType,
    slug,
    sort_order: readOptionalNumber(formData, "sortOrder") ?? 0,
    title_en: readRequiredString(formData, "titleEn"),
    title_vi: readRequiredString(formData, "titleVi")
  };

  await upsertContentPage(payload);

  revalidatePath("/admin/content-pages");
  revalidatePath(slug);
  revalidatePath("/tin-tuc");
  revalidatePath("/rooms");
  revalidatePath("/about-us");
  revalidatePath("/");
}

export async function deleteContentPageAction(formData: FormData) {
  const id = readRequiredString(formData, "id");
  const slug = readOptionalString(formData, "slug");

  await deleteContentPage(id);

  revalidatePath("/admin/content-pages");

  if (slug) {
    revalidatePath(slug.startsWith("/") ? slug : `/${slug}`);
  }
}
