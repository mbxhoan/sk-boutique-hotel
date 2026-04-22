import type { Locale } from "@/lib/locale";
import { appendLocaleQuery } from "@/lib/locale";
import { submitPaymentProofAction } from "@/app/actions/payments";
import { MemberLiveUpdates } from "@/components/member-live-updates";
import { PortalBadge, PortalCard, PortalSectionHeading, PortalStatCard } from "@/components/portal-ui";
import type { WorkflowAuditLog, WorkflowMemberHistoryData, WorkflowPaymentRequest } from "@/lib/supabase/workflow.types";

type MemberHistoryDashboardProps = {
  data: WorkflowMemberHistoryData;
  locale: Locale;
};

function formatDateTime(locale: Locale, value: string) {
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "vi-VN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function formatDateRange(locale: Locale, startAt: string, endAt: string) {
  const formatter = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "vi-VN", {
    dateStyle: "medium"
  });

  return `${formatter.format(new Date(startAt))} → ${formatter.format(new Date(endAt))}`;
}

function formatMoney(locale: Locale, value: number, currency = "VND") {
  const formatted = new Intl.NumberFormat(locale === "en" ? "en-US" : "vi-VN", {
    maximumFractionDigits: 0
  }).format(value);

  return locale === "en" ? `${formatted} ${currency}` : `${formatted} ${currency}`;
}

function statusLabel(locale: Locale, status: string) {
  const labels: Record<Locale, Record<string, string>> = {
    en: {
      cancelled: "Cancelled",
      confirmed: "Confirmed",
      pending_deposit: "Pending deposit",
      proof_uploaded: "Proof uploaded",
      rejected: "Rejected",
      sent: "Sent",
      pending_verification: "Pending verification",
      verified: "Verified",
      draft: "Draft",
      completed: "Completed",
      new: "New",
      in_review: "In review",
      quoted: "Quoted",
      converted: "Converted",
      closed: "Closed",
      expired: "Expired"
    },
    vi: {
      cancelled: "Đã hủy",
      confirmed: "Đã xác nhận",
      pending_deposit: "Chờ deposit",
      proof_uploaded: "Đã upload proof",
      rejected: "Từ chối",
      sent: "Đã gửi",
      pending_verification: "Chờ verify",
      verified: "Đã duyệt",
      draft: "Nháp",
      completed: "Hoàn tất",
      new: "Mới",
      in_review: "Đang duyệt",
      quoted: "Đã báo giá",
      converted: "Đã chuyển",
      closed: "Đã đóng",
      expired: "Hết hạn"
    }
  };

  return labels[locale][status] ?? status;
}

