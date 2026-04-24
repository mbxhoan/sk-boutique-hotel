"use client";

import Link from "next/link";

import { LogoMark } from "@/components/logo-mark";
import { PortalBadge, PortalCard } from "@/components/portal-ui";
import { appendLocaleQuery, localeLabel } from "@/lib/locale";
import type { Locale } from "@/lib/locale";

type MemberPortalSidebarProps = {
  locale: Locale;
};

export function MemberPortalSidebar({ locale }: MemberPortalSidebarProps) {
  const localeToggle = locale === "en" ? "vi" : "en";
  const navItems = [
    {
      href: "#overview",
      label: locale === "en" ? "Overview" : "Tổng quan"
    },
    {
      href: "#booking",
      label: locale === "en" ? "Booking" : "Booking"
    },
    {
      href: "#info",
      label: locale === "en" ? "Info" : "Thông tin"
    }
  ];

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
          <PortalBadge tone="accent">{locale === "en" ? "Member portal" : "Cổng thành viên"}</PortalBadge>
        </div>

        <nav aria-label={locale === "en" ? "Member navigation" : "Điều hướng thành viên"} className="member-portal-sidebar__nav">
          {navItems.map((item) => (
            <a className="member-portal-sidebar__link" href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
      </PortalCard>
    </aside>
  );
}
