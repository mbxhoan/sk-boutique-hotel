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
          <OgHeadline>Về chúng tôi</OgHeadline>
          <OgDescription>
            Không gian lưu trú boutique mang phong cách tinh tế, riêng tư và ấm cúng tại Phú Quốc.
          </OgDescription>
        </div>
      </OgLayout>
    ),
    { width: 1200, height: 630 }
  );
}
