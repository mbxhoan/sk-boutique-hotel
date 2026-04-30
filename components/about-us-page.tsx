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
    "Khám phá câu chuyện, giá trị và những khoảnh khắc lưu trú tại SK Boutique Hotel.",
    "Discover the story, values, and stay moments at SK Boutique Hotel."
  )
};

const aboutCopy = {
  hero: {
    eyebrow: text("VỀ SK", "ABOUT SK"),
    title: text("Nghỉ dưỡng theo cách tinh tế hơn.", "Stay in a more refined way."),
    description: text(
      "Không gian boutique ấm áp, riêng tư và dễ chịu cho những kỳ nghỉ đáng nhớ.",
      "A warm, private boutique stay designed for memorable moments."
    ),
    bullets: [
      text("Không gian hiện đại, cảm giác gần gũi.", "Modern space, welcoming feel."),
      text("Vị trí thuận tiện để nghỉ ngơi và khám phá.", "A convenient place to rest and explore.")
    ],
    primaryCta: text("Khám phá phòng", "Explore Rooms"),
    secondaryCta: text("Liên hệ", "Contact Us"),
    imageAlt: text(
      "Khoảnh khắc khách hàng tại SK Boutique Hotel",
      "A guest moment at SK Boutique Hotel"
    ),
    captionEyebrow: text("KHOẢNH KHẮC TẠI SK", "MOMENTS AT SK"),
    captionTitle: text(
      "Những trải nghiệm thật luôn kể câu chuyện hay nhất.",
      "Real experiences always tell the best story."
    )
  },
  carousel: {
    eyebrow: text("KHÁCH HÀNG", "OUR GUESTS"),
    title: text("Mỗi kỳ nghỉ, một dấu ấn riêng.", "Every stay leaves its own impression."),
    description: text(
      "Những khoảnh khắc tự nhiên luôn là lời giới thiệu chân thành nhất.",
      "Genuine moments are always the most sincere introduction."
    )
  },
  gallery: {
    eyebrow: text("GIÁ TRỊ CỐT LÕI", "CORE VALUES"),
    title: text(
      "Giá trị làm nên trải nghiệm.",
      "The values behind every stay."
    ),
    description: text(
      "Tinh tế, ấm áp và vừa đủ để bạn muốn quay lại.",
      "Refined, warm, and thoughtful enough to bring you back."
    )
  }
} as const;

const fallbackCustomerImages = [
  "/customers/customers1.jpg",
  "/customers/customers2.jpg",
  "/customers/customers3.jpg",
  "/customers/customers4.jpg",
  "/customers/customers5.jpg",
  "/customers/customers6.jpg",
  "/customers/customers22.jpg"
];

function buildGalleryCards(customerImages: string[]) {
  const images = customerImages.length ? customerImages : fallbackCustomerImages;

  return [
    {
      eyebrow: text("KHỞI NGUỒN", "OUR BEGINNING"),
      title: text("Bắt đầu từ sự chỉn chu.", "Built on thoughtful care."),
      description: text(
        "Một nơi ở dễ chịu bắt đầu từ những chi tiết được chăm chút đúng mức.",
        "A comfortable stay begins with details that are carefully considered."
      ),
      image: images[1] ?? images[0],
      imageAlt: text("Khách hàng tại SK Boutique Hotel", "Guests at SK Boutique Hotel")
    },
    {
      eyebrow: text("TRẢI NGHIỆM", "THE EXPERIENCE"),
      title: text("Nhẹ nhàng và trọn vẹn.", "Effortless and complete."),
      description: text(
        "Từ không gian đến dịch vụ, mọi thứ được sắp đặt để bạn cảm thấy thoải mái hơn.",
        "From the space to the service, everything is shaped to make your stay feel easier and more comfortable."
      ),
      image: images[3] ?? images[images.length - 1] ?? images[0],
      imageAlt: text("Khoảnh khắc lưu trú tại khách sạn", "A stay moment at the hotel")
    },
    {
      eyebrow: text("GIÁ TRỊ", "OUR VALUES"),
      title: text("Tinh tế, ấm áp, đáng nhớ.", "Refined, warm, memorable."),
      description: text(
        "SK theo đuổi sự cân bằng giữa thẩm mỹ, riêng tư và cảm giác gần gũi.",
        "SK brings together aesthetics, privacy, and a welcoming sense of comfort."
      ),
      image: images[5] ?? images[images.length - 1] ?? images[0],
      imageAlt: text("Khách lưu trú trong không gian boutique", "Guests enjoying a boutique stay")
    }
  ] as const;
}

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
  card: ReturnType<typeof buildGalleryCards>[number];
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
        <h4 className="about-us-story-card__title">{localize(locale, card.title)}</h4>
        <p className="about-us-story-card__description">{localize(locale, card.description)}</p>
      </div>
    </article>
  );
}

export function AboutUsPage({
  customerImages,
  locale
}: {
  customerImages: string[];
  locale: Locale;
}) {
  const galleryCards = buildGalleryCards(customerImages);

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
                alt={localize(locale, aboutCopy.hero.imageAlt)}
                className="about-us-hero__media-image"
                fill
                priority
                sizes="(min-width: 1080px) 48vw, 100vw"
                src={customerImages[0] ?? customerImages[customerImages.length - 1] ?? "/customers/customers1.jpg"}
              />
              <div className="about-us-hero__caption">
                <p className="about-us-hero__caption-eyebrow">
                  {localize(locale, aboutCopy.hero.captionEyebrow)}
                </p>
                <p className="about-us-hero__caption-title">
                  {localize(locale, aboutCopy.hero.captionTitle)}
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

export const AboutUsPageContent = AboutUsPage;
