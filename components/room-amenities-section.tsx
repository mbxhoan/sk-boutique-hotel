import { PortalCard } from "@/components/portal-ui";
import type { Locale } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";
import type { CmsAmenitiesSection } from "@/lib/mock/public-cms";

export function RoomAmenitiesSection({
  locale,
  section
}: {
  locale: Locale;
  section: CmsAmenitiesSection;
}) {
  return (
    <section
      aria-label={localize(locale, section.title)}
      className="section cms-section cms-section--amenities"
      id={section.id}
    >
      <div className="section-shell cms-amenities__shell">
        <div className="cms-amenities__grid">
          {section.groups.map((group) => (
            <div className="cms-amenities__column" key={group.title.vi}>
              <h2 className="cms-amenities__group-title">{localize(locale, group.title)}</h2>
              <span className="cms-amenities__rule" aria-hidden="true" />

              <PortalCard className="cms-amenities__card" tone="soft">
                <ul className="cms-amenities__list">
                  {group.items.map((item) => (
                    <li className="cms-amenities__item" key={`${item.label.vi}-${item.value.vi}`}>
                      <span className="cms-amenities__marker" aria-hidden="true" />

                      <div className="cms-amenities__text">
                        <span className="cms-amenities__label">{localize(locale, item.label)}</span>
                        <span className="cms-amenities__value">{localize(locale, item.value)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </PortalCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
