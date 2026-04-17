import type { Locale } from "@/lib/locale";
import type { CmsPageCopy } from "@/lib/mock/public-cms";

import { PageViewTracker } from "@/components/page-view-tracker";
import { CmsPageRenderer } from "@/components/public-cms";
import { HomeAvailabilitySection } from "@/components/home-availability-section";

type MarketingHomeProps = {
  locale: Locale;
  page: CmsPageCopy;
};

export function MarketingHome({ locale, page }: MarketingHomeProps) {
  return (
    <>
      <PageViewTracker eventType="page_view" locale={locale} pagePath="/" entityType="homepage" />
      <CmsPageRenderer
        afterFirstSection={<HomeAvailabilitySection locale={locale} />}
        locale={locale}
        page={page}
      />
    </>
  );
}
