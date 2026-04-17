import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageViewTracker } from "@/components/page-view-tracker";
import { PageTemplate } from "@/components/page-template";
import { resolveLocale, translate } from "@/lib/locale";
import { loadStaticPageBySlug } from "@/lib/supabase/queries/content-pages";

type PageProps = {
  searchParams?: Promise<{
    lang?: string;
  }>;
};

const slug = "about-us";

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);
  const page = await loadStaticPageBySlug(slug);

  if (!page) {
    return {};
  }

  return {
    title: translate(locale, page.title),
    description: translate(locale, page.description)
  };
}

export default async function AboutUsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);
  const page = await loadStaticPageBySlug(slug);

  if (!page) {
    notFound();
  }

  return (
    <>
      <PageViewTracker eventType="page_view" locale={locale} pagePath="/about-us" entityId={slug} entityType="static_page" />
      <PageTemplate content={page} locale={locale} />
    </>
  );
}
