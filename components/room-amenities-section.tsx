import { PortalCard } from "@/components/portal-ui";
import type { Locale } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";
import type { CmsAmenitiesSection } from "@/lib/mock/public-cms";

function CheckMark() {
  return (
    <svg aria-hidden="true" fill="none" height="16" viewBox="0 0 16 16" width="16">
      <path
        d="M12.5 4.75L6.75 11.25L3.5 8.25"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function WaterIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="16" viewBox="0 0 16 16" width="16">
      <path
        d="M8 2.5C8.78 3.56 10.75 6.03 11.6 7.46C12.22 8.51 12.5 9.24 12.5 10.1C12.5 12.56 10.56 14 8 14C5.44 14 3.5 12.56 3.5 10.1C3.5 9.24 3.78 8.51 4.4 7.46C5.25 6.03 7.22 3.56 8 2.5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.4"
      />
      <path
        d="M5.8 10.3C5.94 11.46 6.88 12.1 8 12.1"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.2"
      />
    </svg>
  );
}

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
                    <li className="cms-amenities__item" key={`${item.label.vi}-${item.value?.vi ?? "check"}`}>
                      <span className="cms-amenities__marker" aria-hidden="true" />

                      <div className="cms-amenities__text">
                        <span className="cms-amenities__label">
                          {localize(locale, item.label)}
                          {item.icon === "water" ? (
                            <span className="cms-amenities__label-icon" aria-hidden="true">
                              <WaterIcon />
                            </span>
                          ) : null}
                        </span>

                        {item.display === "check" ? (
                          <span className="cms-amenities__check" aria-label={localize(locale, item.label)}>
                            <CheckMark />
                          </span>
                        ) : (
                          <span className="cms-amenities__value">{item.value ? localize(locale, item.value) : null}</span>
                        )}
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
