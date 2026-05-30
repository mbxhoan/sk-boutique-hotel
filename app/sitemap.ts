import type { MetadataRoute } from "next";

import { getContentStaticRouteParams } from "@/lib/supabase/queries/content-pages";
import { listEvents } from "@/lib/supabase/queries/events";
import { listNewsPosts } from "@/lib/supabase/queries/news-posts";
import { listRoomTypes } from "@/lib/supabase/queries/room-types";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const staticRoutes: MetadataRoute.Sitemap = [
  { url: `${base}/`, changeFrequency: "weekly", priority: 1.0, lastModified: new Date() },
  { url: `${base}/rooms`, changeFrequency: "weekly", priority: 0.9, lastModified: new Date() },
  { url: `${base}/about-us`, changeFrequency: "monthly", priority: 0.7, lastModified: new Date() },
  { url: `${base}/su-kien`, changeFrequency: "weekly", priority: 0.7, lastModified: new Date() },
  { url: `${base}/news`, changeFrequency: "weekly", priority: 0.8, lastModified: new Date() }
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [roomTypes, contentParams, events, newsPosts] = await Promise.all([
    listRoomTypes(),
    getContentStaticRouteParams(),
    listEvents(),
    listNewsPosts()
  ]);

  const roomRoutes: MetadataRoute.Sitemap = roomTypes.map((rt) => ({
    url: `${base}/rooms/${rt.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
    lastModified: new Date(rt.updated_at)
  }));

  const eventRoutes: MetadataRoute.Sitemap = events.map((ev) => ({
    url: `${base}/su-kien/${ev.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
    lastModified: new Date(ev.updated_at)
  }));

  const contentRoutes: MetadataRoute.Sitemap = contentParams
    .filter((p) => p.slug && !p.slug.startsWith("_"))
    .map((p) => ({
      url: `${base}/${p.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
      lastModified: new Date()
    }));

  const newsPostRoutes: MetadataRoute.Sitemap = newsPosts.map((p) => ({
    url: `${base}/news/${p.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
    lastModified: new Date(p.updated_at)
  }));

  return [...staticRoutes, ...roomRoutes, ...eventRoutes, ...contentRoutes, ...newsPostRoutes];
}
