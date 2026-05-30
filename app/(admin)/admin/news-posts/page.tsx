import type { Metadata } from "next";

import { AdminNewsPostsManager } from "@/components/admin-news-posts-manager";
import { resolveLocale } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";
import { listNewsPosts, listNewsPostImages } from "@/lib/supabase/queries/news-posts";

type PageProps = {
  searchParams?: Promise<{ lang?: string }>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);

  return {
    title: localize(locale, { vi: "Tạp chí", en: "Journal" }),
    description: localize(locale, {
      vi: "Quản lý bài viết và tạp chí hiển thị trên trang web.",
      en: "Manage journal articles shown on the website."
    })
  };
}

export default async function AdminNewsPostsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);
  const posts = await listNewsPosts({ includeUnpublished: true });

  const postsWithImages = await Promise.all(
    posts.map(async (post) => ({
      ...post,
      images: await listNewsPostImages(post.id)
    }))
  );

  return <AdminNewsPostsManager posts={postsWithImages} locale={locale} />;
}
