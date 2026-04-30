import Image from "next/image";

import type { Locale } from "@/lib/locale";
import { siteInfo } from "@/lib/site-content";
import type { BookingDetailData } from "@/lib/supabase/queries/booking-details";

type AdminBookingReceiptPrintProps = {
  detail: BookingDetailData;
  locale: Locale;
};

function formatReceiptDate(locale: Locale, value: string) {
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh"
  }).format(new Date(value));
}

function formatReceiptShortDate(locale: Locale, value: string) {
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh"
  }).format(new Date(value));
}

function formatReceiptMoney(value: number) {
  return `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(Math.max(0, value))} VND`;
}

function calculateNights(startAt: string, endAt: string) {
  const diffMs = new Date(endAt).getTime() - new Date(startAt).getTime();
  if (!Number.isFinite(diffMs) || diffMs <= 0) return 1;
  return Math.max(1, Math.round(diffMs / 86_400_000));
}

export function AdminBookingReceiptPrint({ detail, locale }: AdminBookingReceiptPrintProps) {
  const { booking, reservation, customer, financial_summary } = detail;
  const nights = calculateNights(booking.stay_start_at, booking.stay_end_at);
  const totalAmount = financial_summary.total_amount;
  const unitPrice = nights > 0 ? Math.round(totalAmount / nights) : totalAmount;
  const roomLabel = locale === "en" ? booking.room_type_name_en : booking.room_type_name_vi;
  const roomCode = booking.room_code;
  const branchName = locale === "en" ? booking.branch_name_en : booking.branch_name_vi;
  const guestCount = booking.guest_count;
  const customerName = customer?.full_name ?? booking.customer_name ?? "—";
  const customerEmail = customer?.email ?? booking.customer_email ?? "—";
  const customerPhone = customer?.phone ?? null;
  const issuedAt = reservation?.completed_at ?? reservation?.confirmed_at ?? booking.created_at;

  const t = (en: string, vi: string) => (locale === "en" ? en : vi);

  return (
    <div className="booking-receipt-print" aria-hidden="true">
      <div className="booking-receipt-print__page">
        <header className="booking-receipt-print__header">
          <Image
            alt="SK Boutique Hotel"
            className="booking-receipt-print__logo"
            height={164}
            priority={false}
            src="/logo-no-bg.png"
            width={321}
          />
          <h1 className="booking-receipt-print__hotel">SK Boutique Hotel</h1>
          <div className="booking-receipt-print__contact">
            <span>📍 {siteInfo.address}</span>
            <span>📞 {siteInfo.phone}</span>
            <span>✉️ {siteInfo.email}</span>
          </div>
        </header>

        <div className="booking-receipt-print__divider" />

        <section className="booking-receipt-print__top">
          <div className="booking-receipt-print__details">
            <h2 className="booking-receipt-print__section-title">{t("Booking Details", "Thông tin lưu trú")}</h2>
            <dl className="booking-receipt-print__rows">
              <div>
                <dt>{t("Check in", "Nhận phòng")}</dt>
                <dd>{formatReceiptDate(locale, booking.stay_start_at)}</dd>
              </div>
              <div>
                <dt>{t("Check-out", "Trả phòng")}</dt>
                <dd>{formatReceiptDate(locale, booking.stay_end_at)}</dd>
              </div>
              <div>
                <dt>{t("Guests", "Số khách")}</dt>
                <dd>{guestCount} {t("guest(s)", "khách")}</dd>
              </div>
              <div>
                <dt>{t("Unit", "Phòng")}</dt>
                <dd>
                  {roomLabel}
                  {roomCode ? ` (${roomCode})` : ""}
                </dd>
              </div>
            </dl>
          </div>
          <div className="booking-receipt-print__heading">
            <span>BOOKING</span>
          </div>
        </section>

        <section className="booking-receipt-print__middle">
          <div>
            <h2 className="booking-receipt-print__section-title">{t("Booked By", "Khách hàng")}</h2>
            <p className="booking-receipt-print__customer-name">{customerName}</p>
            <p>{customerEmail}</p>
            {customerPhone ? <p>{customerPhone}</p> : null}
          </div>
          <dl className="booking-receipt-print__rows">
            <div>
              <dt>{t("Booking #", "Mã booking")}</dt>
              <dd>{booking.booking_code}</dd>
            </div>
            <div>
              <dt>{t("Booking Date", "Ngày tạo")}</dt>
              <dd>{formatReceiptShortDate(locale, issuedAt)}</dd>
            </div>
            <div>
              <dt>{t("Status", "Trạng thái")}</dt>
              <dd>{t("Completed", "Đã hoàn tất")}</dd>
            </div>
            <div>
              <dt>{t("Branch", "Chi nhánh")}</dt>
              <dd>{branchName}</dd>
            </div>
          </dl>
        </section>

        <table className="booking-receipt-print__table">
          <thead>
            <tr>
              <th className="booking-receipt-print__col-qty">{t("Quantity", "Số lượng")}</th>
              <th>{t("Description", "Mô tả")}</th>
              <th className="booking-receipt-print__col-money">{t("Unit Price", "Đơn giá")}</th>
              <th className="booking-receipt-print__col-money">{t("Amount", "Thành tiền")}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="booking-receipt-print__col-qty">{nights.toFixed(2)}</td>
              <td>
                {t(
                  `Night${nights > 1 ? "s" : ""} stay at ${roomLabel}`,
                  `Đêm lưu trú tại ${roomLabel}`
                )}
                {roomCode ? ` (${roomCode})` : ""}
              </td>
              <td className="booking-receipt-print__col-money">{formatReceiptMoney(unitPrice)}</td>
              <td className="booking-receipt-print__col-money">{formatReceiptMoney(totalAmount)}</td>
            </tr>
            <tr className="booking-receipt-print__summary-row">
              <td colSpan={2} />
              <td className="booking-receipt-print__col-money">{t("Subtotal", "Tạm tính")}</td>
              <td className="booking-receipt-print__col-money">{formatReceiptMoney(totalAmount)}</td>
            </tr>
            <tr className="booking-receipt-print__total-row">
              <td colSpan={2} />
              <td className="booking-receipt-print__col-money">{t("Total", "Tổng cộng")}</td>
              <td className="booking-receipt-print__col-money">{formatReceiptMoney(totalAmount)}</td>
            </tr>
          </tbody>
        </table>

        <p className="booking-receipt-print__note">
          {t("*Total includes applicable taxes and service fees.", "*Đã bao gồm thuế và phí dịch vụ.")}
        </p>

        <section className="booking-receipt-print__additional">
          <h2 className="booking-receipt-print__section-title">{t("Additional Information", "Thông tin bổ sung")}</h2>
          <p>{t("Check-in from 2:00 PM, check-out until 12:00 PM.", "Nhận phòng từ 14:00, trả phòng trước 12:00.")}</p>
          <p>{t("Free Wi-Fi and on-site parking.", "Miễn phí Wi-Fi và chỗ đậu xe tại khách sạn.")}</p>
          <p>{t("Thank you for staying with SK Boutique Hotel.", "Cảm ơn quý khách đã lưu trú tại SK Boutique Hotel.")}</p>
        </section>
      </div>
    </div>
  );
}
