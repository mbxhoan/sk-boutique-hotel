import type { Locale } from "@/lib/locale";
import type { PageContent } from "@/lib/site-content";

import {
  CardSection,
  ClosingSection,
  ContactSection,
  FaqSection,
  HeroSection,
  MetricStrip,
  SplitSection,
  TimelineSection
} from "@/components/sections";

type PageTemplateProps = {
  content: PageContent;
  locale?: Locale;
};

export function PageTemplate({ content, locale = "vi" }: PageTemplateProps) {
  return (
    <>
      <HeroSection hero={content.hero} locale={locale} />

      {content.metrics?.length ? <MetricStrip locale={locale} metrics={content.metrics} /> : null}

      {content.splitSections?.map((section, index) => (
        <SplitSection key={`${section.title}-${index}`} locale={locale} section={section} />
      ))}

      {content.cardSections?.map((section, index) => (
        <CardSection key={`${section.title}-${index}`} locale={locale} section={section} />
      ))}

      {content.timelineSection ? (
        <TimelineSection locale={locale} section={content.timelineSection} />
      ) : null}

      {content.faqSection ? <FaqSection locale={locale} section={content.faqSection} /> : null}

      {content.contactSection ? (
        <ContactSection locale={locale} section={content.contactSection} />
      ) : null}

      {content.closingSection ? (
        <ClosingSection locale={locale} section={content.closingSection} />
      ) : null}
    </>
  );
}
