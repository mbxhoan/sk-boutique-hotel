"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { navItems } from "@/lib/site-content";
import { appendLocaleQuery, localeLabel, resolveLocale, translate } from "@/lib/locale";
import { LogoMark } from "@/components/logo-mark";

export function SiteHeader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang"));
  const localeToggle = locale === "en" ? "vi" : "en";

  return (
    <header className="site-header">
      <div className="section-shell site-header__inner">
        <LogoMark className="site-header__logo" href={appendLocaleQuery("/", locale)} priority />

        <nav aria-label="Điều hướng chính" className="site-nav">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={`site-nav__link${active ? " site-nav__link--active" : ""}`}
                href={appendLocaleQuery(item.href, locale)}
                key={item.href}
              >
                {translate(locale, item.label)}
              </Link>
            );
          })}
        </nav>

        <div className="site-header__actions">
          <Link
            aria-label={locale === "en" ? "Switch to Vietnamese" : "Switch to English"}
            className="site-header__locale"
            href={appendLocaleQuery(pathname, localeToggle)}
          >
            {localeLabel(localeToggle)}
          </Link>

          <Link className="button button--solid site-header__cta" href={appendLocaleQuery("/lien-he", locale)}>
            {translate(locale, "Kiểm tra phòng trống")}
          </Link>
        </div>
      </div>
    </header>
  );
}
