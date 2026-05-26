"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { ChatConversationRow, ChatMessageRow } from "@/lib/supabase/database.types";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { Locale } from "@/lib/locale";

type AdminChatPageProps = {
  initialConversations: ChatConversationRow[];
  locale: Locale;
};

type Intent = "booking" | "pricing" | "checkin_checkout" | "other";
type Lang = "vi" | "en";

const TYPING_DEBOUNCE_MS = 2000;
const HIDDEN_STORAGE_KEY = "sk_admin_chat_hidden";

// --- Follow-up 2 quick-reply templates ---

const FOLLOWUP2_TEMPLATES: Record<Intent, { label: string; vi: string; en: string }[]> = {
  booking: [
    {
      label: "Hỏi thêm SL khách + chi nhánh",
      vi: "Cảm ơn bạn nhé. Mình đã nắm được thông tin cơ bản rồi. Bạn vui lòng cho mình biết thêm số lượng khách và nếu có, chi nhánh bạn muốn ở để bên mình kiểm tra nhanh tình trạng phòng phù hợp cho bạn nhé.",
      en: "Thank you. I've got the basic details. Could you also share the number of guests and, if applicable, the branch you prefer, so we can check the most suitable room for you more quickly?"
    },
    {
      label: "Hỏi hạng phòng (đã biết ngày)",
      vi: "Cảm ơn bạn. Với khoảng thời gian này, bạn đang quan tâm đến hạng phòng nào ạ? Nếu bạn chưa chọn được, mình cũng có thể gợi ý theo số lượng khách và nhu cầu của bạn nhé.",
      en: "Thank you. For those dates, which room type are you interested in? If you haven't decided yet, I can also suggest options based on your number of guests and what you need."
    },
    {
      label: "Hỏi ngày ở (đã biết hạng phòng)",
      vi: "Dạ, mình đã ghi nhận hạng phòng bạn đang quan tâm. Bạn dự kiến muốn ở vào khoảng ngày nào để bên mình kiểm tra tình trạng phòng chính xác hơn cho bạn nhé?",
      en: "Got it — I've noted the room type you're interested in. Could you share your expected stay dates so we can check availability more accurately for you?"
    },
    {
      label: "Gợi ý phòng (chưa biết chọn)",
      vi: "Không sao đâu ạ. Bạn cho mình biết giúp: đi mấy người, thích phòng theo kiểu ấm cúng / rộng rãi / có view / phù hợp gia đình, và ngày dự kiến lưu trú. Mình sẽ gợi ý hạng phòng phù hợp hơn cho bạn nhé.",
      en: "No worries at all. Just let me know how many guests, whether you prefer something cozy / spacious / with a view / family-friendly, and your expected stay dates. I'll suggest the most suitable room for you."
    },
    {
      label: "Kiểm tra tình trạng phòng",
      vi: "Bên mình sẽ kiểm tra ngay cho bạn nhé. Bạn gửi giúp mình ngày nhận phòng, ngày trả phòng, số lượng khách, và nếu có, hạng phòng bạn đang quan tâm. Mình sẽ hỗ trợ kiểm tra nhanh nhất có thể.",
      en: "We'll check that for you right away. Please send your check-in date, check-out date, number of guests, and, if possible, the room type you're interested in. We'll get back to you as quickly as possible."
    },
    {
      label: "Đã nhận đủ thông tin",
      vi: "Cảm ơn bạn, mình đã nhận đủ thông tin rồi. Bên mình sẽ kiểm tra tình trạng phòng và liên hệ lại với bạn sớm nhất để hỗ trợ đặt phòng nhé.",
      en: "Thank you, I've received all the details. We'll check room availability and get back to you as soon as possible to assist with your booking."
    }
  ],
  pricing: [
    {
      label: "Có hạng phòng + ngày ở",
      vi: "Cảm ơn bạn. Mình sẽ kiểm tra mức giá phù hợp cho thời gian này. Nếu bạn muốn, mình cũng có thể kiểm tra thêm xem hiện tại có ưu đãi nào áp dụng được cho hạng phòng này không nhé.",
      en: "Thank you. I'll check the most suitable rate for those dates. If you'd like, I can also see whether there are any available offers for this room type."
    },
    {
      label: "Hỏi giá chung chung",
      vi: "Dạ, để báo giá sát hơn, bạn cho mình biết giúp ngày dự kiến lưu trú, hạng phòng bạn quan tâm, và số lượng khách. Bên mình sẽ kiểm tra và gửi lại mức giá phù hợp nhất cho bạn nhé.",
      en: "Sure — to give you a more accurate rate, could you share your expected stay dates, the room type you're interested in, and the number of guests? We'll check and send you the most suitable rate."
    },
    {
      label: "Hỏi ưu đãi",
      vi: "Dạ có ạ, ưu đãi sẽ tùy theo thời gian lưu trú, hạng phòng và tình trạng phòng hiện tại. Bạn cho mình xin ngày dự kiến ở để bên mình kiểm tra ưu đãi phù hợp nhất cho bạn nhé.",
      en: "Yes, offers may vary depending on your stay dates, room type, and current availability. Please share your expected stay dates so we can check the most suitable offer for you."
    },
    {
      label: "Hỏi giá thấp nhất",
      vi: "Bên mình có thể hỗ trợ bạn tham khảo mức giá phù hợp nhất theo từng thời điểm. Bạn cho mình xin ngày ở dự kiến hoặc khoảng thời gian linh hoạt để mình kiểm tra mức giá tốt nhất hiện có nhé.",
      en: "We can help you check the best available rate depending on the period. Please share your expected stay dates or a flexible date range, and I'll look for the best available option for you."
    },
    {
      label: "So sánh nhiều hạng phòng",
      vi: "Dạ được ạ. Bạn cho mình biết các hạng phòng bạn đang cân nhắc hoặc số lượng khách, mình sẽ hỗ trợ so sánh nhanh về giá, không gian và độ phù hợp cho bạn nhé.",
      en: "Of course. Please share the room types you're considering, or simply the number of guests, and I can help compare them in terms of rate, space, and overall suitability."
    },
    {
      label: "Đã đủ thông tin báo giá",
      vi: "Cảm ơn bạn, mình đã nhận đủ thông tin rồi. Bên mình sẽ kiểm tra giá và ưu đãi hiện có, sau đó phản hồi lại bạn sớm nhất nhé.",
      en: "Thank you, I've got all the details I need. We'll check the available rates and offers, then get back to you as soon as possible."
    }
  ],
  checkin_checkout: [
    {
      label: "Hỏi giờ check-in/out",
      vi: "Dạ, bên mình sẽ hỗ trợ thông tin này ngay cho bạn. Bạn đang muốn hỏi về giờ nhận phòng, giờ trả phòng, hay cần hỗ trợ thêm về check-in sớm / check-out muộn ạ?",
      en: "Of course — I'd be happy to help with that. Are you asking about the check-in time, check-out time, or do you need support with early check-in / late check-out?"
    },
    {
      label: "Check-in sớm",
      vi: "Dạ, check-in sớm sẽ tùy theo tình trạng phòng thực tế trong ngày bạn đến. Bạn cho mình xin ngày lưu trú và nếu đã có, mã booking để bên mình kiểm tra nhanh hơn nhé.",
      en: "Early check-in depends on actual room availability on your arrival day. Please share your stay date and, if available, your booking code, so we can check more quickly for you."
    },
    {
      label: "Check-out muộn",
      vi: "Dạ, check-out muộn cũng sẽ phụ thuộc vào tình trạng phòng trong ngày. Bạn gửi giúp mình ngày check-out dự kiến hoặc mã booking, bên mình sẽ kiểm tra và phản hồi lại bạn nhé.",
      en: "Late check-out also depends on room availability on that day. Please send your expected check-out date or your booking code, and we'll check and get back to you."
    },
    {
      label: "Hỏi thủ tục nhận phòng",
      vi: "Dạ, nếu bạn cần hỗ trợ về thủ tục nhận phòng, bạn có thể cho mình biết bạn đang quan tâm đến giờ nhận phòng, giấy tờ cần mang theo, hay hỗ trợ đến sớm / đến muộn. Mình sẽ gửi đúng thông tin bạn cần nhé.",
      en: "Of course. If you need help with check-in procedures, please let me know whether you're asking about check-in time, required documents, or arriving early / late. I'll share the right details for you."
    },
    {
      label: "Đã có booking",
      vi: "Cảm ơn bạn. Nếu bạn đã có booking, bạn vui lòng gửi giúp mình mã booking để bên mình hỗ trợ nhanh và chính xác hơn nhé.",
      en: "Thank you. If you already have a booking, please send your booking code so we can assist you more quickly and accurately."
    }
  ],
  other: [
    {
      label: "Hỏi địa chỉ / vị trí",
      vi: "Dạ, nếu bạn đang cần hỗ trợ về vị trí khách sạn, mình có thể gửi thông tin địa chỉ, chi nhánh, hoặc hướng dẫn di chuyển phù hợp cho bạn. Bạn muốn mình hỗ trợ phần nào trước nhé?",
      en: "If you need help with the hotel location, I can share the address, branch details, or travel guidance for you. Which part would you like help with first?"
    },
    {
      label: "Hỏi dịch vụ / tiện nghi",
      vi: "Dạ, bạn đang muốn tìm hiểu về dịch vụ hay tiện nghi phòng / khách sạn nào ạ? Bạn cứ nhắn cụ thể giúp mình, bên mình sẽ phản hồi đúng thông tin cho bạn nhé.",
      en: "Sure — are you asking about a specific service or room / hotel amenity? Just let me know what you'd like to know, and we'll provide the right information for you."
    },
    {
      label: "Chuyển sang người thật",
      vi: "Dạ, nội dung này bên mình sẽ nhờ bộ phận phù hợp kiểm tra kỹ hơn và phản hồi lại bạn sớm nhất nhé. Bạn cứ để lại thêm thông tin nếu cần, bên mình vẫn đang theo dõi cuộc trò chuyện này ạ.",
      en: "We'll have the appropriate team review this more carefully and get back to you as soon as possible. Please feel free to leave any additional details — we're still following this conversation closely."
    }
  ]
};

