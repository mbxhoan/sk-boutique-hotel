"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { LogoMark } from "@/components/logo-mark";
import { appendLocaleQuery, resolveLocale } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";
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
  address: t("Địa chỉ mẫu, Quận trung tâm, TP.HCM", "Sample address, central district, Ho Chi Minh City"),
  phone: "+84 28 0000 2020",
  email: "hello@skboutiquehotel.example",
  support: t("Luôn sẵn sàng hỗ trợ khách lưu trú.", "Always ready to assist staying guests.")
};

const footerLegal = t("© 2026 SK Boutique Hotel.", "© 2026 SK Boutique Hotel.");

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
                <dd>{localize(locale, footerContact.address)}</dd>
              </div>
              <div className="site-footer__detail">
                <dt>{locale === "en" ? "Phone" : "Điện thoại"}</dt>
                <dd>{footerContact.phone}</dd>
              </div>
              <div className="site-footer__detail">
                <dt>Email</dt>
                <dd>{footerContact.email}</dd>
              </div>
              <div className="site-footer__detail">
                <dt>{footerContact.badge.vi}</dt>
                <dd>{localize(locale, footerContact.support)}</dd>
              </div>
            </dl>
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
