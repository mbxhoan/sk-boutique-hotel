"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createContext, startTransition, Suspense, type ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react";

import { PortalCard } from "@/components/portal-ui";
import { appendLocaleQuery, type Locale } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { AdminNotificationIcon, AdminNotificationItem, AdminNotificationTone } from "@/lib/supabase/queries/admin-notifications";

type AdminNotificationsMenuProps = {
  locale: Locale;
  viewAllHref: string;
};

type AdminNotificationsPageSectionProps = {
  locale: Locale;
};

type AdminNotificationCenterValue = {
  addFlash: (status: "success" | "error", message: string) => void;
  closeNotification: () => void;
  dismissToast: (id: string) => void;
  isRead: (id: string) => boolean;
  items: AdminNotificationItem[];
  locale: Locale;
  markAllAsRead: () => void;
  openNotification: (item: AdminNotificationItem) => void;
  selectedNotification: AdminNotificationItem | null;
  toasts: AdminNotificationItem[];
};

const readStorageKey = "sk-admin-notifications-read";
const localStorageKey = "sk-admin-notifications-local";
const maxStoredNotifications = 24;
const maxToastCount = 3;

const AdminNotificationCenterContext = createContext<AdminNotificationCenterValue | null>(null);

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

function readStoredLocalNotifications() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(localStorageKey);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is AdminNotificationItem => Boolean(item) && typeof item.id === "string");
  } catch {
    return [];
  }
}

function persistLocalNotifications(items: AdminNotificationItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(localStorageKey, JSON.stringify(items));
}

function persistReadIds(items: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(readStorageKey, JSON.stringify(items));
}

function sortNotifications(items: AdminNotificationItem[]) {
  return [...items].sort((left, right) => {
    const leftTime = new Date(left.happened_at).getTime();
    const rightTime = new Date(right.happened_at).getTime();

    if (leftTime === rightTime) {
      return right.id.localeCompare(left.id);
    }

    return rightTime - leftTime;
  });
}

function shouldOpenNotificationDialog(item: AdminNotificationItem) {
  return item.icon === "system" || item.tone === "danger";
}

function mergeNotifications(serverItems: AdminNotificationItem[], localItems: AdminNotificationItem[]) {
  const merged = new Map<string, AdminNotificationItem>();

  for (const item of [...localItems, ...serverItems]) {
    merged.set(item.id, item);
  }

  return sortNotifications(Array.from(merged.values()));
}

