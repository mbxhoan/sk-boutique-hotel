import type { Metadata } from "next";

import { AboutUsPage as AboutUsPageContent, aboutUsSeo } from "@/components/about-us-page";
import { PageViewTracker } from "@/components/page-view-tracker";
import { resolveLocale } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";

type PageProps = {
  searchParams?: Promise<{
    lang?: string;
  }>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);

  return {
    title: localize(locale, aboutUsSeo.title),
    description: localize(locale, aboutUsSeo.description)
  };
}

export default async function AboutUsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);

  return (
    <>
      <PageViewTracker eventType="page_view" locale={locale} pagePath="/about-us" entityId="about-us" entityType="static_page" />
      <AboutUsPageContent locale={locale} />
    </>
  );
}
