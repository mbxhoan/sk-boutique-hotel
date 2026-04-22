import type { ReactNode } from "react";

import { PortalBadge, PortalCard, PortalSectionHeading, PortalStatCard } from "@/components/portal-ui";
import type { Locale } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";
import type { CustomerRow } from "@/lib/supabase/database.types";

type AdminAccountsPageProps = {
  actions?: ReactNode;
  customers: CustomerRow[];
  locale: Locale;
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

function statusLabel(locale: Locale, customer: CustomerRow) {
  if (customer.auth_user_id) {
    return localize(locale, { vi: "Đã liên kết", en: "Linked" });
  }

  return localize(locale, { vi: "Khách", en: "Guest" });
}

export function AdminAccountsPage({ actions, customers, locale }: AdminAccountsPageProps) {
  const linkedCount = customers.filter((customer) => Boolean(customer.auth_user_id)).length;
  const activeCount = customers.filter((customer) => isRecentlyActive(customer.last_seen_at)).length;
  const consentedCount = customers.filter((customer) => customer.marketing_consent).length;

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
                        <strong className="portal-data-table__title">{customer.full_name}</strong>
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
    </div>
  );
}