function createFlashNotification({
  href,
  message,
  status
}: {
  href: string;
  message: string;
  status: "error" | "success";
}): AdminNotificationItem {
  const now = new Date().toISOString();

  return {
    action: `flash.${status}`,
    body_en: message,
    body_vi: message,
    branch_name_en: null,
    branch_name_vi: null,
    happened_at: now,
    href,
    icon: status === "success" ? "system" : "warning",
    id: `flash-${status}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title_en: status === "success" ? "Action successful" : "Action failed",
    title_vi: status === "success" ? "Thao tác thành công" : "Thao tác chưa thành công",
    tone: status === "success" ? "accent" : "danger"
  };
}

function buildCleanHref(pathname: string, searchParams: URLSearchParams) {
  const nextParams = new URLSearchParams(searchParams.toString());
  nextParams.delete("actionStatus");
  nextParams.delete("actionMessage");

  const query = nextParams.toString();

  return `${pathname}${query ? `?${query}` : ""}`;
}

function useAdminNotificationCenterState(locale: Locale, serverItems: AdminNotificationItem[]) {
  const pathname = usePathname();
  const router = useRouter();
  const [readIds, setReadIds] = useState<string[]>([]);
  const [localItems, setLocalItems] = useState<AdminNotificationItem[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<AdminNotificationItem | null>(null);
  const [toasts, setToasts] = useState<AdminNotificationItem[]>([]);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    setReadIds(readStoredNotificationIds());
    setLocalItems(readStoredLocalNotifications());
    hasLoadedRef.current = true;
  }, []);

  useEffect(() => {
    if (!hasLoadedRef.current || typeof window === "undefined") {
      return;
    }

    persistReadIds(readIds);
  }, [readIds]);

  useEffect(() => {
    if (!hasLoadedRef.current || typeof window === "undefined") {
      return;
    }

    persistLocalNotifications(localItems.slice(0, maxStoredNotifications));
  }, [localItems]);

  function addFlash(status: "success" | "error", message: string) {
    const flashItem = createFlashNotification({
      href: pathname,
      message,
      status
    });

    setLocalItems((current) => {
      const next = mergeNotifications([], [flashItem, ...current]);
      return next.slice(0, maxStoredNotifications);
    });
    setToasts((current) => [flashItem, ...current.filter((item) => item.id !== flashItem.id)].slice(0, maxToastCount));
  }

  useEffect(() => {
    if (!toasts.length) {
      return;
    }

    const timers = toasts.map((toast) =>
      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== toast.id));
      }, 5500)
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [toasts]);

  const items = useMemo(() => mergeNotifications(serverItems, localItems), [localItems, serverItems]);

  function isRead(id: string) {
    return readIds.includes(id);
  }

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

  function openNotification(item: AdminNotificationItem) {
    markAsRead(item.id);

    if (shouldOpenNotificationDialog(item)) {
      setSelectedNotification(item);
      return;
    }

    router.push(appendLocaleQuery(item.href, locale));
  }

  function closeNotification() {
    setSelectedNotification(null);
  }

  function dismissToast(id: string) {
    setToasts((current) => current.filter((item) => item.id !== id));
  }

  return {
    addFlash,
    closeNotification,
    dismissToast,
    isRead,
    items,
    locale,
    markAllAsRead,
    openNotification,
    selectedNotification,
    toasts
  } satisfies AdminNotificationCenterValue;
}

function FlashHandler({ onFlash }: { onFlash: (status: "success" | "error", message: string) => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const handledFlashRef = useRef<string | null>(null);

  useEffect(() => {
    const actionStatus = searchParams.get("actionStatus");
    const actionMessage = searchParams.get("actionMessage");

    if (!actionStatus || !actionMessage) {
      handledFlashRef.current = null;
      return;
    }

    const flashStatus = actionStatus === "success" ? "success" : "error";
    const flashSignature = `${pathname}|${flashStatus}|${actionMessage}`;

    if (handledFlashRef.current === flashSignature) {
      return;
    }

    handledFlashRef.current = flashSignature;
    onFlash(flashStatus, actionMessage);

    const cleanHref = buildCleanHref(pathname, new URLSearchParams(searchParams.toString()));
    router.replace(cleanHref);
  }, [onFlash, pathname, router, searchParams]);

  return null;
}

export function AdminNotificationProvider({
  children,
  locale,
  serverItems
}: {
  children: ReactNode;
  locale: Locale;
  serverItems: AdminNotificationItem[];
}) {
  const value = useAdminNotificationCenterState(locale, serverItems);

  return (
    <AdminNotificationCenterContext.Provider value={value}>
      <Suspense fallback={null}>
        <FlashHandler onFlash={value.addFlash} />
      </Suspense>
      {children}
    </AdminNotificationCenterContext.Provider>
  );
}

export function useAdminNotificationCenter() {
  const context = useContext(AdminNotificationCenterContext);

  if (!context) {
    throw new Error("useAdminNotificationCenter must be used within AdminNotificationProvider.");
  }

  return context;
}

function NotificationItemButton({
  item,
  locale,
  onOpen,
  unread
}: {
  item: AdminNotificationItem;
  locale: Locale;
  onOpen: () => void;
  unread: boolean;
}) {
  const title = localize(locale, { en: item.title_en, vi: item.title_vi });
  const body = localize(locale, { en: item.body_en, vi: item.body_vi });

  return (
    <button
      className={`admin-notifications__item${unread ? " admin-notifications__item--unread" : ""}`}
      onClick={onOpen}
      type="button"
    >
      <NotificationIcon icon={item.icon} tone={item.tone} />
      <div className="admin-notifications__item-copy">
        <div className="admin-notifications__item-head">
          <p className="admin-notifications__item-title">{title}</p>
          {unread ? <span aria-hidden="true" className="admin-notifications__item-dot" /> : null}
        </div>
        <p className="admin-notifications__item-body">{body}</p>
        <div className="admin-notifications__item-meta">
          <span>{formatRelativeTime(locale, item.happened_at)}</span>
          {item.branch_name_en || item.branch_name_vi ? <span>{locale === "en" ? item.branch_name_en : item.branch_name_vi}</span> : null}
        </div>
      </div>
    </button>
  );
}

function NotificationDialog() {
  const { closeNotification, selectedNotification, locale } = useAdminNotificationCenter();

  useEffect(() => {
    if (!selectedNotification) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeNotification();
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [closeNotification, selectedNotification]);

  if (!selectedNotification) {
    return null;
  }

  const title = localize(locale, { en: selectedNotification.title_en, vi: selectedNotification.title_vi });
  const body = localize(locale, { en: selectedNotification.body_en, vi: selectedNotification.body_vi });
  const href = appendLocaleQuery(selectedNotification.href, locale);

  return (
    <div
      aria-hidden="false"
      aria-modal="true"
      className="admin-notifications__dialog-backdrop"
      onClick={closeNotification}
      role="presentation"
    >
      <div className="admin-notifications__dialog" onClick={(event) => event.stopPropagation()} role="dialog">
        <div className="admin-notifications__dialog-head">
          <div>
            <p className="admin-notifications__eyebrow">{locale === "en" ? "Notification detail" : "Chi tiết thông báo"}</p>
            <h3 className="admin-notifications__dialog-title">{title}</h3>
          </div>
          <button aria-label={locale === "en" ? "Close notification" : "Đóng thông báo"} className="admin-notifications__dialog-close" onClick={closeNotification} type="button">
            ×
          </button>
        </div>

        <div className="admin-notifications__dialog-body">
          <NotificationIcon icon={selectedNotification.icon} tone={selectedNotification.tone} />
          <div className="admin-notifications__dialog-copy">
            <p className="admin-notifications__dialog-message">{body}</p>
            <div className="admin-notifications__dialog-meta">
              <span>{formatRelativeTime(locale, selectedNotification.happened_at)}</span>
              {selectedNotification.branch_name_en || selectedNotification.branch_name_vi ? (
                <span>{locale === "en" ? selectedNotification.branch_name_en : selectedNotification.branch_name_vi}</span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="admin-notifications__dialog-actions">
          <button className="button button--text-light" onClick={closeNotification} type="button">
            {locale === "en" ? "Close" : "Đóng"}
          </button>
          {selectedNotification.href !== "/admin" ? (
            <Link className="button button--solid" href={href} onClick={closeNotification}>
              {locale === "en" ? "Open related page" : "Mở trang liên quan"}
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ToastStack() {
  const { dismissToast, locale, openNotification, toasts } = useAdminNotificationCenter();

  if (!toasts.length) {
    return null;
  }

  return (
    <div className="admin-notifications__toast-stack" aria-live="polite" aria-relevant="additions removals">
      {toasts.map((toast) => {
        const title = localize(locale, { en: toast.title_en, vi: toast.title_vi });
        const body = localize(locale, { en: toast.body_en, vi: toast.body_vi });

        return (
          <div
            className={`admin-notifications__toast admin-notifications__toast--${toast.tone}`}
            key={toast.id}
            onClick={() => openNotification(toast)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openNotification(toast);
              }
            }}
          >
            <NotificationIcon icon={toast.icon} tone={toast.tone} />
            <div className="admin-notifications__toast-copy">
              <p className="admin-notifications__toast-title">{title}</p>
              <p className="admin-notifications__toast-body">{body}</p>
            </div>
            <button
              aria-label={locale === "en" ? "Dismiss notification" : "Đóng thông báo"}
              className="admin-notifications__toast-close"
              onClick={(event) => {
                event.stopPropagation();
                dismissToast(toast.id);
              }}
              type="button"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function AdminNotificationsMenu({ locale, viewAllHref }: AdminNotificationsMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const { items, isRead, markAllAsRead, openNotification } = useAdminNotificationCenter();
  const unreadCount = items.filter((item) => !isRead(item.id)).length;

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (containerRef.current?.contains(target)) return;
      setOpen(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open]);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const channel = supabase.channel("admin-notifications");
    const trackedTables = [
      "availability_requests",
      "room_holds",
      "reservations",
      "payment_requests",
      "payment_proofs",
      "audit_logs"
    ] as const;

    for (const table of trackedTables) {
      for (const event of ["INSERT", "UPDATE", "DELETE"] as const) {
        if (table === "audit_logs" && event !== "INSERT") {
          continue;
        }

        channel.on(
          "postgres_changes",
          {
            event,
            schema: "public",
            table
          },
          () => {
            startTransition(() => {
              router.refresh();
            });
          }
        );
      }
    }

    channel.subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [router]);

  return (
    <div className="admin-notifications" ref={containerRef}>
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
        <section
          aria-labelledby="admin-notifications-menu-title"
          className="admin-notifications__panel"
          role="dialog"
        >
            <div className="admin-notifications__panel-head">
              <div>
                <p className="admin-notifications__eyebrow">{locale === "en" ? "Ops inbox" : "Ops inbox"}</p>
                <h3 className="admin-notifications__panel-title" id="admin-notifications-menu-title">
                  {locale === "en" ? "Notifications" : "Thông báo"}
                </h3>
              </div>

              <div className="admin-notifications__panel-head-actions">
                <button className="admin-notifications__mark-all" onClick={markAllAsRead} type="button">
                  {locale === "en" ? "Mark all as read" : "Đánh dấu đã đọc"}
                </button>
                <button
                  aria-label={locale === "en" ? "Close notifications" : "Đóng thông báo"}
                  className="admin-notifications__panel-close"
                  onClick={() => setOpen(false)}
                  type="button"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="admin-notifications__panel-list">
              {items.length ? (
                items.map((item) => (
                  <NotificationItemButton
                    item={item}
                    key={item.id}
                    locale={locale}
                    onOpen={() => {
                      setOpen(false);
                      openNotification(item);
                    }}
                    unread={!isRead(item.id)}
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
        </section>
      ) : null}
    </div>
  );
}

export function AdminNotificationToastHost() {
  return <ToastStack />;
}

export function AdminNotificationDialogHost() {
  return <NotificationDialog />;
}

export function AdminNotificationsPageSection({ locale }: AdminNotificationsPageSectionProps) {
  const { isRead, items, markAllAsRead, openNotification } = useAdminNotificationCenter();

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
            <NotificationItemButton item={item} key={item.id} locale={locale} onOpen={() => openNotification(item)} unread={!isRead(item.id)} />
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
