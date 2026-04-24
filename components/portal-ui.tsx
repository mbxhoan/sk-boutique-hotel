import type { ReactNode } from "react";

import type { Locale } from "@/lib/locale";
import type { LocalizedText } from "@/lib/mock/i18n";
import { localize } from "@/lib/mock/i18n";

type PortalBadgeTone = "neutral" | "soft" | "accent";
type PortalCardTone = "default" | "soft" | "accent";

export function PortalBadge({
  children,
  tone = "neutral"
}: {
  children: ReactNode;
  tone?: PortalBadgeTone;
}) {
  return <span className={`portal-badge portal-badge--${tone}`}>{children}</span>;
}

export function PortalHelp({
  content,
  locale,
  label = "?"
}: {
  content: LocalizedText | string;
  label?: string;
  locale: Locale;
}) {
  const helpText = typeof content === "string" ? content : localize(locale, content);

  return (
    <span className="portal-help">
      <button
        aria-label={helpText}
        className="portal-help__button"
        type="button"
      >
        {label}
      </button>
      <span className="portal-help__tooltip" role="tooltip">
        {helpText}
      </span>
    </span>
  );
}

export function PortalCard({
  children,
  className,
  id,
  tone = "default"
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  tone?: PortalCardTone;
}) {
  return (
    <article className={`portal-card portal-card--${tone}${className ? ` ${className}` : ""}`} id={id}>
      {children}
    </article>
  );
}

export function PortalSectionHeading({
  actions,
  align = "left",
  description,
  eyebrow,
  help,
  locale,
  title
}: {
  actions?: ReactNode;
  align?: "left" | "center";
  description: LocalizedText;
  eyebrow: LocalizedText;
  help?: LocalizedText | string;
  locale: Locale;
  title: LocalizedText;
}) {
  return (
    <div className={`portal-section-heading portal-section-heading--${align}`}>
      <div className="portal-section-heading__copy">
        <p className="portal-section-heading__eyebrow">{localize(locale, eyebrow)}</p>
        <div className="portal-section-heading__title-row">
          <h2 className="portal-section-heading__title">{localize(locale, title)}</h2>
          {help ? <PortalHelp content={help} locale={locale} /> : null}
        </div>
        <p className="portal-section-heading__description">{localize(locale, description)}</p>
      </div>
      {actions ? <div className="portal-section-heading__actions">{actions}</div> : null}
    </div>
  );
}

export function PortalStatCard({
  detail,
  label,
  locale,
  tone = "default",
  value
}: {
  detail: LocalizedText;
  label: LocalizedText;
  locale: Locale;
  tone?: PortalCardTone;
  value: string | LocalizedText;
}) {
  const renderedValue = typeof value === "string" ? value : localize(locale, value);

  return (
    <article className={`portal-stat portal-stat--${tone}`}>
      <p className="portal-stat__value">{renderedValue}</p>
      <p className="portal-stat__label">{localize(locale, label)}</p>
      <p className="portal-stat__detail">{localize(locale, detail)}</p>
    </article>
  );
}

export function PortalBulletList({
  className,
  items,
  locale
}: {
  className?: string;
  items: LocalizedText[];
  locale: Locale;
}) {
  return (
    <ul className={`portal-bullet-list${className ? ` ${className}` : ""}`}>
      {items.map((item) => (
        <li className="portal-bullet-list__item" key={item.vi}>
          <span className="portal-bullet-list__marker" aria-hidden="true" />
          <span>{localize(locale, item)}</span>
        </li>
      ))}
    </ul>
  );
}
