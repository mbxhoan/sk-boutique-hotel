import { headers } from "next/headers";

import { PageLoadingScreen } from "@/components/page-loading-screen";
import { resolveLocaleFromUrl } from "@/lib/locale";

type LocalizedPageLoadingScreenProps = Readonly<{
  copy: { en: string; vi: string };
  title: { en: string; vi: string };
}>;

export async function LocalizedPageLoadingScreen({ copy, title }: LocalizedPageLoadingScreenProps) {
  const requestHeaders = await headers();
  const locale = resolveLocaleFromUrl(requestHeaders.get("next-url") ?? requestHeaders.get("x-next-url"));

  return <PageLoadingScreen copy={copy[locale]} title={title[locale]} />;
}
