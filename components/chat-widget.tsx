"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { siteInfo } from "@/lib/site-content";

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

type Lang = "vi" | "en";
type WidgetView = "closed" | "form" | "chat";

const STORAGE_KEY = "sk_chat_conversation_id";
const STORAGE_LANG_KEY = "sk_chat_language";
const TYPING_DEBOUNCE_MS = 2000;

const T = {
  vi: {
    brandSub: "Chat với lễ tân",
    greeting: (name: string) => `Xin chào, ${name}!`,
    formIntro: "Vui lòng cho chúng tôi biết thông tin của bạn để hỗ trợ tốt hơn.",
    nameLabel: "Họ tên *",
    emailLabel: "Email *",
    phoneLabel: "Số điện thoại",
    namePlaceholder: "Nguyễn Văn A",
    emailPlaceholder: "email@example.com",
    phonePlaceholder: "Không bắt buộc",
    startBtn: "Bắt đầu chat",
    errorName: "Vui lòng nhập họ tên.",
    errorEmail: "Vui lòng nhập email.",
    errorEmailInvalid: "Email không hợp lệ.",
    welcomePrompt: "Xin chào! Bạn cần hỗ trợ gì?",
    options: [
      { label: "🛏️ Tôi muốn đặt phòng", text: "Tôi muốn đặt phòng" },
      { label: "💰 Hỏi về giá & ưu đãi", text: "Cho tôi biết về giá phòng và ưu đãi hiện tại" },
      { label: "🕐 Hỗ trợ check-in / check-out", text: "Tôi cần hỗ trợ về giờ check-in / check-out" },
      { label: "❓ Câu hỏi khác", text: "Tôi có một câu hỏi khác" }
    ],
    inputPlaceholder: "Nhập tin nhắn... (Enter gửi)",
    sentLabel: "✓ Đã gửi",
    typingLabel: "Đang nhập...",
    langToggleLabel: "Ngôn ngữ"
  },
  en: {
    brandSub: "Chat with reception",
    greeting: (name: string) => `Hello, ${name}!`,
    formIntro: "Please share your details so we can assist you better.",
    nameLabel: "Full name *",
    emailLabel: "Email *",
    phoneLabel: "Phone number",
    namePlaceholder: "John Smith",
    emailPlaceholder: "email@example.com",
    phonePlaceholder: "Optional",
    startBtn: "Start chat",
    errorName: "Please enter your name.",
    errorEmail: "Please enter your email.",
    errorEmailInvalid: "Invalid email address.",
    welcomePrompt: "Hello! How can we help you?",
    options: [
      { label: "🛏️ I want to book a room", text: "I want to book a room" },
      { label: "💰 Ask about rates & offers", text: "Ask about rates & offers" },
      { label: "🕐 Check-in / check-out support", text: "I need support with check-in / check-out" },
      { label: "❓ Other questions", text: "I have another question" }
    ],
    inputPlaceholder: "Type a message... (Enter to send)",
    sentLabel: "✓ Sent",
    typingLabel: "Typing...",
    langToggleLabel: "Language"
  }
};

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

