"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { PageLoadingScreen } from "@/components/page-loading-screen";
import { resolveLocale } from "@/lib/locale";

const SHOW_DELAY_MS = 120;
const FAIL_SAFE_HIDE_MS = 15_000;

export function NavigationLoadingIndicator() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang"));
  const search = searchParams.toString();
  const [isVisible, setIsVisible] = useState(false);
  const showTimerRef = useRef<number | null>(null);
  const failSafeTimerRef = useRef<number | null>(null);
  const pendingHrefRef = useRef<string | null>(null);

  const resetPendingNavigation = () => {
    if (showTimerRef.current !== null) {
      window.clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }

    if (failSafeTimerRef.current !== null) {
      window.clearTimeout(failSafeTimerRef.current);
      failSafeTimerRef.current = null;
    }

    pendingHrefRef.current = null;
    setIsVisible(false);
  };

  const schedulePendingNavigation = (nextHref: string) => {
    if (pendingHrefRef.current === nextHref) {
      return;
    }

    if (showTimerRef.current !== null) {
      window.clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }

    if (failSafeTimerRef.current !== null) {
      window.clearTimeout(failSafeTimerRef.current);
      failSafeTimerRef.current = null;
    }

    pendingHrefRef.current = nextHref;
    showTimerRef.current = window.setTimeout(() => {
      setIsVisible(true);
      showTimerRef.current = null;
    }, SHOW_DELAY_MS);
    failSafeTimerRef.current = window.setTimeout(() => {
      resetPendingNavigation();
    }, FAIL_SAFE_HIDE_MS);
  };

  useEffect(() => {
    const currentHistory = window.history;
    const originalPushState = currentHistory.pushState.bind(currentHistory);
    const originalReplaceState = currentHistory.replaceState.bind(currentHistory);

    const maybeScheduleFromUrl = (url?: string | URL | null) => {
      if (!url) {
        return;
      }

      let nextUrl: URL;
      try {
        nextUrl = new URL(url.toString(), window.location.href);
      } catch {
        return;
      }

      if (nextUrl.origin !== window.location.origin) {
        return;
      }

      const currentUrl = new URL(window.location.href);
      const sameDestination = nextUrl.pathname === currentUrl.pathname && nextUrl.search === currentUrl.search;

      if (sameDestination) {
        return;
      }

      schedulePendingNavigation(`${nextUrl.pathname}${nextUrl.search}`);
    };

    currentHistory.pushState = ((state, title, url) => {
      maybeScheduleFromUrl(url);
      return originalPushState(state, title, url);
    }) as History["pushState"];

    currentHistory.replaceState = ((state, title, url) => {
      maybeScheduleFromUrl(url);
      return originalReplaceState(state, title, url);
    }) as History["replaceState"];

    return () => {
      currentHistory.pushState = originalPushState;
      currentHistory.replaceState = originalReplaceState;

      if (showTimerRef.current !== null) {
        window.clearTimeout(showTimerRef.current);
        showTimerRef.current = null;
      }

      if (failSafeTimerRef.current !== null) {
        window.clearTimeout(failSafeTimerRef.current);
        failSafeTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!pendingHrefRef.current) {
      return;
    }

    resetPendingNavigation();
  }, [pathname, search]);

  if (!isVisible) {
    return null;
  }

  return (
    <PageLoadingScreen
      copy={
        locale === "en"
          ? "Please wait a moment while we load the next page."
          : "Vui lòng giữ trong giây lát, chúng tôi đang chuyển trang cho bạn."
      }
      title={locale === "en" ? "Loading" : "Đang tải"}
    />
  );
}
