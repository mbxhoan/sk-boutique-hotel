"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import {
  AdminNotificationDialogHost,
  AdminNotificationProvider,
  AdminNotificationToastHost,
  AdminNotificationsMenu
} from "@/components/admin-notifications-center";
import { LogoMark } from "@/components/logo-mark";
import { appendLocaleQuery, localeLabel, resolveLocale } from "@/lib/locale";
import type { AdminNotificationItem } from "@/lib/supabase/queries/admin-notifications";
import type { BranchRow } from "@/lib/supabase/database.types";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type AdminShellProps = {
  children: ReactNode;
  branches: Pick<BranchRow, "id" | "name_en" | "name_vi" | "slug">[];
  notifications: AdminNotificationItem[];
};

type AdminNavItem = {
  icon: "bookings" | "content" | "customers" | "dashboard" | "logout" | "media" | "rooms" | "roomTypes" | "settings" | "support";
  href: string;
  label: {
    en: string;
    vi: string;
  };
};

const adminNavItems: AdminNavItem[] = [
  {
    icon: "dashboard",
    href: "/admin",
    label: {
      vi: "Tổng quan",
      en: "Dashboard"
    }
  },
  {
    icon: "bookings",
    href: "/admin/bookings",
    label: {
      vi: "Đặt phòng",
      en: "Bookings"
    }
  },
  {
    icon: "rooms",
    href: "/admin/rooms",
    label: {
      vi: "Quản lý phòng",
      en: "Room Management"
    }
  },
  {
    icon: "roomTypes",
    href: "/admin/room-types",
    label: {
      vi: "Hạng phòng",
      en: "Room Types"
    }
  },
  {
    icon: "media",
    href: "/admin/media",
    label: {
      vi: "Thư viện ảnh",
      en: "Media Library"
    }
  },
  {
    icon: "customers",
    href: "/admin/accounts",
    label: {
      vi: "Khách hàng",
      en: "Customers"
    }
  },
  {
    icon: "content",
    href: "/admin/content-pages",
    label: {
      vi: "Nội dung",
      en: "Content"
    }
  },
  {
    icon: "settings",
    href: "/admin/roles",
    label: {
      vi: "Cài đặt",
      en: "Settings"
    }
  }
];

