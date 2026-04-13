"use client";

import { LogoMark } from "@/components/logo-mark";
import { footerLinks, siteInfo, socialLinks } from "@/lib/site-content";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { appendLocaleQuery, resolveLocale, translate } from "@/lib/locale";

export function SiteFooter() {
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang"));

  return (
    <footer className="site-footer">
      <div className="section-shell site-footer__grid">
        <div className="site-footer__brand">
          <LogoMark className="site-footer__logo" href={appendLocaleQuery("/", locale)} variant="muted" />
          <p className="site-footer__copy">
            {translate(
              locale,
              "Frontend foundation cho SK Boutique Hotel, manual-first, sẵn cho marketing, member và admin shells."
            )}
          </p>
        </div>

        <div className="site-footer__links">
          <h2 className="site-footer__title">{translate(locale, "Khám phá")}</h2>
          <div className="site-footer__link-grid">
            {footerLinks.map((item) => (
              <Link className="site-footer__link" href={appendLocaleQuery(item.href, locale)} key={item.href}>
                {translate(locale, item.label)}
              </Link>
            ))}
          </div>
        </div>

        <div className="site-footer__contact">
          <h2 className="site-footer__title">{translate(locale, "Liên hệ mẫu")}</h2>
          <dl className="site-footer__details">
            <div className="site-footer__detail">
              <dt>{translate(locale, "Địa chỉ")}</dt>
              <dd>{translate(locale, siteInfo.address)}</dd>
            </div>
            <div className="site-footer__detail">
              <dt>{translate(locale, "Điện thoại")}</dt>
              <dd>{siteInfo.phone}</dd>
            </div>
            <div className="site-footer__detail">
              <dt>Email</dt>
              <dd>{siteInfo.email}</dd>
            </div>
            <div className="site-footer__detail">
              <dt>{translate(locale, "Giờ làm việc")}</dt>
              <dd>{siteInfo.hours}</dd>
            </div>
          </dl>

          <div className="site-footer__social">
            {socialLinks.map((item) => (
              <a
                className="site-footer__social-link"
                href={item.href}
                key={item.label}
                rel="noreferrer"
                target="_blank"
                title={item.label}
              >
                <img alt="" aria-hidden="true" src={item.icon} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="section-shell site-footer__bar">
        <span>{translate(locale, siteInfo.legal)}</span>
        <span>SK Boutique Hotel</span>
      </div>
    </footer>
  );
}
