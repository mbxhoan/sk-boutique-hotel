import Image from "next/image";

import { AboutCustomerCarousel } from "@/components/about-us-customer-carousel";
import { ButtonLink } from "@/components/sections";
import type { Locale } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";
import type { LocalizedText } from "@/lib/mock/i18n";

const text = (vi: string, en: string): LocalizedText => ({ vi, en });

export const aboutUsSeo = {
  title: text("Về chúng tôi", "About us"),
  description: text(
    "Trang giới thiệu rút gọn, ưu tiên ảnh khách hàng, nhịp không gian và những câu chữ ngắn để bạn thay sau này.",
    "A trimmed about page that prioritizes customer imagery, spatial rhythm, and short copy you can replace later."
  )
};

const customerImages = [
  "/customers/customers1.jpg",
  "/customers/customers2.jpg",
  "/customers/customers3.jpg",
  "/customers/customers4.jpg",
  "/customers/customers5.jpg",
  "/customers/customers6.jpg",
  "/customers/customers22.jpg"
] as const;

const aboutCopy = {
  hero: {
    eyebrow: text("ABOUT SK", "ABOUT SK"),
    title: text("Ở lại theo cách tinh tế hơn.", "Stay in a more refined way."),
    description: text(
      "Không gian boutique ấm áp, riêng tư và dễ chịu cho những kỳ nghỉ đáng nhớ.",
      "A warm, private boutique stay designed for memorable moments."
    ),
    bullets: [
      text("Không gian hiện đại, cảm giác gần gũi.", "Modern space, welcoming feel."),
      text("Vị trí thuận tiện để nghỉ ngơi và khám phá.", "A convenient place to rest and explore."),
    ],
    primaryCta: text("Khám phá phòng", "Explore rooms"),
    secondaryCta: text("Liên hệ", "Contact")
  },
  carousel: {
    eyebrow: text("KHÁCH HÀNG", "OUR GUESTS"),
    title: text("Một vài khung hình thật.", "A few real moments."),
    description: text(
      "Slider ảnh khách hàng để bạn thay bằng bộ ảnh thật sau này, không cần đổi cấu trúc trang.",
      "A guest-photo slider you can replace later without changing the page structure."
    )
  },
  gallery: {
    eyebrow: text("ẢNH KHÁCH HÀNG", "GUEST IMAGES"),
    title: text("Những khung hình đang nói thay nội dung.", "Images that carry the story for now."),
    description: text(
      "Tạm thời ưu tiên ảnh và khoảng thở; phần chữ bạn có thể thay sau khi nội dung đã chốt.",
      "Images and breathing room come first for now; you can replace the copy once the content is finalized."
    )
  }
} as const;

const galleryCards = [
  {
    eyebrow: text("KHUNG HÌNH 01", "FRAME 01"),
    title: text("Khoảnh khắc đầu tiên.", "The first moment."),
    description: text(
      "Ảnh placeholder từ thư mục /public/customers.",
      "Placeholder imagery from /public/customers."
    ),
    image: customerImages[1],
    imageAlt: text("Khách hàng trong một khoảnh khắc nhẹ nhàng", "A guest in a quiet, refined moment")
  },
  {
    eyebrow: text("KHUNG HÌNH 02", "FRAME 02"),
    title: text("Nhịp ở lại chậm hơn.", "A slower stay rhythm."),
    description: text(
      "Dùng để thay ảnh sảnh, phòng hoặc hoạt động lưu trú sau này.",
      "Use this for lobby, room, or stay-life imagery later."
    ),
    image: customerImages[3],
    imageAlt: text("Khoảnh khắc khách hàng tại khách sạn", "A guest moment at the hotel")
  },
  {
    eyebrow: text("KHUNG HÌNH 03", "FRAME 03"),
    title: text("Không gian và cảm xúc.", "Space and feeling."),
    description: text(
      "Một ô hình tạm để bạn thay ảnh khách hàng bằng asset chính thức.",
      "A temporary frame for swapping in official guest imagery later."
    ),
    image: customerImages[5],
    imageAlt: text("Khách lưu trú thư giãn trong không gian boutique", "A guest relaxing in a boutique setting")
  }
] as const;