function ShellIcon({
  icon,
  size = 18
}: {
  icon:
    | "bookings"
    | "content"
    | "customers"
    | "dashboard"
    | "close"
    | "logout"
    | "media"
    | "menu"
    | "notifications"
    | "rooms"
    | "roomTypes"
    | "search"
    | "settings"
    | "storefront"
    | "support"
    | "chevron";
  size?: number;
}) {
  if (icon === "search") {
    return (
      <svg aria-hidden="true" fill="none" height={size} viewBox="0 0 18 18" width={size}>
        <circle cx="7.6" cy="7.6" r="4.9" stroke="currentColor" strokeWidth="1.4" />
        <path d="M11.3 11.3L15 15" stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" />
      </svg>
    );
  }

  if (icon === "menu") {
    return (
      <svg aria-hidden="true" fill="none" height={size} viewBox="0 0 18 18" width={size}>
        <path d="M3 4.8h12" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
        <path d="M3 9h12" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
        <path d="M3 13.2h12" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
      </svg>
    );
  }

  if (icon === "close") {
    return (
      <svg aria-hidden="true" fill="none" height={size} viewBox="0 0 18 18" width={size}>
        <path d="M4.8 4.8 13.2 13.2" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
        <path d="M13.2 4.8 4.8 13.2" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
      </svg>
    );
  }

  if (icon === "notifications") {
    return (
      <svg aria-hidden="true" fill="none" height={size} viewBox="0 0 18 18" width={size}>
        <path
          d="M9 3.2a3.5 3.5 0 0 0-3.5 3.5c0 3.7-1.1 4.1-1.1 4.1h9.2s-1.1-.4-1.1-4.1A3.5 3.5 0 0 0 9 3.2Z"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="1.2"
        />
        <path d="M7.2 13.9a1.8 1.8 0 0 0 3.6 0" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
      </svg>
    );
  }

  if (icon === "storefront") {
    return (
      <svg aria-hidden="true" fill="none" height={size} viewBox="0 0 18 18" width={size}>
        <path d="M3.5 6h11" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
        <path
          d="M4.2 6 5 3.8h8l.8 2.2M4.8 6v7.2h8.4V6"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="1.2"
        />
        <path d="M7.2 13.2V9.7h3.6v3.5" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.2" />
      </svg>
    );
  }

  if (icon === "chevron") {
    return (
      <svg aria-hidden="true" fill="none" height={size} viewBox="0 0 18 18" width={size}>
        <path d="M4.6 6.8L9 11.2l4.4-4.4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" />
      </svg>
    );
  }

  if (icon === "bookings") {
    return (
      <svg aria-hidden="true" fill="none" height={size} viewBox="0 0 18 18" width={size}>
        <rect height="11.2" rx="1.5" stroke="currentColor" strokeWidth="1.2" width="12.2" x="2.9" y="3.2" />
        <path d="M5.1 2.6v2.3M12.9 2.6v2.3M4.2 7.2h9.6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
      </svg>
    );
  }

  if (icon === "media") {
    return (
      <svg aria-hidden="true" fill="none" height={size} viewBox="0 0 18 18" width={size}>
        <rect height="11.6" rx="1.8" stroke="currentColor" strokeWidth="1.2" width="13.2" x="2.4" y="3.2" />
        <path d="M5 11.4 7.4 8.8l2.1 2 1.9-1.8 2.2 2.4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
        <circle cx="6" cy="6.4" fill="currentColor" r=".8" />
      </svg>
    );
  }

  if (icon === "roomTypes") {
    return (
      <svg aria-hidden="true" fill="none" height={size} viewBox="0 0 18 18" width={size}>
        <path d="M3.5 6.1 9 3l5.5 3.1-5.5 3.1L3.5 6.1Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.2" />
        <path d="M3.5 10.1 9 13l5.5-2.9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
        <path d="M3.5 8.1 9 11l5.5-2.9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
      </svg>
    );
  }

  if (icon === "rooms") {
    return (
      <svg aria-hidden="true" fill="none" height={size} viewBox="0 0 18 18" width={size}>
        <path
          d="M4 14V5.3a1.1 1.1 0 0 1 1.1-1.1h7.8A1.1 1.1 0 0 1 14 5.3V14"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.2"
        />
        <path d="M5.4 14v-2.8h7.2V14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
        <path d="M6.7 8.2h4.6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
      </svg>
    );
  }

  if (icon === "customers") {
    return (
      <svg aria-hidden="true" fill="none" height={size} viewBox="0 0 18 18" width={size}>
        <circle cx="9" cy="6.1" r="2.7" stroke="currentColor" strokeWidth="1.2" />
        <path d="M4.4 14.1c.5-2.4 2.4-4 4.6-4s4.1 1.6 4.6 4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
      </svg>
    );
  }

  if (icon === "content") {
    return (
      <svg aria-hidden="true" fill="none" height={size} viewBox="0 0 18 18" width={size}>
        <path d="M4.2 3.8h7.1l2.5 2.6v7.8H4.2V3.8Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.2" />
        <path d="M11.3 3.8v2.6h2.5" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.2" />
        <path d="M6.2 9.1h5.7M6.2 11.4h5.7" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
      </svg>
    );
  }

  if (icon === "settings") {
    return (
      <svg aria-hidden="true" fill="none" height={size} viewBox="0 0 18 18" width={size}>
        <path
          d="M7.4 3.3h3.2l.4 1.5a5.5 5.5 0 0 1 1.4.8l1.4-.5 1.6 2.8-1.2 1a5.5 5.5 0 0 1 0 1.6l1.2 1-1.6 2.8-1.4-.5a5.5 5.5 0 0 1-1.4.8l-.4 1.5H7.4L7 14.8a5.5 5.5 0 0 1-1.4-.8l-1.4.5-1.6-2.8 1.2-1a5.5 5.5 0 0 1 0-1.6l-1.2-1 1.6-2.8 1.4.5A5.5 5.5 0 0 1 7 4.8l.4-1.5Z"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="1.1"
        />
        <circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    );
  }

  if (icon === "support") {
    return (
      <svg aria-hidden="true" fill="none" height={size} viewBox="0 0 18 18" width={size}>
        <path
          d="M9 3.1a4.9 4.9 0 0 0-4.9 4.9v1.8c0 1.3.9 2.4 2.1 2.7v.9a.9.9 0 0 0 1.5.7l1.1-.9h1.9a4.9 4.9 0 0 0 4.9-4.9V8a4.9 4.9 0 0 0-4.9-4.9Z"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="1.2"
        />
        <path d="M9 6.1c.8 0 1.4.5 1.4 1.1 0 .7-.7 1-.9 1.2-.3.2-.5.5-.5 1" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
        <circle cx="9" cy="11.7" fill="currentColor" r=".75" />
      </svg>
    );
  }

  if (icon === "logout") {
    return (
      <svg aria-hidden="true" fill="none" height={size} viewBox="0 0 18 18" width={size}>
        <path d="M7.1 3.6H4.4A1.4 1.4 0 0 0 3 5v8A1.4 1.4 0 0 0 4.4 14.4h2.7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
        <path d="M10 6.1 12.9 9 10 11.9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
        <path d="M12.9 9H7.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" fill="none" height={size} viewBox="0 0 18 18" width={size}>
      <path d="M3.4 8.8 9 3.4l5.6 5.4V14H3.4V8.8Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.2" />
    </svg>
  );
}

function isActiveNavItem(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function getSearchPlaceholder(pathname: string, locale: "en" | "vi") {
  if (pathname.startsWith("/admin/bookings")) {
    return locale === "en" ? "Search bookings, guests..." : "Tìm booking, khách...";
  }

  if (pathname.startsWith("/admin/rooms")) {
    return locale === "en" ? "Search rooms, types..." : "Tìm phòng, loại phòng...";
  }

  if (pathname.startsWith("/admin/room-types")) {
    return locale === "en" ? "Search room types..." : "Tìm hạng phòng...";
  }

  if (pathname.startsWith("/admin/media")) {
    return locale === "en" ? "Search media, folders..." : "Tìm media, thư mục...";
  }

  if (pathname.startsWith("/admin/content-pages")) {
    return locale === "en" ? "Search pages, banners..." : "Tìm trang, banner...";
  }

  return locale === "en" ? "Search bookings, guests..." : "Tìm booking, khách...";
}

function buildBranchHref(
  pathname: string,
  searchParams: {
    toString(): string;
  },
  locale: "en" | "vi",
  branchId?: string | null
) {
  const params = new URLSearchParams(searchParams.toString());

  if (branchId) {
    params.set("branch", branchId);
  } else {
    params.delete("branch");
  }

  const query = params.toString();
  return appendLocaleQuery(`${pathname}${query ? `?${query}` : ""}`, locale);
}

export function AdminShell({ children, branches, notifications }: AdminShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const locale = resolveLocale(searchParams.get("lang"));
  const localeToggle = locale === "en" ? "vi" : "en";
  const currentSearch = searchParams.toString();
  const currentHref = currentSearch ? `${pathname}?${currentSearch}` : pathname;
  const branchId = searchParams.get("branch");
  const currentBranch =
    branches.find((branch) => branch.id === branchId) ?? branches[0] ?? null;
  const showSearchTopbar =
    pathname === "/admin" ||
    pathname.startsWith("/admin/bookings") ||
    pathname.startsWith("/admin/rooms") ||
    pathname.startsWith("/admin/room-types") ||
    pathname.startsWith("/admin/media");

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [currentSearch, pathname]);

  useEffect(() => {
    if (!isMobileNavOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMobileNavOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileNavOpen]);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    navigator.serviceWorker.register("/admin/sw.js", { scope: "/admin/" }).catch(() => {
      // Ignore failures. The portal still works without a service worker.
    });
  }, []);

  async function handleSignOut() {
    setIsMobileNavOpen(false);
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/admin/sign-in");
    router.refresh();
  }

  const mainNavItems = adminNavItems.slice(0, -1);
  const settingsNavItem = adminNavItems[adminNavItems.length - 1];

  return (
    <AdminNotificationProvider locale={locale} serverItems={notifications}>
      <div className="portal-shell portal-shell--admin admin-shell">
        {isMobileNavOpen ? (
          <button
            aria-label={locale === "en" ? "Close admin menu" : "Đóng menu admin"}
            className="admin-shell__drawer-overlay"
            onClick={() => setIsMobileNavOpen(false)}
            type="button"
          />
        ) : null}

        <aside
          className={`admin-shell__sidebar${isMobileNavOpen ? " admin-shell__sidebar--open" : ""}`}
          id="admin-shell-sidebar"
        >
          <div className="admin-shell__sidebar-head">
            <div className="admin-shell__brand">
              <LogoMark className="admin-shell__logo" href={appendLocaleQuery("/admin", locale)} priority variant="light" />
              <div className="admin-shell__brand-copy">
                <p className="admin-shell__brand-title">SK Boutique</p>
                <p className="admin-shell__brand-subtitle">{locale === "en" ? "Admin Portal" : "Cổng quản trị"}</p>
              </div>
            </div>

            <button
              aria-label={locale === "en" ? "Close admin menu" : "Đóng menu admin"}
              className="admin-shell__sidebar-close"
              onClick={() => setIsMobileNavOpen(false)}
              type="button"
            >
              <ShellIcon icon="close" size={18} />
            </button>
          </div>

          <div className="admin-shell__sidebar-controls">
            <details className="admin-shell__branch-menu">
              <summary className="admin-shell__branch-selector">
                <span className="admin-shell__branch-selector-icon" aria-hidden="true">
                  <ShellIcon icon="storefront" size={16} />
                </span>
                <span>{currentBranch ? (locale === "en" ? currentBranch.name_en : currentBranch.name_vi) : locale === "en" ? "Branch selector" : "Chọn chi nhánh"}</span>
                <span className="admin-shell__branch-selector-chevron" aria-hidden="true">
                  <ShellIcon icon="chevron" size={15} />
                </span>
              </summary>
              <div className="admin-shell__branch-menu-panel" role="menu">
                <Link className="admin-shell__branch-menu-link" href={buildBranchHref(pathname, searchParams, locale)}>
                  {locale === "en" ? "All branches" : "Tất cả chi nhánh"}
                </Link>
                {branches.map((branch) => {
                  const href = buildBranchHref(pathname, searchParams, locale, branch.id);
                  const active = branch.id === currentBranch?.id;

                  return (
                    <Link
                      aria-current={active ? "page" : undefined}
                      className={`admin-shell__branch-menu-link${active ? " admin-shell__branch-menu-link--active" : ""}`}
                      href={href}
                      key={branch.id}
                      onClick={() => setIsMobileNavOpen(false)}
                    >
                      <span>{locale === "en" ? branch.name_en : branch.name_vi}</span>
                    </Link>
                  );
                })}
              </div>
            </details>

            <Link className="admin-shell__locale-switch" href={appendLocaleQuery(currentHref, localeToggle)}>
              {localeLabel(localeToggle)}
            </Link>
          </div>

          <nav aria-label={locale === "en" ? "Admin navigation" : "Điều hướng admin"} className="admin-shell__nav">
            {mainNavItems.map((item) => {
              const active = isActiveNavItem(pathname, item.href);

              return (
                <Link
                  aria-current={active ? "page" : undefined}
                  className={`admin-shell__nav-link${active ? " admin-shell__nav-link--active" : ""}`}
                  href={appendLocaleQuery(item.href, locale)}
                  key={item.href}
                  onClick={() => setIsMobileNavOpen(false)}
                >
                  <span className="admin-shell__nav-icon" aria-hidden="true">
                    <ShellIcon icon={item.icon} />
                  </span>
                  <span className="admin-shell__nav-label">{item.label[locale]}</span>
                </Link>
              );
            })}

            <div className="admin-shell__nav-divider" aria-hidden="true" />
          </nav>

          <div className="admin-shell__footer">
            {settingsNavItem ? (
              <Link
                aria-current={isActiveNavItem(pathname, settingsNavItem.href) ? "page" : undefined}
                className={`admin-shell__footer-link${isActiveNavItem(pathname, settingsNavItem.href) ? " admin-shell__nav-link--active" : ""}`}
                href={appendLocaleQuery(settingsNavItem.href, locale)}
                key={settingsNavItem.href}
                onClick={() => setIsMobileNavOpen(false)}
              >
                <span className="admin-shell__nav-icon" aria-hidden="true">
                  <ShellIcon icon={settingsNavItem.icon} />
                </span>
                <span>{settingsNavItem.label[locale]}</span>
              </Link>
            ) : null}
            <a className="admin-shell__footer-link" href="mailto:ops@skboutiquehotel.vn" onClick={() => setIsMobileNavOpen(false)}>
              <span className="admin-shell__nav-icon" aria-hidden="true">
                <ShellIcon icon="support" />
              </span>
              <span>{locale === "en" ? "Support" : "Hỗ trợ"}</span>
            </a>
            <button className="admin-shell__footer-link admin-shell__footer-link--button" onClick={handleSignOut} type="button">
              <span className="admin-shell__nav-icon" aria-hidden="true">
                <ShellIcon icon="logout" />
              </span>
              <span>{locale === "en" ? "Log out" : "Đăng xuất"}</span>
            </button>
          </div>
        </aside>

        <div className="admin-shell__workspace">
          <header className="admin-shell__topbar">
            <button
              aria-controls="admin-shell-sidebar"
              aria-expanded={isMobileNavOpen}
              aria-label={locale === "en" ? "Open admin menu" : "Mở menu admin"}
              className="admin-shell__menu-button"
              onClick={() => setIsMobileNavOpen(true)}
              type="button"
            >
              <ShellIcon icon="menu" size={20} />
            </button>

            <div className={`admin-shell__topbar-brand${showSearchTopbar ? " admin-shell__topbar-brand--with-search" : ""}`}>
              <LogoMark className="admin-shell__topbar-logo" href={appendLocaleQuery("/admin", locale)} priority={pathname === "/admin"} variant="noBg" />
              <p className="admin-shell__topbar-brand-text">SK Boutique Hotel</p>
            </div>

            {showSearchTopbar ? (
              <label className="admin-shell__search">
                <span className="admin-shell__search-icon" aria-hidden="true">
                  <ShellIcon icon="search" size={17} />
                </span>
                <input
                  aria-label={locale === "en" ? "Search admin portal" : "Tìm kiếm admin portal"}
                  className="admin-shell__search-input"
                  defaultValue=""
                  placeholder={getSearchPlaceholder(pathname, locale)}
                  type="search"
                />
              </label>
            ) : null}

            <div className="admin-shell__actions">
              <details className="admin-shell__branch-menu">
                <summary className="admin-shell__branch-selector">
                  <span className="admin-shell__branch-selector-icon" aria-hidden="true">
                    <ShellIcon icon="storefront" size={16} />
                  </span>
                  <span>{currentBranch ? (locale === "en" ? currentBranch.name_en : currentBranch.name_vi) : locale === "en" ? "Branch selector" : "Chọn chi nhánh"}</span>
                  <span className="admin-shell__branch-selector-chevron" aria-hidden="true">
                    <ShellIcon icon="chevron" size={15} />
                  </span>
                </summary>
                <div className="admin-shell__branch-menu-panel" role="menu">
                  <Link className="admin-shell__branch-menu-link" href={buildBranchHref(pathname, searchParams, locale)}>
                    {locale === "en" ? "All branches" : "Tất cả chi nhánh"}
                  </Link>
                  {branches.map((branch) => {
                    const href = buildBranchHref(pathname, searchParams, locale, branch.id);
                    const active = branch.id === currentBranch?.id;

                    return (
                      <Link
                        aria-current={active ? "page" : undefined}
                        className={`admin-shell__branch-menu-link${active ? " admin-shell__branch-menu-link--active" : ""}`}
                        href={href}
                        key={branch.id}
                      >
                        <span>{locale === "en" ? branch.name_en : branch.name_vi}</span>
                      </Link>
                    );
                  })}
                </div>
              </details>

              <span className="admin-shell__divider" aria-hidden="true" />

              <AdminNotificationsMenu locale={locale} viewAllHref="/admin/notifications" />

              <Link className="admin-shell__locale-switch" href={appendLocaleQuery(currentHref, localeToggle)}>
                {localeLabel(localeToggle)}
              </Link>

              <button className="admin-shell__avatar" aria-label={locale === "en" ? "Profile" : "Hồ sơ cá nhân"} type="button">
                AD
              </button>
            </div>
          </header>

          <main className="admin-shell__content">{children}</main>
        </div>
      </div>
      <AdminNotificationToastHost />
      <AdminNotificationDialogHost />
    </AdminNotificationProvider>
  );
}
