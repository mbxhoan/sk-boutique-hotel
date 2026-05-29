import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd, roomDetailBreadcrumbJsonLd } from "@/components/json-ld";
import { PageViewTracker } from "@/components/page-view-tracker";
import { RoomPreviewPage } from "@/components/room-preview-page";
import { resolveLocale } from "@/lib/locale";
import { buildPageMetadata } from "@/lib/metadata";
import { buildRoomCatalogEntry } from "@/lib/rooms/catalog";
import { siteInfo } from "@/lib/site-content";
import { loadMediaCollectionImageUrls } from "@/lib/supabase/queries/media";
import { getRoomTypeBySlug, getRoomStaticParams } from "@/lib/supabase/queries/room-types";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ lang?: string; checkin?: string }>;
};

function getRoomOgImage(slug: string): string {
  const type = slug.replace(/-room$/, "");
  return `/assets/room_types/${type}/1.png`;
}

function roomGalleryCollectionSlug(roomSlug: string) {
  return `room-${roomSlug.replace(/-room$/, "")}`;
}

const galleryFallbacks: Record<string, string[]> = {
  "family-room": [
    "/assets/room_types/family/1.png",
    "/assets/room_types/family/2.png",
    "/assets/room_types/family/3.png",
    "/assets/room_types/family/4.png",
    "/assets/room_types/family/5.png",
    "/assets/room_types/family/6.png",
    "/assets/room_types/family/7.png",
    "/assets/room_types/family/8.png",
    "/assets/room_types/family/9.png"
  ],
  "superior-room": [
    "/assets/room_types/superior/1.png",
    "/assets/room_types/superior/2.png",
    "/assets/room_types/superior/3.png",
    "/assets/room_types/superior/4.png",
    "/assets/room_types/superior/5.png",
    "/assets/room_types/superior/6.png",
    "/assets/room_types/superior/7.png"
  ],
  "quadruple-room": [
    "/assets/room_types/quadruple/1.png",
    "/assets/room_types/quadruple/2.png",
    "/assets/room_types/quadruple/3.png",
    "/assets/room_types/quadruple/4.png",
    "/assets/room_types/quadruple/5.png",
    "/assets/room_types/quadruple/6.png"
  ]
};

export async function generateStaticParams() {
  return getRoomStaticParams();
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);
  const roomType = await getRoomTypeBySlug(slug);

  if (!roomType) return {};

  const title = locale === "vi" ? roomType.name_vi : roomType.name_en;
  const description = locale === "vi"
    ? roomType.summary_vi || roomType.description_vi || roomType.story_vi
    : roomType.summary_en || roomType.description_en || roomType.story_en;

  return buildPageMetadata({
    title,
    description: description || "",
    path: `/rooms/${slug}`,
    ogImagePath: getRoomOgImage(slug),
    locale,
    type: "article"
  });
}

export default async function RoomPreviewPageRoute({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);
  const checkin = resolvedSearchParams.checkin;

  const roomType = await getRoomTypeBySlug(slug);

  if (!roomType) {
    notFound();
  }

  const collectionSlug = roomGalleryCollectionSlug(slug);
  const fallback = galleryFallbacks[slug] ?? [];
  const gallery = await loadMediaCollectionImageUrls(collectionSlug, fallback, 20);

  const room = buildRoomCatalogEntry(roomType, 0, gallery.length > 0 ? gallery : fallback, false, checkin);
  const roomName = locale === "vi" ? roomType.name_vi : roomType.name_en;

  return (
    <>
      <JsonLd data={roomDetailBreadcrumbJsonLd(roomName, slug)} />
      <PageViewTracker
        entityId={slug}
        entityType="room_type"
        eventType="room_view"
        locale={locale}
        pagePath={`/rooms/${slug}`}
      />
      <RoomPreviewPage facebookUrl={siteInfo.facebook} locale={locale} room={room} />
    </>
  );
}
