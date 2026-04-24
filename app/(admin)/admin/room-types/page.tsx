import type { Metadata } from "next";

import { AdminRoomTypesManager } from "@/components/admin-room-types-manager";
import { resolveLocale } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";
import { listRoomTypes } from "@/lib/supabase/queries/room-types";

type PageProps = {
  searchParams?: Promise<{
    lang?: string;
  }>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);

  return {
    title: localize(locale, { vi: "Hạng phòng", en: "Room types" }),
    description: localize(locale, {
      vi: "Quản lý nội dung, hình ảnh, tiện ích và giá của hạng phòng hiển thị trên web.",
      en: "Manage the content, imagery, amenities, and pricing for room types on the website."
    })
  };
}

export default async function AdminRoomTypesPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const roomTypes = await listRoomTypes({ includeInactive: true });
  const locale = resolveLocale(resolvedSearchParams.lang);

  return <AdminRoomTypesManager locale={locale} roomTypes={roomTypes} />;
}
