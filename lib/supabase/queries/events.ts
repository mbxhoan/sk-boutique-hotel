import type { EventImageInsert, EventImageRow, EventInsert, EventRow, EventUpdate } from "@/lib/supabase/database.types";
import { queryWithServiceFallback } from "@/lib/supabase/queries/shared";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

const eventSelect = "id, slug, title_vi, title_en, description_vi, description_en, cover_image_path, event_date, is_published, show_detail_link, sort_order, created_at, updated_at";
const eventImageSelect = "id, event_id, image_path, caption_vi, caption_en, sort_order, created_at";

export async function listEvents(options: { includeUnpublished?: boolean } = {}) {
  return queryWithServiceFallback(async (client) => {
    let query = client.from("events").select(eventSelect).order("sort_order").order("created_at");

    if (!options.includeUnpublished) {
      query = query.eq("is_published", true);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data ?? []) as EventRow[];
  }, [] as EventRow[]);
}

export async function getEventBySlug(slug: string) {
  return queryWithServiceFallback(async (client) => {
    const { data, error } = await client.from("events").select(eventSelect).eq("slug", slug).maybeSingle();

    if (error) throw error;
    return (data ?? null) as EventRow | null;
  }, null as EventRow | null);
}

export async function listEventImages(eventId: string) {
  return queryWithServiceFallback(async (client) => {
    const { data, error } = await client
      .from("event_images")
      .select(eventImageSelect)
      .eq("event_id", eventId)
      .order("sort_order")
      .order("created_at");

    if (error) throw error;
    return (data ?? []) as EventImageRow[];
  }, [] as EventImageRow[]);
}

export async function upsertEvent(input: EventInsert) {
  const client = createSupabaseServiceClient();
  const { data, error } = await client.from("events").upsert(input, { onConflict: "id" }).select(eventSelect).single();

  if (error) throw error;
  return data as EventRow;
}

export async function updateEvent(id: string, input: EventUpdate) {
  const client = createSupabaseServiceClient();
  const { data, error } = await client.from("events").update(input).eq("id", id).select(eventSelect).single();

  if (error) throw error;
  return data as EventRow;
}

export async function deleteEvent(id: string) {
  const client = createSupabaseServiceClient();
  const { error } = await client.from("events").delete().eq("id", id);

  if (error) throw error;
}

export async function addEventImage(input: EventImageInsert) {
  const client = createSupabaseServiceClient();
  const { data, error } = await client.from("event_images").insert(input).select(eventImageSelect).single();

  if (error) throw error;
  return data as EventImageRow;
}

export async function deleteEventImage(id: string) {
  const client = createSupabaseServiceClient();
  const { error } = await client.from("event_images").delete().eq("id", id);

  if (error) throw error;
}

export async function reorderEventImages(updates: { id: string; sort_order: number }[]) {
  const client = createSupabaseServiceClient();

  await Promise.all(
    updates.map(({ id, sort_order }) =>
      client.from("event_images").update({ sort_order }).eq("id", id)
    )
  );
}
