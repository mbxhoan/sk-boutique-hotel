"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { createContext, Suspense, useContext, useEffect, useRef, useState } from "react";

import type { Locale } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";

type MemberNotificationItem = {
  body_en: string;
  body_vi: string;
  happened_at: string;
  id: string;
  title_en: string;
  title_vi: string;
  tone: "accent" | "danger" | "soft";
};

type MemberNotificationContextValue = {
  addToast: (status: string, message: string) => void;
  dismissToast: (id: string) => void;
  toasts: MemberNotificationItem[];
};

const MemberNotificationContext = createContext<MemberNotificationContextValue | null>(null);

export function useMemberNotifications() {
  const context = useContext(MemberNotificationContext);
  if (!context) {
    throw new Error("useMemberNotifications must be used within MemberNotificationProvider");
  }
  return context;
}

function createFlashNotification(status: string, message: string): MemberNotificationItem {
  const now = new Date().toISOString();
  return {
    body_en: message,
    body_vi: message,
    happened_at: now,
    id: `member-flash-${status}-${Date.now()}`,
    title_en: status === "success" ? "Action successful" : "Action failed",
    title_vi: status === "success" ? "Thao tác thành công" : "Thao tác chưa thành công",
    tone: status === "success" ? "accent" : "danger"
  };
}

function FlashHandler({ onFlash }: { onFlash: (status: string, message: string) => void }) {
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

    const flashSignature = `${pathname}|${actionStatus}|${actionMessage}`;

    if (handledFlashRef.current === flashSignature) {
      return;
    }

    handledFlashRef.current = flashSignature;
    onFlash(actionStatus, actionMessage);

    // Clean URL
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("actionStatus");
    nextParams.delete("actionMessage");
    const query = nextParams.toString();
    const cleanHref = `${pathname}${query ? `?${query}` : ""}`;
    router.replace(cleanHref);
  }, [onFlash, pathname, router, searchParams]);

  return null;
}

export function MemberNotificationProvider({ children, locale }: { children: ReactNode; locale: Locale }) {
  const [toasts, setToasts] = useState<MemberNotificationItem[]>([]);

  useEffect(() => {
    if (!toasts.length) return;
    const timers = toasts.map((toast) =>
      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== toast.id));
      }, 5000)
    );
    return () => timers.forEach(window.clearTimeout);
  }, [toasts]);

  function addToast(status: string, message: string) {
    const flashItem = createFlashNotification(status, message);
    setToasts((current) => [flashItem, ...current].slice(0, 3));
  }

  function dismissToast(id: string) {
    setToasts((current) => current.filter((item) => item.id !== id));
  }

  return (
    <MemberNotificationContext.Provider value={{ addToast, dismissToast, toasts }}>
      <Suspense fallback={null}>
        <FlashHandler onFlash={addToast} />
      </Suspense>
      {children}
      <MemberToastStack dismissToast={dismissToast} locale={locale} toasts={toasts} />
    </MemberNotificationContext.Provider>
  );
}

function MemberToastStack({
  dismissToast,
  locale,
  toasts
}: {
  dismissToast: (id: string) => void;
  locale: Locale;
  toasts: MemberNotificationItem[];
}) {
  if (!toasts.length) return null;

  return (
    <div className="member-notifications-stack">
      {toasts.map((toast) => (
        <div className={`member-toast member-toast--${toast.tone}`} key={toast.id}>
          <div className="member-toast__content">
            <p className="member-toast__title">{localize(locale, { en: toast.title_en, vi: toast.title_vi })}</p>
            <p className="member-toast__body">{localize(locale, { en: toast.body_en, vi: toast.body_vi })}</p>
          </div>
          <button className="member-toast__close" onClick={() => dismissToast(toast.id)}>
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
