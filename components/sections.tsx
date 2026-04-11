import type { ReactNode } from "react";
import Link from "next/link";
import { AnalyticsLink } from "@/components/analytics-link";

import type { Locale } from "@/lib/locale";
import { appendLocaleQuery, translate } from "@/lib/locale";
import type {
  CardSectionData,
  ClosingSectionData,
  ContactSectionData,
  FaqSectionData,
  HeroData,
  MetricItem,
  SplitSectionData,
  TimelineSectionData,
  VisualPanelData
} from "@/lib/site-content";

type ButtonLinkProps = {
  children: ReactNode;
  className?: string;
  href: string;
  locale?: Locale;
  variant?: "solid" | "ghost" | "inverse" | "text";
};

type SectionHeadingProps = {
  align?: "left" | "center";
  className?: string;
  description: string;
  eyebrow: string;
  locale?: Locale;
  title: string;
};

type VisualPanelProps = VisualPanelData & {
  className?: string;
  locale?: Locale;
  size?: "hero" | "section";
};

export function ButtonLink({
  children,
  className,
  href,
  locale = "vi",
  variant = "solid"
}: ButtonLinkProps) {
  return (
    <AnalyticsLink
      className={`button button--${variant}${className ? ` ${className}` : ""}`}
      eventType="cta_click"
      href={href}
      locale={locale}
      metadata={{ variant }}
    >
      {children}
    </AnalyticsLink>
  );
}

export function SectionHeading({
  align = "left",
  className,
  description,
  eyebrow,
  locale = "vi",
  title
}: SectionHeadingProps) {
  return (
    <div
      className={`section-heading section-heading--${align}${className ? ` ${className}` : ""}`}
    >
      <p className="section-heading__eyebrow">{translate(locale, eyebrow)}</p>
      <h2 className="section-heading__title">{translate(locale, title)}</h2>
      <p className="section-heading__description">{translate(locale, description)}</p>
    </div>
  );
}