function FacebookIcon() {
  return (
    <svg fill="currentColor" height="22" viewBox="0 0 24 24" width="22">
      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
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
@media (max-width: 480px) {
  .sk-chat-panel {
    width: calc(100vw - 2rem) !important;
    right: 1rem !important;
    left: 1rem !important;
  }
}
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

// --- Language Toggle ---

function LangToggle({ lang, onChange }: { lang: Lang; onChange: (l: Lang) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", background: "rgba(255,255,255,0.12)", borderRadius: "0.375rem", padding: "0.15rem" }}>
      {(["vi", "en"] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => onChange(l)}
          style={{
            background: lang === l ? "rgba(255,255,255,0.9)" : "none",
            border: "none",
            borderRadius: "0.25rem",
            color: lang === l ? "var(--ink)" : "rgba(255,255,255,0.7)",
            cursor: "pointer",
            fontFamily: "var(--font-display)",
            fontSize: "0.65rem",
            fontWeight: 700,
            letterSpacing: "0.05em",
            padding: "0.2rem 0.4rem",
            lineHeight: 1,
            transition: "all 0.15s"
          }}
          type="button"
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

// --- Main component ---

export function ChatWidget() {
  const [view, setView] = useState<WidgetView>("closed");
  const [lang, setLang] = useState<Lang>("vi");
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
  const supabaseRef = useRef(createSupabaseBrowserClient());
  const supabase = supabaseRef.current;
  const presenceChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const t = T[lang];

  // Restore state from sessionStorage; fall back to URL ?lang= param
  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) setConversationId(stored);
    const storedLang = sessionStorage.getItem(STORAGE_LANG_KEY) as Lang | null;
    if (storedLang === "vi" || storedLang === "en") {
      setLang(storedLang);
    } else {
      const urlLang = new URLSearchParams(window.location.search).get("lang");
      if (urlLang === "vi" || urlLang === "en") setLang(urlLang);
    }
  }, []);

  // Persist language choice
  useEffect(() => {
    sessionStorage.setItem(STORAGE_LANG_KEY, lang);
  }, [lang]);

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
  }, [conversationId]); // eslint-disable-line react-hooks/exhaustive-deps

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

  function handleLangChange(newLang: Lang) {
    if (conversationId) return; // language locked once chat has started
    setLang(newLang);
  }

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
    if (!guestInfo.name.trim()) return t.errorName;
    if (!guestInfo.email.trim()) return t.errorEmail;
    if (!isValidEmail(guestInfo.email)) return t.errorEmailInvalid;
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

  async function createConversationWithMessage(text: string | null) {
    const res = await fetch("/api/public/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: text,
        guestName: guestInfo.name || null,
        guestEmail: guestInfo.email || null,
        guestPhone: guestInfo.phone || null,
        sourceUrl: window.location.href,
        guestLanguage: lang
      })
    });

    if (!res.ok) throw new Error("Failed to start chat");
    const { conversationId: newId } = (await res.json()) as { conversationId: string };
    sessionStorage.setItem(STORAGE_KEY, newId);
    sessionStorage.setItem(STORAGE_LANG_KEY, lang);
    setConversationId(newId);
    return newId;
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
        await createConversationWithMessage(text);
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
        convId = await createConversationWithMessage(null);
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

      await supabase.from("chat_messages").insert({
        conversation_id: convId,
        sender_type: "guest",
        message: "",
        attachment_url: urlData.publicUrl,
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
    maxWidth: "calc(100vw - 2rem)",
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
    gap: "0.5rem",
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
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.03em" }}>SK Boutique Hotel</p>
                <p style={{ margin: "0.15rem 0 0", fontSize: "0.7rem", opacity: 0.65 }}>{t.brandSub}</p>
              </div>
              <LangToggle lang={lang} onChange={handleLangChange} />
              <button aria-label="Đóng" onClick={handleClose} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", opacity: 0.7, padding: "0.25rem", lineHeight: 1, flexShrink: 0 }}>
                <CloseIcon />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--muted)", lineHeight: 1.5 }}>
                {t.formIntro}
              </p>

              {formError && (
                <p style={{ margin: 0, fontSize: "0.75rem", color: "#ef4444", background: "#fef2f2", padding: "0.4rem 0.6rem", borderRadius: "0.375rem" }}>
                  {formError}
                </p>
              )}

              {(["name", "email", "phone"] as const).map((field) => (
                <div key={field}>
                  <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "var(--ink)", marginBottom: "0.25rem" }}>
                    {field === "name" ? t.nameLabel : field === "email" ? t.emailLabel : t.phoneLabel}
                  </label>
                  <input
                    autoComplete={field === "name" ? "name" : field === "email" ? "email" : "tel"}
                    onChange={(e) => setGuestInfo((prev) => ({ ...prev, [field]: e.target.value }))}
                    placeholder={field === "name" ? t.namePlaceholder : field === "email" ? t.emailPlaceholder : t.phonePlaceholder}
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
                {t.startBtn}
              </button>
            </form>
          </div>
        )}

        {/* Chat panel */}
        {view === "chat" && (
          <div style={{ ...panelStyle, height: "44rem", maxHeight: "calc(100dvh - 6rem)" }}>
            <div style={headerStyle}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.03em" }}>SK Boutique Hotel</p>
                <p style={{ margin: "0.15rem 0 0", fontSize: "0.7rem", opacity: 0.65 }}>
                  {guestInfo.name ? t.greeting(guestInfo.name.split(" ").at(-1)!) : t.brandSub}
                </p>
              </div>
              {/* Language selector (locked to badge once conversation started) */}
              {conversationId ? (
                <span style={{ fontSize: "0.62rem", fontWeight: 700, background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: "0.25rem", padding: "0.15rem 0.4rem", letterSpacing: "0.05em", flexShrink: 0 }}>
                  {lang.toUpperCase()}
                </span>
              ) : (
                <LangToggle lang={lang} onChange={handleLangChange} />
              )}
              <button aria-label="Đóng chat" onClick={handleClose} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", opacity: 0.7, padding: "0.25rem", lineHeight: 1, flexShrink: 0 }}>
                <CloseIcon />
              </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "0.875rem", display: "flex", flexDirection: "column", gap: "0.625rem", minHeight: 0 }}>
              {messages.length === 0 && !conversationId && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", paddingTop: "0.5rem" }}>
                  <p style={{ margin: 0, textAlign: "center", fontSize: "0.8rem", color: "var(--muted)", lineHeight: 1.5 }}>
                    {t.welcomePrompt}
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {t.options.map(({ label, text }) => (
                      <button
                        key={label}
                        onClick={() => {
                          void (async () => {
                            setSending(true);
                            try {
                              await createConversationWithMessage(text);
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
                          alt="Attachment"
                          onClick={() => window.open(msg.attachment_url!, "_blank")}
                          src={msg.attachment_url}
                          style={{ display: "block", maxWidth: "100%", borderRadius: "0.75rem", cursor: "pointer" }}
                        />
                      ) : null}
                      {msg.message && <span style={{ whiteSpace: "pre-line" }}>{msg.message}</span>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.65rem", color: "var(--muted)", padding: "0 0.25rem" }}>
                      <span>{formatTime(msg.created_at)}</span>
                      {isGuest && <span>{t.sentLabel}</span>}
                    </div>
                  </div>
                );
              })}

              {adminTyping && <TypingBubble label={t.typingLabel} />}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div style={{ padding: "0.75rem", borderTop: "1px solid var(--border-subtle)", display: "flex", gap: "0.5rem", alignItems: "flex-end", flexShrink: 0 }}>
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
                placeholder={t.inputPlaceholder}
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

        {/* Facebook Floating Button */}
        {view === "closed" && (
          <a
            aria-label="Facebook fanpage"
            href={siteInfo.facebook}
            rel="noreferrer noopener"
            style={{
              width: "3.25rem",
              height: "3.25rem",
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--gold) 0%, #785a19 100%)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 20px rgba(197, 160, 89, 0.25)",
              transition: "transform 0.2s ease, opacity 0.2s ease",
            }}
            target="_blank"
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; }}
          >
            <FacebookIcon />
          </a>
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
