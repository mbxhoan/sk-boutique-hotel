import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EventDetailPage } from "@/components/event-detail-page";
import { PageViewTracker } from "@/components/page-view-tracker";
import { resolveLocale } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";
import { getEventBySlug, listEventImages, listEvents } from "@/lib/supabase/queries/events";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ lang?: string }>;
};

export async function generateStaticParams() {
  const events = await listEvents();
  return events.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);
  const event = await getEventBySlug(slug);

  if (!event) {
    return { title: localize(locale, { vi: "Không tìm thấy", en: "Not found" }) };
  }

  const title = locale === "vi" ? event.title_vi : event.title_en;
  const description = locale === "vi" ? event.description_vi : event.description_en;

  return {
    title,
    description: description || undefined,
    alternates: { canonical: `/su-kien/${slug}` },
    openGraph: event.cover_image_path
      ? { images: [{ url: event.cover_image_path }] }
      : undefined
  };
}

export default async function EventDetailPageRoute({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);

  const event = await getEventBySlug(slug);

  if (!event || !event.show_detail_link) {
    notFound();
  }

  const images = await listEventImages(event.id);

  return (
    <>
      <PageViewTracker eventType="page_view" locale={locale} pagePath={`/su-kien/${slug}`} entityId={event.id} entityType="static_page" />
      <EventDetailPage event={event} images={images} locale={locale} />
    </>
  );
}
