import type { Locale } from "@/lib/locale";
import { homePageCopy } from "@/lib/mock/public-cms";

import { PageViewTracker } from "@/components/page-view-tracker";
import { CmsPageRenderer } from "@/components/public-cms";

type MarketingHomeProps = {
  locale: Locale;
};

export function MarketingHome({ locale }: MarketingHomeProps) {
  return (
    <>
      <PageViewTracker eventType="page_view" locale={locale} pagePath="/" entityType="homepage" />
      <CmsPageRenderer locale={locale} page={homePageCopy} />
    </>
  );
}
