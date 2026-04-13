import type { ReactNode } from "react";

import type { Locale } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";
import type { AdminManagementPageCopy } from "@/lib/mock/admin-management";
import { PortalBadge, PortalCard, PortalSectionHeading } from "@/components/portal-ui";

type AdminManagementPageProps = {
  actions?: ReactNode;
  locale: Locale;
  page: AdminManagementPageCopy;
};

export function AdminManagementPage({ actions, locale, page }: AdminManagementPageProps) {
  return (
    <div className="portal-content portal-management-page">
      <PortalSectionHeading
        actions={actions}
        description={page.description}
        eyebrow={page.eyebrow}
        locale={locale}
        title={page.title}
      />

      <div className="portal-management-page__grid">
        {page.features.map((feature) => (
          <PortalCard className="portal-management-page__card" key={feature.title.vi} tone="soft">
            <PortalBadge tone="accent">{localize(locale, page.badge)}</PortalBadge>
            <h3 className="portal-management-page__card-title">{localize(locale, feature.title)}</h3>
            <p className="portal-management-page__card-copy">{localize(locale, feature.detail)}</p>
          </PortalCard>
        ))}
      </div>

      <PortalCard className="portal-management-page__note" tone="default">
        <p className="portal-panel__eyebrow">{localize(locale, page.badge)}</p>
        <p className="portal-description">{localize(locale, page.note)}</p>
      </PortalCard>
    </div>
  );
}
