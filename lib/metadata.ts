import type { Metadata } from "next";

import type { Locale } from "@/lib/locale";

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const SITE_NAME = "SK Boutique Hotel";

/* ------------------------------------------------------------------ */
/*  Builder                                                           */
/* ------------------------------------------------------------------ */

type BuildPageMetadataOptions = {
  /** Page title (already localized) */
  title: string;
  /** Page description (already localized) */
  description: string;
  /** Canonical path, e.g. "/rooms/family-room" — without domain */
  path: string;
  /** OG image route path, e.g. "/api/og/room?slug=family-room" */
  ogImagePath: string;
  /** Current locale, defaults to "vi" */
  locale?: Locale;
  /** OG type, defaults to "website" */
  type?: "website" | "article";
};

/**
 * Build a complete `Metadata` object with:
 * - `title`, `description`
 * - `openGraph` (title, description, images 1200×630, siteName, type, locale, url)
 * - `twitter` (summary_large_image card)
 * - `alternates.canonical`
 * - `alternates.languages` (vi ↔ en)
 */
export function buildPageMetadata({
  title,
  description,
  path,
  ogImagePath,
  locale = "vi",
  type = "website"
}: BuildPageMetadataOptions): Metadata {
  const ogLocale = locale === "en" ? "en_US" : "vi_VN";
  const altLocale = locale === "en" ? "vi_VN" : "en_US";

  // Build alternate language URLs
  const cleanPath = path.split("?")[0];
  const existingParams = path.includes("?") ? path.split("?")[1] : "";

  const viUrl = cleanPath + (existingParams ? `?${existingParams}` : "");
  const enParams = existingParams ? `${existingParams}&lang=en` : "lang=en";
  const enUrl = `${cleanPath}?${enParams}`;

  return {
    title,
    description,
    alternates: {
      canonical: path,
      languages: {
        vi: viUrl,
        en: enUrl
      }
    },
    openGraph: {
      title,
      description,
      images: [
        {
          url: ogImagePath,
          width: 1200,
          height: 630,
          alt: title
        }
      ],
      locale: ogLocale,
      alternateLocale: [altLocale],
      siteName: SITE_NAME,
      type,
      url: path
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImagePath]
    }
  };
}
