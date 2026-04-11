import type { Locale } from "@/lib/locale";

export type LocalizedText = {
  en: string;
  vi: string;
};

export function localize(locale: Locale, value: LocalizedText) {
  return value[locale];
}
