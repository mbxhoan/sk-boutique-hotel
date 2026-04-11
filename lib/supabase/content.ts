import type { Locale } from "@/lib/locale";
import type { LocalizedText } from "@/lib/mock/i18n";

export function text(vi: string, en: string): LocalizedText {
  return { vi, en };
}

export function localizedArray(
  viValues: string[] | null | undefined,
  enValues: string[] | null | undefined
): LocalizedText[] {
  const length = Math.max(viValues?.length ?? 0, enValues?.length ?? 0);

  return Array.from({ length }, (_, index) => {
    const vi = viValues?.[index] ?? "";
    const en = enValues?.[index] ?? "";

    return { vi, en };
  }).filter((item) => item.vi.length > 0 || item.en.length > 0);
}

export function localizedLabelList(values: string[] | null | undefined, locale: "vi" | "en") {
  return (values ?? []).map((value) => text(value, value));
}

function formatNumber(value: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US", {
    maximumFractionDigits: 2
  }).format(value);
}

export function formatAreaText(value: number | null | undefined) {
  if (value == null) {
    return null;
  }

  return text(`${formatNumber(value, "vi")} m²`, `${formatNumber(value, "en")} sqm`);
}

export function formatCurrencyText(value: number | null | undefined) {
  if (value == null) {
    return null;
  }

  return text(`Từ ${formatNumber(value, "vi")}`, `From ${formatNumber(value, "en")}`);
}