function LocalizedSectionHeading({
  description,
  eyebrow,
  locale,
  title
}: {
  description: LocalizedText;
  eyebrow: LocalizedText;
  locale: Locale;
  title: LocalizedText;
}) {
  return (
    <div className="section-heading">
      <p className="section-heading__eyebrow">{localize(locale, eyebrow)}</p>
      <h3 className="section-heading__title">{localize(locale, title)}</h3>
      <p className="section-heading__description">{localize(locale, description)}</p>
    </div>
  );
}

function AboutUsStoryCard({
  card,
  locale
}: {
  card: (typeof galleryCards)[number];
  locale: Locale;
}) {
  return (
    <article className="about-us-story-card">
      <div className="about-us-story-card__media">
        <Image
          alt={localize(locale, card.imageAlt)}
          className="about-us-story-card__image"
          fill
          loading="lazy"
          sizes="(min-width: 1080px) 33vw, (min-width: 720px) 50vw, 100vw"
          src={card.image}
        />
      </div>

      <div className="about-us-story-card__body">
        <p className="about-us-story-card__eyebrow">{localize(locale, card.eyebrow)}</p>
        <h3 className="about-us-story-card__title">{localize(locale, card.title)}</h3>
        <p className="about-us-story-card__description">{localize(locale, card.description)}</p>
      </div>
    </article>
  );
}

export function AboutUsPage({ locale }: { locale: Locale }) {
  return (
    <>
      <section className="hero hero--split about-us-hero">
        <div className="section-shell hero__inner about-us-hero__inner">
          <div className="hero__copy about-us-hero__copy">
            <p className="hero__eyebrow">{localize(locale, aboutCopy.hero.eyebrow)}</p>
            <h1 className="hero__title">{localize(locale, aboutCopy.hero.title)}</h1>
            <p className="hero__description">{localize(locale, aboutCopy.hero.description)}</p>

            <div className="hero__actions">
              <ButtonLink href="/rooms" locale={locale}>
                {localize(locale, aboutCopy.hero.primaryCta)}
              </ButtonLink>
              <ButtonLink href="/about-us#site-footer" locale={locale} variant="ghost">
                {localize(locale, aboutCopy.hero.secondaryCta)}
              </ButtonLink>
            </div>

            <ul className="about-us-hero__notes">
              {aboutCopy.hero.bullets.map((bullet) => (
                <li className="about-us-hero__note" key={bullet.vi}>
                  <span className="about-us-hero__note-marker" aria-hidden="true" />
                  <span>{localize(locale, bullet)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="hero__visual about-us-hero__visual">
            <div className="about-us-hero__media">
              <Image
                alt={localize(locale, aboutCopy.carousel.title)}
                className="about-us-hero__media-image"
                fill
                priority
                sizes="(min-width: 1080px) 48vw, 100vw"
                src={customerImages[0]}
              />
              <div className="about-us-hero__caption">
                <p className="about-us-hero__caption-eyebrow">{locale === "en" ? "MOMENTS AT SK" : "KHOẢNH KHẮC TẠI SK"}</p>
                <p className="about-us-hero__caption-title">
                  {locale === "en"
                    ? "Real experiences always tell the best story."
                    : "Những trải nghiệm thật luôn kể câu chuyện hay nhất."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section about-us-carousel-section">
        <div className="section-shell">
          <LocalizedSectionHeading
            description={aboutCopy.carousel.description}
            eyebrow={aboutCopy.carousel.eyebrow}
            locale={locale}
            title={aboutCopy.carousel.title}
          />

          <AboutCustomerCarousel images={customerImages.slice(1)} locale={locale} />
        </div>
      </section>

      <section className="section about-us-stories-section">
        <div className="section-shell">
          <LocalizedSectionHeading
            description={aboutCopy.gallery.description}
            eyebrow={aboutCopy.gallery.eyebrow}
            locale={locale}
            title={aboutCopy.gallery.title}
          />

          <div className="about-us-story-grid">
            {galleryCards.map((card) => (
              <AboutUsStoryCard card={card} key={card.eyebrow.vi} locale={locale} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