function PaymentRequestCard({
  locale,
  paymentRequest
}: {
  locale: Locale;
  paymentRequest: WorkflowMemberHistoryData["payment_requests"][number];
}) {
  const canUpload = paymentRequest.status === "sent" || paymentRequest.status === "pending_verification";

  return (
    <PortalCard className="portal-workflow-card" tone="default">
      <div className="portal-item-card__top">
        <p className="portal-item-card__code">{paymentRequest.payment_code}</p>
        <PortalBadge tone={paymentRequest.status === "verified" ? "accent" : "soft"}>
          {statusLabel(locale, paymentRequest.status)}
        </PortalBadge>
      </div>
      <h3 className="portal-item-card__title">
        {locale === "en" ? paymentRequest.branch_name_en : paymentRequest.branch_name_vi}
      </h3>
      <p className="portal-item-card__detail">
        {locale === "en" ? paymentRequest.reservation_booking_code : paymentRequest.reservation_booking_code}
      </p>
      <dl className="portal-profile-list">
        <div className="portal-profile-list__item">
          <dt className="portal-profile-list__label">{locale === "en" ? "Customer" : "Khách"}</dt>
          <dd className="portal-profile-list__value">{paymentRequest.customer_name}</dd>
        </div>
        <div className="portal-profile-list__item">
          <dt className="portal-profile-list__label">{locale === "en" ? "Amount" : "Số tiền"}</dt>
          <dd className="portal-profile-list__value">{formatMoney(locale, paymentRequest.amount, paymentRequest.currency)}</dd>
        </div>
        <div className="portal-profile-list__item">
          <dt className="portal-profile-list__label">{locale === "en" ? "Transfer content" : "Nội dung CK"}</dt>
          <dd className="portal-profile-list__value">{paymentRequest.transfer_content}</dd>
        </div>
      </dl>
      {paymentRequest.payment_upload_path ? (
        <p className="portal-item-card__note">
          <a className="button button--text-light" href={appendLocaleQuery(paymentRequest.payment_upload_path, locale)}>
            {locale === "en" ? "Open secure upload link" : "Mở link upload an toàn"}
          </a>
        </p>
      ) : null}
      {paymentRequest.latest_proof_file_path ? (
        <p className="portal-item-card__note">
          {locale === "en" ? "Latest proof uploaded." : "Proof gần nhất đã upload."}
          {" "}
          {paymentRequest.latest_proof_review_note ? `• ${paymentRequest.latest_proof_review_note}` : ""}
        </p>
      ) : null}
      {canUpload ? (
        <form className="portal-form" action={submitPaymentProofAction}>
          <input name="paymentRequestId" type="hidden" value={paymentRequest.id} />
          <input name="returnTo" type="hidden" value="/member" />
          <input name="uploadedVia" type="hidden" value="member_portal" />
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Proof file" : "Tệp proof"}</span>
            <input className="portal-field__control" name="proofFile" type="file" accept="image/*,.pdf" />
          </label>
          <label className="portal-field">
            <span className="portal-field__label">{locale === "en" ? "Note" : "Ghi chú"}</span>
            <textarea className="portal-field__control" name="note" rows={3} />
          </label>
          <button className="button button--solid" type="submit">
            {locale === "en" ? "Confirm deposit paid" : "Xác nhận đã thanh toán cọc"}
          </button>
        </form>
      ) : null}
    </PortalCard>
  );
}

function AuditLogCard({
  locale,
  log
}: {
  locale: Locale;
  log: WorkflowAuditLog;
}) {
  return (
    <li className="portal-timeline__item">
      <span className="portal-timeline__time">{formatDateTime(locale, log.happened_at)}</span>
      <div className="portal-timeline__copy">
        <h4 className="portal-timeline__title">{locale === "en" ? log.entity_label_en : log.entity_label_vi}</h4>
        <p className="portal-timeline__detail">
          {log.summary}
          {log.branch_name_vi || log.branch_name_en
            ? ` • ${locale === "en" ? log.branch_name_en ?? log.branch_name_vi : log.branch_name_vi ?? log.branch_name_en}`
            : ""}
        </p>
      </div>
    </li>
  );
}

