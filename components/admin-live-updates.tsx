"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { PortalBadge, PortalCard } from "@/components/portal-ui";
import type { Locale } from "@/lib/locale";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type AdminLiveUpdatesProps = {
  locale: Locale;
};

function labelForTable(locale: Locale, table: string, eventType: "INSERT" | "UPDATE" | "DELETE") {
  const tableLabels: Record<string, string> =
    locale === "en"
      ? {
          availability_requests: "Availability request",
          audit_logs: "Audit event",
          payment_proofs: "Payment proof",
          payment_requests: "Payment request",
          reservations: "Reservation",
          room_holds: "Room hold"
        }
      : {
          availability_requests: "Yêu cầu xem phòng",
          audit_logs: "Audit event",
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

function summarizeRealtimeRow(row: unknown) {
  if (!row || typeof row !== "object") {
    return null;
  }

  const record = row as Record<string, unknown>;
  const candidate =
    record.request_code ?? record.hold_code ?? record.booking_code ?? record.payment_code ?? record.summary ?? null;

  return typeof candidate === "string" && candidate.trim().length > 0 ? candidate.trim() : null;
}

export function AdminLiveUpdates({ locale }: AdminLiveUpdatesProps) {
  const router = useRouter();
  const [count, setCount] = useState(0);
  const [latestMessage, setLatestMessage] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const trackedTables = [
      "availability_requests",
      "room_holds",
      "reservations",
      "payment_requests",
      "payment_proofs",
      "audit_logs"
    ] as const;
    const channel = supabase.channel("admin-live-updates");

    for (const table of trackedTables) {
      for (const event of ["INSERT", "UPDATE", "DELETE"] as const) {
        if (table === "audit_logs" && event !== "INSERT") {
          continue;
        }

        channel.on(
          "postgres_changes",
          {
            event,
            schema: "public",
            table
          },
          ({ eventType, new: newRow, old: oldRow }) => {
            const row = newRow ?? oldRow;
            const summary = summarizeRealtimeRow(row);

            setCount((current) => current + 1);
            setLatestMessage(`${labelForTable(locale, table, eventType as "INSERT" | "UPDATE" | "DELETE")}${summary ? ` • ${summary}` : ""}`);
            router.refresh();
          }
        );
      }
    }

    channel.subscribe();

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
