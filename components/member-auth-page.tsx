import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { LogoMark } from "@/components/logo-mark";
import type { Locale } from "@/lib/locale";
import { appendLocaleQuery } from "@/lib/locale";
import { localize, type LocalizedText } from "@/lib/mock/i18n";

type MemberAuthPageProps = {
  children: ReactNode;
  description: LocalizedText;
  eyebrow: LocalizedText;
  locale: Locale;
  nextHref?: string;
  routePath: "/member/sign-in" | "/member/sign-up";
  title: LocalizedText;
};

const backgroundImageSrc = "/home/pool3.jpg";

function buildLocaleHref(routePath: MemberAuthPageProps["routePath"], nextHref: string | null | undefined, targetLocale: Locale) {
  const url = new URL(routePath, "https://sk-boutique-hotel.local");

  if (nextHref?.startsWith("/")) {
    url.searchParams.set("next", nextHref);
  }

  return appendLocaleQuery(`${url.pathname}${url.search}${url.hash}`, targetLocale);
}

export function MemberAuthPage({
  children,
  description,
  eyebrow,
  locale,
  nextHref,
  routePath,
  title
}: MemberAuthPageProps) {
  return (
    <main className="member-auth-page">
      <div className="member-auth-page__media" aria-hidden="true">
        <Image
          alt=""
          className="member-auth-page__image"
          fill
          priority
          sizes="100vw"
          src={backgroundImageSrc}
        />
        <span className="member-auth-page__overlay" aria-hidden="true" />
      </div>

      <div className="member-auth-page__content">
        <header className="member-auth-page__topbar">
          <LogoMark className="member-auth-page__logo" href={appendLocaleQuery("/", locale)} priority variant="light" />

          <div className="member-auth-page__locale-switch" aria-label={locale === "en" ? "Language switch" : "Chuyển ngôn ngữ"}>
            <Link
              className={`member-auth-page__locale-link${locale === "vi" ? " member-auth-page__locale-link--active" : ""}`}
              href={buildLocaleHref(routePath, nextHref, "vi")}
            >
              VI
            </Link>
            <Link
              className={`member-auth-page__locale-link${locale === "en" ? " member-auth-page__locale-link--active" : ""}`}
              href={buildLocaleHref(routePath, nextHref, "en")}
            >
              EN
            </Link>
          </div>
        </header>

        <section className="member-auth-card">
          <p className="member-auth-card__eyebrow">{localize(locale, eyebrow)}</p>
          <h1 className="sr-only">{localize(locale, title)}</h1>
          {/* <p className="member-auth-card__description">{localize(locale, description)}</p> */}
          {children}
        </section>
      </div>
    </main>
  );
}
