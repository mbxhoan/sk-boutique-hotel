import type { Metadata } from "next";

import { AdminChatPage } from "@/components/admin-chat-page";
import { resolveLocale } from "@/lib/locale";
import { listConversations } from "@/lib/supabase/queries/chat";

type PageProps = {
  searchParams?: Promise<{ lang?: string }>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);

  return {
    title: locale === "en" ? "Live Chat" : "Live Chat",
    description:
      locale === "en"
        ? "View and respond to guest chat conversations in real time."
        : "Xem và phản hồi các cuộc hội thoại chat với khách trong thời gian thực."
  };
}

export default async function AdminChatRoute({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);
  const conversations = await listConversations();

  return <AdminChatPage initialConversations={conversations} locale={locale} />;
}
