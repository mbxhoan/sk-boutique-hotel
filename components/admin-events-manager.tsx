"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import {
  createEventAction,
  deleteEventAction,
  deleteEventImageAction,
  toggleEventDetailLinkAction,
  toggleEventPublishedAction,
  updateEventAction,
  uploadEventCoverImageAction,
  uploadEventImageAction
} from "@/app/(admin)/admin/events/actions";
import { PortalBadge, PortalCard, PortalSectionHeading } from "@/components/portal-ui";
import { PortalSubmitButton } from "@/components/portal-submit-button";
import type { Locale } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";
import type { EventImageRow, EventRow } from "@/lib/supabase/database.types";

type EventWithImages = EventRow & { images: EventImageRow[] };

type AdminEventsManagerProps = {
  events: EventWithImages[];
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

export function AdminEventsManager({ events, locale }: AdminEventsManagerProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(events[0]?.id ?? "");
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [togglingDetail, setTogglingDetail] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const selectedEvent = events.find((e) => e.id === selectedId) ?? null;

  function handleSelectEvent(id: string) {
    setSelectedId(id);
    setCreating(false);
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !selectedEvent) return;
    setCoverUploading(true);
    const formData = new FormData();
    formData.set("eventId", selectedEvent.id);
    formData.set("slug", selectedEvent.slug);
    formData.set("file", file);
    await uploadEventCoverImageAction(formData);
    if (coverInputRef.current) coverInputRef.current.value = "";
    setCoverUploading(false);
    router.refresh();
  }

  async function handleTogglePublished() {
    if (!selectedEvent) return;
    setToggling(true);
    const formData = new FormData();
    formData.set("id", selectedEvent.id);
    formData.set("slug", selectedEvent.slug);
    formData.set("isPublished", selectedEvent.is_published ? "" : "1");
    await toggleEventPublishedAction(formData);
    setToggling(false);
    router.refresh();
  }

  async function handleToggleDetailLink() {
    if (!selectedEvent) return;
    setTogglingDetail(true);
    const formData = new FormData();
    formData.set("id", selectedEvent.id);
    formData.set("slug", selectedEvent.slug);
    formData.set("showDetailLink", selectedEvent.show_detail_link ? "" : "1");
    await toggleEventDetailLinkAction(formData);
    setTogglingDetail(false);
    router.refresh();
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !selectedEvent) return;

    setUploading(true);
    const formData = new FormData();
    formData.set("eventId", selectedEvent.id);
    formData.set("file", file);
    formData.set("captionVi", "");
    formData.set("captionEn", "");
    formData.set("sortOrder", String(selectedEvent.images.length));
    await uploadEventImageAction(formData);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setUploading(false);
    router.refresh();
  }

  async function handleDeleteImage(imageId: string) {
    const formData = new FormData();
    formData.set("id", imageId);
    await deleteEventImageAction(formData);
    router.refresh();
  }

  async function handleDeleteEvent() {
    if (!selectedEvent) return;
    const formData = new FormData();
    formData.set("id", selectedEvent.id);
    await deleteEventAction(formData);
    setDeleteConfirmId(null);
    setSelectedId(events.find((e) => e.id !== selectedEvent.id)?.id ?? "");
    router.refresh();
  }

  return (
    <div className="portal-content admin-events">
      <PortalSectionHeading
        description={{ vi: "Quản lý sự kiện và ảnh hiển thị trên trang web.", en: "Manage events and images shown on the website." }}
        eyebrow={{ vi: "Sự kiện", en: "Events" }}
        locale={locale}
        title={{ vi: "Quản lý sự kiện", en: "Event Management" }}
      />

      <div className="admin-events__layout">
        {/* Sidebar */}
        <PortalCard className="admin-events__sidebar" tone="soft">
          <div className="admin-events__sidebar-head">
            <div>
              <p className="portal-panel__eyebrow">{localize(locale, { vi: "Danh sách", en: "List" })}</p>
              <h2 className="portal-section-heading__title">{localize(locale, { vi: "Sự kiện", en: "Events" })}</h2>
            </div>
            <PortalBadge tone="accent">{events.length}</PortalBadge>
          </div>

          <div className="admin-events__list">
            {events.map((event) => {
              const active = event.id === selectedId && !creating;
              const title = locale === "vi" ? event.title_vi : event.title_en;

              return (
                <button
                  aria-pressed={active}
                  className={`admin-events__event-card${active ? " admin-events__event-card--active" : ""}`}
                  key={event.id}
                  onClick={() => handleSelectEvent(event.id)}
                  type="button"
                >
                  {event.cover_image_path ? (
                    <div className="admin-events__event-thumb">
                      <Image alt={title} fill sizes="80px" src={event.cover_image_path} style={{ objectFit: "cover" }} />
                    </div>
                  ) : null}
                  <div className="admin-events__event-info">
                    <strong>{title}</strong>
                    <div className="admin-events__event-meta">
                      <span>{event.slug}</span>
                      <PortalBadge tone={event.is_published ? "accent" : "neutral"}>
                        {event.is_published
                          ? localize(locale, { vi: "Đăng", en: "Published" })
                          : localize(locale, { vi: "Ẩn", en: "Draft" })}
                      </PortalBadge>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            className="btn btn--outline admin-events__new-btn"
            onClick={() => setCreating(true)}
            type="button"
          >
            + {localize(locale, { vi: "Tạo sự kiện mới", en: "New event" })}
          </button>
        </PortalCard>

        {/* Editor */}
        <div className="admin-events__editor-stack">
          {creating ? (
            <PortalCard tone="default">
              <p className="portal-panel__eyebrow">{localize(locale, { vi: "Tạo mới", en: "Create new" })}</p>
              <h3 className="portal-section-heading__title">{localize(locale, { vi: "Sự kiện mới", en: "New event" })}</h3>
              <form
                action={async (fd) => {
                  await createEventAction(fd);
                  setCreating(false);
                  router.refresh();
                }}
                className="portal-form admin-events__form"
              >
                <div className="portal-form__group">
                  <label className="portal-form__label">{localize(locale, { vi: "Tiêu đề (VI)", en: "Title (VI)" })}</label>
                  <input className="portal-form__input" name="titleVi" required type="text" />
                </div>
                <div className="portal-form__group">
                  <label className="portal-form__label">{localize(locale, { vi: "Tiêu đề (EN)", en: "Title (EN)" })}</label>
                  <input className="portal-form__input" name="titleEn" required type="text" />
                </div>
                <div className="portal-form__group">
                  <label className="portal-form__label">Slug</label>
                  <input className="portal-form__input" name="slug" placeholder="vi-du-su-kien" required type="text" />
                </div>
                <div className="portal-form__group">
                  <label className="portal-form__label">{localize(locale, { vi: "Ngày sự kiện", en: "Event date" })}</label>
                  <input className="portal-form__input" name="eventDate" type="date" />
                </div>
                <div className="portal-form__group">
                  <label className="portal-form__label">{localize(locale, { vi: "Nội dung (VI)", en: "Content (VI)" })}</label>
                  <textarea className="portal-form__input" name="descriptionVi" rows={4} />
                </div>
                <div className="portal-form__group">
                  <label className="portal-form__label">{localize(locale, { vi: "Nội dung (EN)", en: "Content (EN)" })}</label>
                  <textarea className="portal-form__input" name="descriptionEn" rows={4} />
                </div>
                <div className="portal-form__actions">
                  <PortalSubmitButton>
                    {localize(locale, { vi: "Tạo sự kiện", en: "Create event" })}
                  </PortalSubmitButton>
                  <button
                    className="btn btn--ghost"
                    onClick={() => setCreating(false)}
                    type="button"
                  >
                    {localize(locale, { vi: "Hủy", en: "Cancel" })}
                  </button>
                </div>
              </form>
            </PortalCard>
          ) : selectedEvent ? (
            <>
              {/* Edit form */}
              <PortalCard tone="default">
                <div className="admin-events__editor-head">
                  <div>
                    <p className="portal-panel__eyebrow">{localize(locale, { vi: "Chỉnh sửa", en: "Edit" })}</p>
                    <h3 className="portal-section-heading__title">
                      {locale === "vi" ? selectedEvent.title_vi : selectedEvent.title_en}
                    </h3>
                  </div>
                  <div className="admin-events__toggles">
                    <button
                      className={`admin-events__toggle-btn${selectedEvent.is_published ? " admin-events__toggle-btn--on" : ""}`}
                      disabled={toggling}
                      onClick={handleTogglePublished}
                      type="button"
                    >
                      <span className="admin-events__toggle-dot" />
                      {selectedEvent.is_published
                        ? localize(locale, { vi: "Hiển thị", en: "Visible" })
                        : localize(locale, { vi: "Đang ẩn", en: "Hidden" })}
                    </button>
                    <button
                      className={`admin-events__toggle-btn${selectedEvent.show_detail_link ? " admin-events__toggle-btn--on" : ""}`}
                      disabled={togglingDetail}
                      onClick={handleToggleDetailLink}
                      type="button"
                    >
                      <span className="admin-events__toggle-dot" />
                      {selectedEvent.show_detail_link
                        ? localize(locale, { vi: "Có nút chi tiết", en: "Detail link on" })
                        : localize(locale, { vi: "Ẩn nút chi tiết", en: "Detail link off" })}
                    </button>
                  </div>
                </div>

                <form action={updateEventAction} className="portal-form admin-events__form">
                  <input name="id" type="hidden" value={selectedEvent.id} />
                  <div className="portal-form__group">
                    <label className="portal-form__label">{localize(locale, { vi: "Tiêu đề (VI)", en: "Title (VI)" })}</label>
                    <input className="portal-form__input" defaultValue={selectedEvent.title_vi} name="titleVi" required type="text" />
                  </div>
                  <div className="portal-form__group">
                    <label className="portal-form__label">{localize(locale, { vi: "Tiêu đề (EN)", en: "Title (EN)" })}</label>
                    <input className="portal-form__input" defaultValue={selectedEvent.title_en} name="titleEn" required type="text" />
                  </div>
                  <div className="portal-form__group">
                    <label className="portal-form__label">Slug</label>
                    <input className="portal-form__input" defaultValue={selectedEvent.slug} name="slug" required type="text" />
                  </div>
                  <div className="portal-form__group">
                    <label className="portal-form__label">{localize(locale, { vi: "Ngày sự kiện", en: "Event date" })}</label>
                    <input className="portal-form__input" defaultValue={selectedEvent.event_date ?? ""} name="eventDate" type="date" />
                  </div>
                  <div className="portal-form__group">
                    <label className="portal-form__label">{localize(locale, { vi: "Nội dung (VI)", en: "Content (VI)" })}</label>
                    <textarea className="portal-form__input" defaultValue={selectedEvent.description_vi} name="descriptionVi" rows={5} />
                  </div>
                  <div className="portal-form__group">
                    <label className="portal-form__label">{localize(locale, { vi: "Nội dung (EN)", en: "Content (EN)" })}</label>
                    <textarea className="portal-form__input" defaultValue={selectedEvent.description_en} name="descriptionEn" rows={5} />
                  </div>
                  <div className="portal-form__group">
                    <label className="portal-form__label">{localize(locale, { vi: "Thứ tự hiển thị", en: "Sort order" })}</label>
                    <input className="portal-form__input" defaultValue={selectedEvent.sort_order} name="sortOrder" type="number" />
                  </div>
                  <input name="isPublished" type="hidden" value={selectedEvent.is_published ? "1" : ""} />
                  <input name="showDetailLink" type="hidden" value={selectedEvent.show_detail_link ? "1" : ""} />
                  <div className="portal-form__actions">
                    <PortalSubmitButton>
                      {localize(locale, { vi: "Lưu thay đổi", en: "Save changes" })}
                    </PortalSubmitButton>
                  </div>
                </form>
              </PortalCard>

              {/* Cover image */}
              <PortalCard tone="soft">
                <p className="portal-panel__eyebrow">{localize(locale, { vi: "Ảnh bìa", en: "Cover image" })}</p>
                <h3 className="portal-section-heading__title">{localize(locale, { vi: "Ảnh đại diện sự kiện", en: "Event cover photo" })}</h3>

                {selectedEvent.cover_image_path ? (
                  <div className="admin-events__cover-preview">
                    <Image
                      alt={locale === "vi" ? selectedEvent.title_vi : selectedEvent.title_en}
                      fill
                      sizes="400px"
                      src={selectedEvent.cover_image_path}
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                ) : (
                  <div className="admin-events__cover-empty">
                    {localize(locale, { vi: "Chưa có ảnh bìa", en: "No cover image yet" })}
                  </div>
                )}

                <div className="admin-events__upload">
                  <input
                    accept="image/*"
                    disabled={coverUploading}
                    onChange={handleCoverUpload}
                    ref={coverInputRef}
                    style={{ display: "none" }}
                    type="file"
                  />
                  <button
                    className="btn btn--outline"
                    disabled={coverUploading}
                    onClick={() => coverInputRef.current?.click()}
                    type="button"
                  >
                    {coverUploading
                      ? localize(locale, { vi: "Đang tải...", en: "Uploading..." })
                      : selectedEvent.cover_image_path
                        ? localize(locale, { vi: "Đổi ảnh bìa", en: "Change cover" })
                        : localize(locale, { vi: "Tải ảnh bìa", en: "Upload cover" })}
                  </button>
                </div>
              </PortalCard>

              {/* Gallery images */}
              <PortalCard tone="soft">
                <p className="portal-panel__eyebrow">{localize(locale, { vi: "Thư viện ảnh", en: "Gallery" })}</p>
                <h3 className="portal-section-heading__title">{localize(locale, { vi: "Ảnh sự kiện", en: "Event images" })}</h3>

                {selectedEvent.images.length > 0 ? (
                  <div className="admin-events__images-grid">
                    {selectedEvent.images.map((img) => {
                      const caption = locale === "vi" ? img.caption_vi : img.caption_en;

                      return (
                        <div className="admin-events__image-item" key={img.id}>
                          <div className="admin-events__image-preview">
                            <Image alt={caption || ""} fill sizes="160px" src={img.image_path} style={{ objectFit: "cover" }} />
                          </div>
                          {caption ? <p className="admin-events__image-caption">{caption}</p> : null}
                          <button
                            className="admin-events__image-delete"
                            onClick={() => handleDeleteImage(img.id)}
                            title={localize(locale, { vi: "Xóa ảnh", en: "Delete image" })}
                            type="button"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="admin-events__images-empty">
                    {localize(locale, { vi: "Chưa có ảnh nào.", en: "No images yet." })}
                  </p>
                )}

                <div className="admin-events__upload">
                  <input
                    accept="image/*"
                    disabled={uploading}
                    onChange={handleImageUpload}
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    type="file"
                  />
                  <button
                    className="btn btn--outline"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                    type="button"
                  >
                    {uploading
                      ? localize(locale, { vi: "Đang tải...", en: "Uploading..." })
                      : localize(locale, { vi: "+ Thêm ảnh", en: "+ Add image" })}
                  </button>
                </div>
              </PortalCard>

              {/* Danger zone */}
              <PortalCard tone="soft">
                <p className="portal-panel__eyebrow">{localize(locale, { vi: "Thao tác nguy hiểm", en: "Danger zone" })}</p>
                {deleteConfirmId === selectedEvent.id ? (
                  <div className="admin-events__delete-confirm">
                    <p>{localize(locale, { vi: "Xác nhận xóa sự kiện này?", en: "Confirm delete this event?" })}</p>
                    <div className="portal-form__actions">
                      <button className="btn btn--danger" onClick={handleDeleteEvent} type="button">
                        {localize(locale, { vi: "Xóa", en: "Delete" })}
                      </button>
                      <button className="btn btn--ghost" onClick={() => setDeleteConfirmId(null)} type="button">
                        {localize(locale, { vi: "Hủy", en: "Cancel" })}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className="btn btn--danger-outline"
                    onClick={() => setDeleteConfirmId(selectedEvent.id)}
                    type="button"
                  >
                    {localize(locale, { vi: "Xóa sự kiện", en: "Delete event" })}
                  </button>
                )}
              </PortalCard>
            </>
          ) : (
            <PortalCard tone="soft">
              <p className="portal-description">
                {localize(locale, { vi: "Chọn một sự kiện để chỉnh sửa hoặc tạo mới.", en: "Select an event to edit or create a new one." })}
              </p>
            </PortalCard>
          )}
        </div>
      </div>
    </div>
  );
}
