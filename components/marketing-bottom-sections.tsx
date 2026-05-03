"use client";

import { useSearchParams } from "next/navigation";

import { FacilitiesSection } from "@/components/facilities-section";
import { LocationSection } from "@/components/location-section";
import { PaymentSection } from "@/components/payment-section";
import { resolveLocale } from "@/lib/locale";
import type { CmsMarketingShellCopy } from "@/lib/mock/public-cms";

export function MarketingBottomSections({
  copy
}: {
  copy?: CmsMarketingShellCopy;
}) {
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang"));

  return (
    <>
      <FacilitiesSection copy={copy?.facilities} locale={locale} />
      <LocationSection locale={locale} />
      <PaymentSection locale={locale} />
    </>
  );
}
