import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

import { loadLogoDataUrl, OgDescription, OgEyebrow, OgHeadline, OgLayout } from "@/lib/og-utils";
import { getEventBySlug } from "@/lib/supabase/queries/events";

export const runtime = "nodejs";

function formatEventDate(dateStr: string | null): string | null {
  if (!dateStr) return null;

  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");

  if (!slug) {
    return new Response("Missing slug", { status: 400 });
  }

  const event = await getEventBySlug(slug);

  if (!event) {
    return new Response("Event not found", { status: 404 });
  }

  const logoSrc = await loadLogoDataUrl();
  const title = event.title_vi || event.title_en || "Sự kiện";
  const description = event.description_vi || event.description_en || "";
  const truncatedDesc = description.length > 120 ? `${description.slice(0, 117)}...` : description;
  const dateLabel = formatEventDate(event.event_date);

  return new ImageResponse(
    (
      <OgLayout logoSrc={logoSrc}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <OgEyebrow>{dateLabel ? `Sự kiện · ${dateLabel}` : "Sự kiện"}</OgEyebrow>
          <OgHeadline>{title}</OgHeadline>
          {truncatedDesc ? <OgDescription>{truncatedDesc}</OgDescription> : null}
        </div>
      </OgLayout>
    ),
    { width: 1200, height: 630 }
  );
}
