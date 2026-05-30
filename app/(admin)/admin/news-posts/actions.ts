"use server";

import { revalidatePath } from "next/cache";

import { addNewsPostImage, deleteNewsPost, deleteNewsPostImage, upsertNewsPost, updateNewsPost } from "@/lib/supabase/queries/news-posts";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { getSupabaseUrl } from "@/lib/supabase/env";

function readRequiredString(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim().length === 0) throw new Error(`Missing required field: ${key}`);
  return value.trim();
}

function readOptionalString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readOptionalNumber(formData: FormData, key: string) {
  const value = formData.get(key);
  if (value == null || value === "") return 0;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function readBoolean(formData: FormData, key: string) {
  return formData.get(key) === "1" || formData.get(key) === "on" || formData.get(key) === "true";
}

function readTags(formData: FormData) {
  const raw = readOptionalString(formData, "tags");
  return raw ? raw.split(",").map((t) => t.trim()).filter(Boolean) : [];
}

function fileExt(file: File) {
  const parts = file.name.split(".");
  return parts.length > 1 ? (parts.at(-1)?.toLowerCase() ?? "jpg") : "jpg";
}

function revalidateAll(slug?: string) {
  revalidatePath("/admin/news-posts");
  revalidatePath("/news");
  if (slug) revalidatePath(`/news/${slug}`);
}

export async function createNewsPostAction(formData: FormData) {
  const slug = readRequiredString(formData, "slug");
  const titleVi = readRequiredString(formData, "titleVi");
  const titleEn = readRequiredString(formData, "titleEn");

  await upsertNewsPost({
    slug,
    title_vi: titleVi,
    title_en: titleEn,
    excerpt_vi: readOptionalString(formData, "excerptVi"),
    excerpt_en: readOptionalString(formData, "excerptEn"),
    body_vi: readOptionalString(formData, "bodyVi"),
    body_en: readOptionalString(formData, "bodyEn"),
    cover_image_path: null,
    author_name: readOptionalString(formData, "authorName") || "SK Boutique",
    author_role_vi: readOptionalString(formData, "authorRoleVi"),
    author_role_en: readOptionalString(formData, "authorRoleEn"),
    author_bio_vi: readOptionalString(formData, "authorBioVi"),
    author_bio_en: readOptionalString(formData, "authorBioEn"),
    author_image_path: null,
    category: readOptionalString(formData, "category") || "tin-tuc",
    tags: readTags(formData),
    read_time_vi: readOptionalString(formData, "readTimeVi"),
    read_time_en: readOptionalString(formData, "readTimeEn"),
    is_published: readBoolean(formData, "isPublished"),
    is_featured: readBoolean(formData, "isFeatured"),
    published_at: readOptionalString(formData, "publishedAt") || null,
    sort_order: readOptionalNumber(formData, "sortOrder")
  });

  revalidateAll(slug);
}

export async function updateNewsPostAction(formData: FormData) {
  const id = readRequiredString(formData, "id");
  const slug = readRequiredString(formData, "slug");

  await updateNewsPost(id, {
    slug,
    title_vi: readRequiredString(formData, "titleVi"),
    title_en: readRequiredString(formData, "titleEn"),
    excerpt_vi: readOptionalString(formData, "excerptVi"),
    excerpt_en: readOptionalString(formData, "excerptEn"),
    body_vi: readOptionalString(formData, "bodyVi"),
    body_en: readOptionalString(formData, "bodyEn"),
    author_name: readOptionalString(formData, "authorName") || "SK Boutique",
    author_role_vi: readOptionalString(formData, "authorRoleVi"),
    author_role_en: readOptionalString(formData, "authorRoleEn"),
    author_bio_vi: readOptionalString(formData, "authorBioVi"),
    author_bio_en: readOptionalString(formData, "authorBioEn"),
    category: readOptionalString(formData, "category") || "tin-tuc",
    tags: readTags(formData),
    read_time_vi: readOptionalString(formData, "readTimeVi"),
    read_time_en: readOptionalString(formData, "readTimeEn"),
    is_published: readBoolean(formData, "isPublished"),
    is_featured: readBoolean(formData, "isFeatured"),
    published_at: readOptionalString(formData, "publishedAt") || null,
    sort_order: readOptionalNumber(formData, "sortOrder")
  });

  revalidateAll(slug);
}

export async function deleteNewsPostAction(formData: FormData) {
  const id = readRequiredString(formData, "id");
  await deleteNewsPost(id);
  revalidateAll();
}

export async function toggleNewsPostPublishedAction(formData: FormData) {
  const id = readRequiredString(formData, "id");
  const slug = readOptionalString(formData, "slug");
  const isPublished = readBoolean(formData, "isPublished");
  await updateNewsPost(id, { is_published: isPublished });
  revalidateAll(slug || undefined);
}

export async function toggleNewsPostFeaturedAction(formData: FormData) {
  const id = readRequiredString(formData, "id");
  const slug = readOptionalString(formData, "slug");
  const isFeatured = readBoolean(formData, "isFeatured");
  await updateNewsPost(id, { is_featured: isFeatured });
  revalidateAll(slug || undefined);
}

export async function uploadNewsPostCoverAction(formData: FormData) {
  const postId = readRequiredString(formData, "postId");
  const slug = readOptionalString(formData, "slug");
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) throw new Error("No file provided");

  const client = createSupabaseServiceClient();
  const ext = fileExt(file);
  const filePath = `news/${postId}/cover-${Date.now()}.${ext}`;

  const { error: uploadError } = await client.storage.from("news-images").upload(filePath, file, {
    contentType: file.type || "image/jpeg",
    upsert: false
  });
  if (uploadError) throw uploadError;

  const baseUrl = getSupabaseUrl().replace(/\/$/, "");
  const publicUrl = `${baseUrl}/storage/v1/object/public/news-images/${filePath}`;

  await updateNewsPost(postId, { cover_image_path: publicUrl });
  revalidateAll(slug || undefined);
}

export async function uploadNewsPostImageAction(formData: FormData) {
  const postId = readRequiredString(formData, "postId");
  const captionVi = readOptionalString(formData, "captionVi");
  const captionEn = readOptionalString(formData, "captionEn");
  const sortOrder = readOptionalNumber(formData, "sortOrder");
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) throw new Error("No file provided");

  const client = createSupabaseServiceClient();
  const ext = fileExt(file);
  const filePath = `news/${postId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await client.storage.from("news-images").upload(filePath, file, {
    contentType: file.type || "image/jpeg",
    upsert: false
  });
  if (uploadError) throw uploadError;

  const baseUrl = getSupabaseUrl().replace(/\/$/, "");
  const publicUrl = `${baseUrl}/storage/v1/object/public/news-images/${filePath}`;

  await addNewsPostImage({ post_id: postId, image_path: publicUrl, caption_vi: captionVi, caption_en: captionEn, sort_order: sortOrder });
  revalidateAll();
}

export async function deleteNewsPostImageAction(formData: FormData) {
  const id = readRequiredString(formData, "id");
  await deleteNewsPostImage(id);
  revalidateAll();
}
