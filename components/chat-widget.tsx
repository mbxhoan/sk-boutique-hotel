"use client";

import { useEffect, useRef, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type Message = {
  id: string;
  sender_type: "guest" | "admin" | "system";
  message: string;
  created_at: string;
};

const STORAGE_KEY = "sk_chat_conversation_id";

function ChatIcon() {
  return (
    <svg fill="none" height="22" viewBox="0 0 24 24" width="22">
      <path
        d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg fill="none" height="18" viewBox="0 0 24 24" width="18">
      <line stroke="currentColor" strokeLinecap="round" strokeWidth="2" x1="18" x2="6" y1="6" y2="18" />
      <line stroke="currentColor" strokeLinecap="round" strokeWidth="2" x1="6" x2="18" y1="6" y2="18" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg fill="none" height="16" viewBox="0 0 24 24" width="16">
      <line stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="22" x2="11" y1="2" y2="13" />
      <polygon
        fill="currentColor"
        points="22 2 15 22 11 13 2 9 22 2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) setConversationId(stored);
  }, []);

  useEffect(() => {
    if (!conversationId) return;

    supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data) setMessages(data as Message[]);
      });

    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => [...prev, newMsg]);
          if (!open && newMsg.sender_type === "admin") {
            setHasUnread(true);
          }
        }
      )
      .subscribe();

    return () => {
      void channel.unsubscribe();
    };
  }, [conversationId, open, supabase]);

  useEffect(() => {
    if (open) {
      setHasUnread(false);
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [open, messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;

    setSending(true);
    setInput("");

    try {
      if (!conversationId) {
        const res = await fetch("/api/public/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            sourceUrl: window.location.href
          })
        });

        if (!res.ok) throw new Error("Failed to start chat");

        const { conversationId: newId } = (await res.json()) as { conversationId: string };
        sessionStorage.setItem(STORAGE_KEY, newId);
        setConversationId(newId);
      } else {
        await supabase.from("chat_messages").insert({
          conversation_id: conversationId,
          sender_type: "guest",
          message: text
        });
      }
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

  return (
    <div style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 200, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.75rem" }}>
      {open && (
        <div
          style={{
            width: "22rem",
            maxHeight: "30rem",
            background: "var(--surface-container-lowest)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "1rem",
            boxShadow: "var(--shadow-strong)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }}
        >
          {/* Header */}
          <div style={{ padding: "0.875rem 1rem", background: "var(--ink)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.03em" }}>
                SK Boutique Hotel
              </p>
              <p style={{ margin: 0, fontSize: "0.7rem", opacity: 0.65, marginTop: "0.15rem" }}>Chat với lễ tân</p>
            </div>
            <button
              aria-label="Đóng chat"
              onClick={() => setOpen(false)}
              style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", opacity: 0.7, padding: "0.25rem", lineHeight: 1 }}
            >
              <CloseIcon />
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "0.875rem", display: "flex", flexDirection: "column", gap: "0.5rem", minHeight: "12rem", maxHeight: "18rem" }}>
            {messages.length === 0 && (
              <p style={{ margin: "auto", textAlign: "center", fontSize: "0.8rem", color: "var(--muted)" }}>
                Xin chào! Chúng tôi có thể giúp gì cho bạn?
              </p>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  justifyContent: msg.sender_type === "guest" ? "flex-end" : "flex-start"
                }}
              >
                <div
                  style={{
                    maxWidth: "78%",
                    padding: "0.5rem 0.75rem",
                    borderRadius: msg.sender_type === "guest" ? "1rem 1rem 0.25rem 1rem" : "1rem 1rem 1rem 0.25rem",
                    background: msg.sender_type === "guest" ? "var(--ink)" : "var(--surface-container-low)",
                    color: msg.sender_type === "guest" ? "#fff" : "var(--text)",
                    fontSize: "0.82rem",
                    lineHeight: 1.5,
                    wordBreak: "break-word"
                  }}
                >
                  {msg.message}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: "0.75rem", borderTop: "1px solid var(--border-subtle)", display: "flex", gap: "0.5rem", alignItems: "flex-end" }}>
            <textarea
              disabled={sending}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập tin nhắn..."
              rows={1}
              style={{
                flex: 1,
                resize: "none",
                border: "1px solid var(--border-subtle)",
                borderRadius: "0.5rem",
                padding: "0.5rem 0.75rem",
                fontFamily: "var(--font-body)",
                fontSize: "0.82rem",
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
                padding: "0.5rem 0.625rem",
                lineHeight: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <SendIcon />
            </button>
          </div>
        </div>
      )}

      {/* FAB button */}
      <button
        aria-label={open ? "Đóng chat" : "Mở chat với lễ tân"}
        onClick={() => setOpen((prev) => !prev)}
        style={{
          width: "3.25rem",
          height: "3.25rem",
          borderRadius: "50%",
          background: "var(--ink)",
          border: "none",
          color: "#fff",
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(0,12,30,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          transition: "transform 0.15s ease, box-shadow 0.15s ease"
        }}
      >
        {open ? <CloseIcon /> : <ChatIcon />}
        {!open && hasUnread && (
          <span
            style={{
              position: "absolute",
              top: "0.25rem",
              right: "0.25rem",
              width: "0.625rem",
              height: "0.625rem",
              borderRadius: "50%",
              background: "var(--gold)",
              border: "2px solid var(--ink)"
            }}
          />
        )}
      </button>
    </div>
  );
}
