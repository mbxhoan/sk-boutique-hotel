import type { Metadata } from "next";

import { CmsPageRenderer } from "@/components/public-cms";
import { localize } from "@/lib/mock/i18n";
import { resolveLocale } from "@/lib/locale";
import { loadRoomCollectionPageCopy } from "@/lib/supabase/queries/room-types";

type PageProps = {
  searchParams?: Promise<{
    lang?: string;
  }>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);
  const page = await loadRoomCollectionPageCopy();

  return {
    title: localize(locale, page.seo.title),
    description: localize(locale, page.seo.description)
  };
}

export default async function RoomsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);
  const page = await loadRoomCollectionPageCopy();

  return <CmsPageRenderer locale={locale} page={page} />;
}
