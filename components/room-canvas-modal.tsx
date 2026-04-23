"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import type { Locale } from "@/lib/locale";
import { formatRoomCurrency, type RoomCatalogEntry } from "@/lib/rooms/catalog";
import { RoomBookingRequestForm } from "@/components/room-booking-request-form";

type RoomCanvasModalProps = {
  locale: Locale;
  bookingContext: {
    branchId: string;
    guestCount: number;
    stayEndAt: string;
    stayStartAt: string;
  };
  onClose: () => void;
  open: boolean;
  room: RoomCatalogEntry | null;
};

function CloseIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 18 18" width="18">
      <path d="M4.5 4.5L13.5 13.5M13.5 4.5L4.5 13.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
    </svg>
  );
}

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg aria-hidden="true" fill="none" height="20" viewBox="0 0 20 20" width="20">
      <path
        d={direction === "left" ? "M12.5 4.75L7.25 10L12.5 15.25" : "M7.5 4.75L12.75 10L7.5 15.25"}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function RadioIcon({ checked }: { checked?: boolean }) {
  return (
    <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 18 18" width="18">
      <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.4" />
      {checked ? <circle cx="9" cy="9" fill="currentColor" r="3.2" /> : null}
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="16" viewBox="0 0 16 16" width="16">
      <path d="M12.5 4.75L6.75 11.25L3.5 8.25" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function roomAmenities(locale: Locale) {
  return locale === "en"
    ? [
        "Alarm clock",
        "Safe",
        "Coffee / tea maker",
        "Hair dryer",
        "Minibar",
        "Flat-screen TV",
        "Fridge",
        "Wi-Fi"
      ]
    : [
        "Đồng hồ báo thức",
        "Két an toàn",
        "Máy pha trà/cà phê",
        "Máy sấy tóc",
        "Minibar",
        "TV màn hình phẳng",
        "Tủ lạnh",
        "Wi-Fi"
      ];
}

export function RoomCanvasModal({ bookingContext, locale, onClose, open, room }: RoomCanvasModalProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [breakfastIndex, setBreakfastIndex] = useState(0);
  const [cancellationIndex, setCancellationIndex] = useState(0);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [imageZoomOpen, setImageZoomOpen] = useState(false);
  const bookingPanelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open || !room) {
      return;
    }

    setActiveImageIndex(0);
    const breakfastSelected = room.breakfastOptions.findIndex((option) => option.selected);
    const cancellationSelected = room.cancellationOptions.findIndex((option) => option.selected);

    setBreakfastIndex(breakfastSelected >= 0 ? breakfastSelected : 0);
    setCancellationIndex(cancellationSelected >= 0 ? cancellationSelected : 0);
    setBookingOpen(false);
    setImageZoomOpen(false);
  }, [open, room]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onEscape = (event: KeyboardEvent) => {
      const galleryLength = room?.gallery.length ?? 0;

      if (event.key === "Escape") {
        if (imageZoomOpen) {
          setImageZoomOpen(false);
          return;
        }

        onClose();
        return;
      }

      if (!imageZoomOpen || galleryLength < 2) {
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setActiveImageIndex((current) => (current - 1 + galleryLength) % galleryLength);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        setActiveImageIndex((current) => (current + 1) % galleryLength);
      }
    };

    window.addEventListener("keydown", onEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onEscape);
    };
  }, [imageZoomOpen, onClose, open, room]);

  useEffect(() => {
    if (!bookingOpen) {
      return;
    }

    bookingPanelRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }, [bookingOpen]);

  if (!open || !room) {
    return null;
  }

  const breakfastOption = room.breakfastOptions[breakfastIndex] ?? room.breakfastOptions[0];
  const cancellationOption = room.cancellationOptions[cancellationIndex] ?? room.cancellationOptions[0];
  const basePrice = room.currentPrice ?? 0;
  const totalPrice = room.priceVisible ? basePrice + breakfastOption.delta + cancellationOption.delta : null;
  const originalPrice = room.originalPrice;
  const currentImage = room.gallery[activeImageIndex] ?? room.gallery[0];
  const isSoldOut = room.availableRooms <= 0;
  const canNavigateGallery = room.gallery.length > 1;

  return (
    <div className="room-canvas" role="presentation">
      <button aria-label={locale === "en" ? "Close room canvas" : "Đóng popup phòng"} className="room-canvas__backdrop" onClick={onClose} type="button" />

      <section
        aria-label={locale === "en" ? "Room details" : "Chi tiết phòng"}
        aria-modal="true"
        className="room-canvas__dialog"
        role="dialog"
      >
        <div className="room-canvas__head">
          <span className="room-canvas__head-spacer" aria-hidden="true" />
          <h3 className="room-canvas__head-title">{room.title[locale]}</h3>
          <button aria-label={locale === "en" ? "Close" : "Đóng"} className="room-canvas__close" onClick={onClose} type="button">
            <CloseIcon />
          </button>
        </div>

        <div className="room-canvas__media">
          <button
            aria-label={locale === "en" ? "Open enlarged photo" : "Phóng to ảnh"}
            className="room-canvas__media-zoom-trigger"
            onClick={() => setImageZoomOpen(true)}
            type="button"
          >
            <Image
              alt={room.title[locale]}
              className="room-canvas__image"
              fill
              quality={90}
              priority
              sizes="(max-width: 960px) 100vw, 900px"
              src={currentImage}
            />
          </button>

          <button
            aria-label={locale === "en" ? "Previous photo" : "Ảnh trước"}
            className="room-canvas__media-nav room-canvas__media-nav--prev"
            onClick={() => setActiveImageIndex((current) => (current - 1 + room.gallery.length) % room.gallery.length)}
            type="button"
          >
            <ArrowIcon direction="left" />
          </button>

          <button
            aria-label={locale === "en" ? "Next photo" : "Ảnh tiếp theo"}
            className="room-canvas__media-nav room-canvas__media-nav--next"
            onClick={() => setActiveImageIndex((current) => (current + 1) % room.gallery.length)}
            type="button"
          >
            <ArrowIcon direction="right" />
          </button>

          <span className="room-canvas__badge">{`${activeImageIndex + 1}/${room.gallery.length}`}</span>
        </div>

        <div className="room-canvas__thumbs" aria-label={locale === "en" ? "Gallery thumbnails" : "Ảnh thu nhỏ"}>
          {room.gallery.map((image, index) => (
            <button
              aria-label={locale === "en" ? `Select photo ${index + 1}` : `Chọn ảnh ${index + 1}`}
              className={`room-canvas__thumb${index === activeImageIndex ? " room-canvas__thumb--active" : ""}`}
              key={`${room.slug}-${image}-${index}`}
              onClick={() => setActiveImageIndex(index)}
              type="button"
            >
              <Image alt="" aria-hidden="true" className="room-canvas__thumb-image" fill sizes="96px" src={image} />
            </button>
          ))}
        </div>

        <div className="room-canvas__body">
          <div className="room-canvas__intro">
            <div className="room-canvas__intro-copy">
              <h3 className="room-canvas__room-title">{room.title[locale]}</h3>
              <p className="room-canvas__room-summary">
                {room.summary[locale]}
                <span className="room-canvas__room-fact">
                  {room.sizeLabel ? ` • ${room.sizeLabel[locale]}` : ""}
                </span>
              </p>
            </div>

            {room.highlights.length ? (
              <div className="room-canvas__chips">
                {room.highlights.slice(0, 4).map((highlight) => (
                  <span className="room-canvas__chip" key={highlight.vi}>
                    {highlight[locale]}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div className="room-canvas__facts">
            {room.metaFacts.map((fact) => (
              <div className="room-canvas__fact" key={fact.label.vi}>
                <span className="room-canvas__fact-label">{fact.label[locale]}</span>
                <strong className="room-canvas__fact-value">{fact.value[locale]}</strong>
              </div>
            ))}
          </div>

          <div className="room-canvas__amenities">
            <h4 className="room-canvas__section-title">{locale === "en" ? "Room amenities" : "Tiện nghi phòng"}</h4>

            <div className="room-canvas__amenity-badges">
              {roomAmenities(locale).slice(0, 4).map((amenity) => (
                <span className="room-canvas__amenity-badge" key={amenity}>
                  {amenity}
                </span>
              ))}
            </div>

            <div className="room-canvas__amenity-grid">
              {roomAmenities(locale).map((amenity) => (
                <div className="room-canvas__amenity" key={amenity}>
                  <span className="room-canvas__amenity-icon">
                    <CheckIcon />
                  </span>
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="room-canvas__options">
            <div className="room-canvas__option-group">
              <h4 className="room-canvas__section-title">{locale === "en" ? "Room options" : "Tùy chọn phòng"}</h4>
              <p className="room-canvas__section-subtitle">{locale === "en" ? "Meal choice" : "Lựa chọn bữa ăn"}</p>

              <div className="room-canvas__option-list">
                {room.breakfastOptions.map((option, index) => {
                  const isSelected = index === breakfastIndex;
                  const priceDelta = option.delta ? formatRoomCurrency(locale, option.delta) : null;

                  return (
                    <button
                      className={`room-canvas__option${isSelected ? " room-canvas__option--selected" : ""}`}
                      key={option.label.vi}
                      onClick={() => setBreakfastIndex(index)}
                      type="button"
                    >
                      <span className="room-canvas__option-copy">
                        <span className="room-canvas__option-radio">
                          <RadioIcon checked={isSelected} />
                        </span>
                        <span>
                          <strong>{option.label[locale]}</strong>
                          {option.note ? <span className="room-canvas__option-note">{option.note[locale]}</span> : null}
                        </span>
                      </span>

                      {priceDelta ? <span className="room-canvas__option-price">+{priceDelta}</span> : null}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="room-canvas__option-group">
              <p className="room-canvas__section-subtitle">{locale === "en" ? "Cancellation choice" : "Tùy chọn hủy bỏ"}</p>

              <div className="room-canvas__option-list">
                {room.cancellationOptions.map((option, index) => {
                  const isSelected = index === cancellationIndex;
                  const priceDelta = option.delta ? formatRoomCurrency(locale, option.delta) : null;

                  return (
                    <button
                      className={`room-canvas__option${isSelected ? " room-canvas__option--selected" : ""}`}
                      key={option.label.vi}
                      onClick={() => setCancellationIndex(index)}
                      type="button"
                    >
                      <span className="room-canvas__option-copy">
                        <span className="room-canvas__option-radio">
                          <RadioIcon checked={isSelected} />
                        </span>
                        <span>
                          <strong>{option.label[locale]}</strong>
                          {option.note ? <span className="room-canvas__option-note">{option.note[locale]}</span> : null}
                        </span>
                      </span>

                      {priceDelta ? <span className="room-canvas__option-price">+{priceDelta}</span> : null}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="room-canvas__footer">
            <div className="room-canvas__price-block">
              {room.priceVisible ? (
                <>
                  {originalPrice ? <span className="room-canvas__original-price">{formatRoomCurrency(locale, originalPrice)}</span> : null}
                  <div className="room-canvas__price-row">
                    <strong className="room-canvas__price">{formatRoomCurrency(locale, totalPrice)}</strong>
                    {room.discountPercent ? <span className="room-canvas__discount">-{room.discountPercent}%</span> : null}
                  </div>
                </>
              ) : (
                <div className="room-canvas__price-row">
                  <strong className="room-canvas__price">{locale === "en" ? "Price hidden" : "Ẩn giá công khai"}</strong>
                </div>
              )}
            </div>

            <div className="room-canvas__footer-actions">
              <p className="room-canvas__availability">{room.availabilityLabel[locale]}</p>
              <button
                className="button button--solid room-canvas__cta"
                disabled={isSoldOut}
                onClick={() => {
                  if (!isSoldOut) {
                    setBookingOpen(true);
                  }
                }}
                type="button"
              >
                {isSoldOut ? (locale === "en" ? "Sold out" : "Hết phòng") : locale === "en" ? "Book now" : "Đặt phòng"}
              </button>
            </div>
          </div>

          {bookingOpen ? (
            <div className="room-booking-panel" ref={bookingPanelRef}>
              <div className="room-booking-panel__head">
                <div>
                  <p className="room-booking-panel__eyebrow">{locale === "en" ? "Booking request" : "Yêu cầu đặt phòng"}</p>
                  <h4 className="room-booking-panel__title">
                    {locale === "en" ? "Leave your information" : "Nhập thông tin"}
                  </h4>
                  <p className="room-booking-panel__description">
                    {locale === "en"
                      ? "SK Boutique Hotel will get back to you as soon as possible."
                      : "SK Boutique Hotel sẽ phản hồi bạn trong thời gian sớm nhất."}
                  </p>
                </div>
                <button className="room-booking-panel__close" onClick={() => setBookingOpen(false)} type="button">
                  {locale === "en" ? "Hide" : "Ẩn"}
                </button>
              </div>

              <div className="room-booking-panel__summary">
                <span>{room.title[locale]}</span>
                <strong>{room.bookingCtaLabel[locale]}</strong>
              </div>

              <RoomBookingRequestForm
                branchId={bookingContext.branchId}
                availableRooms={room.availableRooms}
                guestCount={bookingContext.guestCount}
                locale={locale}
                roomTypeId={room.roomTypeId}
                stayEndAt={bookingContext.stayEndAt}
                stayStartAt={bookingContext.stayStartAt}
              />
            </div>
          ) : null}
        </div>
      </section>

        {imageZoomOpen ? (
          <div className="room-canvas__zoom" role="presentation">
            <button
              aria-label={locale === "en" ? "Close enlarged photo" : "Đóng chế độ phóng to"}
              className="room-canvas__zoom-backdrop"
            onClick={() => setImageZoomOpen(false)}
            type="button"
          />

          <section
            aria-label={locale === "en" ? "Enlarged photo viewer" : "Trình xem ảnh phóng to"}
            aria-modal="true"
            className="room-canvas__zoom-dialog"
            role="dialog"
            >
              <div className="room-canvas__zoom-head">
                <span className="room-canvas__zoom-title">{room.title[locale]}</span>
                <button
                  aria-label={locale === "en" ? "Close enlarged photo" : "Đóng chế độ phóng to"}
                  className="room-canvas__zoom-close"
                  onClick={() => setImageZoomOpen(false)}
                  type="button"
                >
                  <CloseIcon />
                </button>
              </div>

              <div className="room-canvas__zoom-media">
                {canNavigateGallery ? (
                  <>
                    <button
                      aria-label={locale === "en" ? "Previous enlarged photo" : "Ảnh phóng to trước"}
                      className="room-canvas__zoom-nav room-canvas__zoom-nav--prev"
                      onClick={() => setActiveImageIndex((current) => (current - 1 + room.gallery.length) % room.gallery.length)}
                      type="button"
                    >
                      <ArrowIcon direction="left" />
                    </button>

                    <button
                      aria-label={locale === "en" ? "Next enlarged photo" : "Ảnh phóng to tiếp theo"}
                      className="room-canvas__zoom-nav room-canvas__zoom-nav--next"
                      onClick={() => setActiveImageIndex((current) => (current + 1) % room.gallery.length)}
                      type="button"
                    >
                      <ArrowIcon direction="right" />
                    </button>
                  </>
                ) : null}

              <Image
                alt={room.title[locale]}
                className="room-canvas__zoom-image"
                fill
                quality={90}
                priority
                sizes="(max-width: 960px) 100vw, 92vw"
                src={currentImage}
              />
              </div>
            </section>
          </div>
        ) : null}
    </div>
  );
}
