"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { LogoMark } from "@/components/logo-mark";
import { appendLocaleQuery, resolveLocale } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";
import { siteInfo } from "@/lib/site-content";
import type { LocalizedText } from "@/lib/mock/i18n";

type FooterLink = {
  href: string;
  label: LocalizedText;
};

type FooterGroup = {
  title: LocalizedText;
  links: FooterLink[];
};

const t = (vi: string, en: string): LocalizedText => ({ vi, en });

const footerBrand = {
  eyebrow: t("Boutique luxury stay", "Boutique luxury stay"),
  description: t(
    "SK Boutique Hotel mang tinh thần nghỉ dưỡng tinh tế, ấm áp và kín đáo. Mọi điểm chạm đều được giữ tối giản để trải nghiệm luôn sang và dễ chịu.",
    "SK Boutique Hotel carries a refined, warm, and discreet stay story. Every touchpoint stays minimal so the experience feels elegant and effortless."
  )
};

const footerNavGroups: FooterGroup[] = [
  {
    title: t("Nội dung", "Content"),
    links: [
      { href: "/phong", label: t("Phòng", "Rooms") },
      { href: "/tin-tuc", label: t("Tin tức", "News") },
      { href: "/thuong-hieu", label: t("Thương hiệu", "Brand") }
    ]
  },
  {
    title: t("Thông tin", "Information"),
    links: [
      { href: "/ve-chung-toi", label: t("Về chúng tôi", "About us") },
      { href: "/lien-he", label: t("Liên hệ", "Contact") },
      { href: "/tuyen-dung", label: t("Tuyển dụng", "Careers") },
      { href: "/ho-tro", label: t("Hỗ trợ", "Support") }
    ]
  }
];

const footerContact = {
  title: t("Liên hệ", "Contact"),
  badge: t("Hỗ trợ 24/7", "24/7 support"),
  support: t("Luôn sẵn sàng hỗ trợ khách lưu trú.", "Always ready to assist staying guests.")
};

const footerLegal = t("© 2026 SK Boutique Hotel.", "© 2026 SK Boutique Hotel.");

function FacebookIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 18 18" width="18">
      <path
        d="M10.75 5.25H12.5V3H10.75C9.23122 3 8 4.23122 8 5.75V7.25H6.5V9.5H8V15H10.25V9.5H12.2L12.5 7.25H10.25V6C10.25 5.58579 10.5858 5.25 10.75 5.25Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ZaloIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 18 18" width="18">
      <path
        d="M14.25 4.5H3.75C3.33579 4.5 3 4.83579 3 5.25V12.75C3 13.1642 3.33579 13.5 3.75 13.5H6.1L7.8 15.25L9.55 13.5H14.25C14.6642 13.5 15 13.1642 15 12.75V5.25C15 4.83579 14.6642 4.5 14.25 4.5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.25"
      />
      <path d="M6.2 7.25H11.8L6.2 10.75H11.8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
    </svg>
  );
}

export function SiteFooter() {
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang"));

  return (
    <footer className="site-footer site-footer--boutique">
      <div className="section-shell site-footer__panel">
        <div className="site-footer__grid">
          <section className="site-footer__brand" aria-label={localize(locale, footerBrand.eyebrow)}>
            <LogoMark className="site-footer__logo" href={appendLocaleQuery("/", locale)} priority variant="light" />
            <p className="site-footer__eyebrow">{localize(locale, footerBrand.eyebrow)}</p>
            <p className="site-footer__copy">{localize(locale, footerBrand.description)}</p>
          </section>

          <nav className="site-footer__nav" aria-label={locale === "en" ? "Footer navigation" : "Điều hướng chân trang"}>
            {footerNavGroups.map((group) => (
              <section className="site-footer__nav-group" key={group.title.vi}>
                <h2 className="site-footer__title">{localize(locale, group.title)}</h2>
                <div className="site-footer__nav-links">
                  {group.links.map((item) => (
                    <Link className="site-footer__link" href={appendLocaleQuery(item.href, locale)} key={item.href}>
                      {localize(locale, item.label)}
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </nav>

          <section className="site-footer__contact" aria-label={localize(locale, footerContact.title)}>
            <div className="site-footer__contact-header">
              <h2 className="site-footer__title">{localize(locale, footerContact.title)}</h2>
              <span className="site-footer__badge">{localize(locale, footerContact.badge)}</span>
            </div>

            <dl className="site-footer__details">
              <div className="site-footer__detail">
                <dt>{locale === "en" ? "Address" : "Địa chỉ"}</dt>
                <dd>{siteInfo.address}</dd>
              </div>
              <div className="site-footer__detail">
                <dt>{locale === "en" ? "Phone" : "Điện thoại"}</dt>
                <dd>
                  <a className="site-footer__detail-link" href={`tel:${siteInfo.phone.replace(/\s+/g, "")}`}>
                    {siteInfo.phone}
                  </a>
                </dd>
              </div>
              <div className="site-footer__detail">
                <dt>Email</dt>
                <dd>
                  <a className="site-footer__detail-link" href={`mailto:${siteInfo.email}`}>
                    {siteInfo.email}
                  </a>
                </dd>
              </div>
              <div className="site-footer__detail">
                <dt>{footerContact.badge.vi}</dt>
                <dd>{localize(locale, footerContact.support)}</dd>
              </div>
            </dl>

            <div className="site-footer__social">
              <nav className="site-footer__social-links" aria-label={locale === "en" ? "Social links" : "Liên kết mạng xã hội"}>
                <a
                  className="site-footer__social-link"
                  href={siteInfo.facebook}
                  rel="noreferrer noopener"
                  target="_blank"
                  title="Facebook"
                  aria-label="Facebook"
                >
                  <FacebookIcon />
                </a>
                <a
                  className="site-footer__social-link"
                  href={`https://zalo.me/${siteInfo.zalo.replace(/\s+/g, "")}`}
                  rel="noreferrer noopener"
                  target="_blank"
                  title="Zalo"
                  aria-label="Zalo"
                >
                  <ZaloIcon />
                </a>
              </nav>
            </div>
          </section>
        </div>

        <div className="site-footer__bar">
          <span>{localize(locale, footerLegal)}</span>
          <span>SK Boutique Hotel</span>
        </div>
      </div>
    </footer>
  );
}
