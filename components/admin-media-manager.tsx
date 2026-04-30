"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import type { Locale } from "@/lib/locale";
import { appendLocaleQuery } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";
import { PortalSubmitButton } from "@/components/portal-submit-button";
import { MediaPreviewImage } from "@/components/media-preview-image";
import { PortalCard, PortalSectionHeading } from "@/components/portal-ui";
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

type SortKey = "createdDesc" | "createdAsc" | "nameAsc" | "nameDesc" | "sizeDesc" | "sizeAsc";

const PAGE_SIZE = 24;

function useEscapeToClose(isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);
}

function MediaDialog({
  children,
  onClose,
  title,
  locale,
  size = "default"
}: {
  children: ReactNode;
  onClose: () => void;
  title: string;
  locale: Locale;
  size?: "default" | "wide";
}) {
  useEscapeToClose(true, onClose);

  return (
    <div className="admin-media__dialog" role="presentation" onClick={onClose}>
      <div
        aria-labelledby="admin-media-dialog-title"
        aria-modal="true"
        className={`admin-media__dialog-card${size === "wide" ? " admin-media__dialog-card--wide" : ""}`}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header className="admin-media__dialog-head">
          <div>
            <p className="admin-media__dialog-eyebrow">{locale === "en" ? "Media library" : "Thư viện ảnh"}</p>
            <h3 className="admin-media__dialog-title" id="admin-media-dialog-title">
              {title}
            </h3>
          </div>
          <button
            aria-label={locale === "en" ? "Close dialog" : "Đóng cửa sổ"}
            className="admin-media__dialog-close"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </header>
        <div className="admin-media__dialog-body">{children}</div>
      </div>
    </div>
  );
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

function getAssetTitle(asset: MediaAssetRowWithUrl, locale: Locale) {
  if (locale === "en") {
    return asset.title_en || asset.title_vi || asset.file_name || asset.slug;
  }
  return asset.title_vi || asset.title_en || asset.file_name || asset.slug;
}

function sortAssets(assets: MediaAssetRowWithUrl[], sortKey: SortKey, locale: Locale) {
  const list = [...assets];

  switch (sortKey) {
    case "createdAsc":
      return list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    case "nameAsc":
      return list.sort((a, b) => getAssetTitle(a, locale).localeCompare(getAssetTitle(b, locale), locale === "en" ? "en" : "vi"));
    case "nameDesc":
      return list.sort((a, b) => getAssetTitle(b, locale).localeCompare(getAssetTitle(a, locale), locale === "en" ? "en" : "vi"));
    case "sizeDesc":
      return list.sort((a, b) => (b.file_size ?? 0) - (a.file_size ?? 0));
    case "sizeAsc":
      return list.sort((a, b) => (a.file_size ?? 0) - (b.file_size ?? 0));
    case "createdDesc":
    default:
      return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
}

function buildPageList(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages: (number | "…")[] = [1];

  if (currentPage > 3) {
    pages.push("…");
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let i = start; i <= end; i += 1) {
    pages.push(i);
  }

  if (currentPage < totalPages - 2) {
    pages.push("…");
  }

  pages.push(totalPages);
  return pages;
}

function CollectionEditorForm({
  collection,
  locale,
  onAfterSubmit
}: {
  collection: MediaCollectionRow;
  locale: Locale;
  onAfterSubmit: () => void;
}) {
  return (
    <>
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
            <textarea className="portal-field__control" name="descriptionVi" rows={3} defaultValue={collection.description_vi ?? ""} />
          </label>
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Description EN" : "Mô tả EN"}</span>
            <textarea className="portal-field__control" name="descriptionEn" rows={3} defaultValue={collection.description_en ?? ""} />
          </label>
        </div>

        <div className="admin-media__grid admin-media__grid--two">
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Sort order" : "Thứ tự"}</span>
            <input className="portal-field__control" name="sortOrder" type="number" defaultValue={collection.sort_order} />
          </label>
          <label className="portal-field admin-media__publish">
            <span className="portal-field__label">{locale === "en" ? "Active" : "Kích hoạt"}</span>
            <input className="portal-field__checkbox" name="isActive" type="checkbox" defaultChecked={collection.is_active} />
          </label>
        </div>

        <div className="admin-media__dialog-actions">
          <form action={deleteMediaCollectionAction}>
            <input name="slug" type="hidden" value={collection.slug} />
            <PortalSubmitButton
              className="button button--text-light admin-media__danger"
              pendingLabel={locale === "en" ? "Deleting..." : "Đang xoá..."}
            >
              {locale === "en" ? "Delete collection" : "Xoá danh mục"}
            </PortalSubmitButton>
          </form>
          <PortalSubmitButton className="button button--solid" pendingLabel={locale === "en" ? "Saving..." : "Đang lưu..."} onClick={onAfterSubmit}>
            {locale === "en" ? "Save" : "Lưu"}
          </PortalSubmitButton>
        </div>
      </form>
    </>
  );
}

function NewCollectionForm({ locale, onAfterSubmit }: { locale: Locale; onAfterSubmit: () => void }) {
  return (
    <form className="admin-media__form" action={saveMediaCollectionAction}>
      <div className="admin-media__grid admin-media__grid--two">
        <label className="portal-field">
          <span className="portal-field__label">{locale === "en" ? "Slug" : "Slug"}</span>
          <input className="portal-field__control" name="slug" placeholder="lobby" required />
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

      <div className="admin-media__dialog-actions">
        <PortalSubmitButton className="button button--solid" pendingLabel={locale === "en" ? "Creating..." : "Đang tạo..."} onClick={onAfterSubmit}>
          {locale === "en" ? "Create collection" : "Tạo danh mục"}
        </PortalSubmitButton>
      </div>
    </form>
  );
}

function AssetEditorForm({
  asset,
  locale,
  onAfterSubmit
}: {
  asset: MediaAssetRowWithUrl;
  locale: Locale;
  onAfterSubmit: () => void;
}) {
  return (
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
          <input className="portal-field__control" name="titleVi" defaultValue={asset.title_vi ?? ""} />
        </label>
        <label className="portal-field">
          <span className="portal-field__label">{locale === "en" ? "Title EN" : "Tiêu đề EN"}</span>
          <input className="portal-field__control" name="titleEn" defaultValue={asset.title_en ?? ""} />
        </label>
      </div>

      <div className="admin-media__grid admin-media__grid--two">
        <label className="portal-field">
          <span className="portal-field__label">{locale === "en" ? "Alt VI" : "Alt VI"}</span>
          <input className="portal-field__control" name="altVi" defaultValue={asset.alt_vi ?? ""} />
        </label>
        <label className="portal-field">
          <span className="portal-field__label">{locale === "en" ? "Alt EN" : "Alt EN"}</span>
          <input className="portal-field__control" name="altEn" defaultValue={asset.alt_en ?? ""} />
        </label>
      </div>

      <div className="admin-media__grid admin-media__grid--two">
        <label className="portal-field">
          <span className="portal-field__label">{locale === "en" ? "Description VI" : "Mô tả VI"}</span>
          <textarea className="portal-field__control" name="descriptionVi" rows={3} defaultValue={asset.description_vi ?? ""} />
        </label>
        <label className="portal-field">
          <span className="portal-field__label">{locale === "en" ? "Description EN" : "Mô tả EN"}</span>
          <textarea className="portal-field__control" name="descriptionEn" rows={3} defaultValue={asset.description_en ?? ""} />
        </label>
      </div>

      <label className="portal-field">
        <span className="portal-field__label">{locale === "en" ? "Fallback URL" : "URL dự phòng"}</span>
        <input className="portal-field__control" name="fallbackUrl" defaultValue={asset.fallback_url ?? ""} />
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

      <div className="admin-media__dialog-actions">
        <PortalSubmitButton className="button button--solid" pendingLabel={locale === "en" ? "Saving..." : "Đang lưu..."} onClick={onAfterSubmit}>
          {locale === "en" ? "Save asset" : "Lưu ảnh"}
        </PortalSubmitButton>
      </div>
    </form>
  );
}

function NewAssetForm({
  collections,
  defaultCollectionSlug,
  locale,
  onAfterSubmit
}: {
  collections: MediaCollectionRow[];
  defaultCollectionSlug: string;
  locale: Locale;
  onAfterSubmit: () => void;
}) {
  return (
    <form className="admin-media__form" action={saveMediaAssetAction} encType="multipart/form-data">
      <div className="admin-media__grid admin-media__grid--two">
        <label className="portal-field">
          <span className="portal-field__label">{locale === "en" ? "Collection" : "Danh mục"}</span>
          <select className="portal-field__control" name="collectionSlug" defaultValue={defaultCollectionSlug} required>
            {collections.map((collection) => (
              <option key={collection.slug} value={collection.slug}>
                {locale === "en" ? collection.name_en || collection.slug : collection.name_vi || collection.slug} ({collection.slug})
              </option>
            ))}
          </select>
        </label>
        <label className="portal-field">
          <span className="portal-field__label">{locale === "en" ? "Slug" : "Slug"}</span>
          <input className="portal-field__control" name="slug" placeholder="image-1" required />
        </label>
      </div>

      <label className="portal-field">
        <span className="portal-field__label">{locale === "en" ? "Upload file" : "Tải file lên"}</span>
        <input className="portal-field__control" name="mediaFile" type="file" accept="image/*,.svg,.webp,.jpg,.jpeg,.png,.gif,.avif" required />
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

      <div className="admin-media__dialog-actions">
        <PortalSubmitButton className="button button--solid" pendingLabel={locale === "en" ? "Uploading..." : "Đang tải lên..."} onClick={onAfterSubmit}>
          {locale === "en" ? "Upload" : "Tải lên"}
        </PortalSubmitButton>
      </div>
    </form>
  );
}

function AssetCard({
  asset,
  locale,
  onOpen
}: {
  asset: MediaAssetRowWithUrl;
  locale: Locale;
  onOpen: () => void;
}) {
  const previewUrl = asset.public_url || asset.fallback_url || "";
  const title = getAssetTitle(asset, locale);

  return (
    <button className="admin-media__library-card" onClick={onOpen} type="button">
      <div className="admin-media__library-thumb">
        {previewUrl ? (
          <MediaPreviewImage
            alt={asset.alt_vi || asset.title_vi || asset.slug}
            className="admin-media__library-image"
            fallbackSrc={asset.fallback_url || "/home/block.jpg"}
            loading="lazy"
            src={previewUrl}
          />
        ) : (
          <div className="admin-media__library-empty">{locale === "en" ? "No image" : "Chưa có ảnh"}</div>
        )}
        {!asset.is_active ? (
          <span className="admin-media__library-status">{locale === "en" ? "Inactive" : "Tắt"}</span>
        ) : null}
      </div>
      <div className="admin-media__library-meta">
        <p className="admin-media__library-name" title={title}>
          {title}
        </p>
        <p className="admin-media__library-size">{formatBytes(asset.file_size)}</p>
        <span className="admin-media__library-chip">{asset.collection_slug}</span>
      </div>
    </button>
  );
}

function AssetEditDialog({
  asset,
  locale,
  onClose
}: {
  asset: MediaAssetRowWithUrl;
  locale: Locale;
  onClose: () => void;
}) {
  const previewUrl = asset.public_url || asset.fallback_url || "";

  return (
    <MediaDialog
      locale={locale}
      onClose={onClose}
      size="wide"
      title={localize(locale, {
        vi: asset.title_vi || asset.slug,
        en: asset.title_en || asset.slug
      })}
    >
      <div className="admin-media__dialog-grid">
        <div className="admin-media__dialog-side">
          <div className="admin-media__dialog-preview">
            {previewUrl ? (
              <MediaPreviewImage
                alt={asset.alt_vi || asset.title_vi || asset.slug}
                className="admin-media__dialog-image"
                fallbackSrc={asset.fallback_url || "/home/block.jpg"}
                loading="eager"
                src={previewUrl}
              />
            ) : (
              <div className="admin-media__dialog-empty">{locale === "en" ? "No image available" : "Không có ảnh"}</div>
            )}
          </div>

          <div className="admin-media__dialog-meta">
            <p className="portal-panel__eyebrow">
              {asset.collection_slug}/{asset.slug}
            </p>
            <p className="admin-media__dialog-meta-line">{asset.file_name || asset.file_path || asset.fallback_url || "-"}</p>
            <p className="admin-media__dialog-meta-line">{formatBytes(asset.file_size)}</p>
          </div>

          <div className="admin-media__dialog-side-actions">
            {previewUrl ? (
              <a className="button button--text-light" href={previewUrl} rel="noreferrer" target="_blank">
                {locale === "en" ? "Open original" : "Mở ảnh gốc"}
              </a>
            ) : null}
            <form action={deleteMediaAssetAction} onSubmit={onClose}>
              <input name="id" type="hidden" value={asset.id} />
              <input name="fileBucket" type="hidden" value={asset.file_bucket} />
              <input name="filePath" type="hidden" value={asset.file_path ?? ""} />
              <PortalSubmitButton
                className="button button--text-light admin-media__danger"
                pendingLabel={locale === "en" ? "Deleting..." : "Đang xoá..."}
              >
                {locale === "en" ? "Delete" : "Xoá ảnh"}
              </PortalSubmitButton>
            </form>
          </div>
        </div>

        <div className="admin-media__dialog-form">
          <AssetEditorForm asset={asset} locale={locale} onAfterSubmit={onClose} />
        </div>
      </div>
    </MediaDialog>
  );
}

export function AdminMediaManager({
  assets,
  collections,
  activeCollectionSlug,
  locale
}: AdminMediaManagerProps) {
  const selectedCollection =
    activeCollectionSlug && activeCollectionSlug !== "all"
      ? collections.find((collection) => collection.slug === activeCollectionSlug) ?? null
      : null;

  const collectionAssetCounts = useMemo(() => {
    return collections.reduce<Record<string, number>>((acc, collection) => {
      acc[collection.slug] = assets.filter((asset) => asset.collection_slug === collection.slug).length;
      return acc;
    }, {});
  }, [assets, collections]);

  const filteredAssets = useMemo(() => {
    return selectedCollection ? assets.filter((asset) => asset.collection_slug === selectedCollection.slug) : assets;
  }, [assets, selectedCollection]);

  const [sortKey, setSortKey] = useState<SortKey>("createdDesc");
  const [page, setPage] = useState(1);
  const [isCreateCollectionOpen, setIsCreateCollectionOpen] = useState(false);
  const [editingCollectionSlug, setEditingCollectionSlug] = useState<string | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
  }, [activeCollectionSlug, sortKey]);

  const sortedAssets = useMemo(() => sortAssets(filteredAssets, sortKey, locale), [filteredAssets, sortKey, locale]);
  const totalPages = Math.max(1, Math.ceil(sortedAssets.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageAssets = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return sortedAssets.slice(start, start + PAGE_SIZE);
  }, [sortedAssets, safePage]);
  const editingAsset = useMemo(() => assets.find((asset) => asset.id === editingAssetId) ?? null, [assets, editingAssetId]);
  const editingCollection = useMemo(
    () => collections.find((collection) => collection.slug === editingCollectionSlug) ?? null,
    [collections, editingCollectionSlug]
  );

  const showingFrom = sortedAssets.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(safePage * PAGE_SIZE, sortedAssets.length);

  const sortOptions: { value: SortKey; label: { vi: string; en: string } }[] = [
    { value: "createdDesc", label: { vi: "Mới nhất", en: "Newest" } },
    { value: "createdAsc", label: { vi: "Cũ nhất", en: "Oldest" } },
    { value: "nameAsc", label: { vi: "Tên A → Z", en: "Name A → Z" } },
    { value: "nameDesc", label: { vi: "Tên Z → A", en: "Name Z → A" } },
    { value: "sizeDesc", label: { vi: "Dung lượng lớn nhất", en: "Largest size" } },
    { value: "sizeAsc", label: { vi: "Dung lượng nhỏ nhất", en: "Smallest size" } }
  ];

  const pageList = buildPageList(safePage, totalPages);

  return (
    <div className="portal-content admin-media">
      <PortalSectionHeading
        description={{
          en: "Manage reusable hotel media here. Public pages can pick images from these collections instead of hard-coded source files.",
          vi: "Quản lý toàn bộ media dùng chung tại đây. Các trang public có thể chọn ảnh từ nhóm này thay vì hard-code trong source."
        }}
        eyebrow={{ en: "Media library", vi: "Thư viện media" }}
        actions={
          <div className="admin-media__header-actions">
            <button className="button button--text-light" onClick={() => setIsCreateCollectionOpen(true)} type="button">
              {locale === "en" ? "Add collection" : "Thêm danh mục"}
            </button>
            <button className="button button--solid" onClick={() => setIsUploadOpen(true)} type="button">
              {locale === "en" ? "Upload image" : "Tải ảnh lên"}
            </button>
          </div>
        }
        locale={locale}
        title={{ en: "Media library", vi: "Thư viện ảnh" }}
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

      <div className="admin-media__toolbar">
        <div className="admin-media__toolbar-info">
          <span className="admin-media__toolbar-count">
            {sortedAssets.length} {locale === "en" ? "items total" : "ảnh"}
          </span>
          {selectedCollection ? (
            <button
              className="button button--text-light admin-media__toolbar-edit"
              onClick={() => setEditingCollectionSlug(selectedCollection.slug)}
              type="button"
            >
              {locale === "en" ? "Edit collection" : "Sửa danh mục"}
            </button>
          ) : null}
        </div>
        <label className="admin-media__sort">
          <span className="admin-media__sort-label">{locale === "en" ? "Sort" : "Sắp xếp"}</span>
          <select
            className="portal-field__control admin-media__sort-select"
            onChange={(event) => setSortKey(event.target.value as SortKey)}
            value={sortKey}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {locale === "en" ? option.label.en : option.label.vi}
              </option>
            ))}
          </select>
        </label>
      </div>

      <PortalCard className="admin-media__library-card-wrap" tone="default">
        {pageAssets.length ? (
          <div className="admin-media__library-grid">
            {pageAssets.map((asset) => (
              <AssetCard asset={asset} key={asset.id} locale={locale} onOpen={() => setEditingAssetId(asset.id)} />
            ))}
          </div>
        ) : (
          <div className="admin-media__library-empty-state">
            <p>{locale === "en" ? "No assets yet. Upload your first image to get started." : "Chưa có ảnh nào. Hãy tải lên ảnh đầu tiên."}</p>
          </div>
        )}

        {sortedAssets.length > 0 ? (
          <div className="admin-media__pagination">
            <span className="admin-media__pagination-info">
              {locale === "en"
                ? `Showing ${showingFrom} to ${showingTo} of ${sortedAssets.length} entries`
                : `Hiển thị ${showingFrom} đến ${showingTo} trong ${sortedAssets.length} ảnh`}
            </span>
            {totalPages > 1 ? (
              <div className="admin-media__pagination-controls">
                <button
                  className="admin-media__page-button"
                  disabled={safePage === 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  type="button"
                >
                  ‹
                </button>
                {pageList.map((entry, index) =>
                  entry === "…" ? (
                    <span className="admin-media__page-ellipsis" key={`ellipsis-${index}`}>
                      …
                    </span>
                  ) : (
                    <button
                      className={`admin-media__page-button${safePage === entry ? " admin-media__page-button--active" : ""}`}
                      key={entry}
                      onClick={() => setPage(entry)}
                      type="button"
                    >
                      {entry}
                    </button>
                  )
                )}
                <button
                  className="admin-media__page-button"
                  disabled={safePage === totalPages}
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  type="button"
                >
                  ›
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </PortalCard>

      {isCreateCollectionOpen ? (
        <MediaDialog locale={locale} onClose={() => setIsCreateCollectionOpen(false)} title={locale === "en" ? "Create collection" : "Tạo danh mục"}>
          <NewCollectionForm locale={locale} onAfterSubmit={() => setIsCreateCollectionOpen(false)} />
        </MediaDialog>
      ) : null}

      {editingCollection ? (
        <MediaDialog
          locale={locale}
          onClose={() => setEditingCollectionSlug(null)}
          title={localize(locale, { vi: editingCollection.name_vi, en: editingCollection.name_en })}
        >
          <CollectionEditorForm collection={editingCollection} locale={locale} onAfterSubmit={() => setEditingCollectionSlug(null)} />
        </MediaDialog>
      ) : null}

      {isUploadOpen ? (
        <MediaDialog locale={locale} onClose={() => setIsUploadOpen(false)} title={locale === "en" ? "Upload media" : "Tải ảnh lên"}>
          {collections.length === 0 ? (
            <p className="portal-panel__note-copy">
              {locale === "en" ? "Create a collection first before uploading." : "Hãy tạo một danh mục trước khi tải ảnh lên."}
            </p>
          ) : (
            <NewAssetForm
              collections={collections}
              defaultCollectionSlug={selectedCollection?.slug ?? collections[0].slug}
              locale={locale}
              onAfterSubmit={() => setIsUploadOpen(false)}
            />
          )}
        </MediaDialog>
      ) : null}

      {editingAsset ? <AssetEditDialog asset={editingAsset} locale={locale} onClose={() => setEditingAssetId(null)} /> : null}
    </div>
  );
}
