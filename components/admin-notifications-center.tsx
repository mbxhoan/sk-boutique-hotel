"use client";

import Link from "next/link";
import { startTransition, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { PortalCard } from "@/components/portal-ui";
import { appendLocaleQuery, type Locale } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { AdminNotificationIcon, AdminNotificationItem, AdminNotificationTone } from "@/lib/supabase/queries/admin-notifications";

type AdminNotificationsMenuProps = {
  items: AdminNotificationItem[];
  locale: Locale;
  viewAllHref: string;
};

type AdminNotificationsPageSectionProps = {
  items: AdminNotificationItem[];
  locale: Locale;
};

const readStorageKey = "sk-admin-notifications-read";

function NotificationIcon({
  icon,
  tone
}: {
  icon: AdminNotificationIcon;
  tone: AdminNotificationTone;
}) {
  const className = `admin-notifications__icon admin-notifications__icon--${tone}`;

  if (icon === "payment") {
    return (
      <span aria-hidden="true" className={className}>
        $
      </span>
    );
  }

  if (icon === "warning") {
    return (
      <span aria-hidden="true" className={className}>
        !
      </span>
    );
  }

  if (icon === "system") {
    return (
      <span aria-hidden="true" className={className}>
        ⌁
      </span>
    );
  }

  return (
    <span aria-hidden="true" className={className}>
      ✓
    </span>
  );
}

function formatRelativeTime(locale: Locale, happenedAt: string, now = Date.now()) {
  const diffMs = new Date(happenedAt).getTime() - now;
  const diffMinutes = Math.round(diffMs / 60_000);
  const formatter = new Intl.RelativeTimeFormat(locale === "en" ? "en" : "vi", { numeric: "auto" });

  if (Math.abs(diffMinutes) < 60) {
    return formatter.format(diffMinutes, "minute");
  }

  const diffHours = Math.round(diffMinutes / 60);

  if (Math.abs(diffHours) < 24) {
    return formatter.format(diffHours, "hour");
  }

  const diffDays = Math.round(diffHours / 24);

  return formatter.format(diffDays, "day");
}

function readStoredNotificationIds() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(readStorageKey);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : [];
  } catch {
    return [];
  }
}

function useNotificationReadState(items: AdminNotificationItem[]) {
  const [readIds, setReadIds] = useState<string[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    setReadIds(readStoredNotificationIds());
    setHasLoaded(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !hasLoaded) {
      return;
    }

    window.localStorage.setItem(readStorageKey, JSON.stringify(readIds));
  }, [hasLoaded, readIds]);

  function markAsRead(id: string) {
    setReadIds((current) => (current.includes(id) ? current : [...current, id]));
  }

  function markAllAsRead() {
    setReadIds((current) => {
      const next = new Set(current);

      for (const item of items) {
        next.add(item.id);
      }

      return Array.from(next);
    });
  }

  return {
    isRead(id: string) {
      return readIds.includes(id);
    },
    markAllAsRead,
    markAsRead
  };
}

