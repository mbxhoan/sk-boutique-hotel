"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { LogoMark } from "@/components/logo-mark";
import { appendLocaleQuery, localeLabel, resolveLocale } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";
import { headerMenu } from "@/lib/site-content";

function isRouteMatch(pathname: string, href: string) {
  if (href.startsWith("#")) {
    return false;
  }

  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}

function isMenuItemActive(pathname: string, item: (typeof headerMenu.items)[number]) {
  if (isRouteMatch(pathname, item.href)) {
    return true;
  }

  return item.children?.some((child) => isRouteMatch(pathname, child.href)) ?? false;
}

function resolveHeaderHref(href: string, locale: "en" | "vi", currentHref: string) {
  if (href.startsWith("#")) {
    return appendLocaleQuery(`${currentHref}${href}`, locale);
  }

  return appendLocaleQuery(href, locale);
}

function ChevronIcon({ open }: { open?: boolean }) {
  return (
    <svg aria-hidden="true" className={`site-header__chevron${open ? " site-header__chevron--open" : ""}`} fill="none" height="14" viewBox="0 0 14 14" width="14">
      <path d="M3 5.25L7 9.25L11 5.25" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 18 18" width="18">
      <path d="M3.25 4.75H14.75M3.25 9H14.75M3.25 13.25H14.75" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 18 18" width="18">
      <path d="M4.5 4.5L13.5 13.5M13.5 4.5L4.5 13.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
    </svg>
  );
}

function LocaleToggleLink({
  ariaLabel,
  className,
  href,
  locale,
  onClick
}: {
  ariaLabel: string;
  className: string;
  href: string;
  locale: "en" | "vi";
  onClick?: () => void;
}) {
  const flagSrc = locale === "en" ? "/flags/en.svg" : "/flags/vi.svg";

  return (
    <Link aria-label={ariaLabel} className={className} href={href} onClick={onClick}>
      <Image alt="" aria-hidden="true" className="site-header__locale-flag" height={16} src={flagSrc} width={16} />
      <span>{localeLabel(locale)}</span>
    </Link>
  );
}

