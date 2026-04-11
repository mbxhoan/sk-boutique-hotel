import type { Metadata } from "next";

import { CmsPageRenderer } from "@/components/public-cms";
import { localize } from "@/lib/mock/i18n";
import { roomCollectionPageCopy } from "@/lib/mock/public-cms";
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
    title: localize(locale, roomCollectionPageCopy.seo.title),
    description: localize(locale, roomCollectionPageCopy.seo.description)
  };
}

export default async function RoomsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);

  return <CmsPageRenderer locale={locale} page={roomCollectionPageCopy} />;
}
