import type { Locale } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";
import { memberDashboardCopy } from "@/lib/mock/member-dashboard";
import { PortalBadge, PortalCard, PortalSectionHeading, PortalStatCard } from "@/components/portal-ui";

type MemberDashboardProps = {
  locale: Locale;
};

export function MemberDashboard({ locale }: MemberDashboardProps) {
  return (
    <div className="portal-content">
      <section className="portal-section" id="summary">
        <PortalSectionHeading
          description={memberDashboardCopy.sections.summary.description}
          eyebrow={memberDashboardCopy.sections.summary.eyebrow}
          locale={locale}
          title={memberDashboardCopy.sections.summary.title}
        />

        <div className="portal-stat-grid">
          {memberDashboardCopy.stats.map((stat, index) => (
            <PortalStatCard
              detail={stat.detail}
              label={stat.label}
              locale={locale}
              key={`${stat.value}-${index}`}
              tone={index === 1 ? "accent" : "soft"}
              value={stat.value}
            />
          ))}
        </div>
      </section>

      <section className="portal-section" id="requests">
        <PortalSectionHeading
          description={memberDashboardCopy.sections.requests.description}
          eyebrow={memberDashboardCopy.sections.requests.eyebrow}
          locale={locale}
          title={memberDashboardCopy.sections.requests.title}
        />

        <div className="portal-card-grid">
          {memberDashboardCopy.requests.map((request) => (
            <PortalCard className="portal-item-card" key={request.code} tone={request.tone === "paper" ? "soft" : request.tone === "gold" ? "accent" : "default"}>
              <div className="portal-item-card__top">
                <p className="portal-item-card__code">{request.code}</p>
                <PortalBadge tone={request.tone === "gold" ? "accent" : request.tone === "paper" ? "soft" : "neutral"}>
                  {localize(locale, request.status)}
                </PortalBadge>
              </div>
              <h3 className="portal-item-card__title">{localize(locale, request.title)}</h3>
              <p className="portal-item-card__detail">{localize(locale, request.detail)}</p>
              <p className="portal-item-card__note">{localize(locale, request.note)}</p>
            </PortalCard>
          ))}
        </div>
      </section>

      <section className="portal-section" id="history">
        <PortalSectionHeading
          description={memberDashboardCopy.sections.history.description}
          eyebrow={memberDashboardCopy.sections.history.eyebrow}
          locale={locale}
          title={memberDashboardCopy.sections.history.title}
        />

        <div className="portal-grid portal-grid--two">
          <PortalCard className="portal-panel" tone="soft">
            <p className="portal-panel__eyebrow">
              {locale === "en" ? "Recent activity" : "Hoạt động gần nhất"}
            </p>
            <ol className="portal-timeline">
              {memberDashboardCopy.timeline.map((item) => (
                <li className="portal-timeline__item" key={`${item.time}-${item.title.vi}`}>
                  <span className="portal-timeline__time">{item.time}</span>
                  <div className="portal-timeline__copy">
                    <h4 className="portal-timeline__title">{localize(locale, item.title)}</h4>
                    <p className="portal-timeline__detail">{localize(locale, item.description)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </PortalCard>

          <PortalCard className="portal-panel" id="profile" tone="default">
            <PortalSectionHeading
              description={memberDashboardCopy.sections.profile.description}
              eyebrow={memberDashboardCopy.sections.profile.eyebrow}
              locale={locale}
              title={memberDashboardCopy.sections.profile.title}
            />

            <dl className="portal-profile-list">
              {memberDashboardCopy.profile.map((item) => (
                <div className="portal-profile-list__item" key={item.label.vi}>
                  <dt className="portal-profile-list__label">{localize(locale, item.label)}</dt>
                  <dd className="portal-profile-list__value">{localize(locale, item.value)}</dd>
                </div>
              ))}
            </dl>

            <div className="portal-panel__note">
              <PortalBadge tone="accent">
                {locale === "en" ? "Manual operations only" : "Chỉ manual operations"}
              </PortalBadge>
              <p className="portal-panel__note-copy">
                {locale === "en"
                  ? "The member shell makes room for proof uploads, consent logs, and booking documents."
                  : "Member shell chừa sẵn chỗ cho ảnh xác nhận thanh toán, consent log và booking documents."}
              </p>
            </div>
          </PortalCard>
        </div>
      </section>

      <section className="portal-section" id="notifications">
        <PortalSectionHeading
          description={memberDashboardCopy.sections.notifications.description}
          eyebrow={memberDashboardCopy.sections.notifications.eyebrow}
          locale={locale}
          title={memberDashboardCopy.sections.notifications.title}
        />

        <PortalCard tone="soft">
          <p className="portal-panel__eyebrow">
            {locale === "en" ? "No live events yet" : "Chưa có sự kiện mới"}
          </p>
          <p className="portal-panel__note-copy">
            {locale === "en"
              ? "Once a request, hold, booking, or proof changes state, the update will appear here."
              : "Khi request, hold, booking hoặc ảnh xác nhận thanh toán thay đổi trạng thái, cập nhật sẽ hiện ở đây."}
          </p>
        </PortalCard>
      </section>
    </div>
  );
}
