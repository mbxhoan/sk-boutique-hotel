import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";

import "@fontsource/montserrat/400.css";
import "@fontsource/montserrat/700.css";
import "@fontsource/be-vietnam-pro/400.css";
import "@fontsource/be-vietnam-pro/700.css";

import "./globals.css";

import { Analytics } from "@vercel/analytics/next";

import { GoogleTagManager } from "@/components/google-tag-manager";
import { MetaPixel } from "@/components/meta-pixel";
import { NavigationLoadingIndicator } from "@/components/navigation-loading-indicator";

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
      "Boutique comfort in Phu Quoc with calm stays, direct support, and a premium hotel experience.",
    images: [
      {
        alt: "SK Boutique Hotel",
        height: 630,
        url: "/assets/reception/1.png",
        width: 1200
      }
    ],
    siteName: "SK Boutique Hotel",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "SK Boutique Hotel",
    description:
      "Boutique comfort in Phu Quoc with calm stays, direct support, and a premium hotel experience.",
    images: ["/assets/reception/1.png"]
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
        <Suspense fallback={null}>
          <NavigationLoadingIndicator />
        </Suspense>
        {children}
        <Analytics />
        <GoogleTagManager />
        <MetaPixel />
      </body>
    </html>
  );
}