export function VisualPanel({
  chips,
  className,
  description,
  label,
  note,
  locale = "vi",
  size = "section",
  title,
  variant = "ink"
}: VisualPanelProps) {
  return (
    <div
      className={`visual-panel visual-panel--${variant} visual-panel--${size}${
        className ? ` ${className}` : ""
      }`}
    >
      <span className="visual-panel__grain" aria-hidden="true" />
      <div className="visual-panel__top">
        <p className="visual-panel__label">{translate(locale, label)}</p>
        {chips?.length ? (
          <div className="visual-panel__chips" aria-label="Tags">
            {chips.map((chip) => (
              <span className="visual-panel__chip" key={chip}>
                {chip}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="visual-panel__body">
        <h3 className="visual-panel__title">{translate(locale, title)}</h3>
        <p className="visual-panel__description">{translate(locale, description)}</p>
      </div>

      {note ? <p className="visual-panel__note">{translate(locale, note)}</p> : null}
    </div>
  );
}

export function HeroSection({ hero, locale = "vi" }: { hero: HeroData; locale?: Locale }) {
  const isStacked = hero.layout === "stacked";

  return (
    <section className={`hero hero--${hero.layout}`}>
      <div className="section-shell hero__inner">
        <div className={`hero__copy${isStacked ? " hero__copy--stacked" : ""}`}>
          <p className="hero__eyebrow">{translate(locale, hero.eyebrow)}</p>
          <h1 className="hero__title">{translate(locale, hero.title)}</h1>
          <p className="hero__description">{translate(locale, hero.description)}</p>

          <div className={`hero__actions${isStacked ? " hero__actions--center" : ""}`}>
            <ButtonLink href={hero.primaryCta.href} locale={locale}>
              {translate(locale, hero.primaryCta.label)}
            </ButtonLink>
            {hero.secondaryCta ? (
              <ButtonLink href={hero.secondaryCta.href} locale={locale} variant="ghost">
                {translate(locale, hero.secondaryCta.label)}
              </ButtonLink>
            ) : null}
          </div>
        </div>

        <div className={`hero__visual${isStacked ? " hero__visual--stacked" : ""}`}>
          <VisualPanel {...hero.visual} locale={locale} size="hero" />
        </div>
      </div>
    </section>
  );
}

export function MetricStrip({ metrics, locale = "vi" }: { metrics: MetricItem[]; locale?: Locale }) {
  return (
    <section className="section">
      <div className="section-shell">
        <div className="metric-strip">
          {metrics.map((metric) => (
            <article className="metric" key={`${metric.label}-${metric.value}`}>
              <p className="metric__value">{metric.value}</p>
              <p className="metric__label">{translate(locale, metric.label)}</p>
              <p className="metric__detail">{translate(locale, metric.detail)}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SplitSection({ section, locale = "vi" }: { section: SplitSectionData; locale?: Locale }) {
  return (
    <section className="section split-section">
      <div className={`section-shell split-section__grid${section.reverse ? " split-section__grid--reverse" : ""}`}>
        <div className="split-section__copy">
          <SectionHeading
            description={section.description}
            eyebrow={section.eyebrow}
            locale={locale}
            title={section.title}
          />
          <ul className="split-section__bullets">
            {section.bullets.map((bullet) => (
              <li className="split-section__bullet" key={bullet}>
                <span className="split-section__bullet-marker" aria-hidden="true" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="split-section__visual">
          <VisualPanel {...section.visual} locale={locale} size="section" />
        </div>
      </div>
    </section>
  );
}

export function CardSection({ section, locale = "vi" }: { section: CardSectionData; locale?: Locale }) {
  return (
    <section className="section card-section">
      <div className="section-shell">
        <SectionHeading
          description={section.description}
          eyebrow={section.eyebrow}
          locale={locale}
          title={section.title}
        />

        <div className="card-grid">
          {section.cards.map((card) => {
            const cardClasses = `content-card content-card--${card.tone ?? "paper"}${
              card.href ? " content-card--link" : ""
            }`;
            const cardBody = (
              <>
                <div className="content-card__visual" aria-hidden="true">
                  <span className="content-card__visual-kicker">{translate(locale, card.kicker)}</span>
                  <span className="content-card__visual-meta">
                    {translate(locale, card.meta ?? "STATIC PLACEHOLDER")}
                  </span>
                </div>
                <div className="content-card__body">
                  <p className="content-card__kicker">{translate(locale, card.kicker)}</p>
                  <h3 className="content-card__title">{translate(locale, card.title)}</h3>
                  <p className="content-card__description">{translate(locale, card.description)}</p>
                  {card.meta ? <p className="content-card__meta">{translate(locale, card.meta)}</p> : null}
                </div>
              </>
            );

            return card.href ? (
              <Link
                className={cardClasses}
                href={appendLocaleQuery(card.href, locale)}
                key={`${card.kicker}-${card.title}`}
              >
                {cardBody}
              </Link>
            ) : (
              <article className={cardClasses} key={`${card.kicker}-${card.title}`}>
                {cardBody}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function TimelineSection({ section, locale = "vi" }: { section: TimelineSectionData; locale?: Locale }) {
  return (
    <section className="section timeline-section">
      <div className="section-shell">
        <SectionHeading
          description={section.description}
          eyebrow={section.eyebrow}
          locale={locale}
          title={section.title}
        />

        <div className="timeline-grid">
          {section.items.map((item) => (
            <article className="timeline-card" key={`${item.step}-${item.title}`}>
              <p className="timeline-card__step">{translate(locale, item.step)}</p>
              <h3 className="timeline-card__title">{translate(locale, item.title)}</h3>
              <p className="timeline-card__description">{translate(locale, item.description)}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FaqSection({ section, locale = "vi" }: { section: FaqSectionData; locale?: Locale }) {
  return (
    <section className="section faq-section">
      <div className="section-shell">
        <SectionHeading
          description={section.description}
          eyebrow={section.eyebrow}
          locale={locale}
          title={section.title}
        />

        <div className="faq-grid">
          {section.items.map((item, index) => (
            <article className="faq-card" key={`${item.question}-${index}`}>
              <p className="faq-card__index">{String(index + 1).padStart(2, "0")}</p>
              <h3 className="faq-card__question">{translate(locale, item.question)}</h3>
              <p className="faq-card__answer">{translate(locale, item.answer)}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ContactSection({ section, locale = "vi" }: { section: ContactSectionData; locale?: Locale }) {
  return (
    <section className="section contact-section">
      <div className="section-shell">
        <SectionHeading
          description={section.description}
          eyebrow={section.eyebrow}
          locale={locale}
          title={section.title}
        />

        <div className="contact-grid">
          <div className="contact-details">
            {section.details.map((detail) => (
              <article className="contact-detail" key={detail.label}>
                <p className="contact-detail__label">{translate(locale, detail.label)}</p>
                {detail.href ? (
                  detail.href.startsWith("http") ||
                  detail.href.startsWith("mailto:") ||
                  detail.href.startsWith("tel:") ? (
                    <a className="contact-detail__value" href={detail.href}>
                      {translate(locale, detail.value)}
                    </a>
                  ) : (
                    <Link className="contact-detail__value" href={detail.href}>
                      {translate(locale, detail.value)}
                    </Link>
                  )
                ) : (
                  <p className="contact-detail__value">{translate(locale, detail.value)}</p>
                )}
              </article>
            ))}
          </div>

          <div className="contact-form-panel">
            <h3 className="contact-form-panel__title">{translate(locale, section.formTitle)}</h3>

            <form className="contact-form">
              <div className="contact-form__grid">
                {section.formFields.map((field) => (
                  <label className="field" key={field.label}>
                    <span className="field__label">{translate(locale, field.label)}</span>
                    {field.type === "textarea" ? (
                      <textarea
                        className="field__control field__control--textarea"
                        placeholder={translate(locale, field.placeholder)}
                      />
                    ) : (
                      <input
                        className="field__control"
                        placeholder={translate(locale, field.placeholder)}
                        type={field.type}
                      />
                    )}
                  </label>
                ))}
              </div>

              <div className="contact-form__actions">
                <button className="button button--solid" type="button">
                  {translate(locale, "Gửi yêu cầu")}
                </button>
                <p className="contact-form__note">
                  {translate(locale, "Form tĩnh placeholder, chưa nối backend.")}
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ClosingSection({ section, locale = "vi" }: { section: ClosingSectionData; locale?: Locale }) {
  return (
    <section className="section closing-band">
      <div className="section-shell">
        <div className="closing-band__inner">
          <div className="closing-band__copy">
            <p className="section-heading__eyebrow section-heading__eyebrow--light">
              {translate(locale, section.eyebrow)}
            </p>
            <h2 className="closing-band__title">{translate(locale, section.title)}</h2>
            <p className="closing-band__description">{translate(locale, section.description)}</p>
          </div>

          <div className="closing-band__actions">
            <ButtonLink href={section.cta.href} locale={locale} variant="inverse">
              {translate(locale, section.cta.label)}
            </ButtonLink>
            {section.secondaryCta ? (
              <ButtonLink
                className="button--text-light"
                href={section.secondaryCta.href}
                locale={locale}
                variant="text"
              >
                {translate(locale, section.secondaryCta.label)}
              </ButtonLink>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
