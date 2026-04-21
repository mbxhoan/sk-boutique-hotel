import type { Database } from "@/lib/supabase/database.types";
import { getSupabaseUrl } from "@/lib/supabase/env";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { queryWithFallback, queryWithServiceFallback } from "@/lib/supabase/queries/shared";
import { buildMediaLookupKey, type MediaLookup } from "@/lib/media/library";

export type MediaCollectionRow = Database["public"]["Tables"]["media_collections"]["Row"];
export type MediaCollectionInsert = Database["public"]["Tables"]["media_collections"]["Insert"];
export type MediaCollectionUpdate = Database["public"]["Tables"]["media_collections"]["Update"];
export type MediaAssetRow = Database["public"]["Tables"]["media_assets"]["Row"];
export type MediaAssetInsert = Database["public"]["Tables"]["media_assets"]["Insert"];
export type MediaAssetUpdate = Database["public"]["Tables"]["media_assets"]["Update"];

export type MediaAssetRowWithUrl = MediaAssetRow & {
  public_url: string;
};

export function resolveMediaAssetUrl(asset: Pick<MediaAssetRow, "fallback_url" | "file_bucket" | "file_path">) {
  if (asset.file_path) {
    const baseUrl = getSupabaseUrl().replace(/\/$/, "");

    return `${baseUrl}/storage/v1/object/public/${asset.file_bucket}/${asset.file_path}`;
  }

  return asset.fallback_url || "";
}

export async function listMediaCollections() {
  return queryWithServiceFallback(
    async (client) => {
      const { data, error } = await client
        .from("media_collections")
        .select("id, slug, name_vi, name_en, description_vi, description_en, sort_order, is_active, created_at, updated_at")
        .order("sort_order", { ascending: true })
        .order("updated_at", { ascending: false });

      if (error) {
        throw error;
      }

      return (data ?? []) as MediaCollectionRow[];
    },
    [] as MediaCollectionRow[]
  );
}

export async function listMediaAssets() {
  return queryWithServiceFallback(
    async (client) => {
      const { data, error } = await client
        .from("media_assets")
        .select(
          "id, collection_slug, slug, title_vi, title_en, alt_vi, alt_en, description_vi, description_en, file_bucket, file_path, file_name, mime_type, file_size, fallback_url, width, height, sort_order, is_featured, is_active, created_by, updated_by, created_at, updated_at"
        )
        .order("collection_slug", { ascending: true })
        .order("sort_order", { ascending: true })
        .order("updated_at", { ascending: false });

      if (error) {
        throw error;
      }

      return (data ?? []) as MediaAssetRow[];
    },
    [] as MediaAssetRow[]
  );
}

export async function listMediaAssetsByCollectionSlug(collectionSlug: string) {
  return queryWithFallback(
    async (client) => {
      const { data, error } = await client
        .from("media_assets")
        .select(
          "id, collection_slug, slug, title_vi, title_en, alt_vi, alt_en, description_vi, description_en, file_bucket, file_path, file_name, mime_type, file_size, fallback_url, width, height, sort_order, is_featured, is_active, created_by, updated_by, created_at, updated_at"
        )
        .eq("collection_slug", collectionSlug)
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .order("sort_order", { ascending: true })
        .order("updated_at", { ascending: false });

      if (error) {
        throw error;
      }

      return (data ?? []) as MediaAssetRow[];
    },
    [] as MediaAssetRow[]
  );
}

export async function loadMediaLookup() {
  return queryWithFallback(
    async (client) => {
      const { data, error } = await client
        .from("media_assets")
        .select("collection_slug, slug, file_bucket, file_path, fallback_url")
        .eq("is_active", true)
        .order("collection_slug", { ascending: true })
        .order("is_featured", { ascending: false })
        .order("sort_order", { ascending: true });

      if (error) {
        throw error;
      }

      return (data ?? []).reduce<MediaLookup>((accumulator, asset) => {
        const key = buildMediaLookupKey(asset.collection_slug, asset.slug);
        const resolvedUrl = resolveMediaAssetUrl(asset);
        accumulator[key] = resolvedUrl;

        if (asset.fallback_url && !accumulator[asset.fallback_url]) {
          accumulator[asset.fallback_url] = resolvedUrl;
        }

        return accumulator;
      }, {});
    },
    {} as MediaLookup
  );
}

export async function loadMediaCollectionImageUrls(collectionSlug: string, fallbackUrls: string[], limit?: number) {
  return queryWithFallback(
    async (client) => {
      let query = client
        .from("media_assets")
        .select("file_bucket, file_path, fallback_url")
        .eq("collection_slug", collectionSlug)
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .order("sort_order", { ascending: true })
        .order("updated_at", { ascending: false });

      if (limit != null) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      const urls = (data ?? [])
        .map((asset) => resolveMediaAssetUrl(asset))
        .filter((url): url is string => Boolean(url));

      return urls.length ? urls : fallbackUrls;
    },
    fallbackUrls
  );
}

export async function upsertMediaCollection(input: MediaCollectionInsert) {
  const client = createSupabaseServiceClient();
  const { data, error } = await client
    .from("media_collections")
    .upsert(input, { onConflict: "slug" })
    .select("id, slug, name_vi, name_en, description_vi, description_en, sort_order, is_active, created_at, updated_at")
    .single();

  if (error) {
    throw error;
  }

  return data as MediaCollectionRow;
}

export async function upsertMediaAsset(input: MediaAssetInsert) {
  const client = createSupabaseServiceClient();
  const { data, error } = await client
    .from("media_assets")
    .upsert(input, { onConflict: "collection_slug,slug" })
    .select(
      "id, collection_slug, slug, title_vi, title_en, alt_vi, alt_en, description_vi, description_en, file_bucket, file_path, file_name, mime_type, file_size, fallback_url, width, height, sort_order, is_featured, is_active, created_by, updated_by, created_at, updated_at"
    )
    .single();

  if (error) {
    throw error;
  }

  return data as MediaAssetRow;
}

export async function deleteMediaCollection(slug: string) {
  const client = createSupabaseServiceClient();
  const { error } = await client.from("media_collections").delete().eq("slug", slug);

  if (error) {
    throw error;
  }
}

export async function deleteMediaAsset(id: string) {
  const client = createSupabaseServiceClient();
  const { error } = await client.from("media_assets").delete().eq("id", id);

  if (error) {
    throw error;
  }
}
