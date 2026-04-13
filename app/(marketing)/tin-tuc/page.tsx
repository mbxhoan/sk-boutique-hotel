import type { Metadata } from "next";

import { PageViewTracker } from "@/components/page-view-tracker";
import { CmsPageRenderer } from "@/components/public-cms";
import { localize } from "@/lib/mock/i18n";
import { resolveLocale } from "@/lib/locale";
import { loadNewsCollectionPageCopy } from "@/lib/supabase/queries/content-pages";

type PageProps = {
  searchParams?: Promise<{
    lang?: string;
  }>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);
  const page = await loadNewsCollectionPageCopy();

  return {
    title: localize(locale, page.seo.title),
    description: localize(locale, page.seo.description)
  };
}

export default async function NewsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);
  const page = await loadNewsCollectionPageCopy();

  return (
    <>
      <PageViewTracker eventType="page_view" locale={locale} pagePath="/tin-tuc" entityType="news_collection" />
      <CmsPageRenderer locale={locale} page={page} />
    </>
  );
}
