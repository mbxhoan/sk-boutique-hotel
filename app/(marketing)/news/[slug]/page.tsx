import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NewsDetailPage } from "@/components/news-detail-page";
import { PageViewTracker } from "@/components/page-view-tracker";
import { resolveLocale } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";
import { getNewsPostBySlug, listNewsPostCards } from "@/lib/supabase/queries/news-posts";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ lang?: string }>;
};

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);
  const post = await getNewsPostBySlug(resolvedParams.slug);

  if (!post) return { title: "Not found" };

  return {
    title: localize(locale, { vi: post.title_vi, en: post.title_en }) + " — SK Boutique Hotel",
    description: localize(locale, { vi: post.excerpt_vi, en: post.excerpt_en }),
    alternates: { canonical: `/news/${post.slug}` },
    openGraph: {
      images: post.cover_image_path ? [{ url: post.cover_image_path }] : undefined
    }
  };
}

export default async function NewsPostPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);

  const [post, cards] = await Promise.all([getNewsPostBySlug(resolvedParams.slug), listNewsPostCards()]);
  if (!post || (!post.is_published && process.env.NODE_ENV === "production")) notFound();

  const related = cards.filter((p) => p.id !== post.id && (p.category === post.category || p.is_featured)).slice(0, 3);

  return (
    <>
      <PageViewTracker eventType="page_view" locale={locale} pagePath={`/news/${post.slug}`} entityId={post.id} entityType="news_post" />
      <NewsDetailPage post={post} relatedPosts={related} locale={locale} />
    </>
  );
}
