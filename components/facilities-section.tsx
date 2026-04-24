"use client";

import type { Locale } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";

type FacilityRow = {
  icon?: "water";
  kind: "check" | "text";
  label: {
    en: string;
    vi: string;
  };
  value?: {
    en: string;
    vi: string;
  };
};

type FacilityColumn = {
  title: {
    en: string;
    vi: string;
  };
  rows: FacilityRow[];
};

type FacilitiesSectionProps = {
  className?: string;
  id?: string;
  locale: Locale;
};

function CheckIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="16" viewBox="0 0 16 16" width="16">
      <path d="M12.5 4.75L6.75 11.25L3.5 8.25" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function WaterIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="15" viewBox="0 0 16 16" width="15">
      <path
        d="M8 2.5C8.78 3.56 10.75 6.03 11.6 7.46C12.22 8.51 12.5 9.24 12.5 10.1C12.5 12.56 10.56 14 8 14C5.44 14 3.5 12.56 3.5 10.1C3.5 9.24 3.78 8.51 4.4 7.46C5.25 6.03 7.22 3.56 8 2.5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.3"
      />
      <path d="M5.8 10.3C5.94 11.46 6.88 12.1 8 12.1" stroke="currentColor" strokeLinecap="round" strokeWidth="1.1" />
    </svg>
  );
}

function buildColumns(locale: Locale): FacilityColumn[] {
  return locale === "en"
    ? [
        {
          title: { en: "Hotel amenities", vi: "Tiện nghi khách sạn" },
          rows: [
            { kind: "check", label: { en: "Free breakfast", vi: "Ăn sáng miễn phí" } },
            { kind: "check", label: { en: "Same-day laundry", vi: "Giặt ủi trong ngày" } },
            { icon: "water", kind: "check", label: { en: "Outdoor pool", vi: "Hồ bơi ngoài trời" } },
            { kind: "check", label: { en: "Windows", vi: "Cửa sổ" } },
            { kind: "check", label: { en: "Balcony", vi: "Ban công" } },
            { kind: "check", label: { en: "Extra mattress", vi: "Kê nệm phụ" } },
            { kind: "check", label: { en: "Bathtub", vi: "Bồn tắm" } },
            { kind: "check", label: { en: "Desk", vi: "Bàn làm việc" } },
            { kind: "check", label: { en: "Fridge", vi: "Tủ lạnh" } },
            { kind: "check", label: { en: "Smart TV / Netflix", vi: "Smart TV / Netflix" } },
            { kind: "check", label: { en: "Hair dryer", vi: "Máy sấy tóc" } },
            { kind: "check", label: { en: "Kettle / tea / coffee", vi: "Ấm đun nước / trà / cà phê" } }
          ]
        },
        {
          title: { en: "Other information", vi: "Thông tin khác" },
          rows: [
            { kind: "text", label: { en: "Bed type", vi: "Loại giường" }, value: { en: "Double bed", vi: "Giường đôi" } },
            { kind: "text", label: { en: "Room view", vi: "View phòng" }, value: { en: "Garden & pool view", vi: "Sân vườn và hồ bơi" } },
            { kind: "text", label: { en: "Safe", vi: "Két sắt" }, value: { en: "VIP rooms only", vi: "Chỉ dành cho phòng VIP" } },
            { kind: "text", label: { en: "Housekeeping", vi: "Dọn phòng" }, value: { en: "Daily", vi: "Mỗi ngày" } },
            { kind: "text", label: { en: "Room service", vi: "Dịch vụ phòng" }, value: { en: "24/7", vi: "24/7" } },
            { kind: "check", label: { en: "No weekend surcharge", vi: "Không phụ thu cuối tuần" } },
            { kind: "check", label: { en: "Early check-in available", vi: "Cho check-in sớm" } },
            { kind: "check", label: { en: "No early check-in fee", vi: "Không thu phí check-in sớm" } }
          ]
        }
      ]
    : [
        {
          title: { en: "Hotel amenities", vi: "Tiện nghi khách sạn" },
          rows: [
            { kind: "check", label: { en: "Free breakfast", vi: "Ăn sáng miễn phí" } },
            { kind: "check", label: { en: "Same-day laundry", vi: "Giặt ủi trong ngày" } },
            { icon: "water", kind: "check", label: { en: "Outdoor pool", vi: "Hồ bơi ngoài trời" } },
            { kind: "check", label: { en: "Windows", vi: "Cửa sổ" } },
            { kind: "check", label: { en: "Balcony", vi: "Ban công" } },
            { kind: "check", label: { en: "Extra mattress", vi: "Kê nệm phụ" } },
            { kind: "check", label: { en: "Bathtub", vi: "Bồn tắm" } },
            { kind: "check", label: { en: "Desk", vi: "Bàn làm việc" } },
            { kind: "check", label: { en: "Fridge", vi: "Tủ lạnh" } },
            { kind: "check", label: { en: "Smart TV / Netflix", vi: "Smart TV / Netflix" } },
            { kind: "check", label: { en: "Hair dryer", vi: "Máy sấy tóc" } },
            { kind: "check", label: { en: "Kettle / tea / coffee", vi: "Ấm đun nước / trà / cà phê" } }
          ]
        },
        {
          title: { en: "Other information", vi: "Thông tin khác" },
          rows: [
            { kind: "text", label: { en: "Bed type", vi: "Loại giường" }, value: { en: "Double bed", vi: "Giường đôi" } },
            { kind: "text", label: { en: "Room view", vi: "View phòng" }, value: { en: "Garden & pool view", vi: "Sân vườn và hồ bơi" } },
            { kind: "text", label: { en: "Safe", vi: "Két sắt" }, value: { en: "VIP rooms only", vi: "Chỉ dành cho phòng VIP" } },
            { kind: "text", label: { en: "Housekeeping", vi: "Dọn phòng" }, value: { en: "Daily", vi: "Mỗi ngày" } },
            { kind: "text", label: { en: "Room service", vi: "Dịch vụ phòng" }, value: { en: "24/7", vi: "24/7" } },
            { kind: "check", label: { en: "No weekend surcharge", vi: "Không phụ thu cuối tuần" } },
            { kind: "check", label: { en: "Early check-in available", vi: "Cho check-in sớm" } },
            { kind: "check", label: { en: "No early check-in fee", vi: "Không thu phí check-in sớm" } }
          ]
        }
      ];
}

