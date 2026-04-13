import type { Metadata } from "next";

import { MarketingHome } from "@/components/marketing-home";
import { localize } from "@/lib/mock/i18n";
import { resolveLocale } from "@/lib/locale";
import { loadHomePageCopy } from "@/lib/supabase/queries/content-pages";

type PageProps = {
  searchParams?: Promise<{
    lang?: string;
  }>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);
  const page = await loadHomePageCopy();

  return {
    title: localize(locale, page.seo.title),
    description: localize(locale, page.seo.description)
  };
}

export default async function MarketingHomePage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);
  const page = await loadHomePageCopy();

  return <MarketingHome locale={locale} page={page} />;
}
