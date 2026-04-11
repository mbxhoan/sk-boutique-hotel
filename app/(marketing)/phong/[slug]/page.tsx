import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CmsPageRenderer } from "@/components/public-cms";
import { localize } from "@/lib/mock/i18n";
import { resolveLocale } from "@/lib/locale";
import { getRoomStaticParams, loadRoomDetailPageCopy } from "@/lib/supabase/queries/room-types";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    lang?: string;
  }>;
};

export function generateStaticParams() {
  return getRoomStaticParams();
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);
  const page = await loadRoomDetailPageCopy(slug);

  if (!page) {
    return {};
  }

  return {
    title: localize(locale, page.seo.title),
    description: localize(locale, page.seo.description)
  };
}

export default async function RoomDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);
  const page = await loadRoomDetailPageCopy(slug);

  if (!page) {
    notFound();
  }

  return <CmsPageRenderer locale={locale} page={page} />;
}
