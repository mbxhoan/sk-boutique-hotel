"use server";

import { revalidatePath } from "next/cache";

import type { RoomTypeInsert } from "@/lib/supabase/database.types";
import { upsertRoomType } from "@/lib/supabase/queries/room-types";

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
    return "";
  }

  return value.trim();
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
  return value
    .trim()
    .replace(/^\/+/, "")
    .replace(/\/+$/, "")
    .replace(/\s+/g, "-")
    .toLowerCase();
}

function normalizeCode(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function readLineList(formData: FormData, key: string) {
  return readOptionalString(formData, key)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export async function saveRoomTypeAction(formData: FormData) {
  const id = readOptionalString(formData, "id") || crypto.randomUUID();
  const nameVi = readRequiredString(formData, "nameVi");
  const nameEn = readRequiredString(formData, "nameEn");
  const slug = normalizeSlug(readRequiredString(formData, "slug"));
  const code = normalizeCode(readRequiredString(formData, "code"));
  const payload: RoomTypeInsert = {
    base_price: readOptionalNumber(formData, "basePrice") ?? 0,
    bed_type: readOptionalString(formData, "bedType"),
    code,
    cover_image_path: readOptionalString(formData, "coverImagePath") || null,
    description_en: readOptionalString(formData, "descriptionEn"),
    description_vi: readOptionalString(formData, "descriptionVi"),
    highlights_en: readLineList(formData, "highlightsEn"),
    highlights_vi: readLineList(formData, "highlightsVi"),
    id,
    is_active: readBoolean(formData, "isActive"),
    manual_override_price: readOptionalNumber(formData, "manualOverridePrice"),
    name_en: nameEn,
    name_vi: nameVi,
    occupancy_adults: readOptionalNumber(formData, "occupancyAdults") ?? 2,
    occupancy_children: readOptionalNumber(formData, "occupancyChildren") ?? 0,
    seo_description_en: readOptionalString(formData, "seoDescriptionEn"),
    seo_description_vi: readOptionalString(formData, "seoDescriptionVi"),
    seo_title_en: readOptionalString(formData, "seoTitleEn") || nameEn,
    seo_title_vi: readOptionalString(formData, "seoTitleVi") || nameVi,
    show_public_price: readBoolean(formData, "showPublicPrice"),
    slug,
    sort_order: readOptionalNumber(formData, "sortOrder") ?? 0,
    size_sqm: readOptionalNumber(formData, "sizeSqm"),
    story_en: readOptionalString(formData, "storyEn"),
    story_vi: readOptionalString(formData, "storyVi"),
    summary_en: readOptionalString(formData, "summaryEn") || readOptionalString(formData, "descriptionEn"),
    summary_vi: readOptionalString(formData, "summaryVi") || readOptionalString(formData, "descriptionVi"),
    weekend_surcharge: readOptionalNumber(formData, "weekendSurcharge") ?? 0
  };

  const savedRoomType = await upsertRoomType(payload);

  revalidatePath("/admin/room-types");
  revalidatePath("/rooms");
  revalidatePath("/phong");
  revalidatePath(`/rooms/${savedRoomType.slug}`);
  revalidatePath(`/phong/${savedRoomType.slug}`);
  revalidatePath("/");
}
