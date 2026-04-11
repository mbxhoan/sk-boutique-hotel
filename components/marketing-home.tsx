import Link from "next/link";

import type { Locale } from "@/lib/locale";
import { appendLocaleQuery } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";
import { marketingHomeCopy } from "@/lib/mock/marketing-home";
import { PortalBadge, PortalBulletList, PortalCard, PortalSectionHeading, PortalStatCard } from "@/components/portal-ui";

type MarketingHomeProps = {
  locale: Locale;
};

export function MarketingHome({ locale }: MarketingHomeProps) {
  return (
    <div className="marketing-home">
      <section className="section marketing-home__hero">
        <div className="section-shell marketing-home__hero-grid">
          <div className="marketing-home__hero-copy">
            <PortalBadge tone="accent">{localize(locale, marketingHomeCopy.hero.badge)}</PortalBadge>
            <p className="marketing-home__eyebrow">{localize(locale, marketingHomeCopy.hero.eyebrow)}</p>
            <h1 className="marketing-home__title">{localize(locale, marketingHomeCopy.hero.title)}</h1>
            <p className="marketing-home__description">{localize(locale, marketingHomeCopy.hero.description)}</p>

            <div className="marketing-home__actions">
              <Link
                className="button button--solid"
                href={appendLocaleQuery(marketingHomeCopy.hero.primaryCta.href, locale)}
              >
                {localize(locale, marketingHomeCopy.hero.primaryCta.label)}
              </Link>
              <Link
                className="button button--ghost"
                href={appendLocaleQuery(marketingHomeCopy.hero.secondaryCta.href, locale)}
              >
                {localize(locale, marketingHomeCopy.hero.secondaryCta.label)}
              </Link>
            </div>

            <PortalBulletList className="marketing-home__hero-bullets" items={marketingHomeCopy.hero.bullets} locale={locale} />
          </div>

          <PortalCard className="marketing-home__hero-panel">
            <div className="marketing-home__hero-panel-head">
              <PortalBadge tone="accent">{localize(locale, marketingHomeCopy.hero.badge)}</PortalBadge>
              <span className="marketing-home__hero-panel-kicker">SK Boutique Hotel</span>
            </div>

            <div className="marketing-home__hero-panel-body">
              <p className="marketing-home__hero-panel-title">
                {locale === "en"
                  ? "Public site -> member portal -> admin console"
                  : "Public site -> member portal -> admin console"}
              </p>
              <p className="marketing-home__hero-panel-copy">
                {locale === "en"
                  ? "The shell is split by audience so future Supabase data can be attached without reworking the frame."
                  : "Shell được tách theo nhóm người dùng để sau này gắn Supabase data mà không phải làm lại khung."}
              </p>
              <PortalBulletList
                className="marketing-home__hero-panel-list"
                items={[
                  {
                    vi: "No instant booking promise",
                    en: "No instant booking promise"
                  },
                  {
                    vi: "Physical rooms underneath",
                    en: "Physical rooms underneath"
                  },
                  {
                    vi: "Manual verification only",
                    en: "Manual verification only"
                  }
                ]}
                locale={locale}
              />
            </div>
          </PortalCard>
        </div>
      </section>

      <section className="section">
        <div className="section-shell marketing-home__stats">
          {marketingHomeCopy.metrics.map((metric, index) => (
            <PortalStatCard
              detail={metric.detail}
              label={metric.label}
              locale={locale}
              key={`${metric.value}-${index}`}
              tone={index === 0 ? "accent" : "soft"}
              value={metric.value}
            />
          ))}
        </div>
      </section>

      <section className="section marketing-home__section">
        <div className="section-shell">
          <PortalSectionHeading
            align="center"
            description={
              locale === "en"
                ? {
                    en: "The front end is split into three distinct shells so the product can grow without a redesign.",
                    vi: "Front-end được tách thành ba shell riêng để sản phẩm có thể mở rộng mà không phải thiết kế lại."
                  }
                : {
                    en: "The front end is split into three distinct shells so the product can grow without a redesign.",
                    vi: "Front-end được tách thành ba shell riêng để sản phẩm có thể mở rộng mà không phải thiết kế lại."
                  }
            }
            eyebrow={{
              vi: "Route architecture",
              en: "Route architecture"
            }}
            locale={locale}
            title={{
              vi: "Ba vùng giao diện, một ngôn ngữ thiết kế.",
              en: "Three interface zones, one design language."
            }}
          />

          <div className="marketing-home__pillar-grid">
            {marketingHomeCopy.pillars.map((pillar) => (
              <PortalCard className={`marketing-home__pillar marketing-home__pillar--${pillar.tone}`} key={pillar.title.vi}>
                <PortalBadge tone={pillar.tone === "paper" ? "soft" : pillar.tone === "gold" ? "neutral" : "accent"}>
                  {localize(locale, pillar.eyebrow)}
                </PortalBadge>
                <h3 className="marketing-home__pillar-title">{localize(locale, pillar.title)}</h3>
                <p className="marketing-home__pillar-description">{localize(locale, pillar.description)}</p>
                <PortalBulletList items={pillar.bullets} locale={locale} />
              </PortalCard>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-shell">
          <PortalSectionHeading
            description={marketingHomeCopy.trust.description}
            eyebrow={{
              vi: "Phase 1 guardrails",
              en: "Phase 1 guardrails"
            }}
            locale={locale}
            title={marketingHomeCopy.trust.title}
          />

          <div className="marketing-home__trust">
            <PortalCard className="marketing-home__trust-card" tone="soft">
              <p className="marketing-home__trust-card-title">
                {locale === "en"
                  ? "Operational rhythm"
                  : "Nhịp vận hành"}
              </p>
              <p className="marketing-home__trust-card-copy">
                {locale === "en"
                  ? "The UI keeps room for hold expiry, manual payment verification, and audit logs from the start."
                  : "UI luôn chừa chỗ cho hold expiry, xác minh thanh toán thủ công, và audit log ngay từ đầu."}
              </p>
            </PortalCard>

            <div className="marketing-home__trust-grid">
              {marketingHomeCopy.trust.items.map((item) => (
                <PortalCard className="marketing-home__trust-chip" key={item.vi} tone="default">
                  <span className="marketing-home__trust-chip-label">{localize(locale, item)}</span>
                </PortalCard>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section marketing-home__workflow">
        <div className="section-shell">
          <PortalSectionHeading
            description={{
              vi: "Luồng hiển thị công khai để sau này việc nối data và form thật không phải phá lại cấu trúc.",
              en: "The visible flow keeps the future data and form wiring from breaking the structure later."
            }}
            eyebrow={{
              vi: "Guest journey",
              en: "Guest journey"
            }}
            locale={locale}
            title={{
              vi: "Từ xem phòng đến xác nhận thủ công.",
              en: "From room browsing to manual confirmation."
            }}
          />

          <div className="marketing-home__workflow-grid">
            {marketingHomeCopy.workflow.map((step) => (
              <PortalCard className="marketing-home__workflow-card" key={step.step}>
                <p className="marketing-home__workflow-step">{step.step}</p>
                <h3 className="marketing-home__workflow-title">{localize(locale, step.title)}</h3>
                <p className="marketing-home__workflow-copy">{localize(locale, step.description)}</p>
              </PortalCard>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
