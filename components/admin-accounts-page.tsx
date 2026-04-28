import Link from "next/link";
import type { ReactNode } from "react";

import { PortalBadge, PortalCard, PortalSectionHeading, PortalStatCard } from "@/components/portal-ui";
import { appendLocaleQuery, type Locale } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";
import type { CustomerRow } from "@/lib/supabase/database.types";
import type { WorkflowMemberHistoryData } from "@/lib/supabase/workflow.types";

type AdminAccountsPageProps = {
  actions?: ReactNode;
  customers: CustomerRow[];
  locale: Locale;
  closeHref?: string;
  selectedCustomer?: CustomerRow | null;
  selectedCustomerHistory?: WorkflowMemberHistoryData | null;
};

function formatDateTime(locale: Locale, value: string | null) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "vi-VN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function isRecentlyActive(value: string | null) {
  if (!value) {
    return false;
  }

  const diffMs = Date.now() - new Date(value).getTime();
  return Number.isFinite(diffMs) && diffMs >= 0 && diffMs <= 30 * 24 * 60 * 60 * 1000;
}

function buildCustomerHref(locale: Locale, customerId: string) {
  return appendLocaleQuery(`/admin/accounts?customer=${customerId}`, locale);
}

function statusLabel(locale: Locale, customer: CustomerRow) {
  if (customer.auth_user_id) {
    return localize(locale, { vi: "Đã liên kết", en: "Linked" });
  }

  return localize(locale, { vi: "Khách", en: "Guest" });
}

function workflowStatusLabel(locale: Locale, status: string) {
  const labels: Record<Locale, Record<string, string>> = {
    en: {
      cancelled: "Cancelled",
      closed: "Closed",
      completed: "Completed",
      confirmed: "Confirmed",
      converted: "Converted",
      draft: "Draft",
      expired: "Expired",
      in_review: "In review",
      new: "New",
      pending_deposit: "Pending deposit",
      pending_verification: "Pending verification",
      quoted: "Quoted",
      rejected: "Rejected",
      sent: "Sent",
      verified: "Verified"
    },
    vi: {
      cancelled: "Đã hủy",
      closed: "Đã đóng",
      completed: "Hoàn tất",
      confirmed: "Đã xác nhận",
      converted: "Đã chuyển",
      draft: "Nháp",
      expired: "Hết hạn",
      in_review: "Đang duyệt",
      new: "Mới",
      pending_deposit: "Chờ cọc",
      pending_verification: "Chờ kiểm tra",
      quoted: "Đã báo giá",
      rejected: "Từ chối",
      sent: "Đã gửi",
      verified: "Đã duyệt"
    }
  };

  return labels[locale][status] ?? status;
}

function formatConsent(locale: Locale, value: boolean | null) {
  if (value == null) {
    return "—";
  }

  return value
    ? localize(locale, { vi: "Đã đồng ý", en: "Consented" })
    : localize(locale, { vi: "Chưa đồng ý", en: "Not consented" });
}

