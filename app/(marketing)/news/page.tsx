import type { Metadata } from "next";

import { NewsListPage } from "@/components/news-list-page";
import { PageViewTracker } from "@/components/page-view-tracker";
import { resolveLocale } from "@/lib/locale";
import { buildPageMetadata } from "@/lib/metadata";
import { localize } from "@/lib/mock/i18n";
import { listNewsPosts } from "@/lib/supabase/queries/news-posts";

type PageProps = {
  searchParams?: Promise<{ lang?: string }>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);

  return buildPageMetadata({
    title: localize(locale, { vi: "Tạp chí", en: "Journal" }),
    description: localize(locale, {
      vi: "Cẩm nang du lịch Phú Quốc, trải nghiệm tại khách sạn, ẩm thực đảo và những ưu đãi dành riêng cho khách của SK Boutique Hotel.",
      en: "Phu Quoc travel guides, hotel stories, island cuisine, and exclusive offers reserved for guests of SK Boutique Hotel."
    }),
    path: "/news",
    ogImagePath: "/assets/reception/1.png",
    locale
  });
}

export default async function NewsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);
  const posts = await listNewsPosts();

  return (
    <>
      <PageViewTracker eventType="page_view" locale={locale} pagePath="/news" entityId="news" entityType="static_page" />
      <NewsListPage posts={posts} locale={locale} />
    </>
  );
}
