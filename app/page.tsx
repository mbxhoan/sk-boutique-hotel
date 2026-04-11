import type { Metadata } from "next";

import { PageTemplate } from "@/components/page-template";
import { findPageBySlug } from "@/lib/site-content";
import { resolveLocale, translate } from "@/lib/locale";

type PageProps = {
  searchParams?: Promise<{
    lang?: string;
  }>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);
  const page = findPageBySlug("");

  return {
    title: translate(locale, page?.title ?? "Trang chủ"),
    description: translate(locale, page?.description ?? "")
  };
}

export default async function HomePage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);
  const page = findPageBySlug("");

  if (!page) {
    return null;
  }

  return <PageTemplate content={page} locale={locale} />;
}
