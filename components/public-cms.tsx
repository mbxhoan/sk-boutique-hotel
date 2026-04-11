import Link from "next/link";

import type { Locale } from "@/lib/locale";
import { appendLocaleQuery } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";
import type {
  CmsAction,
  CmsActionTone,
  CmsBandSection,
  CmsCardsSection,
  CmsCollectionItem,
  CmsHeroSection,
  CmsLocaleZonesSection,
  CmsMediaFrame,
  CmsPageCopy,
  CmsSection,
  CmsSplitSection,
  CmsStatsSection
} from "@/lib/mock/public-cms";
import { PortalBadge, PortalBulletList, PortalCard, PortalSectionHeading, PortalStatCard } from "@/components/portal-ui";

const actionVariantMap: Record<CmsActionTone, "solid" | "ghost" | "text"> = {
  solid: "solid",
  ghost: "ghost",
  text: "text"
};

const toneToBadgeTone = (tone?: CmsMediaFrame["tone"]) => {
  if (tone === "gold") {
    return "accent" as const;
  }

  if (tone === "paper") {
    return "soft" as const;
  }

  return "neutral" as const;
};

const toneToCardTone = (tone?: CmsMediaFrame["tone"]) => {
  if (tone === "gold") {
    return "accent" as const;
  }

  if (tone === "paper") {
    return "soft" as const;
  }

  return "default" as const;
};

function CmsActionLink({
  action,
  locale
}: {
  action: CmsAction;
  locale: Locale;
}) {
  const variant = actionVariantMap[action.tone ?? "solid"];

  return (
    <Link className={`button button--${variant}`} href={appendLocaleQuery(action.href, locale)}>
      {localize(locale, action.label)}
    </Link>
  );
}

