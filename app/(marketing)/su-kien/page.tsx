import type { Metadata } from "next";

import { EventsPage } from "@/components/events-page";
import { PageViewTracker } from "@/components/page-view-tracker";
import { resolveLocale } from "@/lib/locale";
import { buildPageMetadata } from "@/lib/metadata";
import { localize } from "@/lib/mock/i18n";
import { listEvents } from "@/lib/supabase/queries/events";

type PageProps = {
  searchParams?: Promise<{
    lang?: string;
  }>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);

  return buildPageMetadata({
    title: localize(locale, { vi: "Sự kiện", en: "Events" }),
    description: localize(locale, {
      vi: "Khám phá các sự kiện và hoạt động đặc biệt tại SK Boutique Hotel, Phú Quốc.",
      en: "Discover special events and activities at SK Boutique Hotel, Phu Quoc."
    }),
    path: "/su-kien",
    ogImagePath: "/api/og/events",
    locale
  });
}

export default async function EventsPageRoute({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);
  const events = await listEvents();

  return (
    <>
      <PageViewTracker eventType="page_view" locale={locale} pagePath="/su-kien" entityId="events" entityType="static_page" />
      <EventsPage events={events} locale={locale} />
    </>
  );
}
