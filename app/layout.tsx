import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@fontsource/montserrat/400.css";
import "@fontsource/montserrat/700.css";
import "@fontsource/be-vietnam-pro/400.css";
import "@fontsource/be-vietnam-pro/700.css";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SK Boutique Hotel",
    template: "%s | SK Boutique Hotel"
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  description:
    "SK Boutique Hotel - frontend foundation cho website khách sạn premium, member portal và admin shell theo Next.js App Router.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png"
  },
  openGraph: {
    title: "SK Boutique Hotel",
    description:
      "SK Boutique Hotel - nền tảng front-end manual-first với marketing site, member area và admin area.",
    images: [
      {
        alt: "SK Boutique Hotel",
        height: 630,
        url: "/opengraph-image.png",
        width: 1200
      }
    ],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "SK Boutique Hotel",
    description:
      "SK Boutique Hotel - nền tảng front-end manual-first với marketing site, member area và admin area.",
    images: ["/opengraph-image.png"]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="site-body">
        {children}
      </body>
    </html>
  );
}
