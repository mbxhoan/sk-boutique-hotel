"use server";

import { revalidatePath } from "next/cache";

import { deleteMediaAsset, deleteMediaCollection, upsertMediaAsset, upsertMediaCollection } from "@/lib/supabase/queries/media";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

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
    return 0;
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
  const trimmed = value.trim().replace(/^\/+/, "").replace(/\/+$/, "");

  return trimmed;
}

function fileExtension(file: File) {
  const parts = file.name.split(".");
  const extension = parts.length > 1 ? parts.at(-1)?.toLowerCase() : "";

  if (extension) {
    return extension;
  }

  if (file.type.includes("/")) {
    return file.type.split("/").at(-1) ?? "bin";
  }

  return "bin";
}

function sanitizePathSegment(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function buildAssetFilePath(collectionSlug: string, slug: string, file: File) {
  const safeCollection = sanitizePathSegment(collectionSlug) || "media";
  const safeSlug = sanitizePathSegment(slug) || "asset";
  const extension = fileExtension(file);
  const timestamp = Date.now();

  return `${safeCollection}/${safeSlug}/${timestamp}.${extension}`;
}

async function removeFileIfNeeded(bucket: string, filePath: string | null | undefined) {
  if (!filePath) {
    return;
  }

  const client = createSupabaseServiceClient();
  await client.storage.from(bucket).remove([filePath]);
}

function revalidateMediaPages() {
  revalidatePath("/admin/media");
  revalidatePath("/");
  revalidatePath("/rooms");
  revalidatePath("/about-us");
  revalidatePath("/tin-tuc");
  revalidatePath("/chi-nhanh");
  revalidatePath("/member");
}

export async function saveMediaCollectionAction(formData: FormData) {
  const payload = {
    description_en: readOptionalString(formData, "descriptionEn"),
    description_vi: readOptionalString(formData, "descriptionVi"),
    is_active: readBoolean(formData, "isActive"),
    name_en: readRequiredString(formData, "nameEn"),
    name_vi: readRequiredString(formData, "nameVi"),
    slug: normalizeSlug(readRequiredString(formData, "slug")),
    sort_order: readOptionalNumber(formData, "sortOrder")
  };

  await upsertMediaCollection(payload);
  revalidateMediaPages();
}

export async function deleteMediaCollectionAction(formData: FormData) {
  const slug = normalizeSlug(readRequiredString(formData, "slug"));
  const client = createSupabaseServiceClient();
  const { data: assets } = await client
    .from("media_assets")
    .select("file_bucket, file_path")
    .eq("collection_slug", slug);

  for (const asset of assets ?? []) {
    await removeFileIfNeeded(asset.file_bucket, asset.file_path);
  }

  await deleteMediaCollection(slug);
  revalidateMediaPages();
}

export async function saveMediaAssetAction(formData: FormData) {
  const collectionSlug = normalizeSlug(readRequiredString(formData, "collectionSlug"));
  const slug = normalizeSlug(readRequiredString(formData, "slug"));
  const fileInput = formData.get("mediaFile");
  const existingFileBucket = readOptionalString(formData, "existingFileBucket") || "media-assets";
  const existingFilePath = readOptionalString(formData, "existingFilePath") || null;
  const existingFileName = readOptionalString(formData, "existingFileName");
  const existingMimeType = readOptionalString(formData, "existingMimeType");
  const existingFileSize = readOptionalNumber(formData, "existingFileSize");
  let fileBucket = readOptionalString(formData, "fileBucket") || "media-assets";
  let filePath = existingFilePath;
  let fileName = existingFileName;
  let mimeType = existingMimeType;
  let fileSize = existingFileSize;

  if (fileInput instanceof File && fileInput.size > 0) {
    const client = createSupabaseServiceClient();
    const generatedFilePath = buildAssetFilePath(collectionSlug, slug, fileInput);
    const uploadResult = await client.storage
      .from(fileBucket)
      .upload(generatedFilePath, fileInput, {
        contentType: fileInput.type || "application/octet-stream",
        upsert: true
      });

    if (uploadResult.error) {
      throw uploadResult.error;
    }

    if (existingFilePath && existingFilePath !== generatedFilePath && existingFileBucket) {
      await removeFileIfNeeded(existingFileBucket, existingFilePath);
    }

    filePath = generatedFilePath;
    fileName = fileInput.name;
    mimeType = fileInput.type || "application/octet-stream";
    fileSize = fileInput.size;
  }

  const payload = {
    alt_en: readOptionalString(formData, "altEn"),
    alt_vi: readOptionalString(formData, "altVi"),
    collection_slug: collectionSlug,
    description_en: readOptionalString(formData, "descriptionEn"),
    description_vi: readOptionalString(formData, "descriptionVi"),
    fallback_url: readOptionalString(formData, "fallbackUrl"),
    file_bucket: fileBucket,
    file_name: fileName || slug,
    file_path: filePath,
    file_size: fileSize,
    height: null as number | null,
    is_active: readBoolean(formData, "isActive"),
    is_featured: readBoolean(formData, "isFeatured"),
    mime_type: mimeType || "application/octet-stream",
    slug,
    sort_order: readOptionalNumber(formData, "sortOrder"),
    title_en: readOptionalString(formData, "titleEn"),
    title_vi: readOptionalString(formData, "titleVi"),
    width: null as number | null
  };

  await upsertMediaAsset(payload);
  revalidateMediaPages();
}

export async function deleteMediaAssetAction(formData: FormData) {
  const id = readRequiredString(formData, "id");
  const bucket = readOptionalString(formData, "fileBucket") || "media-assets";
  const filePath = readOptionalString(formData, "filePath") || null;

  if (filePath) {
    await removeFileIfNeeded(bucket, filePath);
  }

  await deleteMediaAsset(id);
  revalidateMediaPages();
}