function HeaderNavLink({
  active,
  href,
  currentHref,
  label,
  locale,
  onNavigate
}: {
  active?: boolean;
  currentHref: string;
  href: string;
  label: { en: string; vi: string };
  locale: "en" | "vi";
  onNavigate?: () => void;
}) {
  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={`site-header__nav-link${active ? " site-header__nav-link--active" : ""}`}
      href={resolveHeaderHref(href, locale, currentHref)}
      onClick={onNavigate}
    >
      {localize(locale, label)}
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang"));
  const localeToggle = locale === "en" ? "vi" : "en";
  const currentSearch = searchParams.toString();
  const currentHref = `${pathname}${currentSearch ? `?${currentSearch}` : ""}`;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openDrawerGroup, setOpenDrawerGroup] = useState<string | null | undefined>(undefined);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
    setOpenDropdown(null);
    setOpenDrawerGroup(undefined);
  }, [pathname, locale]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (drawerOpen) {
      return;
    }

    setOpenDrawerGroup(undefined);
  }, [drawerOpen]);

  useEffect(() => {
    if (!drawerOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDrawerOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [drawerOpen]);

  return (
    <header className="site-header">
      <div className="section-shell site-header__inner">
        <LogoMark className="site-header__logo" href={appendLocaleQuery("/", locale)} priority />

        <nav aria-label={locale === "en" ? "Primary navigation" : "Điều hướng chính"} className="site-header__nav site-header__nav--desktop">
          {headerMenu.items.map((item) => {
            const active = isMenuItemActive(pathname, item);
            const label = localize(locale, item.label);

            if (item.children?.length) {
              const dropdownId = item.label.vi;
              const isDropdownOpen = openDropdown === dropdownId;

              return (
                <details
                  className={`site-header__dropdown${active ? " site-header__dropdown--active" : ""}`}
                  key={dropdownId}
                  open={isDropdownOpen}
                >
                  <summary
                    className={`site-header__nav-link site-header__nav-link--summary${active ? " site-header__nav-link--active" : ""}`}
                    aria-label={label}
                    onClick={(event) => {
                      event.preventDefault();
                      setOpenDropdown((current) => (current === dropdownId ? null : dropdownId));
                    }}
                  >
                    <span>{label}</span>
                    <ChevronIcon />
                  </summary>
                  <div className="site-header__dropdown-panel">
                    {item.children.map((child) => {
                      const childActive = isRouteMatch(pathname, child.href);

                      return (
                        <Link
                          aria-current={childActive ? "page" : undefined}
                          className={`site-header__dropdown-link${childActive ? " site-header__dropdown-link--active" : ""}`}
                          href={resolveHeaderHref(child.href, locale, currentHref)}
                          key={child.href}
                        >
                          {localize(locale, child.label)}
                        </Link>
                      );
                    })}
                  </div>
                </details>
              );
            }

            return (
              <HeaderNavLink
                active={active}
                currentHref={currentHref}
                href={item.href}
                key={item.href}
                label={item.label}
                locale={locale}
              />
            );
          })}
        </nav>

        <div className="site-header__actions">
          <LocaleToggleLink
            ariaLabel={locale === "en" ? "Switch to Vietnamese" : "Switch to English"}
            className="site-header__locale"
            href={appendLocaleQuery(pathname, localeToggle)}
            locale={localeToggle}
          />

          <Link className="button button--solid site-header__cta" href={appendLocaleQuery(headerMenu.cta.href, locale)}>
            {localize(locale, headerMenu.cta.label)}
          </Link>

          <button
            aria-controls="site-header-drawer"
            aria-expanded={drawerOpen}
            aria-label={drawerOpen ? (locale === "en" ? "Close menu" : "Đóng menu") : locale === "en" ? "Open menu" : "Mở menu"}
            className="site-header__menu-toggle"
            onClick={() => setDrawerOpen((current) => !current)}
            type="button"
          >
            <MenuIcon />
            <span className="site-header__menu-toggle-label">{locale === "en" ? "Menu" : "Menu"}</span>
          </button>
        </div>
      </div>

      {isMounted && drawerOpen
        ? createPortal(
            <div className="site-header__drawer" role="presentation">
              <button
                aria-label={locale === "en" ? "Close menu" : "Đóng menu"}
                className="site-header__drawer-backdrop"
                onClick={() => setDrawerOpen(false)}
                type="button"
              />

              <aside
                aria-label={locale === "en" ? "Mobile menu" : "Menu di động"}
                aria-modal="true"
                className="site-header__drawer-panel"
                id="site-header-drawer"
                role="dialog"
              >
                <div className="site-header__drawer-head">
                  <LogoMark className="site-header__drawer-logo" href={appendLocaleQuery("/", locale)} priority />
                  <button
                    aria-label={locale === "en" ? "Close menu" : "Đóng menu"}
                    className="site-header__drawer-close"
                    onClick={() => setDrawerOpen(false)}
                    type="button"
                  >
                    <CloseIcon />
                  </button>
                </div>

                <div className="site-header__drawer-actions">
                  <LocaleToggleLink
                    ariaLabel={locale === "en" ? "Switch to Vietnamese" : "Switch to English"}
                    className="site-header__locale site-header__locale--drawer"
                    href={appendLocaleQuery(pathname, localeToggle)}
                    locale={localeToggle}
                    onClick={() => setDrawerOpen(false)}
                  />

                  <div className="site-header__cta-wrap">
                    <Link
                      className="button button--solid site-header__cta site-header__cta--drawer"
                      href={appendLocaleQuery(headerMenu.cta.href, locale)}
                      onClick={() => setDrawerOpen(false)}
                    >
                      {localize(locale, headerMenu.cta.label)}
                    </Link>
                  </div>
                </div>

                <nav aria-label={locale === "en" ? "Mobile navigation" : "Điều hướng di động"} className="site-header__drawer-nav">
                  {headerMenu.items.map((item) => {
                    const active = isMenuItemActive(pathname, item);
                    const label = localize(locale, item.label);

                    if (item.children?.length) {
                      const drawerGroupId = item.label.vi;
                      const isDrawerGroupOpen = openDrawerGroup === undefined ? active : openDrawerGroup === drawerGroupId;

                      return (
                        <details className="site-header__drawer-group" key={drawerGroupId} open={isDrawerGroupOpen}>
                          <summary
                            className={`site-header__drawer-link site-header__drawer-link--summary${active ? " site-header__drawer-link--active" : ""}`}
                            aria-label={label}
                            onClick={(event) => {
                              event.preventDefault();
                              setOpenDrawerGroup((current) => {
                                const currentIsOpen = current === undefined ? active : current === drawerGroupId;

                                return currentIsOpen ? null : drawerGroupId;
                              });
                            }}
                          >
                            <span>{label}</span>
                            <ChevronIcon />
                          </summary>
                          <div className="site-header__drawer-submenu">
                            {item.children.map((child) => {
                              const childActive = isRouteMatch(pathname, child.href);

                              return (
                                <Link
                                  aria-current={childActive ? "page" : undefined}
                                  className={`site-header__drawer-sublink${childActive ? " site-header__drawer-sublink--active" : ""}`}
                                  href={resolveHeaderHref(child.href, locale, currentHref)}
                                  key={child.href}
                                  onClick={() => setDrawerOpen(false)}
                                >
                                  {localize(locale, child.label)}
                                </Link>
                              );
                            })}
                          </div>
                        </details>
                      );
                    }

                    return (
                      <HeaderNavLink
                        active={active}
                        currentHref={currentHref}
                        href={item.href}
                        key={item.href}
                        label={item.label}
                        locale={locale}
                        onNavigate={() => setDrawerOpen(false)}
                      />
                    );
                  })}
                </nav>
              </aside>
            </div>,
          document.body
        )
        : null}
    </header>
  );
}