const SHARED_TEMPLATES = [
  {
    label: "Đã nhận đủ thông tin",
    vi: "Cảm ơn bạn, mình đã nhận đủ thông tin rồi. Bên mình sẽ kiểm tra và phản hồi lại bạn trong thời gian sớm nhất nhé.",
    en: "Thank you, I've received all the details. We'll review everything and get back to you as soon as possible."
  },
  {
    label: "Xin thêm thời gian",
    vi: "Bên mình đã ghi nhận thông tin của bạn rồi ạ. Cho bọn mình ít phút để kiểm tra lại và phản hồi chính xác hơn cho bạn nhé.",
    en: "We've received your information. Please give us a few moments to check and get back to you with the most accurate response."
  },
  {
    label: "Nhắc nhở (im lặng)",
    vi: "Mình vẫn đang ở đây để hỗ trợ bạn nhé. Bạn chỉ cần gửi giúp mình thêm thông tin, bên mình sẽ hỗ trợ tiếp ngay.",
    en: "I'm still here to help whenever you're ready. Just send any additional details and we'll continue from there."
  }
];

// --- CSS ---

const styles = `
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
.admin-chat-outer {
  display: flex;
  height: calc(100dvh - 4.8rem);
  overflow: hidden;
  margin: -1.2rem -1.35rem -1.6rem;
  font-family: var(--font-body);
}
@media (max-width: 720px) {
  .admin-chat-outer { margin: -1rem -0.85rem -1.2rem; }
}
@media (min-width: 721px) {
  .admin-chat-conv-list { width: 20rem !important; min-width: 16rem !important; max-width: 20rem !important; }
  .admin-chat-back-btn { display: none !important; }
}
/* Context menu */
.admin-chat-ctx { position: relative; }
.admin-chat-ctx-menu {
  position: absolute;
  right: 0;
  top: 100%;
  z-index: 10;
  background: var(--surface-container-lowest);
  border: 1px solid var(--border-subtle);
  border-radius: 0.5rem;
  box-shadow: 0 4px 20px rgba(0,12,30,0.12);
  min-width: 9rem;
  overflow: hidden;
  margin-top: 0.25rem;
}
.admin-chat-ctx-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem 0.75rem;
  background: none;
  border: none;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 0.78rem;
  color: var(--ink);
  text-align: left;
}
.admin-chat-ctx-item:hover { background: var(--surface-container-low); }
.admin-chat-ctx-item--danger { color: #dc2626; }
.admin-chat-ctx-item--danger:hover { background: #fef2f2; }
/* Unread badge pulse */
@keyframes sk-badge-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.6; } }
.sk-unread-badge { animation: sk-badge-pulse 1.8s ease-in-out infinite; }
`;

