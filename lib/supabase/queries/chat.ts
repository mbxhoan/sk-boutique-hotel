import type { ChatConversationInsert, ChatConversationRow, ChatMessageRow } from "@/lib/supabase/database.types";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { queryWithServiceFallback } from "@/lib/supabase/queries/shared";

export type { ChatConversationRow, ChatMessageRow };

export async function createConversation(input: ChatConversationInsert): Promise<ChatConversationRow> {
  const client = createSupabaseServiceClient();
  const { data, error } = await client
    .from("chat_conversations")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data as ChatConversationRow;
}

export async function sendMessage(
  conversationId: string,
  senderType: "guest" | "admin" | "system",
  message: string
): Promise<ChatMessageRow> {
  const client = createSupabaseServiceClient();
  const { data, error } = await client
    .from("chat_messages")
    .insert({ conversation_id: conversationId, sender_type: senderType, message })
    .select()
    .single();

  if (error) throw error;
  return data as ChatMessageRow;
}

export async function listConversations(options: { status?: "new" | "open" | "closed" } = {}): Promise<ChatConversationRow[]> {
  return queryWithServiceFallback(
    async (client) => {
      let query = client
        .from("chat_conversations")
        .select("*")
        .order("last_message_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });

      if (options.status) {
        query = query.eq("status", options.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as ChatConversationRow[];
    },
    [] as ChatConversationRow[]
  );
}

export async function listMessages(conversationId: string): Promise<ChatMessageRow[]> {
  return queryWithServiceFallback(
    async (client) => {
      const { data, error } = await client
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return (data ?? []) as ChatMessageRow[];
    },
    [] as ChatMessageRow[]
  );
}

export async function updateConversationStatus(
  conversationId: string,
  status: "new" | "open" | "closed"
): Promise<void> {
  const client = createSupabaseServiceClient();
  const { error } = await client
    .from("chat_conversations")
    .update({ status })
    .eq("id", conversationId);

  if (error) throw error;
}

export async function markMessagesRead(conversationId: string): Promise<void> {
  const client = createSupabaseServiceClient();
  const { error } = await client
    .from("chat_messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .eq("sender_type", "guest")
    .is("read_at", null);

  if (error) throw error;
}

export type ConversationNeedingNudge = {
  id: string;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  source_url: string | null;
  oldest_unread_at: string;
  unread_count: number;
  first_unread_message: string | null;
};

export async function getConversationsNeedingNudge(thresholdMinutes: number): Promise<ConversationNeedingNudge[]> {
  const client = createSupabaseServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (client as any).rpc("get_conversations_needing_nudge", {
    threshold_minutes: thresholdMinutes
  });

  if (error) throw error;
  return ((data ?? []) as unknown) as ConversationNeedingNudge[];
}

export async function markConversationNudgeSent(conversationId: string): Promise<void> {
  const client = createSupabaseServiceClient();
  const { error } = await client
    .from("chat_conversations")
    .update({ nudge_sent_at: new Date().toISOString() })
    .eq("id", conversationId);

  if (error) throw error;
}
