"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type Message = {
  id: string;
  sender_type: "guest" | "admin" | "system";
  message: string;
  attachment_url: string | null;
  attachment_type: string | null;
  created_at: string;
};

type GuestInfo = {
  name: string;
  email: string;
  phone: string;
};

type WidgetView = "closed" | "form" | "chat";

const STORAGE_KEY = "sk_chat_conversation_id";
const TYPING_DEBOUNCE_MS = 2000;

// --- Icons ---

function ChatIcon() {
  return (
    <svg fill="none" height="22" viewBox="0 0 24 24" width="22">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
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
      <polygon fill="currentColor" points="22 2 15 22 11 13 2 9 22 2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg fill="none" height="18" viewBox="0 0 24 24" width="18">
      <rect height="18" rx="2" ry="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" width="18" x="3" y="3" />
      <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
      <polyline points="21 15 16 10 5 21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

// --- Helpers ---

function formatTime(dateStr: string) {
  try {
    return new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Ho_Chi_Minh"
    }).format(new Date(dateStr));
  } catch {
    return "";
  }
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// --- Typing dots animation (pure CSS via style tag) ---
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

// --- Main component ---

export function ChatWidget() {
  const [view, setView] = useState<WidgetView>("closed");
  const [guestInfo, setGuestInfo] = useState<GuestInfo>({ name: "", email: "", phone: "" });
  const [formError, setFormError] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [adminTyping, setAdminTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const presenceChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const supabase = createSupabaseBrowserClient();

  // Restore conversationId from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) setConversationId(stored);
  }, []);

  // Subscribe to messages + presence when conversationId is known
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

    const msgChannel = supabase
      .channel(`chat:msg:${conversationId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        const newMsg = payload.new as Message;
        setMessages((prev) => [...prev, newMsg]);
        if (newMsg.sender_type === "admin") {
          setHasUnread(true);
        }
      })
      .subscribe();

    const presenceChannel = supabase.channel(`chat:typing:${conversationId}`, {
      config: { presence: { key: "guest" } }
    });

    presenceChannel
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState<{ role: string; typing: boolean }>();
        const isAdminTyping = Object.values(state).some((presences) =>
          presences.some((p) => p.role === "admin" && p.typing)
        );
        setAdminTyping(isAdminTyping);
      })
      .subscribe();

    presenceChannelRef.current = presenceChannel;

    return () => {
      void msgChannel.unsubscribe();
      void presenceChannel.unsubscribe();
      presenceChannelRef.current = null;
    };
  }, [conversationId, supabase]);

  // Scroll to bottom on new messages or open
  useEffect(() => {
    if (view === "chat") {
      setHasUnread(false);
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [view, messages]);

  function handleOpen() {
    if (conversationId) {
      setView("chat");
    } else {
      setView("form");
    }
  }

  function handleClose() {
    setView("closed");
  }

  // Broadcast typing state to presence channel
  const broadcastTyping = useCallback((typing: boolean) => {
    const ch = presenceChannelRef.current;
    if (!ch) return;
    void ch.track({ role: "guest", typing });
  }, []);

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    broadcastTyping(true);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => broadcastTyping(false), TYPING_DEBOUNCE_MS);
  }

  function validateForm() {
    if (!guestInfo.name.trim()) return "Vui lòng nhập họ tên.";
    if (!guestInfo.email.trim()) return "Vui lòng nhập email.";
    if (!isValidEmail(guestInfo.email)) return "Email không hợp lệ.";
    return "";
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      setFormError(error);
      return;
    }
    setFormError("");
    setView("chat");
  }

  async function handleSend() {
    const text = input.trim();
    if ((!text && !uploading) || sending) return;
    if (!text) return;

    setSending(true);
    setInput("");
    broadcastTyping(false);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);

    try {
      if (!conversationId) {
        const res = await fetch("/api/public/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            guestName: guestInfo.name || null,
            guestEmail: guestInfo.email || null,
            guestPhone: guestInfo.phone || null,
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

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Ensure we have a conversation first
    let convId = conversationId;
    if (!convId) {
      const error = validateForm();
      if (error) {
        setFormError(error);
        setView("form");
        return;
      }

      setUploading(true);
      try {
        const res = await fetch("/api/public/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            guestName: guestInfo.name || null,
            guestEmail: guestInfo.email || null,
            guestPhone: guestInfo.phone || null,
            sourceUrl: window.location.href
          })
        });
        const { conversationId: newId } = (await res.json()) as { conversationId: string };
        sessionStorage.setItem(STORAGE_KEY, newId);
        setConversationId(newId);
        convId = newId;
      } catch {
        setUploading(false);
        return;
      }
    } else {
      setUploading(true);
    }

    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${convId}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("chat-attachments")
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("chat-attachments").getPublicUrl(path);
      const publicUrl = urlData.publicUrl;

      await supabase.from("chat_messages").insert({
        conversation_id: convId,
        sender_type: "guest",
        message: "",
        attachment_url: publicUrl,
        attachment_type: "image"
      });
    } catch (err) {
      console.error("[chat] Image upload failed", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  }

  // --- Render ---

  const panelStyle: React.CSSProperties = {
    width: "22rem",
    background: "var(--surface-container-lowest)",
    border: "1px solid var(--border-subtle)",
    borderRadius: "1rem",
    boxShadow: "var(--shadow-strong)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden"
  };

  const headerStyle: React.CSSProperties = {
    padding: "0.875rem 1rem",
    background: "var(--ink)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexShrink: 0
  };

  return (
    <>
      <style>{typingStyles}</style>
      <div style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 200, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.75rem" }}>

        {/* Pre-chat info form */}
        {view === "form" && (
          <div style={panelStyle}>
            <div style={headerStyle}>
              <div>
                <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.03em" }}>SK Boutique Hotel</p>
                <p style={{ margin: "0.15rem 0 0", fontSize: "0.7rem", opacity: 0.65 }}>Chat với lễ tân</p>
              </div>
              <button aria-label="Đóng" onClick={handleClose} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", opacity: 0.7, padding: "0.25rem", lineHeight: 1 }}>
                <CloseIcon />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--muted)", lineHeight: 1.5 }}>
                Vui lòng cho chúng tôi biết thông tin của bạn để hỗ trợ tốt hơn.
              </p>

              {formError && (
                <p style={{ margin: 0, fontSize: "0.75rem", color: "#ef4444", background: "#fef2f2", padding: "0.4rem 0.6rem", borderRadius: "0.375rem" }}>
                  {formError}
                </p>
              )}

              {(["name", "email", "phone"] as const).map((field) => (
                <div key={field}>
                  <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "var(--ink)", marginBottom: "0.25rem" }}>
                    {field === "name" ? "Họ tên *" : field === "email" ? "Email *" : "Số điện thoại"}
                  </label>
                  <input
                    autoComplete={field === "name" ? "name" : field === "email" ? "email" : "tel"}
                    onChange={(e) => setGuestInfo((prev) => ({ ...prev, [field]: e.target.value }))}
                    placeholder={field === "name" ? "Nguyễn Văn A" : field === "email" ? "email@example.com" : "Không bắt buộc"}
                    required={field !== "phone"}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "0.5rem",
                      padding: "0.5rem 0.625rem",
                      fontFamily: "var(--font-body)",
                      fontSize: "0.82rem",
                      background: "var(--surface-container-low)",
                      color: "var(--text)",
                      outline: "none"
                    }}
                    type={field === "email" ? "email" : field === "phone" ? "tel" : "text"}
                    value={guestInfo[field]}
                  />
                </div>
              ))}

              <button
                style={{
                  marginTop: "0.25rem",
                  background: "var(--ink)",
                  border: "none",
                  borderRadius: "0.5rem",
                  color: "#fff",
                  cursor: "pointer",
                  padding: "0.625rem",
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  letterSpacing: "0.03em"
                }}
                type="submit"
              >
                Bắt đầu chat
              </button>
            </form>
          </div>
        )}

        {/* Chat panel */}
        {view === "chat" && (
          <div style={{ ...panelStyle, height: "44rem", maxHeight: "calc(100dvh - 6rem)" }}>
            <div style={headerStyle}>
              <div>
                <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.03em" }}>SK Boutique Hotel</p>
                <p style={{ margin: "0.15rem 0 0", fontSize: "0.7rem", opacity: 0.65 }}>
                  {guestInfo.name ? `Xin chào, ${guestInfo.name.split(" ").at(-1)}!` : "Chat với lễ tân"}
                </p>
              </div>
              <button aria-label="Đóng chat" onClick={handleClose} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", opacity: 0.7, padding: "0.25rem", lineHeight: 1 }}>
                <CloseIcon />
              </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "0.875rem", display: "flex", flexDirection: "column", gap: "0.625rem", minHeight: 0 }}>
              {messages.length === 0 && !conversationId && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", paddingTop: "0.5rem" }}>
                  <p style={{ margin: 0, textAlign: "center", fontSize: "0.8rem", color: "var(--muted)", lineHeight: 1.5 }}>
                    Xin chào! Bạn cần hỗ trợ gì?
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {[
                      { label: "🛏️ Tôi muốn đặt phòng", text: "Tôi muốn đặt phòng" },
                      { label: "💰 Hỏi về giá & ưu đãi", text: "Cho tôi biết về giá phòng và ưu đãi hiện tại" },
                      { label: "🕐 Hỗ trợ check-in / check-out", text: "Tôi cần hỗ trợ về giờ check-in / check-out" },
                      { label: "❓ Câu hỏi khác", text: "Tôi có một câu hỏi khác" }
                    ].map(({ label, text }) => (
                      <button
                        key={label}
                        onClick={() => {
                          setInput(text);
                          void (async () => {
                            setSending(true);
                            try {
                              const res = await fetch("/api/public/chat", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  message: text,
                                  guestName: guestInfo.name || null,
                                  guestEmail: guestInfo.email || null,
                                  guestPhone: guestInfo.phone || null,
                                  sourceUrl: window.location.href
                                })
                              });
                              if (res.ok) {
                                const { conversationId: newId } = (await res.json()) as { conversationId: string };
                                sessionStorage.setItem(STORAGE_KEY, newId);
                                setConversationId(newId);
                                setInput("");
                              }
                            } finally {
                              setSending(false);
                            }
                          })();
                        }}
                        style={{
                          background: "var(--surface-container-low)",
                          border: "1px solid var(--border-subtle)",
                          borderRadius: "0.625rem",
                          color: "var(--ink)",
                          cursor: "pointer",
                          fontFamily: "var(--font-body)",
                          fontSize: "0.8rem",
                          fontWeight: 500,
                          padding: "0.6rem 0.875rem",
                          textAlign: "left",
                          transition: "background 0.15s"
                        }}
                        type="button"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg) => {
                if (msg.sender_type === "system") {
                  return (
                    <div key={msg.id} style={{ display: "flex", justifyContent: "center" }}>
                      <div style={{ maxWidth: "88%", padding: "0.375rem 0.75rem", borderRadius: "0.75rem", background: "var(--surface-container-low)", fontSize: "0.75rem", color: "var(--muted)", fontStyle: "italic", textAlign: "center", lineHeight: 1.5 }}>
                        {msg.message}
                      </div>
                    </div>
                  );
                }

                const isGuest = msg.sender_type === "guest";
                return (
                  <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: isGuest ? "flex-end" : "flex-start", gap: "0.125rem" }}>
                    <div style={{ maxWidth: "78%", padding: msg.attachment_url ? "0.25rem" : "0.5rem 0.75rem", borderRadius: isGuest ? "1rem 1rem 0.25rem 1rem" : "1rem 1rem 1rem 0.25rem", background: isGuest ? "var(--ink)" : "var(--surface-container-low)", color: isGuest ? "#fff" : "var(--text)", fontSize: "0.82rem", lineHeight: 1.5, wordBreak: "break-word", overflow: "hidden" }}>
                      {msg.attachment_url && msg.attachment_type === "image" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          alt="Ảnh đính kèm"
                          onClick={() => window.open(msg.attachment_url!, "_blank")}
                          src={msg.attachment_url}
                          style={{ display: "block", maxWidth: "100%", borderRadius: "0.75rem", cursor: "pointer" }}
                        />
                      ) : null}
                      {msg.message && <span>{msg.message}</span>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.65rem", color: "var(--muted)", padding: "0 0.25rem" }}>
                      <span>{formatTime(msg.created_at)}</span>
                      {isGuest && <span>✓ Đã gửi</span>}
                    </div>
                  </div>
                );
              })}

              {adminTyping && <TypingBubble label="Đang nhập..." />}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div style={{ padding: "0.75rem", borderTop: "1px solid var(--border-subtle)", display: "flex", gap: "0.5rem", alignItems: "flex-end", flexShrink: 0 }}>
              {/* Image upload button */}
              <button
                aria-label="Gửi ảnh"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                style={{ background: "none", border: "1px solid var(--border-subtle)", borderRadius: "0.5rem", color: uploading ? "var(--muted)" : "var(--ink)", cursor: uploading ? "not-allowed" : "pointer", padding: "0.5rem", lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
              >
                {uploading ? (
                  <svg fill="none" height="18" viewBox="0 0 24 24" width="18"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25" /><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeLinecap="round" strokeWidth="2"><animateTransform attributeName="transform" dur="0.8s" from="0 12 12" repeatCount="indefinite" to="360 12 12" type="rotate" /></path></svg>
                ) : <ImageIcon />}
              </button>
              <input accept="image/*" onChange={(e) => void handleImageUpload(e)} ref={fileInputRef} style={{ display: "none" }} type="file" />

              <textarea
                disabled={sending}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Nhập tin nhắn... (Enter gửi)"
                rows={1}
                style={{ flex: 1, resize: "none", border: "1px solid var(--border-subtle)", borderRadius: "0.5rem", padding: "0.5rem 0.75rem", fontFamily: "var(--font-body)", fontSize: "0.82rem", background: "var(--surface-container-low)", color: "var(--text)", outline: "none", lineHeight: 1.5 }}
                value={input}
              />

              <button
                aria-label="Gửi"
                disabled={sending || !input.trim()}
                onClick={() => void handleSend()}
                style={{ background: "var(--gold)", border: "none", borderRadius: "0.5rem", color: "var(--ink)", cursor: sending || !input.trim() ? "not-allowed" : "pointer", opacity: sending || !input.trim() ? 0.5 : 1, padding: "0.5rem 0.625rem", lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
              >
                <SendIcon />
              </button>
            </div>
          </div>
        )}

        {/* FAB */}
        {view === "closed" && (
          <button
            aria-label="Mở chat với lễ tân"
            onClick={handleOpen}
            style={{ width: "3.25rem", height: "3.25rem", borderRadius: "50%", background: "var(--ink)", border: "none", color: "#fff", cursor: "pointer", boxShadow: "0 4px 20px rgba(0,12,30,0.25)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}
          >
            <ChatIcon />
            {hasUnread && (
              <span style={{ position: "absolute", top: "0.25rem", right: "0.25rem", width: "0.625rem", height: "0.625rem", borderRadius: "50%", background: "var(--gold)", border: "2px solid var(--ink)" }} />
            )}
          </button>
        )}

        {(view === "form" || view === "chat") && (
          <button
            aria-label="Thu nhỏ chat"
            onClick={handleClose}
            style={{ width: "3.25rem", height: "3.25rem", borderRadius: "50%", background: "var(--ink)", border: "none", color: "#fff", cursor: "pointer", boxShadow: "0 4px 20px rgba(0,12,30,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <CloseIcon />
          </button>
        )}
      </div>
    </>
  );
}
