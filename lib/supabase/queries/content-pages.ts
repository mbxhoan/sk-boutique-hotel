import { findNewsPageBySlug, getNewsStaticParams, homePageCopy, newsCollectionPageCopy } from "@/lib/mock/public-cms";
import type { CmsPageCopy } from "@/lib/mock/public-cms";
import { isTemporarilyHiddenHref } from "@/lib/hidden-routes";
import { findPageBySlug, getStaticRouteParams } from "@/lib/site-content";
import type { Database } from "@/lib/supabase/database.types";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import type { PageContent } from "@/lib/site-content";
import { queryWithFallback } from "@/lib/supabase/queries/shared";

type ContentPageType = "home" | "page" | "collection" | "detail";
export type ContentPageRow = Database["public"]["Tables"]["content_pages"]["Row"];
export type ContentPageInsert = Database["public"]["Tables"]["content_pages"]["Insert"];
export type ContentPageUpdate = Database["public"]["Tables"]["content_pages"]["Update"];

function normalizePath(slug: string) {
  return slug.startsWith("/") ? slug : `/${slug}`;
}

async function loadContentPage<T>(slug: string, pageType: ContentPageType, fallback: T): Promise<T> {
  return queryWithFallback(
    async (client) => {
      const { data, error } = await client
        .from("content_pages")
        .select("content_json")
        .eq("slug", normalizePath(slug))
        .eq("page_type", pageType)
        .eq("is_published", true)
        .maybeSingle();

      if (error || !data?.content_json) {
        return fallback;
      }

      return data.content_json as T;
    },
    fallback
  );
}

async function listContentPageParams(pageType: ContentPageType, fallback: { slug: string }[]) {
  return queryWithFallback(
    async (client) => {
      const { data, error } = await client
        .from("content_pages")
        .select("slug")
        .eq("page_type", pageType)
        .eq("is_published", true)
        .order("sort_order", { ascending: true });

      if (error || !data?.length) {
        return fallback;
      }

      return data.map((row) => ({
        slug: row.slug.replace(/^\/+/, "")
      })).filter((item) => !isTemporarilyHiddenHref(`/${item.slug}`));
    },
    fallback
  );
}

export async function loadHomePageCopy() {
  return loadContentPage<CmsPageCopy>("/", "home", homePageCopy);
}

export async function loadStaticPageBySlug(slug: string) {
  const fallback = findPageBySlug(slug);

  if (!fallback) {
    return null;
  }

  return loadContentPage<PageContent>(slug, "page", fallback);
}

export async function loadNewsCollectionPageCopy() {
  return loadContentPage<CmsPageCopy>("/tin-tuc", "collection", newsCollectionPageCopy);
}

export async function loadNewsPageBySlug(slug: string) {
  const fallback = findNewsPageBySlug(slug);

  if (!fallback) {
    return null;
  }

  return loadContentPage<CmsPageCopy>(`/tin-tuc/${slug}`, "detail", fallback);
}

export async function getContentStaticRouteParams() {
  return listContentPageParams("page", getStaticRouteParams());
}

export async function getContentNewsStaticParams() {
  return listContentPageParams("detail", getNewsStaticParams());
}

export async function listContentPages() {
  return queryWithFallback(
    async (client) => {
      const { data, error } = await client
        .from("content_pages")
        .select("id, slug, page_type, title_vi, title_en, description_vi, description_en, is_published, sort_order, created_at, updated_at")
        .order("sort_order", { ascending: true })
        .order("updated_at", { ascending: false });

      if (error) {
        throw error;
      }

      return (data ?? []) as ContentPageRow[];
    },
    [] as ContentPageRow[]
  );
}

export async function upsertContentPage(input: ContentPageInsert) {
  const client = createSupabaseServiceClient();
  const { data, error } = await client
    .from("content_pages")
    .upsert(input, { onConflict: "id" })
    .select("id, slug, page_type, title_vi, title_en, description_vi, description_en, is_published, sort_order, created_at, updated_at")
    .single();

  if (error) {
    throw error;
  }

  return data as ContentPageRow;
}

export async function deleteContentPage(id: string) {
  const client = createSupabaseServiceClient();
  const { error } = await client.from("content_pages").delete().eq("id", id);

  if (error) {
    throw error;
  }
}