export function FacilitiesSection({ className, id = "tien-ich", locale }: FacilitiesSectionProps) {
  const columns = buildColumns(locale);

  return (
    <section className={`section facilities-band${className ? ` ${className}` : ""}`} id={id}>
      <div className="section-shell facilities-band__shell">
        {columns.map((column) => (
          <div className="facilities-band__column" key={column.title.vi}>
            <h2 className="facilities-band__heading">{localize(locale, column.title)}</h2>
            <span className="facilities-band__rule" aria-hidden="true" />

            <div className="facilities-band__card">
              <ul className="facilities-band__list">
                {column.rows.map((row) => (
                  <li className="facilities-band__item" key={`${column.title.vi}-${row.label.vi}`}>
                    <span className="facilities-band__dot" aria-hidden="true" />

                    <div className="facilities-band__label-wrap">
                      <span className="facilities-band__label">
                        {localize(locale, row.label)}
                        {row.icon === "water" ? (
                          <span className="facilities-band__label-icon" aria-hidden="true">
                            <WaterIcon />
                          </span>
                        ) : null}
                      </span>
                    </div>

                    {row.kind === "check" ? (
                      <span className="facilities-band__check" aria-label={localize(locale, row.label)}>
                        <CheckIcon />
                      </span>
                    ) : (
                      <strong className="facilities-band__value">{row.value ? localize(locale, row.value) : ""}</strong>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
