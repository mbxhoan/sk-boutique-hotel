import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CmsPageRenderer } from "@/components/public-cms";
import { localize } from "@/lib/mock/i18n";
import { findBranchPageBySlug, getBranchStaticParams } from "@/lib/mock/public-cms";
import { resolveLocale } from "@/lib/locale";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    lang?: string;
  }>;
};

export function generateStaticParams() {
  return getBranchStaticParams();
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);
  const page = findBranchPageBySlug(slug);

  if (!page) {
    return {};
  }

  return {
    title: localize(locale, page.seo.title),
    description: localize(locale, page.seo.description)
  };
}

export default async function BranchDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);
  const page = findBranchPageBySlug(slug);

  if (!page) {
    notFound();
  }

  return <CmsPageRenderer locale={locale} page={page} />;
}
