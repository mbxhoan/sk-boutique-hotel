import Link from "next/link";

import { PortalBadge, PortalCard } from "@/components/portal-ui";
import type { Locale } from "@/lib/locale";
import { appendLocaleQuery } from "@/lib/locale";
import { saveContentPageAction, deleteContentPageAction } from "@/app/(admin)/admin/content-pages/actions";
import type { ContentPageRow } from "@/lib/supabase/queries/content-pages";
import type { MediaAssetRowWithUrl, MediaCollectionRow } from "@/lib/supabase/queries/media";
import { localize } from "@/lib/mock/i18n";

type AdminContentPagesManagerProps = {
  assets: MediaAssetRowWithUrl[];
  collections: MediaCollectionRow[];
  locale: Locale;
  pages: ContentPageRow[];
};

const pageTypeLabels: Record<Locale, Record<ContentPageRow["page_type"], string>> = {
  en: {
    home: "Home",
    page: "Page",
    collection: "Collection",
    detail: "Detail"
  },
  vi: {
    home: "Trang chủ",
    page: "Trang",
    collection: "Bộ sưu tập",
    detail: "Chi tiết"
  }
};

function pageTypeIcon(pageType: ContentPageRow["page_type"]) {
  if (pageType === "home") {
    return "⌂";
  }

  if (pageType === "collection") {
    return "◈";
  }

  if (pageType === "detail") {
    return "▤";
  }

  return "▣";
}

function statusTone(isPublished: boolean) {
  return isPublished ? "accent" as const : "neutral" as const;
}

function formatJson(value: unknown) {
  return JSON.stringify(value ?? {}, null, 2);
}

function sortPages(pages: ContentPageRow[]) {
  return [...pages].sort((left, right) => left.sort_order - right.sort_order || right.updated_at.localeCompare(left.updated_at));
}

function PageEditor({
  locale,
  page
}: {
  locale: Locale;
  page: ContentPageRow;
}) {
  return (
    <details className="admin-content__editor">
      <summary className="admin-content__page-row">
        <div className="admin-content__page-row-copy">
          <div className="admin-content__page-icon" aria-hidden="true">
            {pageTypeIcon(page.page_type)}
          </div>
          <div className="admin-content__page-main">
            <p className="admin-content__page-title">{localize(locale, { vi: page.title_vi, en: page.title_en })}</p>
            <p className="admin-content__page-slug">{page.slug}</p>
          </div>
        </div>

        <div className="admin-content__page-actions">
          <PortalBadge tone={page.is_published ? "accent" : "neutral"}>
            {page.is_published ? "Live" : "Draft"}
          </PortalBadge>
          <div className="admin-content__page-buttons">
            <Link className="admin-content__page-icon-button" href={appendLocaleQuery(page.slug, locale)}>
              <span aria-hidden="true">◔</span>
            </Link>
            <span className="admin-content__page-icon-button">
              <span aria-hidden="true">✎</span>
            </span>
          </div>
        </div>
      </summary>

      <form className="admin-content__editor-form" action={saveContentPageAction}>
        <input name="id" type="hidden" value={page.id} />

        <div className="admin-content__form-grid admin-content__form-grid--two">
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Slug" : "Slug"}</span>
            <input className="portal-field__control" name="slug" defaultValue={page.slug} />
          </label>
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Page type" : "Page type"}</span>
            <select className="portal-field__control" name="pageType" defaultValue={page.page_type}>
              <option value="home">home</option>
              <option value="page">page</option>
              <option value="collection">collection</option>
              <option value="detail">detail</option>
            </select>
          </label>
        </div>

        <div className="admin-content__form-grid admin-content__form-grid--two">
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Title VI" : "Title VI"}</span>
            <input className="portal-field__control" name="titleVi" defaultValue={page.title_vi} />
          </label>
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Title EN" : "Title EN"}</span>
            <input className="portal-field__control" name="titleEn" defaultValue={page.title_en} />
          </label>
        </div>

        <div className="admin-content__form-grid admin-content__form-grid--two">
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Description VI" : "Description VI"}</span>
            <textarea className="portal-field__control" name="descriptionVi" rows={3} defaultValue={page.description_vi} />
          </label>
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Description EN" : "Description EN"}</span>
            <textarea className="portal-field__control" name="descriptionEn" rows={3} defaultValue={page.description_en} />
          </label>
        </div>

        <label className="portal-field">
          <span className="portal-field__label">{locale === "en" ? "Content JSON" : "Content JSON"}</span>
          <textarea className="portal-field__control admin-content__json" name="contentJson" rows={12} defaultValue={formatJson(page.content_json)} />
        </label>

        <div className="admin-content__form-grid admin-content__form-grid--footer">
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Sort order" : "Sort order"}</span>
            <input className="portal-field__control" name="sortOrder" type="number" defaultValue={page.sort_order} />
          </label>
          <label className="admin-content__publish-toggle">
            <span className="portal-field__label">{locale === "en" ? "Published" : "Published"}</span>
            <input className="portal-field__checkbox" name="isPublished" type="checkbox" defaultChecked={page.is_published} />
          </label>
          <div className="admin-content__editor-actions">
            <button className="button button--solid" type="submit">
              {locale === "en" ? "Save" : "Save"}
            </button>
          </div>
        </div>
      </form>

      <form className="admin-content__delete-form" action={deleteContentPageAction}>
        <input name="id" type="hidden" value={page.id} />
        <input name="slug" type="hidden" value={page.slug} />
        <button className="button button--text-light" type="submit">
          {locale === "en" ? "Delete" : "Delete"}
        </button>
      </form>
    </details>
  );
}

