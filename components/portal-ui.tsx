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
  locale,
  title
}: {
  actions?: ReactNode;
  align?: "left" | "center";
  description: LocalizedText;
  eyebrow: LocalizedText;
  locale: Locale;
  title: LocalizedText;
}) {
  return (
    <div className={`portal-section-heading portal-section-heading--${align}`}>
      <div className="portal-section-heading__copy">
        <p className="portal-section-heading__eyebrow">{localize(locale, eyebrow)}</p>
        <h2 className="portal-section-heading__title">{localize(locale, title)}</h2>
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
  value: string;
}) {
  return (
    <article className={`portal-stat portal-stat--${tone}`}>
      <p className="portal-stat__value">{value}</p>
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
