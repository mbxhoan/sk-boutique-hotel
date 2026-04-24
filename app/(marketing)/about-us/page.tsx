import type { Metadata } from "next";

import { AboutUsPage as AboutUsSection, aboutUsSeo } from "@/components/about-us-page";
import { PageViewTracker } from "@/components/page-view-tracker";
import { resolveLocale } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";
import { loadMediaCollectionImageUrls } from "@/lib/supabase/queries/media";

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

export default async function AboutUsPageRoute({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);
  const customerImages = await loadMediaCollectionImageUrls("customers", [
    "/customers/customers1.jpg",
    "/customers/customers2.jpg",
    "/customers/customers3.jpg",
    "/customers/customers4.jpg",
    "/customers/customers5.jpg",
    "/customers/customers6.jpg",
    "/customers/customers22.jpg"
  ]);

  return (
    <>
      <PageViewTracker eventType="page_view" locale={locale} pagePath="/about-us" entityId="about-us" entityType="static_page" />
      <AboutUsSection customerImages={customerImages} locale={locale} />
    </>
  );
}
