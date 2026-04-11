import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background:
            "linear-gradient(135deg, #000c1e 0%, #102b49 100%)",
          borderRadius: "16px",
          color: "#fbf9f5",
          display: "flex",
          fontFamily: "serif",
          fontSize: 28,
          fontWeight: 700,
          height: "100%",
          justifyContent: "center",
          letterSpacing: "-0.08em",
          lineHeight: 1,
          width: "100%"
        }}
      >
        SK
      </div>
    ),
    size
  );
}
