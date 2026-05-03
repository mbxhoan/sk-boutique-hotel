"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { PortalBadge, PortalCard } from "@/components/portal-ui";
import type { Locale } from "@/lib/locale";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type MemberLiveUpdatesProps = {
  customerId: string;
  locale: Locale;
};

function labelForTable(locale: Locale, table: string, eventType: "INSERT" | "UPDATE" | "DELETE") {
  const tableLabels: Record<string, string> =
      locale === "en"
      ? {
          availability_requests: "Availability request",
          audit_logs: "Notification",
          payment_proofs: "Payment proof",
          payment_requests: "Payment request",
          reservations: "Reservation",
          room_holds: "Room hold"
        }
      : {
          availability_requests: "Yêu cầu xem phòng",
          audit_logs: "Thông báo",
          payment_proofs: "Ảnh xác nhận thanh toán",
          payment_requests: "Payment request",
          reservations: "Booking",
          room_holds: "Hold phòng"
        };

  const statusLabel =
    eventType === "INSERT"
      ? locale === "en"
        ? "created"
        : "đã tạo"
      : eventType === "UPDATE"
        ? locale === "en"
          ? "updated"
          : "đã cập nhật"
        : locale === "en"
          ? "removed"
          : "đã xoá";

  return `${tableLabels[table] ?? table} ${statusLabel}`;
}

export function MemberLiveUpdates({ customerId, locale }: MemberLiveUpdatesProps) {
  const router = useRouter();
  const [count, setCount] = useState(0);
  const [latestMessage, setLatestMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!customerId) {
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const tables = ["availability_requests", "audit_logs", "room_holds", "reservations", "payment_requests", "payment_proofs"] as const;
    const channel = supabase.channel(`member-live-updates-${customerId}`);

    for (const table of tables) {
      channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
          filter: `customer_id=eq.${customerId}`
        },
        ({ eventType }) => {
          setCount((current) => current + 1);
          setLatestMessage(labelForTable(locale, table, eventType as "INSERT" | "UPDATE" | "DELETE"));
          router.refresh();
        }
      );
    }

    void channel.subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [customerId, locale, router]);

  return (
    <PortalCard className="portal-panel" tone="soft">
      <div className="portal-item-card__top">
        <p className="portal-panel__eyebrow">{locale === "en" ? "Live notifications" : "Thông báo realtime"}</p>
        <PortalBadge tone="accent">{locale === "en" ? "Live" : "Live"}</PortalBadge>
      </div>
      <h3 className="portal-item-card__title">{locale === "en" ? "Your activity feed" : "Hoạt động của bạn"}</h3>
      <p className="portal-panel__note-copy">
        {count > 0
          ? latestMessage ?? (locale === "en" ? "Waiting for the next update." : "Đang chờ cập nhật tiếp theo.")
          : locale === "en"
            ? "Request, hold, booking, and payment changes will appear here in real time."
            : "Request, hold, booking và payment sẽ hiện ở đây theo thời gian thực."}
      </p>
    </PortalCard>
  );
}
