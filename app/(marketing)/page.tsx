import type { Metadata } from "next";

import { MarketingHome } from "@/components/marketing-home";
import { marketingHomeCopy } from "@/lib/mock/marketing-home";
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
    title: locale === "en" ? "Home" : "Trang chủ",
    description:
      locale === "en"
        ? marketingHomeCopy.hero.description.en
        : marketingHomeCopy.hero.description.vi
  };
}

export default async function MarketingHomePage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);

  return <MarketingHome locale={locale} />;
}