function NotificationRow({
  compact = false,
  isRead,
  item,
  locale,
  onClick
}: {
  compact?: boolean;
  isRead: boolean;
  item: AdminNotificationItem;
  locale: Locale;
  onClick?: () => void;
}) {
  const title = localize(locale, { en: item.title_en, vi: item.title_vi });
  const body = localize(locale, { en: item.body_en, vi: item.body_vi });

  return (
    <Link
      className={`admin-notifications__item${isRead ? "" : " admin-notifications__item--unread"}${compact ? " admin-notifications__item--compact" : ""}`}
      href={appendLocaleQuery(item.href, locale)}
      onClick={onClick}
    >
      <NotificationIcon icon={item.icon} tone={item.tone} />
      <div className="admin-notifications__item-copy">
        <div className="admin-notifications__item-head">
          <p className="admin-notifications__item-title">{title}</p>
          {!isRead ? <span aria-hidden="true" className="admin-notifications__item-dot" /> : null}
        </div>
        <p className="admin-notifications__item-body">{body}</p>
        <div className="admin-notifications__item-meta">
          <span>{formatRelativeTime(locale, item.happened_at)}</span>
          {item.branch_name_en || item.branch_name_vi ? (
            <span>{locale === "en" ? item.branch_name_en : item.branch_name_vi}</span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

export function AdminNotificationsMenu({
  items,
  locale,
  viewAllHref
}: AdminNotificationsMenuProps) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const { isRead, markAllAsRead, markAsRead } = useNotificationReadState(items);
  const unreadCount = items.filter((item) => !isRead(item.id)).length;

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current) {
        return;
      }

      if (event.target instanceof Node && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const channel = supabase.channel("admin-notifications");

    channel.on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "audit_logs"
      },
      () => {
        startTransition(() => {
          router.refresh();
        });
      }
    );

    channel.subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [router]);

  return (
    <div className="admin-notifications" ref={rootRef}>
      <button
        aria-expanded={open}
        aria-haspopup="dialog"
        className="admin-shell__icon-button admin-shell__icon-button--notification"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 18 18" width="18">
          <path
            d="M9 3.2a3.5 3.5 0 0 0-3.5 3.5c0 3.7-1.1 4.1-1.1 4.1h9.2s-1.1-.4-1.1-4.1A3.5 3.5 0 0 0 9 3.2Z"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.2"
          />
          <path d="M7.2 13.9a1.8 1.8 0 0 0 3.6 0" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
        </svg>
        {unreadCount > 0 ? (
          <>
            <span className="admin-shell__notification-dot" aria-hidden="true" />
            <span className="admin-notifications__count">{unreadCount > 9 ? "9+" : unreadCount}</span>
          </>
        ) : null}
      </button>

      {open ? (
        <div className="admin-notifications__panel" role="dialog">
          <div className="admin-notifications__panel-head">
            <div>
              <p className="admin-notifications__eyebrow">{locale === "en" ? "Ops inbox" : "Ops inbox"}</p>
              <h3 className="admin-notifications__panel-title">{locale === "en" ? "Notifications" : "Thông báo"}</h3>
            </div>
            <button className="admin-notifications__mark-all" onClick={markAllAsRead} type="button">
              {locale === "en" ? "Mark all as read" : "Đánh dấu đã đọc"}
            </button>
          </div>

          <div className="admin-notifications__panel-list">
            {items.length ? (
              items.map((item) => (
                <NotificationRow
                  compact
                  isRead={isRead(item.id)}
                  item={item}
                  key={item.id}
                  locale={locale}
                  onClick={() => {
                    markAsRead(item.id);
                    setOpen(false);
                  }}
                />
              ))
            ) : (
              <div className="admin-notifications__empty">
                <p>{locale === "en" ? "No recent notifications." : "Chưa có thông báo mới."}</p>
              </div>
            )}
          </div>

          <div className="admin-notifications__panel-footer">
            <Link className="admin-notifications__view-all" href={appendLocaleQuery(viewAllHref, locale)} onClick={() => setOpen(false)}>
              {locale === "en" ? "View all notifications" : "Xem tất cả thông báo"}
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function AdminNotificationsPageSection({
  items,
  locale
}: AdminNotificationsPageSectionProps) {
  const { isRead, markAllAsRead, markAsRead } = useNotificationReadState(items);

  return (
    <div className="admin-page admin-notifications-page">
      <PortalCard className="admin-notifications-page__hero">
        <div className="admin-notifications-page__hero-copy">
          <p className="admin-notifications-page__eyebrow">{locale === "en" ? "Operations" : "Vận hành"}</p>
          <h1 className="admin-notifications-page__title">{locale === "en" ? "Notifications center" : "Trung tâm thông báo"}</h1>
          <p className="admin-notifications-page__description">
            {locale === "en"
              ? "Follow booking confirmations, deposit activity, and operational alerts from one queue."
              : "Theo dõi xác nhận booking, biến động cọc và các cảnh báo vận hành trong một hàng đợi duy nhất."}
          </p>
        </div>
        <div className="admin-notifications-page__hero-actions">
          <span className="admin-notifications-page__hero-pill">
            {items.length} {locale === "en" ? "recent events" : "sự kiện gần đây"}
          </span>
          <button className="button button--text-light" onClick={markAllAsRead} type="button">
            {locale === "en" ? "Mark all as read" : "Đánh dấu đã đọc"}
          </button>
        </div>
      </PortalCard>

      <div className="admin-notifications-page__list">
        {items.length ? (
          items.map((item) => (
            <NotificationRow
              isRead={isRead(item.id)}
              item={item}
              key={item.id}
              locale={locale}
              onClick={() => markAsRead(item.id)}
            />
          ))
        ) : (
          <PortalCard className="admin-notifications-page__empty">
            <p>{locale === "en" ? "No notifications yet." : "Chưa có thông báo nào."}</p>
          </PortalCard>
        )}
      </div>
    </div>
  );
}
