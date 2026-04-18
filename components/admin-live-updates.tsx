"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { PortalBadge, PortalCard } from "@/components/portal-ui";
import type { Locale } from "@/lib/locale";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type AdminLiveUpdatesProps = {
  locale: Locale;
};

export function AdminLiveUpdates({ locale }: AdminLiveUpdatesProps) {
  const router = useRouter();
  const [count, setCount] = useState(0);
  const [latestMessage, setLatestMessage] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel("admin-live-updates")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "audit_logs" }, ({ new: row }) => {
        const summary = typeof row?.summary === "string" ? row.summary : null;

        setCount((current) => current + 1);
        setLatestMessage(summary ?? (locale === "en" ? "New audit event" : "Có audit event mới"));
        router.refresh();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [locale, router]);

  return (
    <PortalCard className="portal-panel" tone="soft">
      <div className="portal-item-card__top">
        <p className="portal-panel__eyebrow">{locale === "en" ? "Live notifications" : "Thông báo realtime"}</p>
        <PortalBadge tone="accent">{locale === "en" ? "Live" : "Live"}</PortalBadge>
      </div>
      <h3 className="portal-item-card__title">{locale === "en" ? "Admin activity stream" : "Dòng hoạt động admin"}</h3>
      <p className="portal-panel__note-copy">
        {count > 0
          ? latestMessage ?? (locale === "en" ? "Waiting for the next event." : "Đang chờ sự kiện tiếp theo.")
          : locale === "en"
            ? "New request, hold, reservation, and payment changes will appear here in real time."
            : "Các thay đổi request, hold, reservation và payment sẽ xuất hiện ở đây theo thời gian thực."}
      </p>
    </PortalCard>
  );
}
