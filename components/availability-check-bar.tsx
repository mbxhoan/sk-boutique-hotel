"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type { Locale } from "@/lib/locale";
import { buildRoomsHref } from "@/lib/room-routes";

type AvailabilityCheckBarProps = {
  className?: string;
  initialAdults?: number;
  initialCheckin?: string;
  initialChildren?: number;
  initialCheckout?: string;
  locale: Locale;
  variant?: "hero" | "page";
};

type DateLike = {
  day: number;
  month: number;
  year: number;
};

const dayNames = {
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  vi: ["CN", "Th 2", "Th 3", "Th 4", "Th 5", "Th 6", "Th 7"]
} satisfies Record<Locale, string[]>;

function toStartOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return toStartOfDay(next);
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function isBeforeDay(left: Date, right: Date) {
  return toStartOfDay(left).getTime() < toStartOfDay(right).getTime();
}

function formatDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function parseDateInput(value?: string | null) {
  if (!value) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00`);

  return Number.isNaN(parsed.getTime()) ? null : toStartOfDay(parsed);
}

function formatStayDate(locale: Locale, date: Date) {
  if (locale === "en") {
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short"
    }).format(date);
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "numeric",
    month: "numeric"
  }).format(date).replace("/", " thg ");
}

function formatMonthLabel(locale: Locale, date: Date) {
  if (locale === "en") {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric"
    }).format(date);
  }

  return `Tháng ${date.getMonth() + 1}, ${date.getFullYear()}`;
}

function buildMonthMatrix(monthStart: Date) {
  const firstDay = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1);
  const lastDay = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
  const gridStart = new Date(firstDay);
  gridStart.setDate(firstDay.getDate() - firstDay.getDay());
  const gridEnd = new Date(lastDay);
  gridEnd.setDate(lastDay.getDate() + (6 - lastDay.getDay()));

  const weeks: Date[][] = [];
  let cursor = gridStart;

  while (cursor <= gridEnd) {
    const week: Date[] = [];

    for (let index = 0; index < 7; index += 1) {
      week.push(new Date(cursor));
      cursor = addDays(cursor, 1);
    }

    weeks.push(week);
  }

  return weeks;
}

function formatDateSummary(locale: Locale, start: Date, end: Date) {
  if (locale === "en") {
    return `${formatStayDate(locale, start)} - ${formatStayDate(locale, end)}`;
  }

  return `${formatStayDate(locale, start)} - ${formatStayDate(locale, end)}`;
}

function CalendarIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 18 18" width="18">
      <path
        d="M4 2.75V4.5M14 2.75V4.5M2.75 7H15.25M4.25 4.5H13.75C14.44 4.5 15 5.06 15 5.75V14C15 14.69 14.44 15.25 13.75 15.25H4.25C3.56 15.25 3 14.69 3 14V5.75C3 5.06 3.56 4.5 4.25 4.5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.4"
      />
    </svg>
  );
}

function GuestIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 18 18" width="18">
      <path
        d="M11.5 5.25C11.5 6.63 10.38 7.75 9 7.75C7.62 7.75 6.5 6.63 6.5 5.25C6.5 3.87 7.62 2.75 9 2.75C10.38 2.75 11.5 3.87 11.5 5.25Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.4"
      />
      <path
        d="M4.25 15.25C4.25 12.49 6.24 10.5 9 10.5C11.76 10.5 13.75 12.49 13.75 15.25"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.4"
      />
    </svg>
  );
}

function ChevronIcon({ direction }: { direction: "down" | "left" | "right" }) {
  const rotate = direction === "down" ? 0 : direction === "left" ? 90 : -90;

  return (
    <svg aria-hidden="true" fill="none" height="14" viewBox="0 0 14 14" width="14">
      <path
        d="M3.25 5.25L7 9L10.75 5.25"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        transform={`rotate(${rotate} 7 7)`}
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="14" viewBox="0 0 14 14" width="14">
      <path d="M7 2.5V11.5M2.5 7H11.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="14" viewBox="0 0 14 14" width="14">
      <path d="M2.5 7H11.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
    </svg>
  );
}

function CalendarDay({
  currentMonth,
  day,
  locale,
  onSelect,
  selectedEnd,
  selectedStart
}: {
  currentMonth: number;
  day: Date;
  locale: Locale;
  onSelect: (day: Date) => void;
  selectedEnd: Date;
  selectedStart: Date;
}) {
  const isInCurrentMonth = day.getMonth() === currentMonth;
  const isStart = isSameDay(day, selectedStart);
  const isEnd = isSameDay(day, selectedEnd);
  const isInRange = day > selectedStart && day < selectedEnd;
  const isToday = isSameDay(day, toStartOfDay(new Date()));

  return (
    <button
      className={[
        "availability-calendar__day",
        isInCurrentMonth ? "" : "availability-calendar__day--muted",
        isInRange ? "availability-calendar__day--range" : "",
        isStart ? "availability-calendar__day--start" : "",
        isEnd ? "availability-calendar__day--end" : "",
        isToday ? "availability-calendar__day--today" : ""
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={() => onSelect(day)}
      type="button"
    >
      <span className="availability-calendar__day-number">{day.getDate()}</span>
      {locale === "en" && !isInCurrentMonth ? <span className="availability-calendar__day-month">{day.getMonth() + 1}</span> : null}
    </button>
  );
}

export function AvailabilityCheckBar({
  className,
  initialAdults = 2,
  initialCheckin,
  initialChildren = 0,
  initialCheckout,
  locale,
  variant = "page"
}: AvailabilityCheckBarProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [activePanel, setActivePanel] = useState<"dates" | "guests" | null>(null);
  const [dateSelectionMode, setDateSelectionMode] = useState<"start" | "end">("start");
  const [monthOffset, setMonthOffset] = useState(0);
  const [checkin, setCheckin] = useState(() => parseDateInput(initialCheckin) ?? toStartOfDay(new Date()));
  const [checkout, setCheckout] = useState(() => parseDateInput(initialCheckout) ?? addDays(toStartOfDay(new Date()), 1));
  const [adults, setAdults] = useState(() => Math.max(1, initialAdults));
  const [children, setChildren] = useState(() => Math.max(0, initialChildren));

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;

      if (target && rootRef.current && !rootRef.current.contains(target)) {
        setActivePanel(null);
      }
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActivePanel(null);
      }
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onEscape);

    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onEscape);
    };
  }, []);

  useEffect(() => {
    if (checkout <= checkin) {
      setCheckout(addDays(checkin, 1));
    }
  }, [checkin, checkout]);

  const currentMonth = addMonths(new Date(checkin.getFullYear(), checkin.getMonth(), 1), monthOffset);
  const nextMonth = addMonths(currentMonth, 1);
  const startLabel = formatStayDate(locale, checkin);
  const endLabel = formatStayDate(locale, checkout);
  const summaryLabel =
    locale === "en"
      ? `${adults + children} guests, 1 room`
      : `${adults + children} khách, 1 phòng`;

  const buildHref = () =>
    buildRoomsHref({
      adults,
      checkin: formatDateKey(checkin),
      children,
      checkout: formatDateKey(checkout),
      lang: locale
    });

  const updateRange = (day: Date) => {
    const normalized = toStartOfDay(day);

    if (dateSelectionMode === "start" || normalized <= checkin) {
      setCheckin(normalized);
      setCheckout(addDays(normalized, 1));
      setDateSelectionMode("end");
      return;
    }

    setCheckout(normalized);
  };

  const resetRange = () => {
    const today = toStartOfDay(new Date());
    setCheckin(today);
    setCheckout(addDays(today, 1));
    setMonthOffset(0);
    setDateSelectionMode("start");
  };

  const renderMonth = (month: Date, navigation: { next?: boolean; prev?: boolean }) => {
    const days = buildMonthMatrix(month);

    return (
      <div className="availability-calendar__month">
        <div className="availability-calendar__month-head">
          {navigation.prev ? (
            <button
              className="availability-calendar__month-nav"
              onClick={() => setMonthOffset((current) => current - 1)}
              type="button"
            >
              <ChevronIcon direction="left" />
            </button>
          ) : (
            <span className="availability-calendar__month-nav availability-calendar__month-nav--spacer" aria-hidden="true" />
          )}
          <div className="availability-calendar__month-title">{formatMonthLabel(locale, month)}</div>
          {navigation.next ? (
            <button
              className="availability-calendar__month-nav"
              onClick={() => setMonthOffset((current) => current + 1)}
              type="button"
            >
              <ChevronIcon direction="right" />
            </button>
          ) : (
            <span className="availability-calendar__month-nav availability-calendar__month-nav--spacer" aria-hidden="true" />
          )}
        </div>

        <div className="availability-calendar__weekdays" aria-hidden="true">
          {dayNames[locale].map((dayName) => (
            <span className="availability-calendar__weekday" key={dayName}>
              {dayName}
            </span>
          ))}
        </div>

        <div className="availability-calendar__grid">
          {days.map((week) =>
            week.map((day) => (
              <CalendarDay
                currentMonth={month.getMonth()}
                day={day}
                key={day.toISOString()}
                locale={locale}
                onSelect={updateRange}
                selectedEnd={checkout}
                selectedStart={checkin}
              />
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`availability-check availability-check--${variant}${className ? ` ${className}` : ""}`}
      ref={rootRef}
    >
      <div className="availability-check__fields">
        <div className="availability-check__field-wrap">
          <button
            aria-expanded={activePanel === "dates"}
            aria-haspopup="dialog"
            className="availability-check__field"
            onClick={() => {
              setActivePanel((current) => (current === "dates" ? null : "dates"));
              setDateSelectionMode("start");
              setMonthOffset(0);
            }}
            type="button"
          >
            <span className="availability-check__field-icon">
              <CalendarIcon />
            </span>
            <span className="availability-check__field-copy">
              <span className="availability-check__field-label">{locale === "en" ? "Date" : "Ngày"}</span>
              <span className="availability-check__field-value">{`${startLabel} - ${endLabel}`}</span>
            </span>
            <span className="availability-check__field-chevron" aria-hidden="true">
              <ChevronIcon direction="down" />
            </span>
          </button>

          {activePanel === "dates" ? (
            <div className="availability-check__popover availability-check__popover--dates" role="dialog">
              <div className="availability-check__popover-head">
                <div>
                  <h3 className="availability-check__popover-title">
                    {locale === "en" ? "Selected dates" : "Ngày đã chọn"}
                  </h3>
                  <p className="availability-check__popover-subtitle">{`${startLabel} - ${endLabel}`}</p>
                </div>

                <button className="availability-check__clear" onClick={resetRange} type="button">
                  {locale === "en" ? "Clear selected dates" : "Xóa ngày đã chọn"}
                </button>
              </div>

              <div className="availability-calendar">
                {renderMonth(currentMonth, { prev: true })}
                {renderMonth(nextMonth, { next: true })}
              </div>

              <div className="availability-check__popover-actions">
                <button className="button button--solid availability-check__save" onClick={() => setActivePanel(null)} type="button">
                  {locale === "en" ? "Save" : "Lưu"}
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="availability-check__field-wrap">
          <button
            aria-expanded={activePanel === "guests"}
            aria-haspopup="dialog"
            className="availability-check__field"
            onClick={() => setActivePanel((current) => (current === "guests" ? null : "guests"))}
            type="button"
          >
            <span className="availability-check__field-icon">
              <GuestIcon />
            </span>
            <span className="availability-check__field-copy">
              <span className="availability-check__field-label">{locale === "en" ? "Guests" : "Khách"}</span>
              <span className="availability-check__field-value">{summaryLabel}</span>
            </span>
            <span className="availability-check__field-chevron" aria-hidden="true">
              <ChevronIcon direction="down" />
            </span>
          </button>

          {activePanel === "guests" ? (
            <div className="availability-check__popover availability-check__popover--guests" role="dialog">
              <div className="availability-counts">
                <div className="availability-count">
                  <div>
                    <p className="availability-count__title">{locale === "en" ? "Adults" : "Người lớn"}</p>
                    <p className="availability-count__subtitle">
                      {locale === "en" ? "18 years old and above" : "Từ 18 tuổi trở lên"}
                    </p>
                  </div>

                  <div className="availability-count__controls">
                    <button
                      aria-label={locale === "en" ? "Decrease adults" : "Giảm người lớn"}
                      className="availability-count__control"
                      disabled={adults <= 1}
                      onClick={() => setAdults((current) => Math.max(1, current - 1))}
                      type="button"
                    >
                      <MinusIcon />
                    </button>
                    <span className="availability-count__value">{adults}</span>
                    <button
                      aria-label={locale === "en" ? "Increase adults" : "Tăng người lớn"}
                      className="availability-count__control"
                      onClick={() => setAdults((current) => current + 1)}
                      type="button"
                    >
                      <PlusIcon />
                    </button>
                  </div>
                </div>

                <div className="availability-count">
                  <div>
                    <p className="availability-count__title">{locale === "en" ? "Children" : "Trẻ em"}</p>
                    <p className="availability-count__subtitle">{locale === "en" ? "0 to 17 years old" : "Từ 0 đến 17 tuổi"}</p>
                  </div>

                  <div className="availability-count__controls">
                    <button
                      aria-label={locale === "en" ? "Decrease children" : "Giảm trẻ em"}
                      className="availability-count__control"
                      disabled={children <= 0}
                      onClick={() => setChildren((current) => Math.max(0, current - 1))}
                      type="button"
                    >
                      <MinusIcon />
                    </button>
                    <span className="availability-count__value">{children}</span>
                    <button
                      aria-label={locale === "en" ? "Increase children" : "Tăng trẻ em"}
                      className="availability-count__control"
                      onClick={() => setChildren((current) => current + 1)}
                      type="button"
                    >
                      <PlusIcon />
                    </button>
                  </div>
                </div>
              </div>

              <div className="availability-check__fixed-room">
                <span>{locale === "en" ? "Room" : "Phòng"}</span>
                <strong>{locale === "en" ? "1 room fixed" : "1 phòng cố định"}</strong>
              </div>

              <div className="availability-check__popover-actions">
                <button className="button button--solid availability-check__save" onClick={() => setActivePanel(null)} type="button">
                  {locale === "en" ? "Save" : "Lưu"}
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <Link className="button button--solid availability-check__submit" href={buildHref()}>
          {locale === "en" ? "Check availability" : "Kiểm tra phòng"}
        </Link>
      </div>
    </div>
  );
}
