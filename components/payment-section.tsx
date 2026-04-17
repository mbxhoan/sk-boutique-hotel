"use client";

import type { Locale } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";

type PaymentBrand = {
  brandTone: "diners" | "mastercard" | "amex" | "jcb" | "visa" | "maestro" | "cash";
  label: {
    en: string;
    vi: string;
  };
  mark: string;
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
  { brandTone: "diners", label: { vi: "Diners Club", en: "Diners Club" }, mark: "DC" },
  { brandTone: "mastercard", label: { vi: "Mastercard", en: "Mastercard" }, mark: "MC" },
  { brandTone: "amex", label: { vi: "American Express", en: "American Express" }, mark: "AMEX" },
  { brandTone: "jcb", label: { vi: "JCB", en: "JCB" }, mark: "JCB" },
  { brandTone: "visa", label: { vi: "Visa", en: "Visa" }, mark: "VISA" },
  { brandTone: "maestro", label: { vi: "Maestro", en: "Maestro" }, mark: "M" },
  { brandTone: "cash", label: { vi: "Tiền mặt", en: "Cash" }, mark: "CASH" }
];

export function PaymentSection({ className, locale }: PaymentSectionProps) {
  const title = locale === "en" ? "Cards accepted at this property" : "Thẻ được chấp nhận tại cơ sở này";
  const summary =
    locale === "en"
      ? "Diners Club, Mastercard, American Express, JCB, Visa, Maestro, cash only"
      : "Diners Club, Mastercard, American Express, JCB, Visa, Maestro, tiền mặt";
  const note = locale === "en" ? "This hotel accepts cash." : "Khách sạn này chấp nhận tiền mặt.";

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
              <span className={`payment-band__brand payment-band__brand--${brand.brandTone}`} key={brand.label.vi}>
                <span className="payment-band__brand-mark" aria-hidden="true">
                  {brand.mark}
                </span>
                <span className="payment-band__brand-label">{localize(locale, brand.label)}</span>
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
