import { NextResponse } from "next/server";

import { sendChatNotificationEmail } from "@/lib/supabase/email";
import { createConversation, sendMessage } from "@/lib/supabase/queries/chat";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Intent = "booking" | "pricing" | "checkin_checkout" | "other";
type Lang = "vi" | "en";

const WELCOME_MESSAGES: Record<Lang, string> = {
  vi: "Xin chào! Cảm ơn bạn đã liên hệ SK Boutique Hotel. Chúng tôi đã nhận được tin nhắn của bạn và sẽ phản hồi trong thời gian sớm nhất. 🏨",
  en: "Hello! Thank you for contacting SK Boutique Hotel. We have received your message and will get back to you as soon as possible. 🏨"
};

const INTENT_FOLLOWUP: Record<Intent, Record<Lang, string>> = {
  booking: {
    vi: "Chào bạn, rất vui khi bạn đang quan tâm đến SK Boutique Hotel. Bọn mình rất sẵn lòng hỗ trợ bạn tìm một không gian lưu trú phù hợp và dễ chịu nhất cho chuyến đi này.\n\nBạn đang quan tâm đến hạng phòng nào và dự kiến muốn ở vào khoảng thời gian nào? Nếu bạn muốn, bạn cũng có thể gửi thêm số lượng khách để bọn mình hỗ trợ nhanh hơn nhé.",
    en: "Hello, and welcome to SK Boutique Hotel. We'd be happy to help you find a stay that feels comfortable and just right for your trip.\n\nMay I ask which room type you are interested in and your expected stay dates? If you'd like, you can also share the number of guests so we can assist you more quickly."
  },
  pricing: {
    vi: "Chào bạn, cảm ơn bạn đã quan tâm đến giá phòng và các ưu đãi tại SK Boutique Hotel.\n\nBạn muốn tham khảo giá cho hạng phòng nào và vào thời gian dự kiến nào? Bọn mình sẽ kiểm tra mức giá phù hợp nhất và thông tin ưu đãi hiện có để gửi lại bạn ngay.",
    en: "Hello, thank you for your interest in room rates and current offers at SK Boutique Hotel.\n\nCould you share which room type you would like to check and your expected stay period? We'll review the most suitable rate and any available offers for you right away."
  },
  checkin_checkout: {
    vi: "Chào bạn, mình sẵn sàng hỗ trợ thông tin về check-in và check-out.\n\nBạn đang cần hỗ trợ về giờ nhận phòng, giờ trả phòng, check-in sớm, hay check-out muộn? Bạn cứ nhắn ngắn gọn nhu cầu của mình, bọn mình sẽ phản hồi đúng thông tin để bạn tiện sắp xếp lịch trình nhé.",
    en: "Hello, I'd be happy to help with check-in and check-out information.\n\nAre you asking about check-in time, check-out time, early check-in, or late check-out? Just let us know what you need, and we'll share the most relevant details for your schedule."
  },
  other: {
    vi: "Chào bạn, cảm ơn bạn đã nhắn cho SK Boutique Hotel. Bạn cứ để lại nội dung mình đang quan tâm, bọn mình sẽ hỗ trợ nhanh và rõ ràng nhất có thể.\n\nNếu thuận tiện, bạn có thể nhắn giúp bọn mình câu hỏi hoặc nhu cầu cụ thể để team hỗ trợ đúng thông tin cho bạn nhé.",
    en: "Hello, thank you for messaging SK Boutique Hotel. Please feel free to share what you need, and we'll do our best to support you clearly and promptly.\n\nIf convenient, you can send us your specific question or request so our team can assist you with the right information."
  }
};

function detectIntent(message: string): Intent {
  const lower = message.toLowerCase();
  if (lower.includes("đặt phòng") || lower.includes("book")) return "booking";
  if (lower.includes("giá") || lower.includes("ưu đãi") || lower.includes("price") || lower.includes("rate") || lower.includes("offer")) return "pricing";
  if (lower.includes("check-in") || lower.includes("check-out") || lower.includes("checkin") || lower.includes("checkout")) return "checkin_checkout";
  return "other";
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;

    const guestName = typeof payload.guestName === "string" && payload.guestName.trim() ? payload.guestName.trim() : null;
    const guestPhone = typeof payload.guestPhone === "string" && payload.guestPhone.trim() ? payload.guestPhone.trim() : null;
    const guestEmail = typeof payload.guestEmail === "string" && payload.guestEmail.trim() ? payload.guestEmail.trim() : null;
    const sourceUrl = typeof payload.sourceUrl === "string" ? payload.sourceUrl : null;
    const firstMessage = typeof payload.message === "string" && payload.message.trim() ? payload.message.trim() : null;
    const lang: Lang = payload.guestLanguage === "en" ? "en" : "vi";

    const intent: Intent | null = firstMessage ? detectIntent(firstMessage) : null;

    const baseInput = {
      guest_name: guestName,
      guest_phone: guestPhone,
      guest_email: guestEmail,
      source_url: sourceUrl,
      utm_source: typeof payload.utmSource === "string" ? payload.utmSource : null,
      utm_campaign: typeof payload.utmCampaign === "string" ? payload.utmCampaign : null,
      status: "new" as const
    };

    let conversation;
    try {
      conversation = await createConversation({ ...baseInput, guest_language: lang, chat_intent: intent });
    } catch (firstErr) {
      // Columns may not exist yet (migration not applied) — retry without them
      const msg = firstErr instanceof Error ? firstErr.message : String(firstErr);
      if (msg.includes("column") || msg.includes("guest_language") || msg.includes("chat_intent")) {
        conversation = await createConversation(baseInput);
      } else {
        throw firstErr;
      }
    }

    // Welcome system message
    await sendMessage(conversation.id, "system", WELCOME_MESSAGES[lang]);

    // Guest's first message (the option they selected)
    if (firstMessage) {
      await sendMessage(conversation.id, "guest", firstMessage);
    }

    // Auto follow-up response based on intent
    if (intent && firstMessage) {
      await sendMessage(conversation.id, "system", INTENT_FOLLOWUP[intent][lang]);
    }

    // Fire-and-forget email notification
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