function NewPageEditor({ locale }: { locale: Locale }) {
  return (
    <details className="admin-content__editor admin-content__editor--new" id="new-page-editor">
      <summary className="admin-content__page-row">
        <div className="admin-content__page-row-copy">
          <div className="admin-content__page-icon">+</div>
          <div className="admin-content__page-main">
            <p className="admin-content__page-title">{locale === "en" ? "Add New Page" : "Add New Page"}</p>
            <p className="admin-content__page-slug">{locale === "en" ? "Create a new content record." : "Create a new content record."}</p>
          </div>
        </div>
        <PortalBadge tone="soft">{locale === "en" ? "Create" : "Create"}</PortalBadge>
      </summary>

      <form className="admin-content__editor-form" action={saveContentPageAction}>
        <div className="admin-content__form-grid admin-content__form-grid--two">
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Slug" : "Slug"}</span>
            <input className="portal-field__control" name="slug" placeholder="/about-us" />
          </label>
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Page type" : "Page type"}</span>
            <select className="portal-field__control" name="pageType" defaultValue="page">
              <option value="home">home</option>
              <option value="page">page</option>
              <option value="collection">collection</option>
              <option value="detail">detail</option>
            </select>
          </label>
        </div>

        <div className="admin-content__form-grid admin-content__form-grid--two">
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Title VI" : "Title VI"}</span>
            <input className="portal-field__control" name="titleVi" placeholder="Về chúng tôi" />
          </label>
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Title EN" : "Title EN"}</span>
            <input className="portal-field__control" name="titleEn" placeholder="About us" />
          </label>
        </div>

        <div className="admin-content__form-grid admin-content__form-grid--two">
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Description VI" : "Description VI"}</span>
            <textarea className="portal-field__control" name="descriptionVi" rows={3} />
          </label>
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Description EN" : "Description EN"}</span>
            <textarea className="portal-field__control" name="descriptionEn" rows={3} />
          </label>
        </div>

        <label className="portal-field">
          <span className="portal-field__label">{locale === "en" ? "Content JSON" : "Content JSON"}</span>
          <textarea className="portal-field__control admin-content__json" name="contentJson" rows={12} defaultValue="{}" />
        </label>

        <div className="admin-content__form-grid admin-content__form-grid--footer">
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Sort order" : "Sort order"}</span>
            <input className="portal-field__control" name="sortOrder" type="number" defaultValue={0} />
          </label>
          <label className="admin-content__publish-toggle">
            <span className="portal-field__label">{locale === "en" ? "Published" : "Published"}</span>
            <input className="portal-field__checkbox" name="isPublished" type="checkbox" defaultChecked />
          </label>
          <div className="admin-content__editor-actions">
            <button className="button button--solid" type="submit">
              {locale === "en" ? "Create" : "Create"}
            </button>
          </div>
        </div>
      </form>
    </details>
  );
}

function BannerCard({
  active,
  label,
  note,
  tone
}: {
  active: boolean;
  label: string;
  note: string;
  tone: "default" | "muted";
}) {
  return (
    <article className={`admin-content__banner admin-content__banner--${tone}${active ? " admin-content__banner--active" : ""}`}>
      <div className="admin-content__banner-head">
        <h3 className="admin-content__banner-title">{label}</h3>
        <label className="admin-content__switch" aria-label={label}>
          <input checked={active} readOnly type="checkbox" />
          <span />
        </label>
      </div>
      <p className="admin-content__banner-copy">{note}</p>
      <p className="admin-content__banner-slot">{tone === "default" ? "HOMEPAGE HERO BANNER" : "OFFERS PAGE ONLY"}</p>
    </article>
  );
}

