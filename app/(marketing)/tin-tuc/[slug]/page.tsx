import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageViewTracker } from "@/components/page-view-tracker";
import { CmsPageRenderer } from "@/components/public-cms";
import { localize } from "@/lib/mock/i18n";
import { findNewsPageBySlug, getNewsStaticParams } from "@/lib/mock/public-cms";
import { resolveLocale } from "@/lib/locale";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    lang?: string;
  }>;
};

export function generateStaticParams() {
  return getNewsStaticParams();
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);
  const page = findNewsPageBySlug(slug);

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
  const page = findNewsPageBySlug(slug);

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
