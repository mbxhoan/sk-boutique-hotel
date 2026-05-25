import { NextResponse } from "next/server";

import { sendChatNotificationEmail } from "@/lib/supabase/email";
import { createConversation, sendMessage } from "@/lib/supabase/queries/chat";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WELCOME_MESSAGE =
  "Xin chào! Cảm ơn bạn đã liên hệ SK Boutique Hotel. Chúng tôi đã nhận được tin nhắn của bạn và sẽ phản hồi trong thời gian sớm nhất. 🏨";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;

    const guestName = typeof payload.guestName === "string" && payload.guestName.trim() ? payload.guestName.trim() : null;
    const guestPhone = typeof payload.guestPhone === "string" && payload.guestPhone.trim() ? payload.guestPhone.trim() : null;
    const guestEmail = typeof payload.guestEmail === "string" && payload.guestEmail.trim() ? payload.guestEmail.trim() : null;
    const sourceUrl = typeof payload.sourceUrl === "string" ? payload.sourceUrl : null;
    const firstMessage = typeof payload.message === "string" && payload.message.trim() ? payload.message.trim() : null;

    const conversation = await createConversation({
      guest_name: guestName,
      guest_phone: guestPhone,
      guest_email: guestEmail,
      source_url: sourceUrl,
      utm_source: typeof payload.utmSource === "string" ? payload.utmSource : null,
      utm_campaign: typeof payload.utmCampaign === "string" ? payload.utmCampaign : null,
      status: "new"
    });

    // Welcome system message — appears before guest's first message
    await sendMessage(conversation.id, "system", WELCOME_MESSAGE);

    // Guest's first message
    if (firstMessage) {
      await sendMessage(conversation.id, "guest", firstMessage);
    }

    // Fire-and-forget email notification — does not block the response
    if (firstMessage) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
      void sendChatNotificationEmail({
        guestName,
        guestEmail,
        guestPhone,
        firstMessage,
        sourceUrl,
        adminChatUrl: `${siteUrl}/admin/chat`
      }).catch((err: unknown) => {
        console.warn("[chat] Failed to send email notification", err);
      });
    }

    return NextResponse.json({ conversationId: conversation.id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create conversation." },
      { status: 500 }
    );
  }
}
