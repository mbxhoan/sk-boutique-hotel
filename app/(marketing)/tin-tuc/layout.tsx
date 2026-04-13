import type { ReactNode } from "react";

export default function NewsLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="news-layout">
      <div className="news-layout__shell">{children}</div>
    </div>
  );
}
