import { cache } from "react";

import type { NewsPostImageInsert, NewsPostImageRow, NewsPostInsert, NewsPostRow, NewsPostUpdate } from "@/lib/supabase/database.types";
import { queryWithServiceFallback } from "@/lib/supabase/queries/shared";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

const postSelect =
  "id, slug, title_vi, title_en, excerpt_vi, excerpt_en, body_vi, body_en, cover_image_path, author_name, author_role_vi, author_role_en, author_bio_vi, author_bio_en, author_image_path, category, tags, read_time_vi, read_time_en, is_published, is_featured, published_at, sort_order, created_at, updated_at";

// Lightweight projection for related/listing cards — no heavy body_* columns.
const cardSelect = "id, slug, title_vi, title_en, category, cover_image_path, read_time_vi, read_time_en, is_featured, sort_order, published_at";

export type NewsPostCard = Pick<
  NewsPostRow,
  "id" | "slug" | "title_vi" | "title_en" | "category" | "cover_image_path" | "read_time_vi" | "read_time_en" | "is_featured" | "sort_order" | "published_at"
>;

const imageSelect = "id, post_id, image_path, caption_vi, caption_en, sort_order, created_at";

export async function listNewsPosts(options: { includeUnpublished?: boolean; category?: string } = {}) {
  return queryWithServiceFallback(async (client) => {
    let query = client.from("news_posts").select(postSelect).order("sort_order").order("published_at", { ascending: false }).order("created_at", { ascending: false });

    if (!options.includeUnpublished) {
      query = query.eq("is_published", true);
    }

    if (options.category) {
      query = query.eq("category", options.category);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as NewsPostRow[];
  }, [] as NewsPostRow[]);
}

export async function getFeaturedPost() {
  return queryWithServiceFallback(async (client) => {
    const { data, error } = await client
      .from("news_posts")
      .select(postSelect)
      .eq("is_published", true)
      .eq("is_featured", true)
      .order("sort_order")
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return (data ?? null) as NewsPostRow | null;
  }, null as NewsPostRow | null);
}

export const getNewsPostBySlug = cache(async (slug: string) => {
  return queryWithServiceFallback(async (client) => {
    const { data, error } = await client.from("news_posts").select(postSelect).eq("slug", slug).maybeSingle();
    if (error) throw error;
    return (data ?? null) as NewsPostRow | null;
  }, null as NewsPostRow | null);
});

// Cached, body-free projection used for related posts and any card grid.
export const listNewsPostCards = cache(async (options: { category?: string } = {}) => {
  return queryWithServiceFallback(async (client) => {
    let query = client
      .from("news_posts")
      .select(cardSelect)
      .eq("is_published", true)
      .order("sort_order")
      .order("published_at", { ascending: false });

    if (options.category) {
      query = query.eq("category", options.category);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as NewsPostCard[];
  }, [] as NewsPostCard[]);
});

export async function listNewsPostImages(postId: string) {
  return queryWithServiceFallback(async (client) => {
    const { data, error } = await client
      .from("news_post_images")
      .select(imageSelect)
      .eq("post_id", postId)
      .order("sort_order")
      .order("created_at");
    if (error) throw error;
    return (data ?? []) as NewsPostImageRow[];
  }, [] as NewsPostImageRow[]);
}

export async function upsertNewsPost(input: NewsPostInsert) {
  const client = createSupabaseServiceClient();
  const { data, error } = await client.from("news_posts").upsert(input, { onConflict: "id" }).select(postSelect).single();
  if (error) throw error;
  return data as NewsPostRow;
}

export async function updateNewsPost(id: string, input: NewsPostUpdate) {
  const client = createSupabaseServiceClient();
  const { data, error } = await client.from("news_posts").update(input).eq("id", id).select(postSelect).single();
  if (error) throw error;
  return data as NewsPostRow;
}

export async function deleteNewsPost(id: string) {
  const client = createSupabaseServiceClient();
  const { error } = await client.from("news_posts").delete().eq("id", id);
  if (error) throw error;
}

export async function addNewsPostImage(input: NewsPostImageInsert) {
  const client = createSupabaseServiceClient();
  const { data, error } = await client.from("news_post_images").insert(input).select(imageSelect).single();
  if (error) throw error;
  return data as NewsPostImageRow;
}

export async function deleteNewsPostImage(id: string) {
  const client = createSupabaseServiceClient();
  const { error } = await client.from("news_post_images").delete().eq("id", id);
  if (error) throw error;
}
