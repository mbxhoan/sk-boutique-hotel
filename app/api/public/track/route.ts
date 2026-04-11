import { NextResponse } from "next/server";

import type { AnalyticsEventType } from "@/lib/supabase/database.types";
import { trackAnalyticsEvent } from "@/lib/supabase/analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const analyticsEventTypes: AnalyticsEventType[] = [
  "page_view",
  "room_view",
  "branch_view",
  "cta_click",
  "gallery_click",
  "check_availability_click",
  "hold_room_click",
  "map_click",
  "payment_upload"
];

function isAnalyticsEventType(value: unknown): value is AnalyticsEventType {
  return typeof value === "string" && analyticsEventTypes.includes(value as AnalyticsEventType);
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;

    await trackAnalyticsEvent({
      branchId: typeof payload.branchId === "string" ? payload.branchId : null,
      customerId: typeof payload.customerId === "string" ? payload.customerId : null,
      entityId: typeof payload.entityId === "string" ? payload.entityId : null,
      entityType: typeof payload.entityType === "string" ? payload.entityType : "",
      eventType: isAnalyticsEventType(payload.eventType) ? payload.eventType : "page_view",
      locale: typeof payload.locale === "string" ? payload.locale : "vi",
      metadata: typeof payload.metadata === "object" && payload.metadata ? (payload.metadata as Record<string, unknown>) : {},
      pagePath: typeof payload.pagePath === "string" ? payload.pagePath : "",
      reservationId: typeof payload.reservationId === "string" ? payload.reservationId : null,
      roomTypeId: typeof payload.roomTypeId === "string" ? payload.roomTypeId : null,
      source: typeof payload.source === "string" ? payload.source : "website"
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to track event.",
        success: false
      },
      { status: 200 }
    );
  }
}
