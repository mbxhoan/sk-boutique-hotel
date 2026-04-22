"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

import { LogoMark } from "@/components/logo-mark";
import { appendLocaleQuery, localeLabel, resolveLocale } from "@/lib/locale";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type AdminShellProps = {
  children: ReactNode;
};

type AdminNavItem = {
  icon: "bookings" | "content" | "customers" | "dashboard" | "logout" | "rooms" | "settings" | "support";
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
      vi: "Dashboard",
      en: "Dashboard"
    }
  },
  {
    icon: "bookings",
    href: "/admin/bookings",
    label: {
      vi: "Bookings",
      en: "Bookings"
    }
  },
  {
    icon: "rooms",
    href: "/admin/rooms",
    label: {
      vi: "Room Management",
      en: "Room Management"
    }
  },
  {
    icon: "customers",
    href: "/admin/accounts",
    label: {
      vi: "Customers",
      en: "Customers"
    }
  },
  {
    icon: "content",
    href: "/admin/content-pages",
    label: {
      vi: "Content",
      en: "Content"
    }
  },
  {
    icon: "settings",
    href: "/admin/roles",
    label: {
      vi: "Settings",
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
    | "logout"
    | "notifications"
    | "rooms"
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
  return pathname === href || pathname.startsWith(`${href}/`);
}

function getSearchPlaceholder(pathname: string, locale: "en" | "vi") {
  if (pathname.startsWith("/admin/bookings")) {
    return locale === "en" ? "Search bookings, guests..." : "Tìm booking, khách...";
  }

  if (pathname.startsWith("/admin/rooms")) {
    return locale === "en" ? "Search..." : "Tìm...";
  }

  if (pathname.startsWith("/admin/content-pages")) {
    return locale === "en" ? "Search pages, banners..." : "Tìm trang, banner...";
  }

  return locale === "en" ? "Search bookings, guests..." : "Tìm booking, khách...";
}

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = resolveLocale(searchParams.get("lang"));
  const localeToggle = locale === "en" ? "vi" : "en";
  const showSearchTopbar =
    pathname === "/admin" || pathname.startsWith("/admin/bookings") || pathname.startsWith("/admin/rooms");

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/admin/sign-in");
    router.refresh();
  }

  return (
    <div className="portal-shell portal-shell--admin admin-shell">
      <aside className="admin-shell__sidebar">
        <div className="admin-shell__brand">
          <LogoMark className="admin-shell__logo" href={appendLocaleQuery("/admin", locale)} priority variant="light" />
          <div className="admin-shell__brand-copy">
            <p className="admin-shell__brand-title">SK Boutique</p>
            <p className="admin-shell__brand-subtitle">{locale === "en" ? "Admin Portal" : "Admin Portal"}</p>
          </div>
        </div>

        <nav aria-label={locale === "en" ? "Admin navigation" : "Điều hướng admin"} className="admin-shell__nav">
          {adminNavItems.map((item) => {
            const active = isActiveNavItem(pathname, item.href);

            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={`admin-shell__nav-link${active ? " admin-shell__nav-link--active" : ""}`}
                href={appendLocaleQuery(item.href, locale)}
                key={item.href}
              >
                <span className="admin-shell__nav-icon" aria-hidden="true">
                  <ShellIcon icon={item.icon} />
                </span>
                <span className="admin-shell__nav-label">{item.label[locale]}</span>
              </Link>
            );
          })}
        </nav>

        <div className="admin-shell__footer">
          <a className="admin-shell__footer-link" href="mailto:ops@skboutiquehotel.vn">
            <span className="admin-shell__nav-icon" aria-hidden="true">
              <ShellIcon icon="support" />
            </span>
            <span>{locale === "en" ? "Support" : "Support"}</span>
          </a>
          <button className="admin-shell__footer-link admin-shell__footer-link--button" onClick={handleSignOut} type="button">
            <span className="admin-shell__nav-icon" aria-hidden="true">
              <ShellIcon icon="logout" />
            </span>
            <span>{locale === "en" ? "Log Out" : "Đăng xuất"}</span>
          </button>
        </div>
      </aside>

      <div className="admin-shell__workspace">
        <header className="admin-shell__topbar">
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
          ) : (
            <div className="admin-shell__topbar-brand">
              <p className="admin-shell__topbar-brand-text">SK Boutique Hotel</p>
            </div>
          )}

          <div className="admin-shell__actions">
            <button className="admin-shell__branch-selector" type="button">
              <span className="admin-shell__branch-selector-icon" aria-hidden="true">
                <ShellIcon icon="storefront" size={16} />
              </span>
              <span>{locale === "en" ? "Branch Selector" : "Branch Selector"}</span>
              <span className="admin-shell__branch-selector-chevron" aria-hidden="true">
                <ShellIcon icon="chevron" size={15} />
              </span>
            </button>

            <span className="admin-shell__divider" aria-hidden="true" />

            <button className="admin-shell__icon-button admin-shell__icon-button--notification" type="button">
              <ShellIcon icon="notifications" />
              <span className="admin-shell__notification-dot" aria-hidden="true" />
            </button>

            <button className="admin-shell__icon-button" type="button">
              <ShellIcon icon="storefront" />
            </button>

            <Link className="admin-shell__locale-switch" href={appendLocaleQuery(pathname, localeToggle)}>
              {localeLabel(localeToggle)}
            </Link>

            <button className="admin-shell__avatar" type="button">
              AD
            </button>
          </div>
        </header>

        <main className="admin-shell__content">{children}</main>
      </div>
    </div>
  );
}
