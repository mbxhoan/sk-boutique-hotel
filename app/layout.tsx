import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

import "@fontsource/playfair-display/400.css";
import "@fontsource/playfair-display/700.css";
import "@fontsource/be-vietnam-pro/400.css";
import "@fontsource/be-vietnam-pro/700.css";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SK Boutique Hotel",
    template: "%s | SK Boutique Hotel"
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  description: "SK Boutique Hotel - website template tĩnh theo phong cách editorial, dùng Next.js App Router và sẵn chỗ thay logo.",
  icons: {
    icon: "/icon",
    shortcut: "/icon",
    apple: "/icon"
  },
  openGraph: {
    title: "SK Boutique Hotel",
    description:
      "SK Boutique Hotel - website template tĩnh theo phong cách editorial, sẵn hỗ trợ song ngữ việt - anh.",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "SK Boutique Hotel",
    description:
      "SK Boutique Hotel - website template tĩnh theo phong cách editorial, sẵn hỗ trợ song ngữ việt - anh."
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
          <SiteHeader />
        </Suspense>
        <main className="site-main">{children}</main>
        <Suspense fallback={null}>
          <SiteFooter />
        </Suspense>
      </body>
    </html>
  );
}
