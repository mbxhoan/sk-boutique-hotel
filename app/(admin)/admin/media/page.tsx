import type { Metadata } from "next";

import { AdminMediaManager } from "@/components/admin-media-manager";
import { resolveLocale } from "@/lib/locale";
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
    title: locale === "en" ? "Media library" : "Thư viện media",
    description:
      locale === "en"
        ? "Manage reusable hotel images from one shared library."
        : "Quản lý ảnh dùng chung của khách sạn trong một thư viện duy nhất."
  };
}

export default async function AdminMediaPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);
  const collections = await listMediaCollections();
  const assets = (await listMediaAssets()).map((asset) => ({
    ...asset,
    public_url: resolveMediaAssetUrl(asset)
  }));

  return <AdminMediaManager assets={assets} collections={collections} locale={locale} />;
}
