import type { Metadata } from "next";

import { AdminContentPagesManager } from "@/components/admin-content-pages-manager";
import { resolveLocale } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";
import { adminManagementCopy } from "@/lib/mock/admin-management";
import { listContentPages } from "@/lib/supabase/queries/content-pages";
import { listMediaAssets, listMediaCollections, resolveMediaAssetUrl } from "@/lib/supabase/queries/media";

type PageProps = {
  searchParams?: Promise<{
    lang?: string;
  }>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);

  return {
    title: locale === "en" ? "Pages & articles" : "Bài viết & trang",
    description: localize(locale, adminManagementCopy.contentPages.description)
  };
}

export default async function AdminContentPagesPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);
  const [pages, assets, collections] = await Promise.all([listContentPages(), listMediaAssets(), listMediaCollections()]);
  const assetsWithUrl = assets.map((asset) => ({
    ...asset,
    public_url: resolveMediaAssetUrl(asset)
  }));

  return (
    <AdminContentPagesManager
      assets={assetsWithUrl}
      collections={collections}
      locale={locale}
      pages={pages}
    />
  );
}
