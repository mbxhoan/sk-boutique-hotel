"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import {
  createNewsPostAction,
  deleteNewsPostAction,
  deleteNewsPostImageAction,
  toggleNewsPostFeaturedAction,
  toggleNewsPostPublishedAction,
  updateNewsPostAction,
  uploadNewsPostCoverAction,
  uploadNewsPostImageAction
} from "@/app/(admin)/admin/news-posts/actions";
import { PortalBadge, PortalCard, PortalSectionHeading } from "@/components/portal-ui";
import { PortalSubmitButton } from "@/components/portal-submit-button";
import type { Locale } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";
import type { NewsPostImageRow, NewsPostRow } from "@/lib/supabase/database.types";

const CATEGORIES = [
  { value: "cam-nang", vi: "Cẩm nang Phú Quốc", en: "Phu Quoc guide" },
  { value: "khuyen-mai", vi: "Khuyến mãi", en: "Promotions" },
  { value: "trai-nghiem", vi: "Trải nghiệm", en: "Experiences" },
  { value: "am-thuc", vi: "Ẩm thực", en: "Cuisine" },
  { value: "su-kien", vi: "Sự kiện", en: "Events" },
  { value: "tin-tuc", vi: "Tin tức", en: "News" },
  { value: "meo-dat-phong", vi: "Mẹo đặt phòng", en: "Booking tips" }
];

type PostWithImages = NewsPostRow & { images: NewsPostImageRow[] };

