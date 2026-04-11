"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { LogoMark } from "@/components/logo-mark";
import { PortalBadge, PortalCard, PortalBulletList } from "@/components/portal-ui";
import { appendLocaleQuery, localeLabel, resolveLocale } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";
import { adminDashboardCopy } from "@/lib/mock/admin-dashboard";

type AdminShellProps = {
  children: ReactNode;
};

function buildSectionHref(pathname: string, search: string, href: string) {
  if (!href.startsWith("#")) {
    return appendLocaleQuery(href, resolveLocale(new URLSearchParams(search).get("lang")));
  }

  return `${pathname}${search ? `?${search}` : ""}${href}`;
}

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const locale = resolveLocale(searchParams.get("lang"));
  const localeToggle = locale === "en" ? "vi" : "en";

  return (
    <div className="portal-shell portal-shell--admin">
      <aside className="portal-shell__sidebar">
        <LogoMark
          className="portal-shell__logo"
          href={appendLocaleQuery("/admin", locale)}
          priority
          variant="light"
        />

        <div className="portal-shell__intro">
          <PortalBadge tone="accent">{localize(locale, adminDashboardCopy.shell.badge)}</PortalBadge>
          <h1 className="portal-shell__title">{localize(locale, adminDashboardCopy.shell.title)}</h1>
          <p className="portal-shell__description">{localize(locale, adminDashboardCopy.shell.description)}</p>
        </div>

        <nav aria-label={locale === "en" ? "Admin navigation" : "Điều hướng admin"} className="portal-shell__nav">
          {adminDashboardCopy.nav.map((item) => (
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
            {locale === "en" ? "Operational cautions" : "Ghi chú vận hành"}
          </p>
          <PortalBulletList items={adminDashboardCopy.shell.bullets} locale={locale} />
        </PortalCard>
      </aside>

      <div className="portal-shell__surface">
        <header className="portal-shell__topbar">
          <div className="portal-shell__heading">
            <p className="portal-shell__eyebrow">{localize(locale, adminDashboardCopy.shell.eyebrow)}</p>
            <PortalBadge tone="accent">{localize(locale, adminDashboardCopy.shell.badge)}</PortalBadge>
          </div>

          <div className="portal-shell__actions">
            <Link
              className="button button--solid"
              href={buildSectionHref(pathname, search, adminDashboardCopy.shell.actions.primary.href)}
            >
              {localize(locale, adminDashboardCopy.shell.actions.primary.label)}
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
