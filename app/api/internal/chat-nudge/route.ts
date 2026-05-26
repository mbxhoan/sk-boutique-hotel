import { NextResponse } from "next/server";

import { sendChatNudgeEmail } from "@/lib/supabase/email";
import { getConversationsNeedingNudge, markConversationNudgeSent } from "@/lib/supabase/queries/chat";
import { getChatNudgeMinutes, getCronSecret } from "@/lib/supabase/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request: Request): boolean {
  const secret = getCronSecret();

  // In local dev without CRON_SECRET, only allow requests from localhost
  if (!secret) {
    const host = request.headers.get("host") ?? "";
    return host.startsWith("localhost") || host.startsWith("127.0.0.1");
  }

  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const nudgeMinutes = getChatNudgeMinutes();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const adminChatUrl = `${siteUrl}/admin/chat`;

  try {
    const conversations = await getConversationsNeedingNudge(nudgeMinutes);

    if (conversations.length === 0) {
      return NextResponse.json({ nudged: 0 });
    }

    const results = await Promise.allSettled(
      conversations.map(async (conv) => {
        const oldestAt = new Date(conv.oldest_unread_at).getTime();
        const minutesWaiting = Math.floor((Date.now() - oldestAt) / 60_000);

        await sendChatNudgeEmail({
          conversationId: conv.id,
          guestName: conv.guest_name,
          guestEmail: conv.guest_email,
          guestPhone: conv.guest_phone,
          firstUnreadMessage: conv.first_unread_message,
          unreadCount: conv.unread_count,
          minutesWaiting,
          adminChatUrl
        });

        await markConversationNudgeSent(conv.id);
      })
    );

    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    if (failed > 0) {
      console.warn("[chat-nudge] Some nudge emails failed", {
        succeeded,
        failed,
        errors: results
          .filter((r): r is PromiseRejectedResult => r.status === "rejected")
          .map((r) => r.reason)
      });
    }

    console.info(`[chat-nudge] Sent ${succeeded} nudge email(s) (threshold: ${nudgeMinutes} min)`);

    return NextResponse.json({ nudged: succeeded, failed });
  } catch (error) {
    console.error("[chat-nudge] Fatal error", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}