// --- Helpers ---

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

function intentLabel(intent: string | null) {
  if (intent === "booking") return "🛏️";
  if (intent === "pricing") return "💰";
  if (intent === "checkin_checkout") return "🕐";
  if (intent === "other") return "❓";
  return null;
}

function SendIcon() {
  return (
    <svg fill="none" height="16" viewBox="0 0 24 24" width="16">
      <line stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="22" x2="11" y1="2" y2="13" />
      <polygon fill="currentColor" points="22 2 15 22 11 13 2 9 22 2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

// --- Main component ---

export function AdminChatPage({ initialConversations, locale: _locale }: AdminChatPageProps) {
  const supabaseRef = useRef(createSupabaseBrowserClient());
  const supabase = supabaseRef.current;

  const [conversations, setConversations] = useState<ChatConversationRow[]>(initialConversations);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [showHidden, setShowHidden] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(initialConversations[0]?.id ?? null);
  const [messages, setMessages] = useState<ChatMessageRow[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [guestTyping, setGuestTyping] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showConvList, setShowConvList] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  // unreadCounts[convId] = number of unread guest messages
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  // latestGuestMsg[convId] = last guest message text
  const [latestGuestMsg, setLatestGuestMsg] = useState<Record<string, string>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const presenceChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const selectedIdRef = useRef<string | null>(selectedId);
  selectedIdRef.current = selectedId;

  // Load hidden IDs from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(HIDDEN_STORAGE_KEY);
      if (raw) setHiddenIds(new Set(JSON.parse(raw) as string[]));
    } catch { /* ignore */ }
  }, []);

  // Persist hidden IDs
  function saveHiddenIds(next: Set<string>) {
    setHiddenIds(next);
    try { localStorage.setItem(HIDDEN_STORAGE_KEY, JSON.stringify([...next])); } catch { /* ignore */ }
  }

  // Prevent page scroll while chat UI is open
  useEffect(() => {
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => { document.documentElement.style.overflow = prev; };
  }, []);

  // Init audio
  useEffect(() => {
    audioRef.current = new Audio("/sounds/message-notification.mp3");
    audioRef.current.volume = 0.7;
  }, []);

  function playNotification() {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => { /* blocked by browser autoplay policy */ });
  }

  // Fetch initial unread counts for all conversations
  useEffect(() => {
    supabase
      .from("chat_messages")
      .select("conversation_id, message, created_at")
      .eq("sender_type", "guest")
      .is("read_at", null)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (!data) return;
        const counts: Record<string, number> = {};
        const latest: Record<string, string> = {};
        for (const row of data as { conversation_id: string; message: string; created_at: string }[]) {
          counts[row.conversation_id] = (counts[row.conversation_id] ?? 0) + 1;
          if (!latest[row.conversation_id]) {
            latest[row.conversation_id] = row.message;
          }
        }
        // Zero out the already-open conversation — it's being marked read right now
        const currentId = selectedIdRef.current;
        if (currentId) counts[currentId] = 0;
        setUnreadCounts(counts);
        setLatestGuestMsg(latest);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Global subscription: all new guest messages across all conversations
  useEffect(() => {
    const globalMsgChannel = supabase
      .channel("chat:admin:global-messages")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
        filter: "sender_type=eq.guest"
      }, (payload) => {
        const msg = payload.new as ChatMessageRow;
        const convId = msg.conversation_id;

        // Play sound for every new guest message (regardless of which conv is selected)
        playNotification();

        // Update preview message
        setLatestGuestMsg((prev) => ({ ...prev, [convId]: msg.message }));

        // Only add to unread count if this conv is not currently open
        if (selectedIdRef.current !== convId) {
          setUnreadCounts((prev) => ({ ...prev, [convId]: (prev[convId] ?? 0) + 1 }));
        }

        // Bump the conversation to the top of the list
        setConversations((prev) => {
          const idx = prev.findIndex((c) => c.id === convId);
          if (idx <= 0) return prev;
          const updated = [...prev];
          const [item] = updated.splice(idx, 1);
          return [{ ...item, last_message_at: msg.created_at }, ...updated];
        });
      })
      .subscribe();

    return () => { void globalMsgChannel.unsubscribe(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Conversation list real-time (inserts + updates)
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

  // Per-conversation messages + presence when selectedId changes
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

    // Mark guest messages as read via server (service client bypasses RLS)
    void fetch("/api/admin/chat/mark-read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: selectedId })
    }).catch(() => { /* fire-and-forget */ });

    setUnreadCounts((prev) => ({ ...prev, [selectedId]: 0 }));

    return () => {
      void msgChannel.unsubscribe();
      void presenceChannel.unsubscribe();
      presenceChannelRef.current = null;
    };
  }, [selectedId, supabase]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close context menu on outside click
  useEffect(() => {
    if (!openMenuId) return;
    function handleClick() { setOpenMenuId(null); }
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [openMenuId]);

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

  async function handleSend(overrideText?: string) {
    const text = (overrideText ?? input).trim();
    if (!text || !selectedId || sending) return;

    setSending(true);
    setInput("");
    setShowTemplates(false);
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
      if (!overrideText) setInput(text);
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

  function handleSelectConversation(id: string) {
    setSelectedId(id);
    setShowTemplates(false);
    setOpenMenuId(null);
    setShowConvList(false);
  }

  function handleHide(id: string) {
    const next = new Set(hiddenIds);
    next.add(id);
    saveHiddenIds(next);
    setOpenMenuId(null);
    if (selectedId === id) {
      const next_ = conversations.find((c) => c.id !== id && !next.has(c.id));
      setSelectedId(next_?.id ?? null);
    }
  }

  function handleUnhide(id: string) {
    const next = new Set(hiddenIds);
    next.delete(id);
    saveHiddenIds(next);
    setOpenMenuId(null);
  }

  async function handleClose(id: string) {
    setOpenMenuId(null);
    await supabase
      .from("chat_conversations")
      .update({ status: "closed" })
      .eq("id", id);
    if (selectedId === id) {
      const next = conversations.find((c) => c.id !== id && c.status !== "closed");
      setSelectedId(next?.id ?? null);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Xoá cuộc hội thoại này? Hành động không thể hoàn tác.")) return;
    setOpenMenuId(null);
    await supabase.from("chat_conversations").delete().eq("id", id);
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  const selectedConversation = conversations.find((c) => c.id === selectedId) ?? null;
  const guestLang: Lang = (selectedConversation?.guest_language as Lang) ?? "vi";
  const intent = selectedConversation?.chat_intent as Intent | null;
  const intentTemplates = intent ? FOLLOWUP2_TEMPLATES[intent] : [];

  const visibleConversations = conversations.filter((c) => showHidden ? true : !hiddenIds.has(c.id));
  const hiddenCount = hiddenIds.size;

  function guestInfoLine(conv: ChatConversationRow) {
    return [conv.guest_name, conv.guest_phone, conv.guest_email].filter(Boolean).join(" · ") || "Khách ẩn danh";
  }

  const totalUnread = Object.values(unreadCounts).reduce((sum, n) => sum + n, 0);

  return (
    <>
      <style>{styles}</style>
      <div className="admin-chat-outer">

        {/* Left panel — conversation list */}
        <div
          className="admin-chat-conv-list"
          style={{
            width: showConvList ? "20rem" : "0",
            minWidth: showConvList ? "16rem" : "0",
            maxWidth: showConvList ? "20rem" : "0",
            borderRight: "1px solid var(--border-subtle)",
            overflowY: "auto",
            overflowX: "hidden",
            background: "var(--surface-container-lowest)",
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
            transition: "width 0.2s, min-width 0.2s, max-width 0.2s"
          }}
        >
          <div style={{ padding: "0.875rem 1rem", borderBottom: "1px solid var(--border-subtle)", position: "sticky", top: 0, background: "var(--surface-container-lowest)", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "0.95rem", fontWeight: 700 }}>Live Chat</h2>
              {totalUnread > 0 && (
                <span className="sk-unread-badge" style={{ fontSize: "0.65rem", fontWeight: 700, background: "#ef4444", color: "#fff", borderRadius: "999px", padding: "0.15rem 0.45rem", minWidth: "1.3rem", textAlign: "center" }}>
                  {totalUnread}
                </span>
              )}
            </div>
            <p style={{ margin: "0.2rem 0 0", fontSize: "0.72rem", color: "var(--muted)" }}>
              {visibleConversations.length} cuộc hội thoại
              {hiddenCount > 0 && (
                <button
                  onClick={() => setShowHidden((v) => !v)}
                  style={{ marginLeft: "0.5rem", background: "none", border: "none", cursor: "pointer", color: "var(--gold)", fontSize: "0.7rem", padding: 0, fontFamily: "inherit" }}
                >
                  {showHidden ? "· Ẩn đã ẩn" : `· ${hiddenCount} đã ẩn`}
                </button>
              )}
            </p>
          </div>

          {visibleConversations.length === 0 ? (
            <p style={{ padding: "1.5rem", fontSize: "0.8rem", color: "var(--muted)", textAlign: "center" }}>Chưa có cuộc hội thoại nào.</p>
          ) : (
            visibleConversations.map((conv) => {
              const badge = statusLabel(conv.status);
              const isSelected = conv.id === selectedId;
              const emoji = intentLabel(conv.chat_intent ?? null);
              const langBadge = conv.guest_language ?? "vi";
              const unread = unreadCounts[conv.id] ?? 0;
              const preview = latestGuestMsg[conv.id];
              const isHidden = hiddenIds.has(conv.id);

              return (
                <div key={conv.id} style={{ position: "relative", borderBottom: "1px solid var(--border-subtle)", zIndex: openMenuId === conv.id ? 10 : 1 }}>
                  <button
                    onClick={() => handleSelectConversation(conv.id)}
                    style={{ display: "block", width: "100%", textAlign: "left", padding: "0.7rem 2.4rem 0.7rem 1rem", background: isSelected ? "var(--surface-container-low)" : unread > 0 ? "rgba(197,160,89,0.04)" : "transparent", border: "none", cursor: "pointer" }}
                  >
                    {/* Row 1: info + status badge */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.4rem" }}>
                      <p style={{ margin: 0, fontSize: "0.78rem", fontWeight: unread > 0 ? 700 : 600, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, minWidth: 0 }}>
                        {emoji && <span style={{ marginRight: "0.25rem" }}>{emoji}</span>}
                        {isHidden && <span style={{ marginRight: "0.25rem", opacity: 0.5 }}>👁‍🗨</span>}
                        {guestInfoLine(conv)}
                      </p>
                      <span style={{ fontSize: "0.6rem", fontWeight: 600, padding: "0.1rem 0.3rem", borderRadius: "0.2rem", background: badge.bg, color: badge.color, flexShrink: 0, whiteSpace: "nowrap" }}>
                        {badge.text}
                      </span>
                    </div>
                    {/* Row 2: latest guest message preview */}
                    {preview && (
                      <p style={{ margin: "0.15rem 0 0", fontSize: "0.7rem", color: unread > 0 ? "var(--ink)" : "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: unread > 0 ? 500 : 400 }}>
                        {preview.slice(0, 60)}{preview.length > 60 ? "…" : ""}
                      </p>
                    )}
                    {/* Row 3: time + lang + unread */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.15rem" }}>
                      <p style={{ margin: 0, fontSize: "0.67rem", color: "var(--muted)" }}>
                        {conv.last_message_at ? formatRelativeTime(conv.last_message_at) : formatRelativeTime(conv.created_at)}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                        <span style={{ fontSize: "0.58rem", fontWeight: 700, color: "var(--muted)", letterSpacing: "0.05em" }}>
                          {langBadge.toUpperCase()}
                        </span>
                        {unread > 0 && (
                          <span className="sk-unread-badge" style={{ fontSize: "0.6rem", fontWeight: 700, background: "#ef4444", color: "#fff", borderRadius: "999px", padding: "0.1rem 0.35rem", minWidth: "1.1rem", textAlign: "center" }}>
                            {unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Context menu trigger */}
                  <div className="admin-chat-ctx" style={{ position: "absolute", right: "0.35rem", top: "50%", transform: "translateY(-50%)" }}>
                    <button
                      aria-label="Tuỳ chọn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId((prev) => prev === conv.id ? null : conv.id);
                      }}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: "0.25rem", lineHeight: 1, borderRadius: "0.25rem", display: "flex", alignItems: "center" }}
                    >
                      <svg fill="currentColor" height="14" viewBox="0 0 16 16" width="14"><circle cx="8" cy="2.5" r="1.5" /><circle cx="8" cy="8" r="1.5" /><circle cx="8" cy="13.5" r="1.5" /></svg>
                    </button>

                    {openMenuId === conv.id && (
                      <div className="admin-chat-ctx-menu" onClick={(e) => e.stopPropagation()}>
                        {isHidden ? (
                          <button className="admin-chat-ctx-item" onClick={() => handleUnhide(conv.id)}>
                            <svg fill="none" height="14" viewBox="0 0 24 24" width="14"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" /></svg>
                            Hiện lại
                          </button>
                        ) : (
                          <button className="admin-chat-ctx-item" onClick={() => handleHide(conv.id)}>
                            <svg fill="none" height="14" viewBox="0 0 24 24" width="14"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" stroke="currentColor" strokeLinecap="round" strokeWidth="2" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" stroke="currentColor" strokeLinecap="round" strokeWidth="2" /><line stroke="currentColor" strokeLinecap="round" strokeWidth="2" x1="1" x2="23" y1="1" y2="23" /></svg>
                            Ẩn
                          </button>
                        )}
                        {conv.status !== "closed" && (
                          <button className="admin-chat-ctx-item" onClick={() => void handleClose(conv.id)}>
                            <svg fill="none" height="14" viewBox="0 0 24 24" width="14"><path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeLinecap="round" strokeWidth="2" /></svg>
                            Đóng hội thoại
                          </button>
                        )}
                        <button className="admin-chat-ctx-item admin-chat-ctx-item--danger" onClick={() => void handleDelete(conv.id)}>
                          <svg fill="none" height="14" viewBox="0 0 24 24" width="14"><polyline points="3 6 5 6 21 6" stroke="currentColor" strokeLinecap="round" strokeWidth="2" /><path d="M19 6l-1 14H6L5 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /><path d="M10 11v6M14 11v6" stroke="currentColor" strokeLinecap="round" strokeWidth="2" /><path d="M9 6V4h6v2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
                          Xoá
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right panel — message thread */}
        {selectedConversation ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
            {/* Header */}
            <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid var(--border-subtle)", background: "var(--surface-container-lowest)", display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
              <button
                aria-label="Quay lại danh sách"
                className="admin-chat-back-btn"
                onClick={() => setShowConvList(true)}
                style={{ display: showConvList ? "none" : "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer", color: "var(--ink)", padding: "0.25rem", flexShrink: 0 }}
              >
                <svg fill="none" height="20" viewBox="0 0 24 24" width="20"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
              </button>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: "0.88rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {intentLabel(selectedConversation.chat_intent ?? null) && (
                    <span style={{ marginRight: "0.3rem" }}>{intentLabel(selectedConversation.chat_intent ?? null)}</span>
                  )}
                  {selectedConversation.guest_name ?? "Khách ẩn danh"}
                </p>
                <p style={{ margin: "0.1rem 0 0", fontSize: "0.72rem", color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {[selectedConversation.guest_phone, selectedConversation.guest_email].filter(Boolean).join(" · ") || "—"}
                </p>
                {selectedConversation.source_url && (
                  <p style={{ margin: "0.05rem 0 0", fontSize: "0.65rem", color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {selectedConversation.source_url}
                  </p>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
                <span style={{ fontSize: "0.65rem", fontWeight: 700, padding: "0.15rem 0.4rem", borderRadius: "0.25rem", background: guestLang === "en" ? "#dbeafe" : "#dcfce7", color: guestLang === "en" ? "#1d4ed8" : "#16a34a", letterSpacing: "0.05em" }}>
                  {guestLang.toUpperCase()}
                </span>
                <span style={{ fontSize: "0.68rem", color: "var(--muted)" }}>
                  {formatRelativeTime(selectedConversation.created_at)}
                </span>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.625rem", minHeight: 0 }}>
              {messages.length === 0 && (
                <p style={{ margin: "auto", fontSize: "0.8rem", color: "var(--muted)", textAlign: "center" }}>Chưa có tin nhắn.</p>
              )}

              {messages.map((msg) => {
                if (msg.sender_type === "system") {
                  return (
                    <div key={msg.id} style={{ display: "flex", justifyContent: "center" }}>
                      <div style={{ maxWidth: "80%", padding: "0.375rem 0.75rem", borderRadius: "0.75rem", background: "var(--surface-container-low)", fontSize: "0.72rem", color: "var(--muted)", fontStyle: "italic", textAlign: "center", lineHeight: 1.5 }}>
                        <span style={{ whiteSpace: "pre-line" }}>{msg.message}</span>
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
                      {msg.message && <span style={{ whiteSpace: "pre-line" }}>{msg.message}</span>}
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

            {/* Quick-reply templates panel */}
            {showTemplates && (
              <div style={{ borderTop: "1px solid var(--border-subtle)", background: "var(--surface-container-lowest)", maxHeight: "13rem", overflowY: "auto", padding: "0.625rem 1rem", display: "flex", flexDirection: "column", gap: "0.375rem", flexShrink: 0 }}>
                <p style={{ margin: 0, fontSize: "0.68rem", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Template phản hồi nhanh ({guestLang.toUpperCase()})
                </p>
                {[...intentTemplates, ...SHARED_TEMPLATES].map((tpl) => (
                  <button
                    key={tpl.label}
                    onClick={() => { setInput(tpl[guestLang]); setShowTemplates(false); }}
                    style={{ textAlign: "left", background: "var(--surface-container-low)", border: "1px solid var(--border-subtle)", borderRadius: "0.5rem", padding: "0.5rem 0.75rem", fontSize: "0.75rem", cursor: "pointer", color: "var(--ink)", lineHeight: 1.4 }}
                  >
                    <span style={{ fontWeight: 600, color: "var(--muted)", fontSize: "0.68rem" }}>{tpl.label} · </span>
                    <span style={{ color: "var(--text)" }}>{tpl[guestLang].slice(0, 80)}{tpl[guestLang].length > 80 ? "…" : ""}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Reply input */}
            <div style={{ padding: "0.75rem 1rem", borderTop: "1px solid var(--border-subtle)", display: "flex", gap: "0.5rem", alignItems: "flex-end", flexShrink: 0 }}>
              <button
                aria-label="Mở template"
                onClick={() => setShowTemplates((v) => !v)}
                title="Template phản hồi nhanh"
                style={{ background: showTemplates ? "var(--surface-container-low)" : "none", border: "1px solid var(--border-subtle)", borderRadius: "0.5rem", color: showTemplates ? "var(--ink)" : "var(--muted)", cursor: "pointer", padding: "0.5rem", lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
              >
                <svg fill="none" height="16" viewBox="0 0 24 24" width="16"><rect height="16" rx="2" stroke="currentColor" strokeWidth="1.8" width="16" x="4" y="4" /><path d="M8 9h8M8 13h5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" /></svg>
              </button>

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
