import type { Locale } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";
import { adminDashboardCopy } from "@/lib/mock/admin-dashboard";
import { PortalBadge, PortalCard, PortalSectionHeading, PortalStatCard } from "@/components/portal-ui";

type AdminDashboardProps = {
  locale: Locale;
};

export function AdminDashboard({ locale }: AdminDashboardProps) {
  return (
    <div className="portal-content">
      <section className="portal-section" id="overview">
        <PortalSectionHeading
          description={adminDashboardCopy.sections.overview.description}
          eyebrow={adminDashboardCopy.sections.overview.eyebrow}
          locale={locale}
          title={adminDashboardCopy.sections.overview.title}
        />

        <div className="portal-stat-grid">
          {adminDashboardCopy.stats.map((stat, index) => (
            <PortalStatCard
              detail={stat.detail}
              label={stat.label}
              locale={locale}
              key={`${stat.value}-${index}`}
              tone={index === 2 ? "accent" : "soft"}
              value={stat.value}
            />
          ))}
        </div>
      </section>

      <section className="portal-section" id="operations">
        <PortalSectionHeading
          description={adminDashboardCopy.sections.operations.description}
          eyebrow={adminDashboardCopy.sections.operations.eyebrow}
          locale={locale}
          title={adminDashboardCopy.sections.operations.title}
        />

        <div className="portal-card-grid">
          {adminDashboardCopy.queues.map((queue) => (
            <PortalCard
              className="portal-item-card"
              key={queue.code}
              tone={queue.tone === "paper" ? "soft" : queue.tone === "gold" ? "accent" : "default"}
            >
              <div className="portal-item-card__top">
                <p className="portal-item-card__code">{queue.code}</p>
                <PortalBadge tone={queue.tone === "gold" ? "accent" : queue.tone === "paper" ? "soft" : "neutral"}>
                  {localize(locale, queue.status)}
                </PortalBadge>
              </div>
              <h3 className="portal-item-card__title">{localize(locale, queue.title)}</h3>
              <p className="portal-item-card__detail">{localize(locale, queue.detail)}</p>
            </PortalCard>
          ))}
        </div>
      </section>

      <section className="portal-section" id="branches">
        <PortalSectionHeading
          description={adminDashboardCopy.sections.branches.description}
          eyebrow={adminDashboardCopy.sections.branches.eyebrow}
          locale={locale}
          title={adminDashboardCopy.sections.branches.title}
        />

        <div className="portal-card-grid portal-card-grid--two">
          {adminDashboardCopy.branches.map((branch) => (
            <PortalCard className="portal-panel" key={branch.title.vi} tone="soft">
              <div className="portal-item-card__top">
                <h3 className="portal-item-card__title">{localize(locale, branch.title)}</h3>
                <PortalBadge tone="accent">{localize(locale, branch.status)}</PortalBadge>
              </div>
              <p className="portal-item-card__detail">{localize(locale, branch.detail)}</p>
              <p className="portal-panel__note-copy">
                {locale === "en"
                  ? "Physical-room model stays visible even before the database layer is connected."
                  : "Mô hình physical-room vẫn được giữ rõ dù chưa nối database layer."}
              </p>
            </PortalCard>
          ))}
        </div>
      </section>

      <section className="portal-section" id="audit">
        <PortalSectionHeading
          description={adminDashboardCopy.sections.audit.description}
          eyebrow={adminDashboardCopy.sections.audit.eyebrow}
          locale={locale}
          title={adminDashboardCopy.sections.audit.title}
        />

        <div className="portal-card-grid portal-card-grid--audit">
          {adminDashboardCopy.audit.map((item) => (
            <PortalCard className="portal-panel" key={`${item.time}-${item.title.vi}`} tone="default">
              <div className="portal-item-card__top">
                <span className="portal-audit__time">{item.time}</span>
                <PortalBadge tone="soft">
                  {locale === "en" ? "Audit event" : "Audit event"}
                </PortalBadge>
              </div>
              <h3 className="portal-item-card__title">{localize(locale, item.title)}</h3>
              <p className="portal-item-card__detail">{localize(locale, item.detail)}</p>
            </PortalCard>
          ))}
        </div>
      </section>
    </div>
  );
}