export function MemberHistoryDashboard({ data, locale }: MemberHistoryDashboardProps) {
  const pendingPaymentCount = data.payment_requests.filter((request) => request.status !== "verified").length;
  const confirmedReservationCount = data.reservations.filter((reservation) => reservation.status === "confirmed").length;

  return (
    <div className="portal-content">
      <section className="portal-section" id="notifications">
        <PortalSectionHeading
          description={{
            en: "Realtime notifications keep your booking history up to date while staff work in the admin portal.",
            vi: "Thông báo realtime giúp lịch sử booking cập nhật khi staff thao tác trong admin portal."
          }}
          eyebrow={{ en: "Realtime", vi: "Realtime" }}
          locale={locale}
          title={{ en: "Live updates", vi: "Cập nhật trực tiếp" }}
        />

        <MemberLiveUpdates customerId={data.customer.id} locale={locale} />

        <PortalCard className="portal-panel" tone="soft">
          <div className="portal-item-card__top">
            <p className="portal-panel__eyebrow">{locale === "en" ? "Recent notifications" : "Thông báo gần đây"}</p>
            <PortalBadge tone="soft">{data.audit_logs.length}</PortalBadge>
          </div>
          <h3 className="portal-item-card__title">{locale === "en" ? "What happened most recently" : "Các cập nhật gần đây"}</h3>
          {data.audit_logs.length ? (
            <ol className="portal-timeline">
              {data.audit_logs.slice(0, 6).map((log) => (
                <AuditLogCard key={log.id} locale={locale} log={log} />
              ))}
            </ol>
          ) : (
            <p className="portal-panel__note-copy">
              {locale === "en"
                ? "Notifications from the admin portal will appear here once staff updates your request, hold, payment, or booking."
                : "Thông báo từ admin portal sẽ xuất hiện tại đây khi staff cập nhật request, hold, payment hoặc booking của bạn."}
            </p>
          )}
        </PortalCard>
      </section>

      <section className="portal-section" id="summary">
        <PortalSectionHeading
          description={{
            en: "Your requests, holds, bookings, and payment proofs stay in one view after sign-in.",
            vi: "Request, hold, booking và proof của bạn nằm gọn trong một màn hình sau khi đăng nhập."
          }}
          eyebrow={{ en: "Member history", vi: "Lịch sử thành viên" }}
          locale={locale}
          title={{
            en: `${data.customer.full_name}'s history`,
            vi: `Lịch sử của ${data.customer.full_name}`
          }}
        />

        <div className="portal-stat-grid">
          <PortalStatCard
            detail={{
              en: "Availability requests submitted from the member account.",
              vi: "Availability request được gửi từ tài khoản member."
            }}
            label={{ en: "Requests", vi: "Request" }}
            locale={locale}
            tone="soft"
            value={`${data.availability_requests.length}`}
          />
          <PortalStatCard
            detail={{
              en: "Manual reservations visible in the member account.",
              vi: "Reservation thủ công hiển thị trong tài khoản member."
            }}
            label={{ en: "Bookings", vi: "Booking" }}
            locale={locale}
            tone="accent"
            value={`${data.reservations.length}`}
          />
          <PortalStatCard
            detail={{
              en: "Deposit requests still waiting for manual review.",
              vi: "Payment request vẫn đang chờ staff verify."
            }}
            label={{ en: "Payments pending", vi: "Payment chờ" }}
            locale={locale}
            tone="soft"
            value={`${pendingPaymentCount}`}
          />
          <PortalStatCard
            detail={{
              en: "Confirmed reservations already processed.",
              vi: "Reservation đã xác nhận và xử lý xong."
            }}
            label={{ en: "Confirmed", vi: "Đã xác nhận" }}
            locale={locale}
            tone="default"
            value={`${confirmedReservationCount}`}
          />
        </div>
      </section>

      <section className="portal-section" id="payments">
        <PortalSectionHeading
          description={{
            en: "Each payment request includes a QR preview, bank details, and a secure upload link.",
            vi: "Mỗi payment request có QR preview, bank details và secure upload link."
          }}
          eyebrow={{ en: "Payments", vi: "Thanh toán" }}
          locale={locale}
          title={{ en: "Deposit requests", vi: "Deposit requests" }}
        />

        <div className="portal-card-grid portal-card-grid--two">
          {data.payment_requests.length ? (
            data.payment_requests.map((paymentRequest) => (
              <PaymentRequestCard key={paymentRequest.id} locale={locale} paymentRequest={paymentRequest} />
            ))
          ) : (
            <PortalCard tone="soft">
              <p className="portal-panel__eyebrow">{locale === "en" ? "No payment requests" : "Chưa có payment request"}</p>
              <p className="portal-panel__note-copy">
                {locale === "en"
                  ? "When staff issues a deposit request, the QR and upload link will appear here."
                  : "Khi staff tạo deposit request, QR và link upload sẽ hiển thị tại đây."}
              </p>
            </PortalCard>
          )}
        </div>
      </section>

      <section className="portal-section" id="requests">
        <PortalSectionHeading
          description={{
            en: "Availability requests and reservations stay in the same history trail.",
            vi: "Availability request và reservation cùng nằm trong lịch sử."
          }}
          eyebrow={{ en: "Timeline", vi: "Timeline" }}
          locale={locale}
          title={{ en: "Requests & bookings", vi: "Request & booking" }}
        />

        <div className="portal-grid portal-grid--two">
          <PortalCard tone="soft">
            <p className="portal-panel__eyebrow">{locale === "en" ? "Availability requests" : "Availability requests"}</p>
            <ol className="portal-timeline">
              {data.availability_requests.length ? (
                data.availability_requests.map((request) => (
                  <li className="portal-timeline__item" key={request.id}>
                    <span className="portal-timeline__time">{formatDateTime(locale, request.created_at)}</span>
                    <div className="portal-timeline__copy">
                      <h4 className="portal-timeline__title">{request.request_code}</h4>
                      <p className="portal-timeline__detail">
                        {formatDateRange(locale, request.stay_start_at, request.stay_end_at)} •{" "}
                        {locale === "en" ? request.room_type_name_en : request.room_type_name_vi}
                      </p>
                    </div>
                  </li>
                ))
              ) : (
                <li className="portal-empty-state">
                  <p className="portal-panel__note-copy">
                    {locale === "en" ? "No availability requests yet." : "Chưa có availability request."}
                  </p>
                </li>
              )}
            </ol>
          </PortalCard>

          <PortalCard tone="default">
            <p className="portal-panel__eyebrow">{locale === "en" ? "Reservations" : "Reservations"}</p>
            <ol className="portal-timeline">
              {data.reservations.length ? (
                data.reservations.map((reservation) => (
                  <li className="portal-timeline__item" key={reservation.id}>
                    <span className="portal-timeline__time">{formatDateTime(locale, reservation.created_at)}</span>
                    <div className="portal-timeline__copy">
                      <h4 className="portal-timeline__title">{reservation.booking_code}</h4>
                      <p className="portal-timeline__detail">
                        {formatDateRange(locale, reservation.stay_start_at, reservation.stay_end_at)} •{" "}
                        {locale === "en" ? reservation.primary_room_type_name_en : reservation.primary_room_type_name_vi}
                      </p>
                    </div>
                  </li>
                ))
              ) : (
                <li className="portal-empty-state">
                  <p className="portal-panel__note-copy">
                    {locale === "en" ? "No reservations yet." : "Chưa có reservation."}
                  </p>
                </li>
              )}
            </ol>
          </PortalCard>
        </div>
      </section>

      <section className="portal-section" id="profile">
        <PortalSectionHeading
          description={{
            en: "Profile and marketing consent are kept separate for future auth expansion.",
            vi: "Profile và marketing consent được tách riêng để mở rộng auth sau này."
          }}
          eyebrow={{ en: "Profile", vi: "Hồ sơ" }}
          locale={locale}
          title={{ en: "Customer details", vi: "Thông tin khách" }}
        />

        <PortalCard tone="accent">
          <dl className="portal-profile-list">
            <div className="portal-profile-list__item">
              <dt className="portal-profile-list__label">{locale === "en" ? "Full name" : "Họ tên"}</dt>
              <dd className="portal-profile-list__value">{data.customer.full_name}</dd>
            </div>
            <div className="portal-profile-list__item">
              <dt className="portal-profile-list__label">{locale === "en" ? "Email" : "Email"}</dt>
              <dd className="portal-profile-list__value">{data.customer.email}</dd>
            </div>
            <div className="portal-profile-list__item">
              <dt className="portal-profile-list__label">{locale === "en" ? "Phone" : "Số điện thoại"}</dt>
              <dd className="portal-profile-list__value">{data.customer.phone ?? "—"}</dd>
            </div>
            <div className="portal-profile-list__item">
              <dt className="portal-profile-list__label">{locale === "en" ? "Preferred locale" : "Ngôn ngữ"}</dt>
              <dd className="portal-profile-list__value">{data.customer.preferred_locale.toUpperCase()}</dd>
            </div>
          </dl>
        </PortalCard>
      </section>
    </div>
  );
}
