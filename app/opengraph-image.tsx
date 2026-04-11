import { ImageResponse } from "next/og";

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
            "radial-gradient(circle at 15% 20%, rgba(197,160,89,0.22), transparent 24%), linear-gradient(135deg, #000c1e 0%, #081733 48%, #102b49 100%)",
          color: "#fbf9f5",
          display: "flex",
          flexDirection: "column",
          fontFamily: "serif",
          height: "100%",
          justifyContent: "space-between",
          padding: "56px"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 32 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 660 }}>
            <div
              style={{
                color: "#c5a059",
                fontFamily: "sans-serif",
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: "0.24em",
                textTransform: "uppercase"
              }}
            >
              SK Boutique Hotel
            </div>
            <div
              style={{
                fontSize: 82,
                fontWeight: 700,
                letterSpacing: "-0.05em",
                lineHeight: 0.94
              }}
            >
              Curated hospitality.
              <br />
              Bilingual by design.
            </div>
            <div
              style={{
                color: "rgba(251,249,245,0.82)",
                fontFamily: "sans-serif",
                fontSize: 28,
                lineHeight: 1.5,
                maxWidth: 560
              }}
            >
              A static Next.js hotel template with Vietnamese-English support,
              premium typography, and a ready-to-share social preview.
            </div>
          </div>

          <div
            style={{
              alignSelf: "flex-start",
              background: "rgba(251,249,245,0.08)",
              borderRadius: 24,
              display: "flex",
              flexDirection: "column",
              gap: 16,
              minHeight: 420,
              padding: 28,
              width: 330
            }}
          >
            <div
              style={{
                background: "linear-gradient(160deg, rgba(251,249,245,0.95), rgba(197,160,89,0.62))",
                borderRadius: 20,
                flex: 1
              }}
            />
            <div
              style={{
                color: "#c5a059",
                fontFamily: "sans-serif",
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase"
              }}
            >
              Editorial Heritage
            </div>
          </div>
        </div>

        <div
          style={{
            color: "rgba(251,249,245,0.7)",
            display: "flex",
            fontFamily: "sans-serif",
            fontSize: 20,
            justifyContent: "space-between",
            letterSpacing: "0.08em"
          }}
        >
          <span>SK Boutique Hotel</span>
          <span>OPENGRAPH PREVIEW</span>
        </div>
      </div>
    ),
    size
  );
}