function pickMediaAssets(assets: MediaAssetRowWithUrl[]) {
  const fallbackAssets: MediaAssetRowWithUrl[] = [
    {
      alt_en: "Luxury hotel pool",
      alt_vi: "Luxury hotel pool",
      collection_slug: "hero",
      created_at: new Date().toISOString(),
      created_by: null,
      description_en: "",
      description_vi: "",
      fallback_url: "/home/pool3.jpg",
      file_bucket: "media-assets",
      file_name: "pool3.jpg",
      file_path: null,
      file_size: 0,
      height: null,
      id: "demo-media-1",
      is_active: true,
      is_featured: true,
      mime_type: "image/jpeg",
      public_url: "/home/pool3.jpg",
      slug: "pool",
      sort_order: 1,
      title_en: "Pool",
      title_vi: "Pool",
      updated_by: null,
      updated_at: new Date().toISOString(),
      width: null
    },
    {
      alt_en: "Grand lobby",
      alt_vi: "Grand lobby",
      collection_slug: "interiors",
      created_at: new Date().toISOString(),
      created_by: null,
      description_en: "",
      description_vi: "",
      fallback_url: "/hero/hero-2.png",
      file_bucket: "media-assets",
      file_name: "hero-2.png",
      file_path: null,
      file_size: 0,
      height: null,
      id: "demo-media-2",
      is_active: true,
      is_featured: false,
      mime_type: "image/png",
      public_url: "/hero/hero-2.png",
      slug: "lobby",
      sort_order: 2,
      title_en: "Lobby",
      title_vi: "Lobby",
      updated_by: null,
      updated_at: new Date().toISOString(),
      width: null
    },
    {
      alt_en: "Suite interior",
      alt_vi: "Suite interior",
      collection_slug: "rooms",
      created_at: new Date().toISOString(),
      created_by: null,
      description_en: "",
      description_vi: "",
      fallback_url: "/home/bed1.jpg",
      file_bucket: "media-assets",
      file_name: "bed1.jpg",
      file_path: null,
      file_size: 0,
      height: null,
      id: "demo-media-3",
      is_active: true,
      is_featured: false,
      mime_type: "image/jpeg",
      public_url: "/home/bed1.jpg",
      slug: "suite",
      sort_order: 3,
      title_en: "Suite",
      title_vi: "Suite",
      updated_by: null,
      updated_at: new Date().toISOString(),
      width: null
    },
    {
      alt_en: "Dining experience",
      alt_vi: "Dining experience",
      collection_slug: "dining",
      created_at: new Date().toISOString(),
      created_by: null,
      description_en: "",
      description_vi: "",
      fallback_url: "/home/block.jpg",
      file_bucket: "media-assets",
      file_name: "block.jpg",
      file_path: null,
      file_size: 0,
      height: null,
      id: "demo-media-4",
      is_active: true,
      is_featured: false,
      mime_type: "image/jpeg",
      public_url: "/home/block.jpg",
      slug: "dining",
      sort_order: 4,
      title_en: "Dining",
      title_vi: "Dining",
      updated_by: null,
      updated_at: new Date().toISOString(),
      width: null
    }
  ];

  if (assets.length >= 4) {
    return assets;
  }

  return [...assets, ...fallbackAssets.slice(assets.length)].slice(0, 4);
}

