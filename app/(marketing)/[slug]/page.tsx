import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageTemplate } from "@/components/page-template";
import { findPageBySlug, getStaticRouteParams } from "@/lib/site-content";
import { resolveLocale, translate } from "@/lib/locale";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    lang?: string;
  }>;
};

export function generateStaticParams() {
  return getStaticRouteParams();
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);
  const page = findPageBySlug(slug);

  if (!page) {
    return {};
  }

  return {
    title: translate(locale, page.title),
    description: translate(locale, page.description)
  };
}

export default async function StaticPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);
  const page = findPageBySlug(slug);

  if (!page) {
    notFound();
  }

  return <PageTemplate content={page} locale={locale} />;
}
