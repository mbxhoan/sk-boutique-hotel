"use server";

import { revalidatePath } from "next/cache";

import { addEventImage, upsertEvent, deleteEvent, deleteEventImage, updateEvent } from "@/lib/supabase/queries/events";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { getSupabaseUrl } from "@/lib/supabase/env";

function readRequiredString(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Missing required field: ${key}`);
  }
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

function fileExt(file: File) {
  const parts = file.name.split(".");
  return parts.length > 1 ? (parts.at(-1)?.toLowerCase() ?? "jpg") : "jpg";
}

function revalidateAll(slug?: string) {
  revalidatePath("/admin/events");
  revalidatePath("/su-kien");
  if (slug) {
    revalidatePath(`/su-kien/${slug}`);
  }
}

export async function createEventAction(formData: FormData) {
  const titleVi = readRequiredString(formData, "titleVi");
  const titleEn = readRequiredString(formData, "titleEn");
  const slug = readRequiredString(formData, "slug");
  const descriptionVi = readOptionalString(formData, "descriptionVi");
  const descriptionEn = readOptionalString(formData, "descriptionEn");
  const eventDate = readOptionalString(formData, "eventDate") || null;
  const isPublished = readBoolean(formData, "isPublished");
  const showDetailLink = readBoolean(formData, "showDetailLink");
  const sortOrder = readOptionalNumber(formData, "sortOrder");

  await upsertEvent({
    title_vi: titleVi,
    title_en: titleEn,
    slug,
    description_vi: descriptionVi,
    description_en: descriptionEn,
    cover_image_path: null,
    event_date: eventDate,
    is_published: isPublished,
    show_detail_link: showDetailLink,
    sort_order: sortOrder
  });

  revalidateAll(slug);
}

export async function updateEventAction(formData: FormData) {
  const id = readRequiredString(formData, "id");
  const titleVi = readRequiredString(formData, "titleVi");
  const titleEn = readRequiredString(formData, "titleEn");
  const slug = readRequiredString(formData, "slug");
  const descriptionVi = readOptionalString(formData, "descriptionVi");
  const descriptionEn = readOptionalString(formData, "descriptionEn");
  const eventDate = readOptionalString(formData, "eventDate") || null;
  const isPublished = readBoolean(formData, "isPublished");
  const showDetailLink = readBoolean(formData, "showDetailLink");
  const sortOrder = readOptionalNumber(formData, "sortOrder");

  await updateEvent(id, {
    title_vi: titleVi,
    title_en: titleEn,
    slug,
    description_vi: descriptionVi,
    description_en: descriptionEn,
    event_date: eventDate,
    is_published: isPublished,
    show_detail_link: showDetailLink,
    sort_order: sortOrder
  });

  revalidateAll(slug);
}

export async function deleteEventAction(formData: FormData) {
  const id = readRequiredString(formData, "id");
  await deleteEvent(id);
  revalidateAll();
}

export async function uploadEventImageAction(formData: FormData) {
  const eventId = readRequiredString(formData, "eventId");
  const captionVi = readOptionalString(formData, "captionVi");
  const captionEn = readOptionalString(formData, "captionEn");
  const sortOrder = readOptionalNumber(formData, "sortOrder");
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("No file provided");
  }

  const client = createSupabaseServiceClient();
  const ext = fileExt(file);
  const filePath = `events/${eventId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await client.storage.from("event-images").upload(filePath, file, {
    contentType: file.type || "image/jpeg",
    upsert: false
  });

  if (uploadError) throw uploadError;

  const baseUrl = getSupabaseUrl().replace(/\/$/, "");
  const publicUrl = `${baseUrl}/storage/v1/object/public/event-images/${filePath}`;

  await addEventImage({
    event_id: eventId,
    image_path: publicUrl,
    caption_vi: captionVi,
    caption_en: captionEn,
    sort_order: sortOrder
  });

  revalidateAll();
}

export async function deleteEventImageAction(formData: FormData) {
  const id = readRequiredString(formData, "id");
  await deleteEventImage(id);
  revalidateAll();
}

export async function uploadEventCoverImageAction(formData: FormData) {
  const eventId = readRequiredString(formData, "eventId");
  const slug = readOptionalString(formData, "slug");
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("No file provided");
  }

  const client = createSupabaseServiceClient();
  const ext = fileExt(file);
  const filePath = `events/${eventId}/cover-${Date.now()}.${ext}`;

  const { error: uploadError } = await client.storage.from("event-images").upload(filePath, file, {
    contentType: file.type || "image/jpeg",
    upsert: false
  });

  if (uploadError) throw uploadError;

  const baseUrl = getSupabaseUrl().replace(/\/$/, "");
  const publicUrl = `${baseUrl}/storage/v1/object/public/event-images/${filePath}`;

  await updateEvent(eventId, { cover_image_path: publicUrl });

  revalidateAll(slug || undefined);
}

export async function toggleEventPublishedAction(formData: FormData) {
  const id = readRequiredString(formData, "id");
  const slug = readOptionalString(formData, "slug");
  const isPublished = readBoolean(formData, "isPublished");

  await updateEvent(id, { is_published: isPublished });

  revalidateAll(slug || undefined);
}

export async function toggleEventDetailLinkAction(formData: FormData) {
  const id = readRequiredString(formData, "id");
  const slug = readOptionalString(formData, "slug");
  const showDetailLink = readBoolean(formData, "showDetailLink");

  await updateEvent(id, { show_detail_link: showDetailLink });

  revalidateAll(slug || undefined);
}
