import { ImageResponse } from "next/og";

import { loadLogoDataUrl, OgDescription, OgEyebrow, OgHeadline, OgLayout } from "@/lib/og-utils";

export const runtime = "nodejs";

export async function GET() {
  const logoSrc = await loadLogoDataUrl();

  return new ImageResponse(
    (
      <OgLayout logoSrc={logoSrc}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <OgEyebrow>SK Boutique Hotel</OgEyebrow>
          <OgHeadline>Sự kiện</OgHeadline>
          <OgDescription>
            Khám phá các sự kiện và hoạt động đặc biệt tại SK Boutique Hotel, Phú Quốc.
          </OgDescription>
        </div>
      </OgLayout>
    ),
    { width: 1200, height: 630 }
  );
}