function CustomerDetailDialog({
  closeHref,
  customer,
  history,
  locale
}: {
  closeHref: string;
  customer: CustomerRow;
  history: WorkflowMemberHistoryData | null;
  locale: Locale;
}) {
  const resolvedCustomer = history?.customer ?? customer;
  const availabilityRequests = history?.availability_requests ?? [];
  const reservations = history?.reservations ?? [];
  const paymentRequests = history?.payment_requests ?? [];
  const auditLogs = history?.audit_logs ?? [];
  const pendingPayments = paymentRequests.filter((paymentRequest) => paymentRequest.status !== "verified").length;

  return (
    <div className="admin-accounts__dialog" role="presentation">
      <div
        aria-labelledby="admin-accounts-dialog-title"
        aria-modal="true"
        className="admin-accounts__dialog-card"
        role="dialog"
      >
        <header className="admin-accounts__dialog-head">
          <div>
            <p className="admin-accounts__dialog-eyebrow">{locale === "en" ? "Customer detail" : "Chi tiết khách hàng"}</p>
            <h3 className="admin-accounts__dialog-title" id="admin-accounts-dialog-title">
              {resolvedCustomer.full_name}
            </h3>
            <p className="admin-accounts__dialog-meta">
              {resolvedCustomer.email}
              {resolvedCustomer.phone ? ` • ${resolvedCustomer.phone}` : ""}
            </p>
          </div>

          <Link aria-label={locale === "en" ? "Close detail" : "Đóng chi tiết"} className="admin-accounts__dialog-close" href={closeHref}>
            ×
          </Link>
        </header>

        <div className="admin-accounts__dialog-body">
          <div className="admin-accounts__dialog-grid">
            <PortalCard tone="soft">
              <p className="portal-panel__eyebrow">{locale === "en" ? "Profile" : "Hồ sơ"}</p>
              <dl className="portal-profile-list portal-profile-list--dense">
                <div className="portal-profile-list__item">
                  <dt className="portal-profile-list__label">{locale === "en" ? "Customer ID" : "Mã khách"}</dt>
                  <dd className="portal-profile-list__value">{resolvedCustomer.id}</dd>
                </div>
                <div className="portal-profile-list__item">
                  <dt className="portal-profile-list__label">{locale === "en" ? "Account" : "Tài khoản"}</dt>
                  <dd className="portal-profile-list__value">{resolvedCustomer.auth_user_id ?? "—"}</dd>
                </div>
                <div className="portal-profile-list__item">
                  <dt className="portal-profile-list__label">{locale === "en" ? "Preferred locale" : "Ngôn ngữ ưu tiên"}</dt>
                  <dd className="portal-profile-list__value">{resolvedCustomer.preferred_locale.toUpperCase()}</dd>
                </div>
                <div className="portal-profile-list__item">
                  <dt className="portal-profile-list__label">{locale === "en" ? "Consent" : "Đồng ý"}</dt>
                  <dd className="portal-profile-list__value">{formatConsent(locale, resolvedCustomer.marketing_consent)}</dd>
                </div>
                <div className="portal-profile-list__item">
                  <dt className="portal-profile-list__label">{locale === "en" ? "Source" : "Nguồn"}</dt>
                  <dd className="portal-profile-list__value">{resolvedCustomer.source ?? "—"}</dd>
                </div>
                <div className="portal-profile-list__item">
                  <dt className="portal-profile-list__label">{locale === "en" ? "Notes" : "Ghi chú"}</dt>
                  <dd className="portal-profile-list__value">{resolvedCustomer.notes || "—"}</dd>
                </div>
              </dl>
            </PortalCard>

            <div className="admin-accounts__dialog-stats">
              <PortalStatCard
                detail={{
                  vi: "Yêu cầu đặt phòng và giữ chỗ liên quan tới khách này.",
                  en: "Availability requests and holds linked to this guest."
                }}
                label={{ vi: "Request", en: "Requests" }}
                locale={locale}
                tone="soft"
                value={`${availabilityRequests.length}`}
              />
              <PortalStatCard
                detail={{
                  vi: "Booking thủ công và reservation được tạo trong hệ thống.",
                  en: "Manual bookings and reservations created in the system."
                }}
                label={{ vi: "Booking", en: "Bookings" }}
                locale={locale}
                tone="accent"
                value={`${reservations.length}`}
              />
              <PortalStatCard
                detail={{
                  vi: "Payment request chưa được verify thủ công.",
                  en: "Payment requests waiting for manual verification."
                }}
                label={{ vi: "Payment chờ", en: "Pending payments" }}
                locale={locale}
                tone="default"
                value={`${pendingPayments}`}
              />
              <PortalStatCard
                detail={{
                  vi: "Nhật ký hoạt động gần nhất của khách.",
                  en: "Most recent activity log entries for this guest."
                }}
                label={{ vi: "Hoạt động", en: "Activity" }}
                locale={locale}
                tone="soft"
                value={`${auditLogs.length}`}
              />
            </div>
          </div>

          <div className="admin-accounts__dialog-sections">
            <PortalCard tone="default">
              <div className="admin-accounts__dialog-section-head">
                <p className="portal-panel__eyebrow">{locale === "en" ? "Bookings" : "Booking"}</p>
                <span className="portal-badge portal-badge--soft">{reservations.length}</span>
              </div>
              {reservations.length ? (
                <ol className="admin-accounts__dialog-list">
                  {reservations.slice(0, 5).map((reservation) => (
                    <li className="admin-accounts__dialog-list-item" key={reservation.id}>
                      <div>
                        <p className="admin-accounts__dialog-item-title">{reservation.booking_code}</p>
                        <p className="admin-accounts__dialog-item-copy">
                          {formatDateTime(locale, reservation.created_at)}
                          {" • "}
                          {locale === "en" ? reservation.primary_room_type_name_en : reservation.primary_room_type_name_vi}
                        </p>
                      </div>
                      <PortalBadge tone={reservation.status === "confirmed" || reservation.status === "completed" ? "accent" : "soft"}>
                        {workflowStatusLabel(locale, reservation.status)}
                      </PortalBadge>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="portal-panel__note-copy">
                  {locale === "en" ? "No bookings are linked to this customer yet." : "Chưa có booking nào gắn với khách này."}
                </p>
              )}
            </PortalCard>

            <PortalCard tone="default">
              <div className="admin-accounts__dialog-section-head">
                <p className="portal-panel__eyebrow">{locale === "en" ? "Activity" : "Hoạt động"}</p>
                <span className="portal-badge portal-badge--soft">{auditLogs.length}</span>
              </div>
              {auditLogs.length ? (
                <ol className="admin-accounts__dialog-timeline">
                  {auditLogs.slice(0, 6).map((log) => (
                    <li className="admin-accounts__dialog-timeline-item" key={log.id}>
                      <p className="admin-accounts__dialog-item-copy">{formatDateTime(locale, log.happened_at)}</p>
                      <p className="admin-accounts__dialog-item-title">{log.summary}</p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="portal-panel__note-copy">
                  {locale === "en" ? "No activity log has been recorded yet." : "Chưa có activity log nào."}
                </p>
              )}
            </PortalCard>

            <PortalCard tone="soft">
              <div className="admin-accounts__dialog-section-head">
                <p className="portal-panel__eyebrow">{locale === "en" ? "Requests" : "Request"}</p>
                <span className="portal-badge portal-badge--soft">{availabilityRequests.length}</span>
              </div>
              {availabilityRequests.length ? (
                <ol className="admin-accounts__dialog-list">
                  {availabilityRequests.slice(0, 5).map((request) => (
                    <li className="admin-accounts__dialog-list-item" key={request.id}>
                      <div>
                        <p className="admin-accounts__dialog-item-title">{request.request_code}</p>
                        <p className="admin-accounts__dialog-item-copy">
                          {formatDateTime(locale, request.created_at)}
                          {" • "}
                          {locale === "en" ? request.room_type_name_en : request.room_type_name_vi}
                        </p>
                      </div>
                      <PortalBadge tone={request.status === "quoted" || request.status === "converted" ? "accent" : "soft"}>
                        {workflowStatusLabel(locale, request.status)}
                      </PortalBadge>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="portal-panel__note-copy">
                  {locale === "en" ? "No availability request is linked to this customer yet." : "Chưa có request nào gắn với khách này."}
                </p>
              )}
            </PortalCard>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminAccountsPage({
  actions,
  closeHref,
  customers,
  locale,
  selectedCustomer,
  selectedCustomerHistory
}: AdminAccountsPageProps) {
  const linkedCount = customers.filter((customer) => Boolean(customer.auth_user_id)).length;
  const activeCount = customers.filter((customer) => isRecentlyActive(customer.last_seen_at)).length;
  const consentedCount = customers.filter((customer) => customer.marketing_consent).length;
  const detailCloseHref = closeHref ?? appendLocaleQuery("/admin/accounts", locale);

  return (
    <div className="portal-content portal-management-page admin-accounts-page">
      <PortalSectionHeading
        actions={actions}
        description={{
          vi: "Danh sách khách hàng và tài khoản member thật đang hoạt động trong hệ thống.",
          en: "Real customers and member accounts active in the system."
        }}
        eyebrow={{ vi: "Tài khoản nội bộ", en: "Customer accounts" }}
        locale={locale}
        title={{ vi: "Khách hàng", en: "Customers" }}
      />

      <div className="portal-stat-grid admin-accounts-page__stats">
        <PortalStatCard
          detail={{ vi: "Tổng số customer hiện có.", en: "Total customer records." }}
          label={{ vi: "Tổng khách", en: "Customers" }}
          locale={locale}
          tone="default"
          value={`${customers.length}`}
        />
        <PortalStatCard
          detail={{ vi: "Customer đã kết nối Supabase Auth.", en: "Customers linked to Supabase Auth." }}
          label={{ vi: "Đã liên kết", en: "Linked" }}
          locale={locale}
          tone="accent"
          value={`${linkedCount}`}
        />
        <PortalStatCard
          detail={{ vi: "Hoạt động trong 30 ngày gần nhất.", en: "Active in the last 30 days." }}
          label={{ vi: "Đang hoạt động", en: "Active" }}
          locale={locale}
          tone="soft"
          value={`${activeCount}`}
        />
        <PortalStatCard
          detail={{ vi: "Khách đã đồng ý nhận marketing.", en: "Customers with marketing consent." }}
          label={{ vi: "Đã đồng ý", en: "Consented" }}
          locale={locale}
          tone="default"
          value={`${consentedCount}`}
        />
        <PortalStatCard
          detail={{ vi: "Hồ sơ khách đang có contact để staff xử lý.", en: "Customer profiles ready for staff follow-up." }}
          label={{ vi: "Đủ hồ sơ", en: "Ready" }}
          locale={locale}
          tone="soft"
          value={`${customers.filter((customer) => Boolean(customer.email)).length}`}
        />
      </div>

      <PortalCard className="admin-accounts-page__table-card" tone="default">
        {customers.length ? (
          <div className="portal-table-shell">
            <table className="portal-data-table">
              <thead>
                <tr>
                  <th>{locale === "en" ? "Customer" : "Khách hàng"}</th>
                  <th>{locale === "en" ? "Account" : "Tài khoản"}</th>
                  <th>{locale === "en" ? "Contact" : "Liên hệ"}</th>
                  <th>{locale === "en" ? "Consent" : "Đồng ý"}</th>
                  <th>{locale === "en" ? "Last seen" : "Hoạt động"}</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <div className="portal-data-table__primary">
                        <strong className="portal-data-table__title">
                          <Link className="admin-accounts-page__customer-link" href={buildCustomerHref(locale, customer.id)}>
                            {customer.full_name}
                          </Link>
                        </strong>
                        <p className="portal-data-table__meta">{customer.id}</p>
                      </div>
                    </td>
                    <td>
                      <div className="portal-data-table__primary">
                        <PortalBadge tone={customer.auth_user_id ? "accent" : "neutral"}>{statusLabel(locale, customer)}</PortalBadge>
                        <p className="portal-data-table__meta">{customer.auth_user_id ?? "—"}</p>
                      </div>
                    </td>
                    <td>
                      <div className="portal-data-table__primary">
                        <strong className="portal-data-table__title">{customer.email}</strong>
                        <p className="portal-data-table__meta">{customer.phone ?? "—"}</p>
                      </div>
                    </td>
                    <td>
                      <PortalBadge tone={customer.marketing_consent ? "accent" : "neutral"}>
                        {customer.marketing_consent
                          ? localize(locale, { vi: "Có", en: "Yes" })
                          : localize(locale, { vi: "Không", en: "No" })}
                      </PortalBadge>
                    </td>
                    <td>
                      <div className="portal-data-table__primary">
                        <strong className="portal-data-table__title">{formatDateTime(locale, customer.last_seen_at)}</strong>
                        <p className="portal-data-table__meta">{customer.source ?? "—"}</p>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="portal-panel__note-copy">
            {locale === "en"
              ? "No customers have been synced yet."
              : "Chưa có customer nào được đồng bộ."}
          </p>
        )}
      </PortalCard>

      {selectedCustomer ? (
        <CustomerDetailDialog closeHref={detailCloseHref} customer={selectedCustomer} history={selectedCustomerHistory ?? null} locale={locale} />
      ) : null}
    </div>
  );
}
