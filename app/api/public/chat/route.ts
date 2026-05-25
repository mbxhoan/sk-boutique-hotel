import { NextResponse } from "next/server";

import { createConversation, sendMessage } from "@/lib/supabase/queries/chat";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;

    const conversation = await createConversation({
      guest_name: typeof payload.guestName === "string" ? payload.guestName : null,
      guest_phone: typeof payload.guestPhone === "string" ? payload.guestPhone : null,
      guest_email: typeof payload.guestEmail === "string" ? payload.guestEmail : null,
      source_url: typeof payload.sourceUrl === "string" ? payload.sourceUrl : null,
      utm_source: typeof payload.utmSource === "string" ? payload.utmSource : null,
      utm_campaign: typeof payload.utmCampaign === "string" ? payload.utmCampaign : null,
      status: "new"
    });

    if (typeof payload.message === "string" && payload.message.trim()) {
      await sendMessage(conversation.id, "guest", payload.message.trim());
    }

    return NextResponse.json({ conversationId: conversation.id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create conversation." },
      { status: 500 }
    );
  }
}
