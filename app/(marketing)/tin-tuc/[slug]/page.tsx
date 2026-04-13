import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageViewTracker } from "@/components/page-view-tracker";
import { CmsPageRenderer } from "@/components/public-cms";
import { localize } from "@/lib/mock/i18n";
import { resolveLocale } from "@/lib/locale";
import { getContentNewsStaticParams, loadNewsPageBySlug } from "@/lib/supabase/queries/content-pages";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    lang?: string;
  }>;
};

export async function generateStaticParams() {
  return getContentNewsStaticParams();
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);
  const page = await loadNewsPageBySlug(slug);

  if (!page) {
    return {};
  }

  return {
    title: localize(locale, page.seo.title),
    description: localize(locale, page.seo.description)
  };
}

export default async function NewsDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);
  const page = await loadNewsPageBySlug(slug);

  if (!page) {
    notFound();
  }

  return (
    <>
      <PageViewTracker eventType="page_view" locale={locale} pagePath={`/tin-tuc/${slug}`} entityId={slug} entityType="news_post" />
      <CmsPageRenderer className="news-article__page" locale={locale} page={page} />
    </>
  );
}
