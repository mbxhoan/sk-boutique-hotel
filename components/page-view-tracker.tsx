"use client";

import { useEffect } from "react";

import type { AnalyticsEventType } from "@/lib/supabase/database.types";

type PageViewTrackerProps = {
  branchId?: string | null;
  customerId?: string | null;
  entityId?: string | null;
  entityType?: string;
  eventType: AnalyticsEventType;
  locale?: string;
  metadata?: Record<string, unknown>;
  pagePath: string;
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

export function PageViewTracker(props: PageViewTrackerProps) {
  useEffect(() => {
    sendAnalyticsEvent({
      ...props,
      source: props.source ?? "website"
    });
    // Track once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
