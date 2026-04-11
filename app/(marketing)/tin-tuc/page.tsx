import type { Metadata } from "next";

import { PageViewTracker } from "@/components/page-view-tracker";
import { CmsPageRenderer } from "@/components/public-cms";
import { localize } from "@/lib/mock/i18n";
import { newsCollectionPageCopy } from "@/lib/mock/public-cms";
import { resolveLocale } from "@/lib/locale";

type PageProps = {
  searchParams?: Promise<{
    lang?: string;
  }>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);

  return {
    title: localize(locale, newsCollectionPageCopy.seo.title),
    description: localize(locale, newsCollectionPageCopy.seo.description)
  };
}

export default async function NewsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);

  return (
    <>
      <PageViewTracker eventType="page_view" locale={locale} pagePath="/tin-tuc" entityType="news_collection" />
      <CmsPageRenderer locale={locale} page={newsCollectionPageCopy} />
    </>
  );
}
