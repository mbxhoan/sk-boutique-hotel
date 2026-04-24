"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { PortalBadge, PortalCard, PortalSectionHeading } from "@/components/portal-ui";
import { resolveMediaSource } from "@/lib/media/library";
import type { Locale } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";
import { formatAreaText } from "@/lib/supabase/content";
import type { RoomTypeRow } from "@/lib/supabase/database.types";
import { saveRoomTypeAction } from "@/app/(admin)/admin/room-types/actions";

type AdminRoomTypesManagerProps = {
  locale: Locale;
  roomTypes: RoomTypeRow[];
};

const previewFallbacks: Record<string, string> = {
  "family-room": "/assets/room_types/family/1.png",
  "quadruple-room": "/assets/room_types/quadruple/1.png",
  "superior-room": "/assets/room_types/superior/1.png"
};

function formatMoney(value: number | null | undefined) {
  if (value == null) {
    return "-";
  }

  return `${new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0
  }).format(value)}đ`;
}

function joinLines(values: string[]) {
  return values.join("\n");
}

function splitLines(value: string | null | undefined) {
  return (value ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function previewImageFor(roomType: RoomTypeRow) {
  const rawPath = roomType.cover_image_path || previewFallbacks[roomType.slug] || "/home/pool3.jpg";
  return resolveMediaSource(rawPath, {}) || "/home/pool3.jpg";
}

export function AdminRoomTypesManager({ locale, roomTypes }: AdminRoomTypesManagerProps) {
  const [selectedSlug, setSelectedSlug] = useState(roomTypes[0]?.slug ?? "");

  useEffect(() => {
    if (!roomTypes.some((roomType) => roomType.slug === selectedSlug)) {
      setSelectedSlug(roomTypes[0]?.slug ?? "");
    }
  }, [roomTypes, selectedSlug]);

  const selectedRoomType = roomTypes.find((roomType) => roomType.slug === selectedSlug) ?? roomTypes[0] ?? null;

  if (!selectedRoomType) {
    return (
      <div className="portal-content admin-room-types">
        <PortalCard tone="soft">
          <p className="portal-description">
            {localize(locale, {
              vi: "Chưa có dữ liệu hạng phòng để chỉnh sửa.",
              en: "There are no room types available to edit yet."
            })}
          </p>
        </PortalCard>
      </div>
    );
  }

  const roomTypeTitle = localize(locale, { vi: selectedRoomType.name_vi, en: selectedRoomType.name_en });
  const roomTypeDescription = localize(locale, {
    vi: selectedRoomType.summary_vi || selectedRoomType.description_vi || selectedRoomType.story_vi,
    en: selectedRoomType.summary_en || selectedRoomType.description_en || selectedRoomType.story_en
  });
  const publicPrice = selectedRoomType.manual_override_price ?? selectedRoomType.base_price;

  return (
    <div className="portal-content admin-room-types">
      <PortalSectionHeading
        description={{
          vi: "Quản lý toàn bộ nội dung, hình ảnh, tiện ích, giá và SEO của hạng phòng hiển thị trên web.",
          en: "Manage the room-type content, imagery, amenities, pricing, and SEO shown on the website."
        }}
        eyebrow={{
          vi: "Hạng phòng",
          en: "Room types"
        }}
        locale={locale}
        title={{
          vi: "Nội dung hạng phòng",
          en: "Room type CMS"
        }}
      />

      <div className="admin-room-types__layout">
        <PortalCard className="admin-room-types__sidebar" tone="soft">
          <div className="admin-room-types__sidebar-head">
            <div>
              <p className="portal-panel__eyebrow">{localize(locale, { vi: "Danh sách", en: "List" })}</p>
              <h2 className="portal-section-heading__title">{localize(locale, { vi: "Chọn hạng phòng", en: "Select a room type" })}</h2>
            </div>
            <PortalBadge tone="accent">{roomTypes.length}</PortalBadge>
          </div>

          <div className="admin-room-types__list">
            {roomTypes.map((roomType) => {
              const active = roomType.slug === selectedRoomType.slug;
              const roomPrice = roomType.manual_override_price ?? roomType.base_price;

              return (
                <button
                  aria-pressed={active}
                  className={`admin-room-types__room-card${active ? " admin-room-types__room-card--active" : ""}`}
                  key={roomType.id}
                  onClick={() => setSelectedSlug(roomType.slug)}
                  type="button"
                >
                  <div className="admin-room-types__room-card-top">
                    <strong className="admin-room-types__room-code">{roomType.code}</strong>
                    <PortalBadge tone={roomType.is_active ? "accent" : "neutral"}>
                      {roomType.is_active ? localize(locale, { vi: "Active", en: "Active" }) : localize(locale, { vi: "Ẩn", en: "Hidden" })}
                    </PortalBadge>
                  </div>
                  <p className="admin-room-types__room-title">{localize(locale, { vi: roomType.name_vi, en: roomType.name_en })}</p>
                  <p className="admin-room-types__room-meta">
                    {formatAreaText(roomType.size_sqm)?.[locale] ?? "-"} · {roomType.occupancy_adults + roomType.occupancy_children}{" "}
                    {locale === "en" ? "guests" : "khách"}
                  </p>
                  <div className="admin-room-types__room-footer">
                    <span>{roomType.slug}</span>
                    <strong>{formatMoney(roomPrice)}</strong>
                  </div>
                </button>
              );
            })}
          </div>
        </PortalCard>

        <div className="admin-room-types__editor-stack">
          <PortalCard className="admin-room-types__hero" tone="default">
            <div className="admin-room-types__hero-copy">
              <p className="portal-panel__eyebrow">{selectedRoomType.code}</p>
              <h2 className="admin-room-types__hero-title">{roomTypeTitle}</h2>
              <p className="admin-room-types__hero-description">{roomTypeDescription}</p>
            </div>

            <div className="admin-room-types__hero-actions">
              <PortalBadge tone={selectedRoomType.is_active ? "accent" : "neutral"}>
                {selectedRoomType.is_active ? localize(locale, { vi: "Đang hoạt động", en: "Active" }) : localize(locale, { vi: "Tạm ẩn", en: "Hidden" })}
              </PortalBadge>
              <button className="button button--solid" form="room-type-form" type="submit">
                {localize(locale, { vi: "Lưu thay đổi", en: "Save changes" })}
              </button>
            </div>
          </PortalCard>

          <form className="admin-room-types__form" action={saveRoomTypeAction} id="room-type-form">
            <input name="id" type="hidden" value={selectedRoomType.id} />

            <div className="admin-room-types__form-grid">
              <div className="admin-room-types__column admin-room-types__column--main">
                <PortalCard className="admin-room-types__card" tone="default">
                  <div className="admin-room-types__card-head">
                    <div>
                      <p className="portal-panel__eyebrow">{localize(locale, { vi: "Tổng quan", en: "Overview" })}</p>
                      <h3 className="admin-room-types__card-title">{localize(locale, { vi: "General Info", en: "General Info" })}</h3>
                      <p className="admin-room-types__card-copy">
                        {localize(locale, {
                          vi: "Tên, mã, mô tả ngắn và các thông số chính của hạng phòng.",
                          en: "Name, code, short copy, and the main room-type details."
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="admin-room-types__grid admin-room-types__grid--two">
                    <label className="portal-field">
                      <span className="portal-field__label">{localize(locale, { vi: "Tên VI", en: "Name VI" })}</span>
                      <input className="portal-field__control" defaultValue={selectedRoomType.name_vi} name="nameVi" />
                    </label>
                    <label className="portal-field">
                      <span className="portal-field__label">{localize(locale, { vi: "Tên EN", en: "Name EN" })}</span>
                      <input className="portal-field__control" defaultValue={selectedRoomType.name_en} name="nameEn" />
                    </label>
                  </div>

                  <div className="admin-room-types__grid admin-room-types__grid--three">
                    <label className="portal-field">
                      <span className="portal-field__label">{localize(locale, { vi: "Mã", en: "Code" })}</span>
                      <input className="portal-field__control" defaultValue={selectedRoomType.code} name="code" />
                    </label>
                    <label className="portal-field">
                      <span className="portal-field__label">{localize(locale, { vi: "Slug", en: "Slug" })}</span>
                      <input className="portal-field__control" defaultValue={selectedRoomType.slug} name="slug" />
                    </label>
                    <label className="portal-field">
                      <span className="portal-field__label">{localize(locale, { vi: "Thứ tự", en: "Sort order" })}</span>
                      <input className="portal-field__control" defaultValue={selectedRoomType.sort_order} name="sortOrder" type="number" />
                    </label>
                  </div>

                  <div className="admin-room-types__grid admin-room-types__grid--two">
                    <label className="portal-field">
                      <span className="portal-field__label">{localize(locale, { vi: "Mô tả VI", en: "Description VI" })}</span>
                      <textarea className="portal-field__control" defaultValue={selectedRoomType.description_vi} name="descriptionVi" rows={4} />
                    </label>
                    <label className="portal-field">
                      <span className="portal-field__label">{localize(locale, { vi: "Mô tả EN", en: "Description EN" })}</span>
                      <textarea className="portal-field__control" defaultValue={selectedRoomType.description_en} name="descriptionEn" rows={4} />
                    </label>
                  </div>

                  <div className="admin-room-types__grid admin-room-types__grid--three">
                    <label className="portal-field">
                      <span className="portal-field__label">{localize(locale, { vi: "Khách lớn", en: "Adults" })}</span>
                      <input className="portal-field__control" defaultValue={selectedRoomType.occupancy_adults} name="occupancyAdults" type="number" />
                    </label>
                    <label className="portal-field">
                      <span className="portal-field__label">{localize(locale, { vi: "Trẻ em", en: "Children" })}</span>
                      <input className="portal-field__control" defaultValue={selectedRoomType.occupancy_children} name="occupancyChildren" type="number" />
                    </label>
                    <label className="portal-field">
                      <span className="portal-field__label">{localize(locale, { vi: "Diện tích m²", en: "Area sqm" })}</span>
                      <input className="portal-field__control" defaultValue={selectedRoomType.size_sqm ?? ""} name="sizeSqm" step="0.01" type="number" />
                    </label>
                  </div>

                  <div className="admin-room-types__grid admin-room-types__grid--two">
                    <label className="portal-field">
                      <span className="portal-field__label">{localize(locale, { vi: "Loại giường", en: "Bed type" })}</span>
                      <input className="portal-field__control" defaultValue={selectedRoomType.bed_type} name="bedType" />
                    </label>
                    <PortalCard tone="soft">
                      <p className="portal-panel__eyebrow">{localize(locale, { vi: "Public", en: "Public" })}</p>
                      <p className="portal-description">
                        {localize(locale, {
                          vi: "Các trường này đổ trực tiếp ra hạng phòng trên website public.",
                          en: "These fields feed the public room-type pages directly."
                        })}
                      </p>
                    </PortalCard>
                  </div>
                </PortalCard>

                <PortalCard className="admin-room-types__card" tone="default">
                  <div className="admin-room-types__card-head">
                    <div>
                      <p className="portal-panel__eyebrow">{localize(locale, { vi: "Nội dung", en: "Content" })}</p>
                      <h3 className="admin-room-types__card-title">{localize(locale, { vi: "Story & summary", en: "Story & summary" })}</h3>
                      <p className="admin-room-types__card-copy">
                        {localize(locale, {
                          vi: "Nội dung dài cho room detail, được dùng cho SEO và phần giới thiệu.",
                          en: "Long-form copy for room detail, SEO, and the room introduction."
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="admin-room-types__grid admin-room-types__grid--two">
                    <label className="portal-field">
                      <span className="portal-field__label">{localize(locale, { vi: "Tóm tắt VI", en: "Summary VI" })}</span>
                      <textarea className="portal-field__control" defaultValue={selectedRoomType.summary_vi} name="summaryVi" rows={3} />
                    </label>
                    <label className="portal-field">
                      <span className="portal-field__label">{localize(locale, { vi: "Tóm tắt EN", en: "Summary EN" })}</span>
                      <textarea className="portal-field__control" defaultValue={selectedRoomType.summary_en} name="summaryEn" rows={3} />
                    </label>
                  </div>

                  <div className="admin-room-types__grid admin-room-types__grid--two">
                    <label className="portal-field">
                      <span className="portal-field__label">{localize(locale, { vi: "Story VI", en: "Story VI" })}</span>
                      <textarea className="portal-field__control" defaultValue={selectedRoomType.story_vi} name="storyVi" rows={6} />
                    </label>
                    <label className="portal-field">
                      <span className="portal-field__label">{localize(locale, { vi: "Story EN", en: "Story EN" })}</span>
                      <textarea className="portal-field__control" defaultValue={selectedRoomType.story_en} name="storyEn" rows={6} />
                    </label>
                  </div>
                </PortalCard>

                <PortalCard className="admin-room-types__card" tone="soft">
                  <div className="admin-room-types__card-head">
                    <div>
                      <p className="portal-panel__eyebrow">{localize(locale, { vi: "Tiện ích", en: "Amenities" })}</p>
                      <h3 className="admin-room-types__card-title">{localize(locale, { vi: "Highlights", en: "Highlights" })}</h3>
                      <p className="admin-room-types__card-copy">
                        {localize(locale, {
                          vi: "Danh sách điểm nhấn hiển thị ở website công khai.",
                          en: "Highlights shown across the public room pages."
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="admin-room-types__grid admin-room-types__grid--two">
                    <label className="portal-field">
                      <span className="portal-field__label">{localize(locale, { vi: "Highlights VI", en: "Highlights VI" })}</span>
                      <textarea className="portal-field__control" defaultValue={joinLines(selectedRoomType.highlights_vi)} name="highlightsVi" rows={8} />
                    </label>
                    <label className="portal-field">
                      <span className="portal-field__label">{localize(locale, { vi: "Highlights EN", en: "Highlights EN" })}</span>
                      <textarea className="portal-field__control" defaultValue={joinLines(selectedRoomType.highlights_en)} name="highlightsEn" rows={8} />
                    </label>
                  </div>
                </PortalCard>

                <PortalCard className="admin-room-types__card" tone="soft">
                  <div className="admin-room-types__card-head">
                    <div>
                      <p className="portal-panel__eyebrow">SEO</p>
                      <h3 className="admin-room-types__card-title">{localize(locale, { vi: "Metadata public", en: "Public metadata" })}</h3>
                      <p className="admin-room-types__card-copy">
                        {localize(locale, {
                          vi: "Dùng cho title/description của trang hạng phòng.",
                          en: "Used for the room-type page title and description."
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="admin-room-types__grid admin-room-types__grid--two">
                    <label className="portal-field">
                      <span className="portal-field__label">{localize(locale, { vi: "SEO title VI", en: "SEO title VI" })}</span>
                      <input className="portal-field__control" defaultValue={selectedRoomType.seo_title_vi} name="seoTitleVi" />
                    </label>
                    <label className="portal-field">
                      <span className="portal-field__label">{localize(locale, { vi: "SEO title EN", en: "SEO title EN" })}</span>
                      <input className="portal-field__control" defaultValue={selectedRoomType.seo_title_en} name="seoTitleEn" />
                    </label>
                  </div>

                  <div className="admin-room-types__grid admin-room-types__grid--two">
                    <label className="portal-field">
                      <span className="portal-field__label">{localize(locale, { vi: "SEO description VI", en: "SEO description VI" })}</span>
                      <textarea className="portal-field__control" defaultValue={selectedRoomType.seo_description_vi} name="seoDescriptionVi" rows={4} />
                    </label>
                    <label className="portal-field">
                      <span className="portal-field__label">{localize(locale, { vi: "SEO description EN", en: "SEO description EN" })}</span>
                      <textarea className="portal-field__control" defaultValue={selectedRoomType.seo_description_en} name="seoDescriptionEn" rows={4} />
                    </label>
                  </div>
                </PortalCard>
              </div>

              <div className="admin-room-types__column admin-room-types__column--side">
                <PortalCard className="admin-room-types__card" tone="soft">
                  <div className="admin-room-types__card-head">
                    <div>
                      <p className="portal-panel__eyebrow">{localize(locale, { vi: "Giá", en: "Pricing" })}</p>
                      <h3 className="admin-room-types__card-title">{localize(locale, { vi: "Pricing & Availability", en: "Pricing & Availability" })}</h3>
                      <p className="admin-room-types__card-copy">
                        {localize(locale, {
                          vi: "Giá cơ bản, override và trạng thái public của hạng phòng.",
                          en: "Base price, overrides, and the room-type public state."
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="admin-room-types__grid admin-room-types__grid--three">
                    <label className="portal-field">
                      <span className="portal-field__label">{localize(locale, { vi: "Giá gốc", en: "Base price" })}</span>
                      <input className="portal-field__control" defaultValue={selectedRoomType.base_price} name="basePrice" step="0.01" type="number" />
                    </label>
                    <label className="portal-field">
                      <span className="portal-field__label">{localize(locale, { vi: "Override", en: "Manual override" })}</span>
                      <input className="portal-field__control" defaultValue={selectedRoomType.manual_override_price ?? ""} name="manualOverridePrice" step="0.01" type="number" />
                    </label>
                    <label className="portal-field">
                      <span className="portal-field__label">{localize(locale, { vi: "Phụ phí cuối tuần", en: "Weekend surcharge" })}</span>
                      <input className="portal-field__control" defaultValue={selectedRoomType.weekend_surcharge} name="weekendSurcharge" step="0.01" type="number" />
                    </label>
                  </div>

                  <div className="admin-room-types__grid admin-room-types__grid--three">
                    <label className="portal-field admin-room-types__switch">
                      <span className="portal-field__label">{localize(locale, { vi: "Hiện giá public", en: "Show public price" })}</span>
                      <input className="portal-field__checkbox" defaultChecked={selectedRoomType.show_public_price} name="showPublicPrice" type="checkbox" />
                    </label>
                    <label className="portal-field admin-room-types__switch">
                      <span className="portal-field__label">{localize(locale, { vi: "Kích hoạt", en: "Active" })}</span>
                      <input className="portal-field__checkbox" defaultChecked={selectedRoomType.is_active} name="isActive" type="checkbox" />
                    </label>
                    <label className="portal-field">
                      <span className="portal-field__label">{localize(locale, { vi: "Thứ tự", en: "Sort order" })}</span>
                      <input className="portal-field__control" defaultValue={selectedRoomType.sort_order} name="sortOrder" type="number" />
                    </label>
                  </div>

                  <div className="admin-room-types__card-copy">
                    {localize(locale, {
                      vi: selectedRoomType.show_public_price
                        ? `Giá public hiện tại: ${formatMoney(publicPrice)}`
                        : "Giá public đang bị ẩn, chỉ hiển thị CTA.",
                      en: selectedRoomType.show_public_price
                        ? `Current public price: ${formatMoney(publicPrice)}`
                        : "Public pricing is hidden and the CTA-only mode is active."
                    })}
                  </div>
                </PortalCard>

                <PortalCard className="admin-room-types__image-card" tone="soft">
                  <div className="admin-room-types__card-head">
                    <div>
                      <p className="portal-panel__eyebrow">{localize(locale, { vi: "Hình ảnh", en: "Image" })}</p>
                      <h3 className="admin-room-types__card-title">{localize(locale, { vi: "Primary Image", en: "Primary Image" })}</h3>
                      <p className="admin-room-types__card-copy">
                        {localize(locale, {
                          vi: "Ảnh cover hiển thị trên web và cards liên quan.",
                          en: "The cover image used across public pages and related cards."
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="admin-room-types__image-preview">
                    <Image
                      alt={roomTypeTitle}
                      className="admin-room-types__image"
                      fill
                      sizes="(max-width: 1080px) 100vw, 30vw"
                      src={previewImageFor(selectedRoomType)}
                    />
                  </div>

                  <div className="admin-room-types__image-meta">
                    <p className="admin-room-types__image-title">{roomTypeTitle}</p>
                    <p className="admin-room-types__image-copy">{selectedRoomType.cover_image_path || previewImageFor(selectedRoomType)}</p>
                  </div>

                  <label className="portal-field">
                    <span className="portal-field__label">{localize(locale, { vi: "Đường dẫn ảnh", en: "Image path" })}</span>
                    <input
                      className="portal-field__control"
                      defaultValue={selectedRoomType.cover_image_path ?? ""}
                      name="coverImagePath"
                      placeholder="/assets/room_types/superior/1.png"
                    />
                  </label>

                  <PortalCard tone="soft">
                    <p className="portal-panel__eyebrow">{localize(locale, { vi: "Gợi ý", en: "Hint" })}</p>
                    <p className="portal-description">
                      {localize(locale, {
                        vi: "Dùng đường dẫn ảnh public hoặc chọn asset từ thư viện media.",
                        en: "Use a public image path or choose an asset from the media library."
                      })}
                    </p>
                  </PortalCard>
                </PortalCard>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
