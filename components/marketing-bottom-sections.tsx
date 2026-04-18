"use client";

import { useSearchParams } from "next/navigation";

import { FacilitiesSection } from "@/components/facilities-section";
import { LocationSection } from "@/components/location-section";
import { PaymentSection } from "@/components/payment-section";
import { resolveLocale } from "@/lib/locale";

export function MarketingBottomSections() {
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang"));

  return (
    <>
      <LocationSection locale={locale} />
      <FacilitiesSection locale={locale} />
      <PaymentSection locale={locale} />
    </>
  );
}
