import type { Metadata } from "next";

import { AdminEventsManager } from "@/components/admin-events-manager";
import { resolveLocale } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";
import { listEventImages, listEvents } from "@/lib/supabase/queries/events";

type PageProps = {
  searchParams?: Promise<{ lang?: string }>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);

  return {
    title: localize(locale, { vi: "Sự kiện", en: "Events" }),
    description: localize(locale, {
      vi: "Quản lý sự kiện và hình ảnh hiển thị trên trang web.",
      en: "Manage events and images shown on the website."
    })
  };
}

export default async function AdminEventsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);
  const events = await listEvents({ includeUnpublished: true });

  const eventsWithImages = await Promise.all(
    events.map(async (event) => ({
      ...event,
      images: await listEventImages(event.id)
    }))
  );

  return <AdminEventsManager events={eventsWithImages} locale={locale} />;
}
