import Link from "next/link";

import { MediaPreviewImage } from "@/components/media-preview-image";
import { PortalBadge, PortalCard } from "@/components/portal-ui";
import { PortalSubmitButton } from "@/components/portal-submit-button";
import type { Locale } from "@/lib/locale";
import { appendLocaleQuery } from "@/lib/locale";
import { saveContentPageAction } from "@/app/(admin)/admin/content-pages/actions";
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
            {page.is_published ? localize(locale, { vi: "Đang xuất bản", en: "Live" }) : localize(locale, { vi: "Bản nháp", en: "Draft" })}
          </PortalBadge>
          <PortalBadge tone="soft">{pageTypeLabels[locale][page.page_type]}</PortalBadge>
          <div className="admin-content__page-buttons">
            <Link
              aria-label={localize(locale, { vi: "Xem trước trang", en: "Preview page" })}
              className="admin-content__page-icon-button"
              href={appendLocaleQuery(page.slug, locale)}
            >
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
        <input name="slug" type="hidden" value={page.slug} />
        <input name="pageType" type="hidden" value={page.page_type} />

        <div className="admin-content__form-grid admin-content__form-grid--two">
          <label className="portal-field">
            <span className="portal-field__label">{localize(locale, { vi: "Tiêu đề VI", en: "Title VI" })}</span>
            <input className="portal-field__control" name="titleVi" defaultValue={page.title_vi} />
          </label>
          <label className="portal-field">
            <span className="portal-field__label">{localize(locale, { vi: "Tiêu đề EN", en: "Title EN" })}</span>
            <input className="portal-field__control" name="titleEn" defaultValue={page.title_en} />
          </label>
        </div>

        <div className="admin-content__form-grid admin-content__form-grid--two">
          <label className="portal-field">
            <span className="portal-field__label">{localize(locale, { vi: "Mô tả VI", en: "Description VI" })}</span>
            <textarea className="portal-field__control" name="descriptionVi" rows={3} defaultValue={page.description_vi} />
          </label>
          <label className="portal-field">
            <span className="portal-field__label">{localize(locale, { vi: "Mô tả EN", en: "Description EN" })}</span>
            <textarea className="portal-field__control" name="descriptionEn" rows={3} defaultValue={page.description_en} />
          </label>
        </div>

        <label className="portal-field">
          <span className="portal-field__label">{localize(locale, { vi: "Nội dung JSON", en: "Content JSON" })}</span>
          <textarea className="portal-field__control admin-content__json" name="contentJson" rows={12} defaultValue={formatJson(page.content_json)} />
        </label>

        <div className="admin-content__form-grid admin-content__form-grid--footer">
          <label className="portal-field">
            <span className="portal-field__label">{localize(locale, { vi: "Thứ tự hiển thị", en: "Sort order" })}</span>
            <input className="portal-field__control" name="sortOrder" type="number" defaultValue={page.sort_order} />
          </label>
          <label className="admin-content__publish-toggle">
            <span className="portal-field__label">{localize(locale, { vi: "Đang xuất bản", en: "Published" })}</span>
            <input className="portal-field__checkbox" name="isPublished" type="checkbox" defaultChecked={page.is_published} />
          </label>
          <div className="admin-content__editor-actions">
            <PortalSubmitButton className="button button--solid" pendingLabel={localize(locale, { vi: "Đang lưu...", en: "Saving..." })}>
              {localize(locale, { vi: "Lưu thay đổi", en: "Save changes" })}
            </PortalSubmitButton>
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
  tone,
  locale
}: {
  active: boolean;
  label: string;
  note: string;
  locale: Locale;
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
      <p className="admin-content__banner-slot">
        {tone === "default"
          ? localize(locale, { vi: "Banner hero trang chủ", en: "Homepage hero banner" })
          : localize(locale, { vi: "Chỉ trang ưu đãi", en: "Offers page only" })}
      </p>
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
  const collectionTitle = collection ? localize(locale, { vi: collection.name_vi, en: collection.name_en }) : localize(locale, { vi: "Logo & biểu tượng", en: "Logos & icons" });
  const collectionDescription = collection
    ? localize(locale, { vi: collection.description_vi || collection.name_vi, en: collection.description_en || collection.name_en })
    : localize(locale, { vi: "Ảnh gần đây dùng cho trang và banner.", en: "Recent uploads used across pages and banners." });

  return (
    <div className="admin-page admin-content">
      <div className="admin-page__hero">
        <div className="admin-page__copy">
          <h1 className="admin-page__title">{localize(locale, { vi: "Quản lý nội dung", en: "Content management" })}</h1>
          <p className="admin-page__description">
            {localize(locale, {
              vi: "Quản lý nội dung public, media và banner khuyến mãi.",
              en: "Manage public-facing website content, media, and promotional banners."
            })}
          </p>
        </div>

        <button className="button button--solid admin-content__publish-button" type="button">
          {localize(locale, { vi: "Xuất bản tất cả", en: "Publish all changes" })}
        </button>
      </div>

      <PortalCard className="admin-content__notice-card">
        <div className="admin-content__notice">
          <div className="admin-content__notice-icon" aria-hidden="true">
            i
          </div>
          <div>
            <h2 className="admin-content__notice-title">{localize(locale, { vi: "Nguyên tắc đồng bộ", en: "Syncing guidelines" })}</h2>
            <p className="admin-content__notice-copy">
              {localize(locale, {
                vi: "Thay đổi trong chế độ edit được lưu dưới dạng draft. Chúng chỉ xuất hiện trên website công khai khi bạn bấm Publish. Dùng Preview để kiểm tra an toàn.",
                en: "Changes made in edit mode are saved as drafts. They will not appear on the live SK Boutique Hotel website until you explicitly click Publish. Use Preview to review changes safely."
              })}
            </p>
          </div>
        </div>
      </PortalCard>

      <div className="admin-content__grid">
        <PortalCard className="admin-content__panel admin-content__panel--pages">
          <div className="admin-content__panel-head">
            <h2 className="admin-content__panel-title">{localize(locale, { vi: "Trang công khai", en: "Public pages" })}</h2>
            <PortalBadge tone="soft">{localize(locale, { vi: "Chỉ sửa", en: "Edit only" })}</PortalBadge>
          </div>

          <div className="admin-content__editor-stack">
            {sortedPages.map((page) => (
              <PageEditor key={page.id} locale={locale} page={page} />
            ))}
          </div>
        </PortalCard>

        <PortalCard className="admin-content__panel admin-content__panel--banners">
          <div className="admin-content__panel-head admin-content__panel-head--stacked">
            <div>
              <h2 className="admin-content__panel-title">{localize(locale, { vi: "Banner hiện hoạt", en: "Active banners" })}</h2>
              <p className="admin-content__panel-copy">{localize(locale, { vi: "Quản lý banner khuyến mãi toàn site.", en: "Manage global site promotions." })}</p>
            </div>
          </div>

          <div className="admin-content__banners">
            <BannerCard
              active
              label={localize(locale, { vi: "Kỳ nghỉ hè 2024", en: "Summer Escape 2024" })}
              note={localize(locale, {
                vi: '"Đặt 3 đêm, tặng đêm thứ 4 tại một số chi nhánh boutique."',
                en: '"Book 3 nights, get the 4th free at select boutique locations."'
              })}
              locale={locale}
              tone="default"
            />
            <BannerCard
              active={false}
              label={localize(locale, { vi: "Gói spa mùa đông", en: "Winter Retreat Spa Package" })}
              note={localize(locale, {
                vi: '"Tặng massage 60 phút khi đặt suite."',
                en: '"Complimentary 60-minute massage with suite bookings."'
              })}
              locale={locale}
              tone="muted"
            />
          </div>
        </PortalCard>
      </div>

      <PortalCard className="admin-content__media-card">
        <div className="admin-content__media-head">
          <div>
            <h2 className="admin-content__panel-title">{localize(locale, { vi: "Tổng quan thư viện media", en: "Media library overview" })}</h2>
            <p className="admin-content__panel-copy">{collectionDescription}</p>
          </div>

          <div className="admin-content__media-actions">
            <Link className="button button--text-light" href={appendLocaleQuery("/admin/media", locale)}>
              {localize(locale, { vi: "Xem tất cả media", en: "Browse all media" })}
            </Link>
            <Link className="button button--solid" href={appendLocaleQuery("/admin/media", locale)}>
              {localize(locale, { vi: "Tải lên", en: "Upload" })}
            </Link>
          </div>
        </div>

        <div className="admin-content__media-grid">
          {mediaAssets.map((asset) => (
            <figure className="admin-content__media-thumb" key={asset.id}>
              <MediaPreviewImage
                alt={locale === "en" ? asset.alt_en || asset.title_en || asset.slug : asset.alt_vi || asset.title_vi || asset.slug}
                className="admin-content__media-image"
                loading="lazy"
                fallbackSrc={asset.fallback_url || "/home/block.jpg"}
                src={asset.public_url || asset.fallback_url || "/home/block.jpg"}
              />
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
            <span className="admin-content__media-upload-label">{localize(locale, { vi: "Kéo để tải lên", en: "Drag to upload" })}</span>
          </div>
        </div>
        <p className="admin-content__media-note">{collectionDescription}</p>
      </PortalCard>
    </div>
  );
}
