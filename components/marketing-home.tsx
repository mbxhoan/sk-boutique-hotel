import type { Locale } from "@/lib/locale";
import { homePageCopy } from "@/lib/mock/public-cms";

import { CmsPageRenderer } from "@/components/public-cms";

type MarketingHomeProps = {
  locale: Locale;
};

export function MarketingHome({ locale }: MarketingHomeProps) {
  return <CmsPageRenderer locale={locale} page={homePageCopy} />;
}
