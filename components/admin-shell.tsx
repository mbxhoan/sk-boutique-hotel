"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { LogoMark } from "@/components/logo-mark";
import { PortalBadge, PortalCard, PortalBulletList } from "@/components/portal-ui";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
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

function ShellIcon({
  name
}: {
  name: "audit" | "branches" | "collapse" | "dashboard" | "expand" | "operations";
}) {
  if (name === "collapse" || name === "expand") {
    return (
      <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 18 18" width="18">
        <path
          d="M3 4.5H15M3 9H11.5M3 13.5H15"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.4"
        />
        <path
          d={name === "collapse" ? "M13 6.5L15.5 9L13 11.5" : "M5 6.5L2.5 9L5 11.5"}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.4"
        />
      </svg>
    );
  }

  if (name === "operations") {
    return (
      <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 18 18" width="18">
        <path
          d="M3.5 4.5H14.5M3.5 9H14.5M3.5 13.5H14.5"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.4"
        />
      </svg>
    );
  }

  if (name === "branches") {
    return (
      <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 18 18" width="18">
        <path
          d="M4 4.5H8.25V8.75H4V4.5ZM9.75 4.5H14V8.75H9.75V4.5ZM4 10.25H8.25V14.5H4V10.25ZM9.75 10.25H14V14.5H9.75V10.25Z"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="1.2"
        />
      </svg>
    );
  }

  if (name === "audit") {
    return (
      <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 18 18" width="18">
        <path
          d="M9 2.75L14.5 5.25V9.5C14.5 12.65 12.24 15.15 9 15.85C5.76 15.15 3.5 12.65 3.5 9.5V5.25L9 2.75Z"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="1.2"
        />
        <path d="M9 5.5V10.2M9 12.2H9.01" stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 18 18" width="18">
      <path
        d="M3.25 9.25L9 3.75L14.75 9.25V14.5H3.25V9.25Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.2"
      />
      <path d="M7 14.5V10.5H11V14.5" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.2" />
    </svg>
  );
}

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const search = searchParams.toString();
  const locale = resolveLocale(searchParams.get("lang"));
  const localeToggle = locale === "en" ? "vi" : "en";
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("skbh-admin-sidebar-collapsed");

    if (stored === "1") {
      setIsCollapsed(true);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("skbh-admin-sidebar-collapsed", isCollapsed ? "1" : "0");
  }, [isCollapsed]);

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/admin/sign-in");
    router.refresh();
  }

  return (
    <div className={`portal-shell portal-shell--admin${isCollapsed ? " portal-shell--collapsed" : ""}`}>
      <aside className="portal-shell__sidebar">
        <div className="portal-shell__sidebar-head">
          <LogoMark
            className="portal-shell__logo"
            href={appendLocaleQuery("/admin", locale)}
            priority
            variant="light"
          />
          <button
            aria-label={
              isCollapsed
                ? locale === "en"
                  ? "Expand menu"
                  : "Mở menu"
                : locale === "en"
                  ? "Collapse menu"
                  : "Thu gọn menu"
            }
            aria-pressed={isCollapsed}
            className="portal-shell__sidebar-toggle button"
            onClick={() => setIsCollapsed((current) => !current)}
            type="button"
            title={
              isCollapsed
                ? locale === "en"
                  ? "Expand menu"
                  : "Mở menu"
                : locale === "en"
                  ? "Collapse menu"
                  : "Thu gọn menu"
            }
          >
            <ShellIcon name={isCollapsed ? "expand" : "collapse"} />
          </button>
        </div>

        <div className="portal-shell__intro">
          <PortalBadge tone="accent">{localize(locale, adminDashboardCopy.shell.badge)}</PortalBadge>
          <h1 className="portal-shell__title">{localize(locale, adminDashboardCopy.shell.title)}</h1>
          <p className="portal-shell__description">{localize(locale, adminDashboardCopy.shell.description)}</p>
        </div>

        <nav aria-label={locale === "en" ? "Admin navigation" : "Điều hướng admin"} className="portal-shell__nav">
          {adminDashboardCopy.nav.map((item) => {
            const label = localize(locale, item.label);

            return (
              <a
                className="portal-shell__nav-link"
                href={buildSectionHref(pathname, search, item.href)}
                key={item.href}
                title={label}
              >
                <span className="portal-shell__nav-icon" aria-hidden="true">
                  <ShellIcon
                    name={
                      item.href === "#operations"
                        ? "operations"
                        : item.href === "#branches"
                          ? "branches"
                          : item.href === "#audit"
                            ? "audit"
                            : "dashboard"
                    }
                  />
                </span>
                <span className="portal-shell__nav-label">{label}</span>
              </a>
            );
          })}
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
            <button className="button button--text-light portal-shell__sign-out" onClick={handleSignOut} type="button">
              {locale === "en" ? "Sign out" : "Đăng xuất"}
            </button>
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
