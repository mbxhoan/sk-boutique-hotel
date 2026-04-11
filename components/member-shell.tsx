"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { LogoMark } from "@/components/logo-mark";
import { PortalBadge, PortalCard, PortalBulletList } from "@/components/portal-ui";
import { appendLocaleQuery, localeLabel, resolveLocale } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";
import { memberDashboardCopy } from "@/lib/mock/member-dashboard";

type MemberShellProps = {
  children: ReactNode;
};

function buildSectionHref(pathname: string, search: string, href: string) {
  if (!href.startsWith("#")) {
    return appendLocaleQuery(href, resolveLocale(new URLSearchParams(search).get("lang")));
  }

  return `${pathname}${search ? `?${search}` : ""}${href}`;
}

export function MemberShell({ children }: MemberShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const locale = resolveLocale(searchParams.get("lang"));
  const localeToggle = locale === "en" ? "vi" : "en";

  return (
    <div className="portal-shell portal-shell--member">
      <aside className="portal-shell__sidebar">
        <LogoMark
          className="portal-shell__logo"
          href={appendLocaleQuery("/member", locale)}
          priority
          variant="light"
        />

        <div className="portal-shell__intro">
          <PortalBadge tone="soft">{localize(locale, memberDashboardCopy.shell.badge)}</PortalBadge>
          <h1 className="portal-shell__title">{localize(locale, memberDashboardCopy.shell.title)}</h1>
          <p className="portal-shell__description">{localize(locale, memberDashboardCopy.shell.description)}</p>
        </div>

        <nav aria-label={locale === "en" ? "Member navigation" : "Điều hướng thành viên"} className="portal-shell__nav">
          {memberDashboardCopy.nav.map((item) => (
            <a
              className="portal-shell__nav-link"
              href={buildSectionHref(pathname, search, item.href)}
              key={item.href}
            >
              {localize(locale, item.label)}
            </a>
          ))}
        </nav>

        <PortalCard className="portal-shell__sidebar-card" tone="soft">
          <p className="portal-shell__sidebar-card-title">
            {locale === "en" ? "Manual-first guardrails" : "Nguyên tắc manual-first"}
          </p>
          <PortalBulletList items={memberDashboardCopy.shell.bullets} locale={locale} />
        </PortalCard>
      </aside>

      <div className="portal-shell__surface">
        <header className="portal-shell__topbar">
          <div className="portal-shell__heading">
            <p className="portal-shell__eyebrow">{localize(locale, memberDashboardCopy.shell.eyebrow)}</p>
            <PortalBadge tone="accent">{localize(locale, memberDashboardCopy.shell.badge)}</PortalBadge>
          </div>

          <div className="portal-shell__actions">
            <Link
              className="button button--solid"
              href={buildSectionHref(pathname, search, memberDashboardCopy.shell.actions.primary.href)}
            >
              {localize(locale, memberDashboardCopy.shell.actions.primary.label)}
            </Link>
            <Link className="button button--text-light" href={appendLocaleQuery(pathname, localeToggle)}>
              {localeLabel(localeToggle)}
            </Link>
          </div>
        </header>

        <main className="portal-shell__main">{children}</main>
      </div>
    </div>
  );
}
