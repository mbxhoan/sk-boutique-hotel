import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageViewTracker } from "@/components/page-view-tracker";
import { PageTemplate } from "@/components/page-template";
import { isTemporarilyHiddenSlug } from "@/lib/hidden-routes";
import { resolveLocale, translate } from "@/lib/locale";
import { buildPageMetadata } from "@/lib/metadata";
import { getContentStaticRouteParams, loadStaticPageBySlug } from "@/lib/supabase/queries/content-pages";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    lang?: string;
  }>;
};

export async function generateStaticParams() {
  return getContentStaticRouteParams();
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);

  if (isTemporarilyHiddenSlug(slug)) {
    return {};
  }

  const page = await loadStaticPageBySlug(slug);

  if (!page) {
    return {};
  }

  return buildPageMetadata({
    title: translate(locale, page.title),
    description: translate(locale, page.description),
    path: `/${slug}`,
    ogImagePath: "/api/og/home",
    locale
  });
}

export default async function StaticPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);

  if (isTemporarilyHiddenSlug(slug)) {
    notFound();
  }

  const page = await loadStaticPageBySlug(slug);

  if (!page) {
    notFound();
  }

  return (
    <>
      <PageViewTracker eventType="page_view" locale={locale} pagePath={`/${slug}`} entityId={slug} entityType="static_page" />
      <PageTemplate content={page} locale={locale} />
    </>
  );
}
