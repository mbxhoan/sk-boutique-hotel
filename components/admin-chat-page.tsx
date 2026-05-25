"use client";

import { useEffect, useRef, useState } from "react";

import type { ChatConversationRow, ChatMessageRow } from "@/lib/supabase/database.types";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { Locale } from "@/lib/locale";

type AdminChatPageProps = {
  initialConversations: ChatConversationRow[];
  locale: Locale;
};

function formatRelativeTime(dateStr: string) {
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  return date.toLocaleDateString("vi-VN");
}

function statusLabel(status: string) {
  if (status === "new") return { text: "Mới", bg: "var(--gold)", color: "var(--ink)" };
  if (status === "open") return { text: "Đang mở", bg: "#22c55e", color: "#fff" };
  return { text: "Đóng", bg: "var(--surface-container-highest)", color: "var(--muted)" };
}

function SendIcon() {
  return (
    <svg fill="none" height="16" viewBox="0 0 24 24" width="16">
      <line stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="22" x2="11" y1="2" y2="13" />
      <polygon fill="currentColor" points="22 2 15 22 11 13 2 9 22 2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

export function AdminChatPage({ initialConversations, locale: _locale }: AdminChatPageProps) {
  const [conversations, setConversations] = useState<ChatConversationRow[]>(initialConversations);
  const [selectedId, setSelectedId] = useState<string | null>(initialConversations[0]?.id ?? null);
  const [messages, setMessages] = useState<ChatMessageRow[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const channel = supabase
      .channel("chat:admin-conversations")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_conversations" },
        (payload) => {
          setConversations((prev) => [payload.new as ChatConversationRow, ...prev]);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "chat_conversations" },
        (payload) => {
          setConversations((prev) =>
            prev.map((c) => (c.id === (payload.new as ChatConversationRow).id ? (payload.new as ChatConversationRow) : c))
          );
        }
      )
      .subscribe();

    return () => {
      void channel.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!selectedId) return;

    supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", selectedId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data) setMessages(data as ChatMessageRow[]);
      });

    const channel = supabase
      .channel(`chat:admin:${selectedId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `conversation_id=eq.${selectedId}`
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as ChatMessageRow]);
        }
      )
      .subscribe();

    return () => {
      void channel.unsubscribe();
    };
  }, [selectedId, supabase]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || !selectedId || sending) return;

    setSending(true);
    setInput("");

    try {
      await supabase.from("chat_messages").insert({
        conversation_id: selectedId,
        sender_type: "admin",
        message: text
      });

      await supabase
        .from("chat_conversations")
        .update({ status: "open" })
        .eq("id", selectedId)
        .eq("status", "new");
    } catch {
      setInput(text);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  }

  const selectedConversation = conversations.find((c) => c.id === selectedId) ?? null;

  return (
    <div style={{ display: "flex", height: "calc(100vh - 4rem)", overflow: "hidden", fontFamily: "var(--font-body)" }}>
      {/* Left panel — conversation list */}
      <div
        style={{
          width: "20rem",
          minWidth: "16rem",
          borderRight: "1px solid var(--border-subtle)",
          overflowY: "auto",
          background: "var(--surface-container-lowest)",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <div style={{ padding: "1rem", borderBottom: "1px solid var(--border-subtle)" }}>
          <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "0.95rem", fontWeight: 700 }}>
            Live Chat
          </h2>
          <p style={{ margin: "0.25rem 0 0", fontSize: "0.75rem", color: "var(--muted)" }}>
            {conversations.length} cuộc hội thoại
          </p>
        </div>

        {conversations.length === 0 ? (
          <p style={{ padding: "1.5rem", fontSize: "0.8rem", color: "var(--muted)", textAlign: "center" }}>
            Chưa có cuộc hội thoại nào.
          </p>
        ) : (
          conversations.map((conv) => {
            const badge = statusLabel(conv.status);
            const isSelected = conv.id === selectedId;

            return (
              <button
                key={conv.id}
                onClick={() => setSelectedId(conv.id)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "0.875rem 1rem",
                  background: isSelected ? "var(--surface-container-low)" : "transparent",
                  border: "none",
                  borderBottom: "1px solid var(--border-subtle)",
                  cursor: "pointer"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                  <span style={{ fontWeight: 600, fontSize: "0.82rem", color: "var(--ink)" }}>
                    {conv.guest_name ?? "Khách ẩn danh"}
                  </span>
                  <span
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: 600,
                      padding: "0.1rem 0.4rem",
                      borderRadius: "0.25rem",
                      background: badge.bg,
                      color: badge.color,
                      flexShrink: 0
                    }}
                  >
                    {badge.text}
                  </span>
                </div>
                {conv.guest_phone && (
                  <p style={{ margin: "0.2rem 0 0", fontSize: "0.72rem", color: "var(--muted)" }}>{conv.guest_phone}</p>
                )}
                <p style={{ margin: "0.2rem 0 0", fontSize: "0.7rem", color: "var(--muted)" }}>
                  {conv.last_message_at ? formatRelativeTime(conv.last_message_at) : formatRelativeTime(conv.created_at)}
                </p>
              </button>
            );
          })
        )}
      </div>

      {/* Right panel — message thread */}
      {selectedConversation ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Header */}
          <div style={{ padding: "0.875rem 1.25rem", borderBottom: "1px solid var(--border-subtle)", background: "var(--surface-container-lowest)", display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: "0.9rem" }}>
                {selectedConversation.guest_name ?? "Khách ẩn danh"}
              </p>
              {selectedConversation.guest_phone && (
                <p style={{ margin: "0.15rem 0 0", fontSize: "0.75rem", color: "var(--muted)" }}>
                  {selectedConversation.guest_phone}
                  {selectedConversation.guest_email ? ` · ${selectedConversation.guest_email}` : ""}
                </p>
              )}
              {selectedConversation.source_url && (
                <p style={{ margin: "0.1rem 0 0", fontSize: "0.68rem", color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "30rem" }}>
                  {selectedConversation.source_url}
                </p>
              )}
            </div>
            <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>
              {formatRelativeTime(selectedConversation.created_at)}
            </span>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {messages.length === 0 && (
              <p style={{ margin: "auto", fontSize: "0.8rem", color: "var(--muted)", textAlign: "center" }}>
                Chưa có tin nhắn nào trong cuộc hội thoại này.
              </p>
            )}
            {messages.map((msg) => (
              <div key={msg.id} style={{ display: "flex", justifyContent: msg.sender_type === "admin" ? "flex-end" : "flex-start" }}>
                <div
                  style={{
                    maxWidth: "60%",
                    padding: "0.5rem 0.875rem",
                    borderRadius: msg.sender_type === "admin" ? "1rem 1rem 0.25rem 1rem" : "1rem 1rem 1rem 0.25rem",
                    background: msg.sender_type === "admin" ? "var(--gold)" : "var(--surface-container-low)",
                    color: msg.sender_type === "admin" ? "var(--ink)" : "var(--text)",
                    fontSize: "0.83rem",
                    lineHeight: 1.55,
                    wordBreak: "break-word"
                  }}
                >
                  {msg.message}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply input */}
          <div style={{ padding: "0.875rem 1.25rem", borderTop: "1px solid var(--border-subtle)", display: "flex", gap: "0.625rem", alignItems: "flex-end" }}>
            <textarea
              disabled={sending}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập phản hồi... (Enter để gửi)"
              rows={2}
              style={{
                flex: 1,
                resize: "none",
                border: "1px solid var(--border-subtle)",
                borderRadius: "0.5rem",
                padding: "0.625rem 0.875rem",
                fontFamily: "var(--font-body)",
                fontSize: "0.83rem",
                background: "var(--surface-container-low)",
                color: "var(--text)",
                outline: "none",
                lineHeight: 1.5
              }}
              value={input}
            />
            <button
              aria-label="Gửi"
              disabled={sending || !input.trim()}
              onClick={() => void handleSend()}
              style={{
                background: "var(--gold)",
                border: "none",
                borderRadius: "0.5rem",
                color: "var(--ink)",
                cursor: sending || !input.trim() ? "not-allowed" : "pointer",
                opacity: sending || !input.trim() ? 0.5 : 1,
                padding: "0.625rem 0.75rem",
                lineHeight: 1,
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
                fontWeight: 600,
                fontSize: "0.8rem"
              }}
            >
              <SendIcon />
              Gửi
            </button>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>Chọn một cuộc hội thoại để xem tin nhắn.</p>
        </div>
      )}
    </div>
  );
}
