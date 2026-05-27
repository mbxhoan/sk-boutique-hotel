import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

export const runtime = "nodejs";

async function loadLogoDataUrl() {
  const logoBuffer = await readFile(join(process.cwd(), "public", "logo.png"));
  return `data:image/png;base64,${logoBuffer.toString("base64")}`;
}

export async function GET() {
  const logoSrc = await loadLogoDataUrl();

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #f6f0e5 0%, #f4ebdd 52%, #efe4d1 100%)",
          color: "#171717",
          display: "flex",
          height: "100%",
          padding: "42px",
          position: "relative",
          width: "100%"
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.28)",
            borderRadius: 999,
            height: 320,
            left: -120,
            position: "absolute",
            top: -110,
            width: 320
          }}
        />
        <div
          style={{
            background: "rgba(255,255,255,0.26)",
            borderRadius: 999,
            bottom: -140,
            position: "absolute",
            right: 110,
            height: 260,
            width: 260
          }}
        />
        <div
          style={{
            border: "1px solid rgba(174, 131, 52, 0.55)",
            borderRadius: 34,
            display: "flex",
            height: "100%",
            overflow: "hidden",
            position: "relative",
            width: "100%",
            zIndex: 1
          }}
        >
          <div
            style={{
              background:
                "radial-gradient(circle at top left, rgba(255,255,255,0.82), rgba(255,255,255,0.28) 52%, rgba(255,255,255,0) 72%)",
              display: "flex",
              flex: 1,
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "44px 48px"
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div
                style={{
                  color: "#af8230",
                  display: "flex",
                  fontSize: 26,
                  fontWeight: 700,
                  letterSpacing: "-0.02em"
                }}
              >
                SK Boutique Hotel
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  fontSize: 84,
                  fontWeight: 700,
                  letterSpacing: "-0.055em",
                  lineHeight: 1.02,
                  maxWidth: 680
                }}
              >
                <div style={{ display: "flex" }}>Refined stays</div>
                <div style={{ display: "flex" }}>in Phu Quoc.</div>
              </div>
              <div
                style={{
                  color: "#2e2e2e",
                  display: "flex",
                  fontSize: 34,
                  lineHeight: 1.35,
                  maxWidth: 700
                }}
              >
                Boutique comfort, calm interiors, and a manual-first reservation experience with direct support from the hotel team.
              </div>
            </div>

            <div
              style={{
                alignItems: "center",
                color: "#4c4c4c",
                display: "flex",
                fontSize: 28,
                justifyContent: "space-between"
              }}
            >
              <div style={{ display: "flex" }}>www.skhotel.com.vn</div>
              <div
                style={{
                  color: "#af8230",
                  display: "flex",
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase"
                }}
              >
                Phu Quoc
              </div>
            </div>
          </div>

          <div
            style={{
              alignItems: "center",
              background: "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(248,242,233,0.96))",
              borderLeft: "1px solid rgba(174, 131, 52, 0.18)",
              borderRadius: 28,
              display: "flex",
              justifyContent: "center",
              margin: "38px",
              marginLeft: 0,
              minWidth: 348,
              padding: "32px"
            }}
          >
            <img
              alt="SK Boutique Hotel logo"
              height="178"
              src={logoSrc}
              style={{ objectFit: "contain" }}
              width="300"
            />
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630
    }
  );
}
