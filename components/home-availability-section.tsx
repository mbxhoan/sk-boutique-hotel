import { AvailabilityCheckBar } from "@/components/availability-check-bar";
import type { Locale } from "@/lib/locale";

type HomeAvailabilitySectionProps = {
  locale: Locale;
};

export function HomeAvailabilitySection({ locale }: HomeAvailabilitySectionProps) {
  return (
    <section className="home-availability">
      <div className="section-shell home-availability__shell">
        <AvailabilityCheckBar locale={locale} variant="hero" />
      </div>
    </section>
  );
}
