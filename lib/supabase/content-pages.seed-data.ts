import { translate } from "../locale.ts";
import type { CmsPageCopy } from "../mock/public-cms.ts";
import {
  homePageCopy,
  newsCollectionPageCopy,
  newsDetailPages
} from "../mock/public-cms.ts";
import type { PageContent } from "../site-content.ts";
import { pages } from "../site-content.ts";
import type { Json } from "./database.types.ts";

export type ContentPageType = "home" | "page" | "collection" | "detail";

export type ContentPageSeedRow = {
  content_json: Json;
  description_en: string;
  description_vi: string;
  is_published: boolean;
  page_type: ContentPageType;
  slug: string;
  sort_order: number;
  title_en: string;
  title_vi: string;
};

function toJson<T>(value: T): Json {
  return JSON.parse(JSON.stringify(value)) as Json;
}

function toStaticPageRow(page: PageContent, sortOrder: number): ContentPageSeedRow {
  return {
    slug: page.slug,
    page_type: "page",
    title_vi: page.title,
    title_en: translate("en", page.title),
    description_vi: page.description,
    description_en: translate("en", page.description),
    content_json: toJson(page),
    sort_order: sortOrder,
    is_published: true
  };
}

function toCmsPageRow(page: CmsPageCopy, pageType: ContentPageType, sortOrder: number): ContentPageSeedRow {
  return {
    slug: page.slug,
    page_type: pageType,
    title_vi: page.seo.title.vi,
    title_en: page.seo.title.en,
    description_vi: page.seo.description.vi,
    description_en: page.seo.description.en,
    content_json: toJson(page),
    sort_order: sortOrder,
    is_published: true
  };
}

export function getContentPageSeedRows(): ContentPageSeedRow[] {
  const staticPageRows = pages
    .filter((page) => page.slug !== "/")
    .map((page, index) => toStaticPageRow(page, (index + 1) * 10));

  const newsDetailRows = newsDetailPages.map((page, index) =>
    toCmsPageRow(page, "detail", 200 + index * 10)
  );

  return [
    toCmsPageRow(homePageCopy, "home", 0),
    ...staticPageRows,
    toCmsPageRow(newsCollectionPageCopy, "collection", 180),
    ...newsDetailRows
  ];
}
