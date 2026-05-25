"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { ChatConversationRow, ChatMessageRow } from "@/lib/supabase/database.types";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { Locale } from "@/lib/locale";

type AdminChatPageProps = {
  initialConversations: ChatConversationRow[];
  locale: Locale;
};

const TYPING_DEBOUNCE_MS = 2000;

const typingStyles = `
@keyframes sk-typing-bounce {
  0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}
.sk-typing-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
  animation: sk-typing-bounce 1.2s infinite ease-in-out;
}
.sk-typing-dot:nth-child(1) { animation-delay: 0s; }
.sk-typing-dot:nth-child(2) { animation-delay: 0.2s; }
.sk-typing-dot:nth-child(3) { animation-delay: 0.4s; }
`;

function TypingBubble({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <div style={{ padding: "0.5rem 0.75rem", borderRadius: "1rem 1rem 1rem 0.25rem", background: "var(--surface-container-low)", display: "flex", gap: "0.3rem", alignItems: "center" }}>
        <span className="sk-typing-dot" />
        <span className="sk-typing-dot" />
        <span className="sk-typing-dot" />
      </div>
      <span style={{ fontSize: "0.68rem", color: "var(--muted)" }}>{label}</span>
    </div>
  );
}

function formatTime(dateStr: string) {
  try {
    return new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      timeZone: "Asia/Ho_Chi_Minh"
    }).format(new Date(dateStr));
  } catch {
    return "";
  }
}

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
  const [guestTyping, setGuestTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const presenceChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const supabase = createSupabaseBrowserClient();

  // Subscribe to conversation list updates
  useEffect(() => {
    const channel = supabase
      .channel("chat:admin-conversations")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_conversations" }, (payload) => {
        setConversations((prev) => [payload.new as ChatConversationRow, ...prev]);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "chat_conversations" }, (payload) => {
        setConversations((prev) =>
          prev.map((c) => (c.id === (payload.new as ChatConversationRow).id ? (payload.new as ChatConversationRow) : c))
        );
      })
      .subscribe();

    return () => { void channel.unsubscribe(); };
  }, [supabase]);

  // Subscribe to messages + presence for selected conversation
  useEffect(() => {
    if (!selectedId) return;

    setMessages([]);
    setGuestTyping(false);

    supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", selectedId)
      .order("created_at", { ascending: true })
      .then(({ data }) => { if (data) setMessages(data as ChatMessageRow[]); });

    const msgChannel = supabase
      .channel(`chat:admin:msg:${selectedId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
        filter: `conversation_id=eq.${selectedId}`
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as ChatMessageRow]);
      })
      .subscribe();

    const presenceChannel = supabase.channel(`chat:typing:${selectedId}`, {
      config: { presence: { key: "admin" } }
    });

    presenceChannel
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState<{ role: string; typing: boolean }>();
        const isGuestTyping = Object.values(state).some((presences) =>
          presences.some((p) => p.role === "guest" && p.typing)
        );
        setGuestTyping(isGuestTyping);
      })
      .subscribe();

    presenceChannelRef.current = presenceChannel;

    return () => {
      void msgChannel.unsubscribe();
      void presenceChannel.unsubscribe();
      presenceChannelRef.current = null;
    };
  }, [selectedId, supabase]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const broadcastTyping = useCallback((typing: boolean) => {
    const ch = presenceChannelRef.current;
    if (!ch) return;
    void ch.track({ role: "admin", typing });
  }, []);

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    broadcastTyping(true);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => broadcastTyping(false), TYPING_DEBOUNCE_MS);
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || !selectedId || sending) return;

    setSending(true);
    setInput("");
    broadcastTyping(false);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);

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
    <>
      <style>{typingStyles}</style>
      <div style={{ display: "flex", height: "calc(100dvh - 4.8rem)", overflow: "hidden", fontFamily: "var(--font-body)", margin: "-1.2rem -1.35rem -1.6rem" }}>

        {/* Left panel — conversation list */}
        <div style={{ width: "20rem", minWidth: "16rem", borderRight: "1px solid var(--border-subtle)", overflowY: "auto", background: "var(--surface-container-lowest)", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "1rem", borderBottom: "1px solid var(--border-subtle)", position: "sticky", top: 0, background: "var(--surface-container-lowest)", zIndex: 1 }}>
            <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "0.95rem", fontWeight: 700 }}>Live Chat</h2>
            <p style={{ margin: "0.25rem 0 0", fontSize: "0.75rem", color: "var(--muted)" }}>{conversations.length} cuộc hội thoại</p>
          </div>

          {conversations.length === 0 ? (
            <p style={{ padding: "1.5rem", fontSize: "0.8rem", color: "var(--muted)", textAlign: "center" }}>Chưa có cuộc hội thoại nào.</p>
          ) : (
            conversations.map((conv) => {
              const badge = statusLabel(conv.status);
              const isSelected = conv.id === selectedId;

              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedId(conv.id)}
                  style={{ display: "block", width: "100%", textAlign: "left", padding: "0.875rem 1rem", background: isSelected ? "var(--surface-container-low)" : "transparent", border: "none", borderBottom: "1px solid var(--border-subtle)", cursor: "pointer" }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                    <span style={{ fontWeight: 600, fontSize: "0.82rem", color: "var(--ink)" }}>
                      {conv.guest_name ?? "Khách ẩn danh"}
                    </span>
                    <span style={{ fontSize: "0.65rem", fontWeight: 600, padding: "0.1rem 0.4rem", borderRadius: "0.25rem", background: badge.bg, color: badge.color, flexShrink: 0 }}>
                      {badge.text}
                    </span>
                  </div>
                  {conv.guest_phone && (
                    <p style={{ margin: "0.2rem 0 0", fontSize: "0.72rem", color: "var(--muted)" }}>{conv.guest_phone}</p>
                  )}
                  {conv.guest_email && (
                    <p style={{ margin: "0.1rem 0 0", fontSize: "0.7rem", color: "var(--muted)" }}>{conv.guest_email}</p>
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
            <div style={{ padding: "0.875rem 1.25rem", borderBottom: "1px solid var(--border-subtle)", background: "var(--surface-container-lowest)", display: "flex", alignItems: "center", gap: "1rem", flexShrink: 0 }}>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: "0.9rem" }}>
                  {selectedConversation.guest_name ?? "Khách ẩn danh"}
                </p>
                <p style={{ margin: "0.15rem 0 0", fontSize: "0.75rem", color: "var(--muted)" }}>
                  {[selectedConversation.guest_phone, selectedConversation.guest_email].filter(Boolean).join(" · ") || "—"}
                </p>
                {selectedConversation.source_url && (
                  <p style={{ margin: "0.1rem 0 0", fontSize: "0.68rem", color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "30rem" }}>
                    {selectedConversation.source_url}
                  </p>
                )}
              </div>
              <span style={{ fontSize: "0.72rem", color: "var(--muted)", flexShrink: 0 }}>
                {formatRelativeTime(selectedConversation.created_at)}
              </span>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {messages.length === 0 && (
                <p style={{ margin: "auto", fontSize: "0.8rem", color: "var(--muted)", textAlign: "center" }}>Chưa có tin nhắn.</p>
              )}

              {messages.map((msg) => {
                if (msg.sender_type === "system") {
                  return (
                    <div key={msg.id} style={{ display: "flex", justifyContent: "center" }}>
                      <div style={{ maxWidth: "80%", padding: "0.375rem 0.75rem", borderRadius: "0.75rem", background: "var(--surface-container-low)", fontSize: "0.72rem", color: "var(--muted)", fontStyle: "italic", textAlign: "center", lineHeight: 1.5 }}>
                        {msg.message}
                      </div>
                    </div>
                  );
                }

                const isAdmin = msg.sender_type === "admin";
                return (
                  <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: isAdmin ? "flex-end" : "flex-start", gap: "0.125rem" }}>
                    <div style={{ maxWidth: "60%", padding: msg.attachment_url ? "0.25rem" : "0.5rem 0.875rem", borderRadius: isAdmin ? "1rem 1rem 0.25rem 1rem" : "1rem 1rem 1rem 0.25rem", background: isAdmin ? "var(--gold)" : "var(--surface-container-low)", color: isAdmin ? "var(--ink)" : "var(--text)", fontSize: "0.83rem", lineHeight: 1.55, wordBreak: "break-word", overflow: "hidden" }}>
                      {msg.attachment_url && msg.attachment_type === "image" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          alt="Ảnh đính kèm"
                          onClick={() => window.open(msg.attachment_url!, "_blank")}
                          src={msg.attachment_url}
                          style={{ display: "block", maxWidth: "220px", borderRadius: "0.75rem", cursor: "pointer" }}
                        />
                      ) : null}
                      {msg.message && <span>{msg.message}</span>}
                    </div>
                    <div style={{ fontSize: "0.65rem", color: "var(--muted)", padding: "0 0.25rem" }}>
                      {formatTime(msg.created_at)}
                    </div>
                  </div>
                );
              })}

              {guestTyping && <TypingBubble label="Khách đang nhập..." />}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply input */}
            <div style={{ padding: "0.875rem 1.25rem", borderTop: "1px solid var(--border-subtle)", display: "flex", gap: "0.625rem", alignItems: "flex-end", flexShrink: 0 }}>
              <textarea
                disabled={sending}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Nhập phản hồi... (Enter để gửi)"
                rows={2}
                style={{ flex: 1, resize: "none", border: "1px solid var(--border-subtle)", borderRadius: "0.5rem", padding: "0.625rem 0.875rem", fontFamily: "var(--font-body)", fontSize: "0.83rem", background: "var(--surface-container-low)", color: "var(--text)", outline: "none", lineHeight: 1.5 }}
                value={input}
              />
              <button
                aria-label="Gửi"
                disabled={sending || !input.trim()}
                onClick={() => void handleSend()}
                style={{ background: "var(--gold)", border: "none", borderRadius: "0.5rem", color: "var(--ink)", cursor: sending || !input.trim() ? "not-allowed" : "pointer", opacity: sending || !input.trim() ? 0.5 : 1, padding: "0.625rem 0.75rem", lineHeight: 1, display: "flex", alignItems: "center", gap: "0.375rem", fontWeight: 600, fontSize: "0.8rem", flexShrink: 0 }}
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
    </>
  );
}
