import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: "#f4f6fb",
    description: "SK Boutique Hotel admin portal for bookings, rooms, media, content, and operations.",
    display: "standalone",
    icons: [
      {
        sizes: "512x512",
        src: "/icon.png",
        type: "image/png"
      }
    ],
    id: "/admin",
    name: "SK Boutique Admin",
    short_name: "SK Admin",
    start_url: "/admin",
    scope: "/admin/",
    theme_color: "#f4f6fb"
  };
}
