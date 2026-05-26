import { NextResponse } from "next/server";

import { markMessagesRead } from "@/lib/supabase/queries/chat";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { conversationId } = (await request.json()) as { conversationId?: string };
    if (!conversationId || typeof conversationId !== "string") {
      return NextResponse.json({ error: "Missing conversationId" }, { status: 400 });
    }
    await markMessagesRead(conversationId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to mark read" },
      { status: 500 }
    );
  }
}