function CmsPreviewFrame({
  frame,
  locale,
  size = "section"
}: {
  frame: CmsMediaFrame;
  locale: Locale;
  size?: "hero" | "section";
}) {
  return (
    <div className={`visual-panel visual-panel--${frame.tone ?? "ink"} visual-panel--${size}`}>
      <span className="visual-panel__grain" aria-hidden="true" />

      <div className="visual-panel__top">
        <p className="visual-panel__label">{localize(locale, frame.label)}</p>
        {frame.chips?.length ? (
          <div className="visual-panel__chips" aria-label="Tags">
            {frame.chips.map((chip) => (
              <span className="visual-panel__chip" key={chip}>
                {chip}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="visual-panel__body">
        <h3 className="visual-panel__title">{localize(locale, frame.title)}</h3>
        <p className="visual-panel__description">{localize(locale, frame.description)}</p>
      </div>

      {frame.note ? <p className="visual-panel__note">{localize(locale, frame.note)}</p> : null}
    </div>
  );
}

function CmsHeroSectionRenderer({
  locale,
  section
}: {
  locale: Locale;
  section: CmsHeroSection;
}) {
  return (
    <section className="section cms-section cms-section--hero" id={section.id}>
      <div className="section-shell cms-hero__shell">
        <div className="cms-hero__grid">
          <div className="cms-hero__copy">
            <PortalBadge tone="accent">{localize(locale, section.eyebrow)}</PortalBadge>
            <h1 className="cms-hero__title">{localize(locale, section.title)}</h1>
            <p className="cms-hero__description">{localize(locale, section.description)}</p>

            <div className="cms-hero__actions">
              <CmsActionLink action={section.actions.primary} locale={locale} />
              {section.actions.secondary ? <CmsActionLink action={section.actions.secondary} locale={locale} /> : null}
            </div>

            <PortalBulletList className="cms-hero__bullets" items={section.bullets} locale={locale} />
          </div>

          <div className="cms-hero__visual">
            <CmsPreviewFrame frame={section.frame} locale={locale} size="hero" />
          </div>
        </div>
      </div>
    </section>
  );
}

function CmsStatsSectionRenderer({
  locale,
  section
}: {
  locale: Locale;
  section: CmsStatsSection;
}) {
  return (
    <section className="section cms-section cms-section--stats" id={section.id}>
      <div className="section-shell">
        <PortalSectionHeading
          description={section.description}
          eyebrow={section.eyebrow}
          locale={locale}
          title={section.title}
        />

        <div className="portal-stat-grid cms-stat-grid">
          {section.items.map((item, index) => (
            <PortalStatCard
              detail={item.detail}
              label={item.label}
              locale={locale}
              key={`${item.label.vi}-${index}`}
              tone={toneToCardTone(item.tone)}
              value={item.value}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function CmsSplitSectionRenderer({
  locale,
  section
}: {
  locale: Locale;
  section: CmsSplitSection;
}) {
  return (
    <section className="section cms-section cms-section--split" id={section.id}>
      <div
        className={`section-shell cms-split__grid${section.reverse ? " cms-split__grid--reverse" : ""}`}
      >
        <div className="cms-split__copy">
          <PortalSectionHeading
            description={section.description}
            eyebrow={section.eyebrow}
            locale={locale}
            title={section.title}
          />
          <PortalBulletList className="cms-split__bullets" items={section.bullets} locale={locale} />
        </div>

        <div className="cms-split__visual">
          <CmsPreviewFrame frame={section.frame} locale={locale} size="section" />
        </div>
      </div>
    </section>
  );
}

function CmsCollectionCard({
  item,
  locale
}: {
  item: CmsCollectionItem;
  locale: Locale;
}) {
  const card = (
    <PortalCard
      className="cms-collection-card"
      tone={toneToCardTone(item.tone)}
    >
      <div className="cms-collection-card__top">
        <PortalBadge tone={toneToBadgeTone(item.tone)}>{localize(locale, item.eyebrow)}</PortalBadge>
        <span className="cms-collection-card__chevron" aria-hidden="true">
          →
        </span>
      </div>

      <div className="cms-collection-card__body">
        <h3 className="cms-collection-card__title">{localize(locale, item.title)}</h3>
        <p className="cms-collection-card__description">{localize(locale, item.description)}</p>
      </div>

      <div className="cms-collection-card__meta" aria-label={localize(locale, item.title)}>
        {item.meta.map((meta) => (
          <PortalBadge key={meta.vi} tone="soft">
            {localize(locale, meta)}
          </PortalBadge>
        ))}
      </div>
    </PortalCard>
  );

  return item.href ? (
    <Link className="cms-collection-card__link" href={appendLocaleQuery(item.href, locale)}>
      {card}
    </Link>
  ) : (
    card
  );
}

function CmsCardsSectionRenderer({
  locale,
  section
}: {
  locale: Locale;
  section: CmsCardsSection;
}) {
  return (
    <section className="section cms-section cms-section--cards" id={section.id}>
      <div className="section-shell">
        <PortalSectionHeading
          description={section.description}
          eyebrow={section.eyebrow}
          locale={locale}
          title={section.title}
        />

        <div className="portal-card-grid cms-card-grid">
          {section.items.map((item) => (
            <CmsCollectionCard item={item} key={`${item.href}-${item.title.vi}`} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CmsBandSectionRenderer({
  locale,
  section
}: {
  locale: Locale;
  section: CmsBandSection;
}) {
  return (
    <section className="section cms-section cms-section--band" id={section.id}>
      <div className="section-shell">
        <PortalCard className="cms-band" tone="accent">
          <div className="cms-band__copy">
            <PortalBadge tone="soft">{localize(locale, section.eyebrow)}</PortalBadge>
            <h2 className="cms-band__title">{localize(locale, section.title)}</h2>
            <p className="cms-band__description">{localize(locale, section.description)}</p>
          </div>

          <div className="cms-band__actions">
            <CmsActionLink action={section.actions.primary} locale={locale} />
            {section.actions.secondary ? <CmsActionLink action={section.actions.secondary} locale={locale} /> : null}
          </div>
        </PortalCard>
      </div>
    </section>
  );
}

function CmsLocaleZonesSectionRenderer({
  locale,
  section
}: {
  locale: Locale;
  section: CmsLocaleZonesSection;
}) {
  const zones = [
    {
      key: "vi" as const,
      tone: "soft" as const,
      zone: section.zones.vi
    },
    {
      key: "en" as const,
      tone: "accent" as const,
      zone: section.zones.en
    }
  ];

  return (
    <section className="section cms-section cms-section--zones" id={section.id}>
      <div className="section-shell">
        <PortalSectionHeading
          description={section.description}
          eyebrow={section.eyebrow}
          locale={locale}
          title={section.title}
        />

        <div className="cms-zone-grid">
          {zones.map(({ key, tone, zone }) => (
            <PortalCard className="cms-zone-card" key={key} tone={tone}>
              <PortalBadge tone={key === "en" ? "accent" : "soft"}>{localize(locale, zone.eyebrow)}</PortalBadge>
              <h3 className="cms-zone-card__title">{localize(locale, zone.title)}</h3>
              <p className="cms-zone-card__description">{localize(locale, zone.description)}</p>
              <PortalBulletList className="cms-zone-card__bullets" items={zone.bullets} locale={locale} />
              {zone.note ? <p className="cms-zone-card__note">{localize(locale, zone.note)}</p> : null}
            </PortalCard>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CmsSectionRenderer({
  locale,
  section
}: {
  locale: Locale;
  section: CmsSection;
}) {
  switch (section.kind) {
    case "hero":
      return <CmsHeroSectionRenderer locale={locale} section={section} />;
    case "stats":
      return <CmsStatsSectionRenderer locale={locale} section={section} />;
    case "split":
      return <CmsSplitSectionRenderer locale={locale} section={section} />;
    case "cards":
      return <CmsCardsSectionRenderer locale={locale} section={section} />;
    case "band":
      return <CmsBandSectionRenderer locale={locale} section={section} />;
    case "locale-zones":
      return <CmsLocaleZonesSectionRenderer locale={locale} section={section} />;
  }
}

export function CmsPageRenderer({
  className,
  locale,
  page
}: {
  className?: string;
  locale: Locale;
  page: CmsPageCopy;
}) {
  return (
    <div className={`cms-page cms-page--${page.kind}${className ? ` ${className}` : ""}`}>
      <div className="cms-page__sections">
        {page.sections.map((section) => (
          <CmsSectionRenderer key={section.id} locale={locale} section={section} />
        ))}
      </div>
    </div>
  );
}

export function CmsArticleLead({
  description,
  eyebrow,
  locale,
  title
}: {
  description: CmsPageCopy["seo"]["description"];
  eyebrow: string;
  locale: Locale;
  title: CmsPageCopy["seo"]["title"];
}) {
  return (
    <div className="cms-article-lead">
      <PortalBadge tone="accent">{eyebrow}</PortalBadge>
      <h1 className="cms-article-lead__title">{localize(locale, title)}</h1>
      <p className="cms-article-lead__description">{localize(locale, description)}</p>
    </div>
  );
}