type Props = {
  posts: PostWithImages[];
  locale: Locale;
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function AdminNewsPostsManager({ posts, locale }: Props) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(posts[0]?.id ?? "");
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [togglingFeatured, setTogglingFeatured] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const selectedPost = posts.find((p) => p.id === selectedId) ?? null;

  async function handleTogglePublished() {
    if (!selectedPost) return;
    setToggling(true);
    const fd = new FormData();
    fd.set("id", selectedPost.id);
    fd.set("slug", selectedPost.slug);
    fd.set("isPublished", selectedPost.is_published ? "" : "1");
    await toggleNewsPostPublishedAction(fd);
    setToggling(false);
    router.refresh();
  }

  async function handleToggleFeatured() {
    if (!selectedPost) return;
    setTogglingFeatured(true);
    const fd = new FormData();
    fd.set("id", selectedPost.id);
    fd.set("slug", selectedPost.slug);
    fd.set("isFeatured", selectedPost.is_featured ? "" : "1");
    await toggleNewsPostFeaturedAction(fd);
    setTogglingFeatured(false);
    router.refresh();
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !selectedPost) return;
    setCoverUploading(true);
    const fd = new FormData();
    fd.set("postId", selectedPost.id);
    fd.set("slug", selectedPost.slug);
    fd.set("file", file);
    await uploadNewsPostCoverAction(fd);
    if (coverInputRef.current) coverInputRef.current.value = "";
    setCoverUploading(false);
    router.refresh();
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !selectedPost) return;
    setUploading(true);
    const fd = new FormData();
    fd.set("postId", selectedPost.id);
    fd.set("file", file);
    fd.set("captionVi", "");
    fd.set("captionEn", "");
    fd.set("sortOrder", String(selectedPost.images.length));
    await uploadNewsPostImageAction(fd);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setUploading(false);
    router.refresh();
  }

  async function handleDeleteImage(imageId: string) {
    const fd = new FormData();
    fd.set("id", imageId);
    await deleteNewsPostImageAction(fd);
    router.refresh();
  }

  async function handleDeletePost() {
    if (!selectedPost) return;
    const fd = new FormData();
    fd.set("id", selectedPost.id);
    await deleteNewsPostAction(fd);
    setDeleteConfirmId(null);
    setSelectedId(posts.find((p) => p.id !== selectedPost.id)?.id ?? "");
    router.refresh();
  }

  return (
    <div className="portal-content admin-events">
      <PortalSectionHeading
        description={{ vi: "Quản lý bài viết tạp chí hiển thị trên trang web.", en: "Manage journal articles shown on the website." }}
        eyebrow={{ vi: "Tạp chí", en: "Journal" }}
        locale={locale}
        title={{ vi: "Quản lý Tạp chí", en: "Journal Management" }}
      />

      <div className="admin-events__layout">
        {/* Sidebar */}
        <PortalCard className="admin-events__sidebar" tone="soft">
          <div className="admin-events__sidebar-head">
            <div>
              <p className="portal-panel__eyebrow">{localize(locale, { vi: "Danh sách", en: "List" })}</p>
              <h2 className="portal-section-heading__title">{localize(locale, { vi: "Bài viết", en: "Posts" })}</h2>
            </div>
            <PortalBadge tone="accent">{posts.length}</PortalBadge>
          </div>

          <div className="admin-events__list">
            {posts.map((post) => {
              const active = post.id === selectedId && !creating;
              const title = locale === "vi" ? post.title_vi : post.title_en;

              return (
                <button
                  aria-pressed={active}
                  className={`admin-events__event-card${active ? " admin-events__event-card--active" : ""}`}
                  key={post.id}
                  onClick={() => { setSelectedId(post.id); setCreating(false); }}
                  type="button"
                >
                  {post.cover_image_path && (
                    <div className="admin-events__event-thumb">
                      <Image alt={title} fill sizes="80px" src={post.cover_image_path} style={{ objectFit: "cover" }} />
                    </div>
                  )}
                  <div className="admin-events__event-info">
                    <strong style={{ display: "block", marginBottom: 2 }}>{title}</strong>
                    <div className="admin-events__event-meta">
                      <span style={{ fontSize: "0.78rem", opacity: 0.7 }}>{post.slug}</span>
                      <div style={{ display: "flex", gap: 4 }}>
                        <PortalBadge tone={post.is_published ? "accent" : "neutral"}>
                          {post.is_published ? localize(locale, { vi: "Đăng", en: "Published" }) : localize(locale, { vi: "Ẩn", en: "Draft" })}
                        </PortalBadge>
                        {post.is_featured && <PortalBadge tone="accent">★</PortalBadge>}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <button className="btn btn--outline admin-events__new-btn" onClick={() => setCreating(true)} type="button">
            + {localize(locale, { vi: "Tạo bài viết mới", en: "New post" })}
          </button>
        </PortalCard>

        {/* Editor */}
        <div className="admin-events__editor-stack">
          {creating ? (
            <PortalCard tone="default">
              <p className="portal-panel__eyebrow">{localize(locale, { vi: "Tạo mới", en: "Create new" })}</p>
              <h3 className="portal-section-heading__title">{localize(locale, { vi: "Bài viết mới", en: "New post" })}</h3>
              <form
                action={async (fd) => {
                  await createNewsPostAction(fd);
                  setCreating(false);
                  router.refresh();
                }}
                className="portal-form admin-events__form"
              >
                <div className="portal-form__group">
                  <label className="portal-form__label">{localize(locale, { vi: "Tiêu đề (VI)", en: "Title (VI)" })}</label>
                  <input className="portal-form__input" name="titleVi" required type="text" onChange={(e) => {
                    const slugInput = e.currentTarget.closest("form")?.querySelector<HTMLInputElement>('[name="slug"]');
                    if (slugInput && !slugInput.dataset.edited) slugInput.value = slugify(e.target.value);
                  }} />
                </div>
                <div className="portal-form__group">
                  <label className="portal-form__label">{localize(locale, { vi: "Tiêu đề (EN)", en: "Title (EN)" })}</label>
                  <input className="portal-form__input" name="titleEn" required type="text" />
                </div>
                <div className="portal-form__group">
                  <label className="portal-form__label">Slug</label>
                  <input className="portal-form__input" name="slug" placeholder="vi-du-bai-viet" required type="text" onInput={(e) => { (e.target as HTMLInputElement).dataset.edited = "1"; }} />
                </div>
                <div className="portal-form__group">
                  <label className="portal-form__label">{localize(locale, { vi: "Chuyên mục", en: "Category" })}</label>
                  <select className="portal-form__input" name="category" defaultValue="tin-tuc">
                    {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{localize(locale, { vi: c.vi, en: c.en })}</option>)}
                  </select>
                </div>
                <div className="portal-form__group">
                  <label className="portal-form__label">{localize(locale, { vi: "Tóm tắt (VI)", en: "Excerpt (VI)" })}</label>
                  <textarea className="portal-form__input" name="excerptVi" rows={2} />
                </div>
                <div className="portal-form__group">
                  <label className="portal-form__label">{localize(locale, { vi: "Tóm tắt (EN)", en: "Excerpt (EN)" })}</label>
                  <textarea className="portal-form__input" name="excerptEn" rows={2} />
                </div>
                <div className="portal-form__group">
                  <label className="portal-form__label">{localize(locale, { vi: "Nội dung (VI) — hỗ trợ Markdown ##", en: "Body (VI) — supports Markdown ##" })}</label>
                  <textarea className="portal-form__input" name="bodyVi" rows={8} />
                </div>
                <div className="portal-form__group">
                  <label className="portal-form__label">{localize(locale, { vi: "Nội dung (EN)", en: "Body (EN)" })}</label>
                  <textarea className="portal-form__input" name="bodyEn" rows={8} />
                </div>
                <div className="portal-form__group">
                  <label className="portal-form__label">{localize(locale, { vi: "Tác giả", en: "Author name" })}</label>
                  <input className="portal-form__input" defaultValue="SK Boutique" name="authorName" type="text" />
                </div>
                <div className="portal-form__group">
                  <label className="portal-form__label">{localize(locale, { vi: "Vai trò tác giả (VI)", en: "Author role (VI)" })}</label>
                  <input className="portal-form__input" name="authorRoleVi" type="text" />
                </div>
                <div className="portal-form__group">
                  <label className="portal-form__label">{localize(locale, { vi: "Vai trò tác giả (EN)", en: "Author role (EN)" })}</label>
                  <input className="portal-form__input" name="authorRoleEn" type="text" />
                </div>
                <div className="portal-form__group">
                  <label className="portal-form__label">{localize(locale, { vi: "Giới thiệu tác giả (VI)", en: "Author bio (VI)" })}</label>
                  <textarea className="portal-form__input" name="authorBioVi" rows={2} />
                </div>
                <div className="portal-form__group">
                  <label className="portal-form__label">{localize(locale, { vi: "Giới thiệu tác giả (EN)", en: "Author bio (EN)" })}</label>
                  <textarea className="portal-form__input" name="authorBioEn" rows={2} />
                </div>
                <div className="portal-form__group">
                  <label className="portal-form__label">{localize(locale, { vi: "Thẻ (phân cách bằng dấu phẩy)", en: "Tags (comma-separated)" })}</label>
                  <input className="portal-form__input" name="tags" placeholder="PhuQuoc, SKBoutique" type="text" />
                </div>
                <div className="portal-form__group">
                  <label className="portal-form__label">{localize(locale, { vi: "Thời gian đọc (VI)", en: "Read time (VI)" })}</label>
                  <input className="portal-form__input" name="readTimeVi" placeholder="9 phút đọc" type="text" />
                </div>
                <div className="portal-form__group">
                  <label className="portal-form__label">{localize(locale, { vi: "Thời gian đọc (EN)", en: "Read time (EN)" })}</label>
                  <input className="portal-form__input" name="readTimeEn" placeholder="9 min read" type="text" />
                </div>
                <div className="portal-form__group">
                  <label className="portal-form__label">{localize(locale, { vi: "Ngày đăng", en: "Published date" })}</label>
                  <input className="portal-form__input" name="publishedAt" type="date" />
                </div>
                <div className="portal-form__group">
                  <label className="portal-form__label">{localize(locale, { vi: "Thứ tự", en: "Sort order" })}</label>
                  <input className="portal-form__input" defaultValue={0} name="sortOrder" type="number" />
                </div>
                <div className="portal-form__actions">
                  <PortalSubmitButton>{localize(locale, { vi: "Tạo bài viết", en: "Create post" })}</PortalSubmitButton>
                  <button className="btn btn--ghost" onClick={() => setCreating(false)} type="button">
                    {localize(locale, { vi: "Hủy", en: "Cancel" })}
                  </button>
                </div>
              </form>
            </PortalCard>
          ) : selectedPost ? (
            <>
              {/* Edit form */}
              <PortalCard tone="default">
                <div className="admin-events__editor-head">
                  <div>
                    <p className="portal-panel__eyebrow">{localize(locale, { vi: "Chỉnh sửa", en: "Edit" })}</p>
                    <h3 className="portal-section-heading__title">
                      {locale === "vi" ? selectedPost.title_vi : selectedPost.title_en}
                    </h3>
                  </div>
                  <div className="admin-events__toggles">
                    <button
                      className={`admin-events__toggle-btn${selectedPost.is_published ? " admin-events__toggle-btn--on" : ""}`}
                      disabled={toggling}
                      onClick={handleTogglePublished}
                      type="button"
                    >
                      <span className="admin-events__toggle-dot" />
                      {selectedPost.is_published
                        ? localize(locale, { vi: "Hiển thị", en: "Published" })
                        : localize(locale, { vi: "Đang ẩn", en: "Draft" })}
                    </button>
                    <button
                      className={`admin-events__toggle-btn${selectedPost.is_featured ? " admin-events__toggle-btn--on" : ""}`}
                      disabled={togglingFeatured}
                      onClick={handleToggleFeatured}
                      type="button"
                    >
                      <span className="admin-events__toggle-dot" />
                      {selectedPost.is_featured
                        ? localize(locale, { vi: "Bài nổi bật", en: "Featured" })
                        : localize(locale, { vi: "Không nổi bật", en: "Not featured" })}
                    </button>
                  </div>
                </div>

                <form action={updateNewsPostAction} className="portal-form admin-events__form">
                  <input name="id" type="hidden" value={selectedPost.id} />
                  <div className="portal-form__group">
                    <label className="portal-form__label">{localize(locale, { vi: "Tiêu đề (VI)", en: "Title (VI)" })}</label>
                    <input className="portal-form__input" defaultValue={selectedPost.title_vi} name="titleVi" required type="text" />
                  </div>
                  <div className="portal-form__group">
                    <label className="portal-form__label">{localize(locale, { vi: "Tiêu đề (EN)", en: "Title (EN)" })}</label>
                    <input className="portal-form__input" defaultValue={selectedPost.title_en} name="titleEn" required type="text" />
                  </div>
                  <div className="portal-form__group">
                    <label className="portal-form__label">Slug</label>
                    <input className="portal-form__input" defaultValue={selectedPost.slug} name="slug" required type="text" />
                  </div>
                  <div className="portal-form__group">
                    <label className="portal-form__label">{localize(locale, { vi: "Chuyên mục", en: "Category" })}</label>
                    <select className="portal-form__input" defaultValue={selectedPost.category} name="category">
                      {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{localize(locale, { vi: c.vi, en: c.en })}</option>)}
                    </select>
                  </div>
                  <div className="portal-form__group">
                    <label className="portal-form__label">{localize(locale, { vi: "Tóm tắt (VI)", en: "Excerpt (VI)" })}</label>
                    <textarea className="portal-form__input" defaultValue={selectedPost.excerpt_vi} name="excerptVi" rows={2} />
                  </div>
                  <div className="portal-form__group">
                    <label className="portal-form__label">{localize(locale, { vi: "Tóm tắt (EN)", en: "Excerpt (EN)" })}</label>
                    <textarea className="portal-form__input" defaultValue={selectedPost.excerpt_en} name="excerptEn" rows={2} />
                  </div>
                  <div className="portal-form__group">
                    <label className="portal-form__label">{localize(locale, { vi: "Nội dung (VI) — Markdown: ## Tiêu đề", en: "Body (VI) — Markdown: ## Heading" })}</label>
                    <textarea className="portal-form__input" defaultValue={selectedPost.body_vi} name="bodyVi" rows={10} />
                  </div>
                  <div className="portal-form__group">
                    <label className="portal-form__label">{localize(locale, { vi: "Nội dung (EN)", en: "Body (EN)" })}</label>
                    <textarea className="portal-form__input" defaultValue={selectedPost.body_en} name="bodyEn" rows={10} />
                  </div>
                  <div className="portal-form__group">
                    <label className="portal-form__label">{localize(locale, { vi: "Tác giả", en: "Author name" })}</label>
                    <input className="portal-form__input" defaultValue={selectedPost.author_name} name="authorName" type="text" />
                  </div>
                  <div className="portal-form__group">
                    <label className="portal-form__label">{localize(locale, { vi: "Vai trò tác giả (VI)", en: "Author role (VI)" })}</label>
                    <input className="portal-form__input" defaultValue={selectedPost.author_role_vi} name="authorRoleVi" type="text" />
                  </div>
                  <div className="portal-form__group">
                    <label className="portal-form__label">{localize(locale, { vi: "Vai trò tác giả (EN)", en: "Author role (EN)" })}</label>
                    <input className="portal-form__input" defaultValue={selectedPost.author_role_en} name="authorRoleEn" type="text" />
                  </div>
                  <div className="portal-form__group">
                    <label className="portal-form__label">{localize(locale, { vi: "Giới thiệu tác giả (VI)", en: "Author bio (VI)" })}</label>
                    <textarea className="portal-form__input" defaultValue={selectedPost.author_bio_vi} name="authorBioVi" rows={2} />
                  </div>
                  <div className="portal-form__group">
                    <label className="portal-form__label">{localize(locale, { vi: "Giới thiệu tác giả (EN)", en: "Author bio (EN)" })}</label>
                    <textarea className="portal-form__input" defaultValue={selectedPost.author_bio_en} name="authorBioEn" rows={2} />
                  </div>
                  <div className="portal-form__group">
                    <label className="portal-form__label">{localize(locale, { vi: "Thẻ (phân cách bằng dấu phẩy)", en: "Tags (comma-separated)" })}</label>
                    <input className="portal-form__input" defaultValue={selectedPost.tags.join(", ")} name="tags" type="text" />
                  </div>
                  <div className="portal-form__group">
                    <label className="portal-form__label">{localize(locale, { vi: "Thời gian đọc (VI)", en: "Read time (VI)" })}</label>
                    <input className="portal-form__input" defaultValue={selectedPost.read_time_vi} name="readTimeVi" type="text" />
                  </div>
                  <div className="portal-form__group">
                    <label className="portal-form__label">{localize(locale, { vi: "Thời gian đọc (EN)", en: "Read time (EN)" })}</label>
                    <input className="portal-form__input" defaultValue={selectedPost.read_time_en} name="readTimeEn" type="text" />
                  </div>
                  <div className="portal-form__group">
                    <label className="portal-form__label">{localize(locale, { vi: "Ngày đăng", en: "Published date" })}</label>
                    <input className="portal-form__input" defaultValue={selectedPost.published_at ?? ""} name="publishedAt" type="date" />
                  </div>
                  <div className="portal-form__group">
                    <label className="portal-form__label">{localize(locale, { vi: "Thứ tự", en: "Sort order" })}</label>
                    <input className="portal-form__input" defaultValue={selectedPost.sort_order} name="sortOrder" type="number" />
                  </div>
                  <input name="isPublished" type="hidden" value={selectedPost.is_published ? "1" : ""} />
                  <input name="isFeatured" type="hidden" value={selectedPost.is_featured ? "1" : ""} />
                  <div className="portal-form__actions">
                    <PortalSubmitButton>{localize(locale, { vi: "Lưu thay đổi", en: "Save changes" })}</PortalSubmitButton>
                  </div>
                </form>

                {/* Delete */}
                <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid var(--border-subtle)" }}>
                  {deleteConfirmId === selectedPost.id ? (
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontSize: "0.86rem", color: "var(--muted)" }}>
                        {localize(locale, { vi: "Xác nhận xóa bài viết này?", en: "Confirm delete this post?" })}
                      </span>
                      <button className="btn btn--danger" onClick={handleDeletePost} type="button">
                        {localize(locale, { vi: "Xóa", en: "Delete" })}
                      </button>
                      <button className="btn btn--ghost" onClick={() => setDeleteConfirmId(null)} type="button">
                        {localize(locale, { vi: "Hủy", en: "Cancel" })}
                      </button>
                    </div>
                  ) : (
                    <button className="btn btn--ghost" onClick={() => setDeleteConfirmId(selectedPost.id)} style={{ color: "#c0392b" }} type="button">
                      {localize(locale, { vi: "Xóa bài viết", en: "Delete post" })}
                    </button>
                  )}
                </div>
              </PortalCard>

              {/* Cover image */}
              <PortalCard tone="soft">
                <p className="portal-panel__eyebrow">{localize(locale, { vi: "Ảnh bìa", en: "Cover image" })}</p>
                <h3 className="portal-section-heading__title">{localize(locale, { vi: "Ảnh đại diện bài viết", en: "Post cover photo" })}</h3>

                {selectedPost.cover_image_path ? (
                  <div className="admin-events__cover-preview">
                    <Image
                      alt={locale === "vi" ? selectedPost.title_vi : selectedPost.title_en}
                      fill
                      sizes="400px"
                      src={selectedPost.cover_image_path}
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                ) : (
                  <div className="admin-events__cover-empty">
                    {localize(locale, { vi: "Chưa có ảnh bìa", en: "No cover image yet" })}
                  </div>
                )}

                <div className="admin-events__upload">
                  <input accept="image/*" disabled={coverUploading} onChange={handleCoverUpload} ref={coverInputRef} style={{ display: "none" }} type="file" />
                  <button className="btn btn--outline" disabled={coverUploading} onClick={() => coverInputRef.current?.click()} type="button">
                    {coverUploading
                      ? localize(locale, { vi: "Đang tải...", en: "Uploading..." })
                      : selectedPost.cover_image_path
                        ? localize(locale, { vi: "Đổi ảnh bìa", en: "Change cover" })
                        : localize(locale, { vi: "Tải ảnh bìa", en: "Upload cover" })}
                  </button>
                </div>
              </PortalCard>

              {/* Gallery images */}
              <PortalCard tone="soft">
                <p className="portal-panel__eyebrow">{localize(locale, { vi: "Thư viện ảnh", en: "Gallery" })}</p>
                <h3 className="portal-section-heading__title">{localize(locale, { vi: "Ảnh bài viết", en: "Post images" })}</h3>

                {selectedPost.images.length > 0 ? (
                  <div className="admin-events__images-grid">
                    {selectedPost.images.map((img) => (
                      <div className="admin-events__image-item" key={img.id}>
                        <div className="admin-events__image-preview" style={{ position: "relative", aspectRatio: "4/3", borderRadius: 4, overflow: "hidden", background: "var(--surface-container-highest)" }}>
                          <Image alt={img.caption_vi || "image"} fill sizes="200px" src={img.image_path} style={{ objectFit: "cover" }} />
                        </div>
                        <button className="btn btn--ghost" onClick={() => handleDeleteImage(img.id)} style={{ fontSize: "0.78rem", marginTop: 4, color: "#c0392b" }} type="button">
                          {localize(locale, { vi: "Xóa", en: "Delete" })}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
                    {localize(locale, { vi: "Chưa có ảnh nào", en: "No images yet" })}
                  </p>
                )}

                <div className="admin-events__upload" style={{ marginTop: 16 }}>
                  <input accept="image/*" disabled={uploading} onChange={handleImageUpload} ref={fileInputRef} style={{ display: "none" }} type="file" />
                  <button className="btn btn--outline" disabled={uploading} onClick={() => fileInputRef.current?.click()} type="button">
                    {uploading
                      ? localize(locale, { vi: "Đang tải...", en: "Uploading..." })
                      : localize(locale, { vi: "Thêm ảnh", en: "Add image" })}
                  </button>
                </div>
              </PortalCard>

              {/* Preview link */}
              <PortalCard tone="soft">
                <p className="portal-panel__eyebrow">{localize(locale, { vi: "Xem trước", en: "Preview" })}</p>
                <a
                  className="btn btn--outline"
                  href={`/news/${selectedPost.slug}`}
                  rel="noopener noreferrer"
                  style={{ display: "inline-flex", textDecoration: "none" }}
                  target="_blank"
                >
                  {localize(locale, { vi: "Mở bài viết →", en: "Open post →" })}
                </a>
              </PortalCard>
            </>
          ) : (
            <PortalCard tone="soft">
              <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
                {localize(locale, { vi: "Chọn bài viết để chỉnh sửa hoặc tạo mới.", en: "Select a post to edit or create a new one." })}
              </p>
            </PortalCard>
          )}
        </div>
      </div>
    </div>
  );
}
