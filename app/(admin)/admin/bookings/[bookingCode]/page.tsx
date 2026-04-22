import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdminBookingDetailPage } from "@/components/admin-booking-detail-page";
import { resolveLocale } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";
import { loadBookingDetailByCode } from "@/lib/supabase/queries/booking-details";

type PageProps = {
  params: Promise<{
    bookingCode: string;
  }>;
  searchParams?: Promise<{
    lang?: string;
  }>;
};

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { bookingCode } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);
  const detail = await loadBookingDetailByCode(bookingCode);

  if (!detail) {
    return {};
  }

  return {
    title: localize(locale, { vi: `Chi tiết booking ${detail.booking.booking_code}`, en: `Booking detail ${detail.booking.booking_code}` }),
    description: localize(locale, {
      vi: "Xem chi tiết booking, request, payment và nhật ký xử lý.",
      en: "View booking details, request state, payment data, and handling logs."
    })
  };
}

export default async function AdminBookingDetailRoute({ params, searchParams }: PageProps) {
  const { bookingCode } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);
  const detail = await loadBookingDetailByCode(bookingCode);

  if (!detail) {
    notFound();
  }

  return <AdminBookingDetailPage detail={detail} locale={locale} />;
}
