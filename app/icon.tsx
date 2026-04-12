import { ImageResponse } from "next/og";
import logo from "@/public/logo.png";

export const runtime = "edge";
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
          background: "#fbf9f5",
          borderRadius: "16px",
          boxShadow: "inset 0 0 0 1px rgba(197,160,89,0.25)",
          display: "flex",
          justifyContent: "center",
          height: "100%",
          overflow: "hidden",
          padding: 8,
          width: "100%"
        }}
      >
        <img
          alt="SK Boutique Hotel"
          src={logo.src}
          style={{
            height: "100%",
            objectFit: "contain",
            width: "100%"
          }}
        />
      </div>
    ),
    size
  );
}
