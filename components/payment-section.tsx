"use client";

import Image from "next/image";

import type { Locale } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";

type PaymentBrand = {
  src: string;
  label: {
    en: string;
    vi: string;
  };
};

type PaymentSectionProps = {
  className?: string;
  locale: Locale;
};

function CreditCardIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 18 18" width="18">
      <rect height="11" rx="2" stroke="currentColor" strokeWidth="1.4" width="14.5" x="1.75" y="3.5" />
      <path d="M1.75 7.25H16.25" stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" />
      <path d="M4.5 11H7.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" />
    </svg>
  );
}

const paymentBrands: PaymentBrand[] = [
  { src: "/logos/Mastercard.svg", label: { vi: "Mastercard", en: "Mastercard" } },
  { src: "/logos/visa.svg", label: { vi: "Visa", en: "Visa" } },
  { src: "/logos/cash.svg", label: { vi: "Tiền mặt", en: "Cash" } }
];

export function PaymentSection({ className, locale }: PaymentSectionProps) {
  const title = locale === "en" ? "Cards accepted at this property" : "Thẻ được chấp nhận tại cơ sở này";
  const summary = locale === "en" ? "Mastercard, Visa, and cash" : "Mastercard, Visa, và tiền mặt";
  const note =
    locale === "en"
      ? "This hotel accepts card and cash payments."
      : "Khách sạn chấp nhận thanh toán bằng thẻ và tiền mặt.";

  return (
    <section className={`section payment-band${className ? ` ${className}` : ""}`}>
      <div className="section-shell payment-band__shell">
        <div className="payment-band__card">
          <h2 className="payment-band__heading">
            <span className="payment-band__heading-icon" aria-hidden="true">
              <CreditCardIcon />
            </span>
            <span>{title}</span>
          </h2>

          <div className="payment-band__brands" aria-label={title}>
            {paymentBrands.map((brand) => (
              <span
                className="payment-band__brand"
                key={brand.label.vi}
                aria-label={localize(locale, brand.label)}
                title={localize(locale, brand.label)}
              >
                <span className="payment-band__brand-mark" aria-hidden="true">
                  <Image alt="" aria-hidden="true" className="payment-band__brand-logo" height={28} src={brand.src} width={56} />
                </span>
              </span>
            ))}
          </div>

          <p className="payment-band__summary">{summary}</p>
          <p className="payment-band__note">{note}</p>
        </div>
      </div>
    </section>
  );
}
