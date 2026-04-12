import { ImageResponse } from "next/og";

import logo from "@/public/logo.png";

export const runtime = "edge";
export const alt = "SK Boutique Hotel";
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "stretch",
          background:
            "radial-gradient(circle at 14% 18%, rgba(197,160,89,0.16), transparent 22%), radial-gradient(circle at 82% 24%, rgba(255,255,255,0.34), transparent 18%), linear-gradient(135deg, #fbf9f5 0%, #f4efe5 48%, #efe5d4 100%)",
          color: "#101720",
          display: "flex",
          flexDirection: "column",
          fontFamily: "Montserrat, sans-serif",
          height: "100%",
          justifyContent: "space-between",
          padding: "54px"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 32, alignItems: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 650 }}>
            <div
              style={{
                color: "#ab843c",
                fontSize: 21,
                fontWeight: 700,
                letterSpacing: "0.24em",
                textTransform: "uppercase"
              }}
            >
              SK Boutique Hotel
            </div>
            <div
              style={{
                fontSize: 80,
                fontWeight: 700,
                letterSpacing: "-0.06em",
                lineHeight: 0.94
              }}
            >
              A premium hotel shell.
              <br />
              Manual-first, bilingual ready.
            </div>
            <div
              style={{
                color: "rgba(16, 23, 32, 0.72)",
                fontSize: 28,
                lineHeight: 1.5,
                maxWidth: 560
              }}
            >
              Marketing site, member portal, and admin console are separated
              from day one, with CMS-ready content structures and manual
              operations built in.
            </div>
          </div>

          <div
            style={{
              alignSelf: "flex-start",
              background: "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(251,249,245,0.82))",
              border: "1px solid rgba(171,132,60,0.18)",
              borderRadius: 28,
              boxShadow: "0 24px 60px rgba(16,23,32,0.12)",
              display: "flex",
              flexDirection: "column",
              gap: 18,
              minHeight: 430,
              padding: 28,
              width: 334
            }}
          >
            <div
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(197,160,89,0.18))",
                borderRadius: 22,
                flex: 1,
                minHeight: 260,
                overflow: "hidden",
                padding: 18
              }}
            >
              <img
                alt="SK Boutique Hotel logo"
                src={logo.src}
                style={{
                  display: "block",
                  height: "100%",
                  objectFit: "contain",
                  width: "100%"
                }}
              />
            </div>
            <div
              style={{
                color: "#ab843c",
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase"
              }}
            >
              Boutique hotel foundation
            </div>
          </div>
        </div>

        <div
          style={{
            color: "rgba(16, 23, 32, 0.58)",
            display: "flex",
            fontSize: 20,
            justifyContent: "space-between",
            letterSpacing: "0.08em"
          }}
        >
          <span>SK Boutique Hotel</span>
          <span>HOME LINK PREVIEW</span>
        </div>
      </div>
    ),
    size
  );
}
