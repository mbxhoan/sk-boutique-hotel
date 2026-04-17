"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { appendLocaleQuery, type Locale } from "@/lib/locale";
import { normalizeRoomHref } from "@/lib/room-routes";
import type { AnalyticsEventType } from "@/lib/supabase/database.types";

type AnalyticsLinkProps = {
  branchId?: string | null;
  children: ReactNode;
  className?: string;
  entityId?: string | null;
  entityType?: string;
  eventType: AnalyticsEventType;
  href: string;
  locale?: Locale;
  metadata?: Record<string, unknown>;
  pagePath?: string;
  reservationId?: string | null;
  roomTypeId?: string | null;
  source?: string;
};

function sendAnalyticsEvent(payload: Record<string, unknown>) {
  const body = JSON.stringify(payload);

  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/public/track", new Blob([body], { type: "application/json" }));
    return;
  }

  void fetch("/api/public/track", {
    body,
    headers: {
      "content-type": "application/json"
    },
    keepalive: true,
    method: "POST"
  });
}

export function AnalyticsLink({
  branchId,
  children,
  className,
  entityId,
  entityType,
  eventType,
  href,
  locale = "vi",
  metadata,
  pagePath,
  reservationId,
  roomTypeId,
  source = "website"
}: AnalyticsLinkProps) {
  const pathname = usePathname();
  const resolvedHref = appendLocaleQuery(normalizeRoomHref(href, locale), locale);

  return (
    <Link
      className={className}
      href={resolvedHref}
      onClick={() => {
        sendAnalyticsEvent({
          branchId,
          entityId,
          entityType,
          eventType,
          locale,
          metadata,
          pagePath: pagePath ?? pathname,
          reservationId,
          roomTypeId,
          source
        });
      }}
    >
      {children}
    </Link>
  );
}
