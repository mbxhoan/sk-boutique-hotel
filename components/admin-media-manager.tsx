import Link from "next/link";

import type { Locale } from "@/lib/locale";
import { appendLocaleQuery } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";
import { PortalBadge, PortalCard, PortalSectionHeading } from "@/components/portal-ui";
import type { MediaAssetRowWithUrl, MediaCollectionRow } from "@/lib/supabase/queries/media";
import {
  deleteMediaAssetAction,
  deleteMediaCollectionAction,
  saveMediaAssetAction,
  saveMediaCollectionAction
} from "@/app/(admin)/admin/media/actions";

type AdminMediaManagerProps = {
  assets: MediaAssetRowWithUrl[];
  collections: MediaCollectionRow[];
  activeCollectionSlug?: string | null;
  locale: Locale;
};

function groupAssetsByCollectionSlug(assets: MediaAssetRowWithUrl[]) {
  return assets.reduce<Record<string, MediaAssetRowWithUrl[]>>((groups, asset) => {
    if (!groups[asset.collection_slug]) {
      groups[asset.collection_slug] = [];
    }

    groups[asset.collection_slug].push(asset);
    return groups;
  }, {});
}

function formatBytes(value: number) {
  if (!value) {
    return "-";
  }

  const units = ["B", "KB", "MB", "GB"];
  let size = value;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function buildMediaHref(locale: Locale, collectionSlug: string | null) {
  const params = new URLSearchParams();

  if (collectionSlug && collectionSlug !== "all") {
    params.set("collection", collectionSlug);
  }

  const query = params.toString();
  return appendLocaleQuery(`/admin/media${query ? `?${query}` : ""}`, locale);
}

function NewCollectionForm({ locale }: { locale: Locale }) {
  return (
    <PortalCard tone="accent">
      <PortalSectionHeading
        description={{
          en: "Create a new media collection to group hotel images and reusable assets.",
          vi: "Tạo một nhóm media mới để gom ảnh khách sạn và tài nguyên dùng chung."
        }}
        eyebrow={{ en: "New collection", vi: "Tạo nhóm mới" }}
        locale={locale}
        title={{ en: "Add collection", vi: "Thêm danh mục" }}
      />

      <form className="admin-media__form" action={saveMediaCollectionAction}>
        <div className="admin-media__grid admin-media__grid--two">
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Slug" : "Slug"}</span>
            <input className="portal-field__control" name="slug" placeholder="lobby" />
          </label>
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Sort order" : "Thứ tự"}</span>
            <input className="portal-field__control" name="sortOrder" type="number" defaultValue={0} />
          </label>
        </div>

        <div className="admin-media__grid admin-media__grid--two">
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Name VI" : "Tên VI"}</span>
            <input className="portal-field__control" name="nameVi" placeholder="Sảnh" />
          </label>
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Name EN" : "Tên EN"}</span>
            <input className="portal-field__control" name="nameEn" placeholder="Lobby" />
          </label>
        </div>

        <div className="admin-media__grid admin-media__grid--two">
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Description VI" : "Mô tả VI"}</span>
            <textarea className="portal-field__control" name="descriptionVi" rows={3} />
          </label>
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Description EN" : "Mô tả EN"}</span>
            <textarea className="portal-field__control" name="descriptionEn" rows={3} />
          </label>
        </div>

        <label className="portal-field admin-media__publish">
          <span className="portal-field__label">{locale === "en" ? "Active" : "Kích hoạt"}</span>
          <input className="portal-field__checkbox" name="isActive" type="checkbox" defaultChecked />
        </label>

        <div className="admin-media__actions">
          <button className="button button--solid" type="submit">
            {locale === "en" ? "Create collection" : "Tạo danh mục"}
          </button>
        </div>
      </form>
    </PortalCard>
  );
}

function CollectionEditor({
  collection,
  locale
}: {
  collection: MediaCollectionRow;
  locale: Locale;
}) {
  return (
    <PortalCard className="admin-media__collection-editor" tone={collection.is_active ? "default" : "soft"}>
      <div className="admin-media__collection-head">
        <div>
          <PortalBadge tone={collection.is_active ? "accent" : "neutral"}>
            {collection.slug}
          </PortalBadge>
          <p className="portal-panel__eyebrow admin-media__collection-subtitle">
            {localize(locale, { vi: collection.name_vi, en: collection.name_en })}
          </p>
        </div>

        <form action={deleteMediaCollectionAction}>
          <input name="slug" type="hidden" value={collection.slug} />
          <button className="button button--text-light admin-media__danger" type="submit">
            {locale === "en" ? "Delete" : "Xoá"}
          </button>
        </form>
      </div>

      <form className="admin-media__form" action={saveMediaCollectionAction}>
        <input name="slug" type="hidden" value={collection.slug} />

        <div className="admin-media__grid admin-media__grid--two">
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Name VI" : "Tên VI"}</span>
            <input className="portal-field__control" name="nameVi" defaultValue={collection.name_vi} />
          </label>
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Name EN" : "Tên EN"}</span>
            <input className="portal-field__control" name="nameEn" defaultValue={collection.name_en} />
          </label>
        </div>

        <div className="admin-media__grid admin-media__grid--two">
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Description VI" : "Mô tả VI"}</span>
            <textarea className="portal-field__control" name="descriptionVi" rows={3} defaultValue={collection.description_vi} />
          </label>
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Description EN" : "Mô tả EN"}</span>
            <textarea className="portal-field__control" name="descriptionEn" rows={3} defaultValue={collection.description_en} />
          </label>
        </div>

        <div className="admin-media__grid admin-media__grid--three">
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Sort order" : "Thứ tự"}</span>
            <input className="portal-field__control" name="sortOrder" type="number" defaultValue={collection.sort_order} />
          </label>
          <label className="portal-field admin-media__publish">
            <span className="portal-field__label">{locale === "en" ? "Active" : "Kích hoạt"}</span>
            <input className="portal-field__checkbox" name="isActive" type="checkbox" defaultChecked={collection.is_active} />
          </label>
          <div className="admin-media__actions">
            <button className="button button--solid" type="submit">
              {locale === "en" ? "Save" : "Lưu"}
            </button>
          </div>
        </div>
      </form>
    </PortalCard>
  );
}

function AssetEditor({
  asset,
  locale
}: {
  asset: MediaAssetRowWithUrl;
  locale: Locale;
}) {
  return (
    <PortalCard className="admin-media__asset-card" tone={asset.is_active ? "default" : "soft"}>
      <div className="admin-media__asset-preview">
        {asset.public_url ? (
          <img alt={asset.alt_vi || asset.title_vi || asset.slug} className="admin-media__asset-image" loading="lazy" src={asset.public_url} />
        ) : (
          <div className="admin-media__asset-empty">{locale === "en" ? "No image" : "Chưa có ảnh"}</div>
        )}
      </div>

      <div className="admin-media__asset-head">
        <div>
          <p className="portal-panel__eyebrow admin-media__asset-slug">{asset.collection_slug}/{asset.slug}</p>
          <h4 className="admin-media__asset-title">{asset.title_vi || asset.title_en || asset.slug}</h4>
        </div>

        <form action={deleteMediaAssetAction}>
          <input name="id" type="hidden" value={asset.id} />
          <input name="fileBucket" type="hidden" value={asset.file_bucket} />
          <input name="filePath" type="hidden" value={asset.file_path ?? ""} />
          <button className="button button--text-light admin-media__danger" type="submit">
            {locale === "en" ? "Delete" : "Xoá"}
          </button>
        </form>
      </div>

      <form className="admin-media__form" action={saveMediaAssetAction} encType="multipart/form-data">
        <input name="collectionSlug" type="hidden" value={asset.collection_slug} />
        <input name="slug" type="hidden" value={asset.slug} />
        <input name="existingFileBucket" type="hidden" value={asset.file_bucket} />
        <input name="existingFilePath" type="hidden" value={asset.file_path ?? ""} />
        <input name="existingFileName" type="hidden" value={asset.file_name} />
        <input name="existingMimeType" type="hidden" value={asset.mime_type} />
        <input name="existingFileSize" type="hidden" value={asset.file_size} />

        <label className="portal-field">
          <span className="portal-field__label">{locale === "en" ? "Replace image" : "Thay ảnh"}</span>
          <input className="portal-field__control" name="mediaFile" type="file" accept="image/*,.svg,.webp,.jpg,.jpeg,.png,.gif,.avif" />
        </label>

        <div className="admin-media__grid admin-media__grid--two">
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Title VI" : "Tiêu đề VI"}</span>
            <input className="portal-field__control" name="titleVi" defaultValue={asset.title_vi} />
          </label>
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Title EN" : "Tiêu đề EN"}</span>
            <input className="portal-field__control" name="titleEn" defaultValue={asset.title_en} />
          </label>
        </div>

        <div className="admin-media__grid admin-media__grid--two">
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Alt VI" : "Alt VI"}</span>
            <input className="portal-field__control" name="altVi" defaultValue={asset.alt_vi} />
          </label>
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Alt EN" : "Alt EN"}</span>
            <input className="portal-field__control" name="altEn" defaultValue={asset.alt_en} />
          </label>
        </div>

        <div className="admin-media__grid admin-media__grid--two">
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Description VI" : "Mô tả VI"}</span>
            <textarea className="portal-field__control" name="descriptionVi" rows={3} defaultValue={asset.description_vi} />
          </label>
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Description EN" : "Mô tả EN"}</span>
            <textarea className="portal-field__control" name="descriptionEn" rows={3} defaultValue={asset.description_en} />
          </label>
        </div>

        <label className="portal-field">
          <span className="portal-field__label">{locale === "en" ? "Fallback URL" : "URL dự phòng"}</span>
          <input className="portal-field__control" name="fallbackUrl" defaultValue={asset.fallback_url} />
        </label>

        <div className="admin-media__grid admin-media__grid--three">
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Sort order" : "Thứ tự"}</span>
            <input className="portal-field__control" name="sortOrder" type="number" defaultValue={asset.sort_order} />
          </label>
          <label className="portal-field admin-media__publish">
            <span className="portal-field__label">{locale === "en" ? "Featured" : "Nổi bật"}</span>
            <input className="portal-field__checkbox" name="isFeatured" type="checkbox" defaultChecked={asset.is_featured} />
          </label>
          <label className="portal-field admin-media__publish">
            <span className="portal-field__label">{locale === "en" ? "Active" : "Kích hoạt"}</span>
            <input className="portal-field__checkbox" name="isActive" type="checkbox" defaultChecked={asset.is_active} />
          </label>
        </div>

        <div className="admin-media__actions">
          <button className="button button--solid" type="submit">
            {locale === "en" ? "Save asset" : "Lưu ảnh"}
          </button>
        </div>
      </form>

      <div className="admin-media__meta">
        <span>{asset.file_name || "-"}</span>
        <span>{asset.file_path || asset.fallback_url || "-"}</span>
        <span>{formatBytes(asset.file_size)}</span>
      </div>
    </PortalCard>
  );
}

function NewAssetForm({
  collectionSlug,
  locale
}: {
  collectionSlug: string;
  locale: Locale;
}) {
  return (
    <PortalCard className="admin-media__asset-card admin-media__asset-card--new" tone="soft">
      <PortalSectionHeading
        description={{
          en: "Add a reusable image for this collection.",
          vi: "Thêm một ảnh dùng chung cho nhóm này."
        }}
        eyebrow={{ en: "New asset", vi: "Ảnh mới" }}
        locale={locale}
        title={{
          en: "Upload media",
          vi: "Tải ảnh lên"
        }}
      />

      <form className="admin-media__form" action={saveMediaAssetAction} encType="multipart/form-data">
        <input name="collectionSlug" type="hidden" value={collectionSlug} />

        <label className="portal-field">
          <span className="portal-field__label">{locale === "en" ? "Slug" : "Slug"}</span>
          <input className="portal-field__control" name="slug" placeholder="image-1" />
        </label>

        <label className="portal-field">
          <span className="portal-field__label">{locale === "en" ? "Upload file" : "Tải file lên"}</span>
          <input className="portal-field__control" name="mediaFile" type="file" accept="image/*,.svg,.webp,.jpg,.jpeg,.png,.gif,.avif" />
        </label>

        <div className="admin-media__grid admin-media__grid--two">
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Title VI" : "Tiêu đề VI"}</span>
            <input className="portal-field__control" name="titleVi" />
          </label>
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Title EN" : "Tiêu đề EN"}</span>
            <input className="portal-field__control" name="titleEn" />
          </label>
        </div>

        <div className="admin-media__grid admin-media__grid--two">
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Alt VI" : "Alt VI"}</span>
            <input className="portal-field__control" name="altVi" />
          </label>
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Alt EN" : "Alt EN"}</span>
            <input className="portal-field__control" name="altEn" />
          </label>
        </div>

        <label className="portal-field">
          <span className="portal-field__label">{locale === "en" ? "Fallback URL" : "URL dự phòng"}</span>
          <input className="portal-field__control" name="fallbackUrl" placeholder="/custom/path.jpg" />
        </label>

        <div className="admin-media__grid admin-media__grid--three">
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Sort order" : "Thứ tự"}</span>
            <input className="portal-field__control" name="sortOrder" type="number" defaultValue={0} />
          </label>
          <label className="portal-field admin-media__publish">
            <span className="portal-field__label">{locale === "en" ? "Featured" : "Nổi bật"}</span>
            <input className="portal-field__checkbox" name="isFeatured" type="checkbox" defaultChecked />
          </label>
          <label className="portal-field admin-media__publish">
            <span className="portal-field__label">{locale === "en" ? "Active" : "Kích hoạt"}</span>
            <input className="portal-field__checkbox" name="isActive" type="checkbox" defaultChecked />
          </label>
        </div>

        <div className="admin-media__actions">
          <button className="button button--solid" type="submit">
            {locale === "en" ? "Create asset" : "Tạo ảnh"}
          </button>
        </div>
      </form>
    </PortalCard>
  );
}

export function AdminMediaManager({
  assets,
  collections,
  activeCollectionSlug,
  locale
}: AdminMediaManagerProps) {
  const groupedAssets = groupAssetsByCollectionSlug(assets);
  const selectedCollection =
    activeCollectionSlug && activeCollectionSlug !== "all"
      ? collections.find((collection) => collection.slug === activeCollectionSlug) ?? null
      : null;
  const visibleCollections = selectedCollection ? [selectedCollection] : collections;
  const collectionAssetCounts = collections.reduce<Record<string, number>>((accumulator, collection) => {
    accumulator[collection.slug] = groupedAssets[collection.slug]?.length ?? 0;
    return accumulator;
  }, {});

  return (
    <div className="portal-content admin-media">
      <PortalSectionHeading
        description={{
          en: "Manage reusable hotel media here. Public pages can pick images from these collections instead of hard-coded source files.",
          vi: "Quản lý toàn bộ media dùng chung tại đây. Các trang public có thể chọn ảnh từ nhóm này thay vì hard-code trong source."
        }}
        eyebrow={{ en: "Media library", vi: "Thư viện media" }}
        locale={locale}
        title={{ en: "Collections & assets", vi: "Danh mục và ảnh" }}
      />

      <div className="admin-media__tabs" role="tablist" aria-label={locale === "en" ? "Media folders" : "Thư mục media"}>
        <Link
          aria-current={!selectedCollection ? "page" : undefined}
          className={`admin-media__tab${!selectedCollection ? " admin-media__tab--active" : ""}`}
          href={buildMediaHref(locale, null)}
        >
          <span>{locale === "en" ? "All" : "Tất cả"}</span>
          <span className="admin-media__tab-count">{assets.length}</span>
        </Link>
        {collections.map((collection) => {
          const active = selectedCollection?.slug === collection.slug;

          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={`admin-media__tab${active ? " admin-media__tab--active" : ""}`}
              href={buildMediaHref(locale, collection.slug)}
              key={collection.slug}
            >
              <span>{collection.slug}</span>
              <span className="admin-media__tab-count">{collectionAssetCounts[collection.slug] ?? 0}</span>
            </Link>
          );
        })}
      </div>

      <PortalCard className="admin-media__summary" tone="soft">
        <div className="admin-media__summary-grid">
          <div>
            <p className="portal-panel__eyebrow">{locale === "en" ? "Current folder" : "Thư mục hiện tại"}</p>
            <p className="portal-description">{selectedCollection ? selectedCollection.slug : locale === "en" ? "All media" : "Toàn bộ media"}</p>
          </div>
          <div>
            <p className="portal-panel__eyebrow">{locale === "en" ? "Collections" : "Danh mục"}</p>
            <p className="portal-description">{collections.length}</p>
          </div>
          <div>
            <p className="portal-panel__eyebrow">{locale === "en" ? "Assets" : "Ảnh"}</p>
            <p className="portal-description">{assets.length}</p>
          </div>
        </div>
      </PortalCard>

      <NewCollectionForm locale={locale} />

      <div className="admin-media__collection-list">
        {visibleCollections.map((collection) => {
          const collectionAssets = groupedAssets[collection.slug] ?? [];

          return (
            <section className="admin-media__section" key={collection.slug} id={`media-${collection.slug}`}>
              <PortalSectionHeading
                description={{
                  en: `${collectionAssets.length} asset(s)`,
                  vi: `${collectionAssets.length} ảnh`
                }}
                eyebrow={{ en: "Collection", vi: "Danh mục" }}
                locale={locale}
                title={{
                  en: collection.name_en,
                  vi: collection.name_vi
                }}
              />

              <CollectionEditor collection={collection} locale={locale} />
              <NewAssetForm collectionSlug={collection.slug} locale={locale} />

              <div className="admin-media__grid-list">
                {collectionAssets.length ? (
                  collectionAssets.map((asset) => <AssetEditor asset={asset} key={asset.id} locale={locale} />)
                ) : (
                  <PortalCard tone="soft">
                    <p className="portal-panel__note-copy">
                      {locale === "en" ? "No media assets in this collection yet." : "Danh mục này chưa có media."}
                    </p>
                  </PortalCard>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
