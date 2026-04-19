"use client";

import Link from "next/link";

import { LogoMark } from "@/components/logo-mark";
import { PortalBadge, PortalBulletList, PortalCard } from "@/components/portal-ui";
import { appendLocaleQuery, localeLabel } from "@/lib/locale";
import type { Locale } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";
import { memberDashboardCopy } from "@/lib/mock/member-dashboard";

type MemberPortalSidebarProps = {
  locale: Locale;
};

export function MemberPortalSidebar({ locale }: MemberPortalSidebarProps) {
  const localeToggle = locale === "en" ? "vi" : "en";

  return (
    <aside className="member-portal-sidebar">
      <PortalCard className="member-portal-sidebar__card" tone="soft">
        <div className="member-portal-sidebar__brand">
          <LogoMark className="member-portal-sidebar__logo" href={appendLocaleQuery("/member", locale)} priority />
          <div className="member-portal-sidebar__locale">
            <Link className="button button--text-light member-portal-sidebar__locale-link" href={appendLocaleQuery("/member", localeToggle)}>
              {localeLabel(localeToggle)}
            </Link>
          </div>
        </div>

        <div className="member-portal-sidebar__intro">
          <PortalBadge tone="accent">{localize(locale, memberDashboardCopy.shell.badge)}</PortalBadge>
          <h1 className="member-portal-sidebar__title">{localize(locale, memberDashboardCopy.shell.title)}</h1>
          <p className="member-portal-sidebar__description">{localize(locale, memberDashboardCopy.shell.description)}</p>
        </div>

        <nav aria-label={locale === "en" ? "Member navigation" : "Điều hướng thành viên"} className="member-portal-sidebar__nav">
          {memberDashboardCopy.nav.map((item) => (
            <a className="member-portal-sidebar__link" href={item.href} key={item.href}>
              {localize(locale, item.label)}
            </a>
          ))}
        </nav>

        <div className="member-portal-sidebar__actions">
          <Link className="button button--solid member-portal-sidebar__cta" href="#requests">
            {locale === "en" ? "New booking request" : "Gửi yêu cầu mới"}
          </Link>
        </div>

        <PortalBulletList className="member-portal-sidebar__bullets" items={memberDashboardCopy.shell.bullets} locale={locale} />
      </PortalCard>
    </aside>
  );
}