export function AdminContentPagesManager({ assets, collections, locale, pages }: AdminContentPagesManagerProps) {
  const sortedPages = sortPages(pages);
  const mediaAssets = pickMediaAssets(assets).slice(0, 4);
  const collection = collections[0];
  const collectionTitle = collection ? localize(locale, { vi: collection.name_vi, en: collection.name_en }) : "LOGOS & ICONS";
  const collectionDescription = collection
    ? localize(locale, { vi: collection.description_vi || collection.name_vi, en: collection.description_en || collection.name_en })
    : "Recent uploads used across pages and banners.";

  return (
    <div className="admin-page admin-content">
      <div className="admin-page__hero">
        <div className="admin-page__copy">
          <h1 className="admin-page__title">{locale === "en" ? "Content Management" : "Content Management"}</h1>
          <p className="admin-page__description">
            {locale === "en"
              ? "Manage public-facing website content, media, and promotional banners."
              : "Quản lý nội dung public, media và banner khuyến mãi."}
          </p>
        </div>

        <button className="button button--solid admin-content__publish-button" type="button">
          {locale === "en" ? "Publish All Changes" : "Publish All Changes"}
        </button>
      </div>

      <PortalCard className="admin-content__notice-card">
        <div className="admin-content__notice">
          <div className="admin-content__notice-icon" aria-hidden="true">
            i
          </div>
          <div>
            <h2 className="admin-content__notice-title">{locale === "en" ? "Syncing Guidelines" : "Syncing Guidelines"}</h2>
            <p className="admin-content__notice-copy">
              {locale === "en"
                ? "Changes made in 'Edit' mode are saved as drafts. They will not appear on the live SK Boutique Hotel website until you explicitly click 'Publish'. Use 'Preview' to review changes safely."
                : "Thay đổi trong chế độ Edit được lưu dưới dạng draft. Chúng sẽ không xuất hiện trên website công khai cho tới khi bạn bấm Publish. Dùng Preview để kiểm tra an toàn."}
            </p>
          </div>
        </div>
      </PortalCard>

      <div className="admin-content__grid">
        <PortalCard className="admin-content__panel admin-content__panel--pages">
          <div className="admin-content__panel-head">
            <h2 className="admin-content__panel-title">{locale === "en" ? "Public Pages" : "Public Pages"}</h2>
            <Link className="admin-content__panel-action" href="#new-page-editor">
              <span aria-hidden="true">+</span>
              {locale === "en" ? "New Page" : "New Page"}
            </Link>
          </div>

          <div className="admin-content__editor-stack">
            <NewPageEditor locale={locale} />
            {sortedPages.map((page) => (
              <PageEditor key={page.id} locale={locale} page={page} />
            ))}
          </div>
        </PortalCard>

        <PortalCard className="admin-content__panel admin-content__panel--banners">
          <div className="admin-content__panel-head admin-content__panel-head--stacked">
            <div>
              <h2 className="admin-content__panel-title">{locale === "en" ? "Active Banners" : "Active Banners"}</h2>
              <p className="admin-content__panel-copy">
                {locale === "en" ? "Manage global site promotions." : "Quản lý banner khuyến mãi toàn site."}
              </p>
            </div>
          </div>

          <div className="admin-content__banners">
            <BannerCard
              active
              label={locale === "en" ? "Summer Escape 2024" : "Summer Escape 2024"}
              note={locale === "en" ? '"Book 3 nights, get the 4th free at select boutique locations."' : '"Book 3 nights, get the 4th free at select boutique locations."'}
              tone="default"
            />
            <BannerCard
              active={false}
              label={locale === "en" ? "Winter Retreat Spa Package" : "Winter Retreat Spa Package"}
              note={locale === "en" ? '"Complimentary 60-minute massage with suite bookings."' : '"Complimentary 60-minute massage with suite bookings."'}
              tone="muted"
            />
          </div>
        </PortalCard>
      </div>

      <PortalCard className="admin-content__media-card">
        <div className="admin-content__media-head">
          <div>
            <h2 className="admin-content__panel-title">{locale === "en" ? "Media Library Overview" : "Media Library Overview"}</h2>
            <p className="admin-content__panel-copy">
              {locale === "en" ? "Recent uploads used across pages and banners." : "Các ảnh gần đây dùng cho page và banner."}
            </p>
          </div>

          <div className="admin-content__media-actions">
            <Link className="button button--text-light" href={appendLocaleQuery("/admin/media", locale)}>
              {locale === "en" ? "Browse All Media" : "Browse All Media"}
            </Link>
            <Link className="button button--solid" href={appendLocaleQuery("/admin/media", locale)}>
              {locale === "en" ? "Upload" : "Upload"}
            </Link>
          </div>
        </div>

        <div className="admin-content__media-grid">
          {mediaAssets.map((asset) => (
            <figure className="admin-content__media-thumb" key={asset.id}>
              <img alt={asset.alt_en || asset.title_en || asset.slug} className="admin-content__media-image" loading="lazy" src={asset.public_url || asset.fallback_url || "/home/block.jpg"} />
            </figure>
          ))}

          <div className="admin-content__media-folder">
            <span className="admin-content__media-folder-icon" aria-hidden="true">
              ⌂
            </span>
            <span className="admin-content__media-folder-label">{collectionTitle}</span>
          </div>

          <div className="admin-content__media-upload">
            <span className="admin-content__media-upload-icon" aria-hidden="true">
              +
            </span>
            <span className="admin-content__media-upload-label">{locale === "en" ? "Drag to Upload" : "Drag to Upload"}</span>
          </div>
        </div>
        <p className="admin-content__media-note">{collectionDescription}</p>
      </PortalCard>
    </div>
  );
}
