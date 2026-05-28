import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

import { loadLogoDataUrl, OgBadge, OgDescription, OgEyebrow, OgHeadline, OgLayout } from "@/lib/og-utils";
import { getRoomTypeBySlug } from "@/lib/supabase/queries/room-types";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");

  if (!slug) {
    return new Response("Missing slug", { status: 400 });
  }

  const roomType = await getRoomTypeBySlug(slug);

  if (!roomType) {
    return new Response("Room type not found", { status: 404 });
  }

  const logoSrc = await loadLogoDataUrl();
  const name = roomType.name_vi || roomType.name_en || "Phòng";
  const summary = roomType.summary_vi || roomType.summary_en || roomType.description_vi || "";
  const truncatedSummary = summary.length > 120 ? `${summary.slice(0, 117)}...` : summary;

  const badges: string[] = [];

  if (roomType.bed_type) {
    badges.push(roomType.bed_type);
  }

  if (roomType.occupancy_adults) {
    badges.push(`${roomType.occupancy_adults} khách`);
  }

  if (roomType.size_sqm) {
    badges.push(`${roomType.size_sqm} m²`);
  }

  return new ImageResponse(
    (
      <OgLayout logoSrc={logoSrc}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <OgEyebrow>SK Boutique Hotel</OgEyebrow>
          <OgHeadline>{name}</OgHeadline>
          {truncatedSummary ? <OgDescription>{truncatedSummary}</OgDescription> : null}
          {badges.length > 0 ? (
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              {badges.map((badge) => (
                <OgBadge key={badge}>{badge}</OgBadge>
              ))}
            </div>
          ) : null}
        </div>
      </OgLayout>
    ),
    { width: 1200, height: 630 }
  );
}
