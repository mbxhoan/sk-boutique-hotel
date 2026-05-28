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
          <OgHeadline>Hạng phòng</OgHeadline>
          <OgDescription>
            Khám phá các hạng phòng cao cấp tại SK Boutique Hotel, Phú Quốc — Family, Superior và Quadruple.
          </OgDescription>
        </div>
      </OgLayout>
    ),
    { width: 1200, height: 630 }
  );
}
