import { BOOKING_TIME_ZONE } from "@/lib/booking-dates";

export const ROOM_STATUS_LOOKAHEAD_DAYS = 365;
export const ROOM_STATUS_DEFAULT_DAYS = 1;
const VIETNAM_UTC_OFFSET = "+07:00";

export const roomOperationalStatuses = ["available", "occupied", "cleaning", "maintenance"] as const;
export const roomOperationalOverrideStatuses = roomOperationalStatuses.filter((status) => status !== "available") as Array<
  Exclude<(typeof roomOperationalStatuses)[number], "available">
>;

export type RoomOperationalStatus = (typeof roomOperationalStatuses)[number];
export type RoomOperationalOverrideStatus = (typeof roomOperationalOverrideStatuses)[number];

export type RoomDateWindow = {
  endDate: string;
  startDate: string;
};

const dateKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  day: "2-digit",
  month: "2-digit",
  timeZone: BOOKING_TIME_ZONE,
  year: "numeric"
});

function formatDateKeyFromParts(date: Date) {
  const parts = dateKeyFormatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const day = parts.find((part) => part.type === "day")?.value ?? "";

  return `${year}-${month}-${day}`;
}

function compareDateKeys(left: string, right: string) {
  if (left === right) {
    return 0;
  }

  return left < right ? -1 : 1;
}

export function formatHotelDateKey(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return formatDateKeyFromParts(date);
}

export function parseHotelDateKey(value?: string | null) {
  if (!value) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00${VIETNAM_UTC_OFFSET}`);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return formatDateKeyFromParts(parsed) === value ? parsed : null;
}

export function getTodayHotelDateKey(now = new Date()) {
  return formatDateKeyFromParts(now);
}

export function addHotelDays(dateKey: string, amount: number) {
  const base = parseHotelDateKey(dateKey);

  if (!base) {
    return null;
  }

  const next = new Date(base);
  next.setUTCDate(next.getUTCDate() + amount);

  return formatDateKeyFromParts(next);
}

export function normalizeDateWindow(startValue?: string | null, endValue?: string | null) {
  const today = getTodayHotelDateKey();
  const fallbackStart = parseHotelDateKey(startValue) ? startValue! : parseHotelDateKey(endValue) ? endValue! : today;
  const fallbackEnd = parseHotelDateKey(endValue) ? endValue! : parseHotelDateKey(startValue) ? startValue! : fallbackStart;

  if (compareDateKeys(fallbackStart, fallbackEnd) <= 0) {
    return { endDate: fallbackEnd, startDate: fallbackStart };
  }

  return { endDate: fallbackStart, startDate: fallbackEnd };
}

export function buildDayRangeTimestamps(startDate: string, endDate: string) {
  const start = parseHotelDateKey(startDate);
  const endBase = parseHotelDateKey(endDate);
  const endNextDate = endBase ? addHotelDays(endDate, 1) : null;
  const end = endNextDate ? parseHotelDateKey(endNextDate) : null;

  if (!start || !end) {
    return null;
  }

  return {
    endAt: end.toISOString(),
    startAt: start.toISOString()
  };
}

export function timestampWindowToDateWindow(startAt: string, endAt: string): RoomDateWindow | null {
  const start = new Date(startAt);
  const end = new Date(endAt);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end.getTime() <= start.getTime()) {
    return null;
  }

  const inclusiveEnd = new Date(end.getTime() - 1);
  const startDate = formatHotelDateKey(start);
  const endDate = formatHotelDateKey(inclusiveEnd);

  if (!startDate || !endDate) {
    return null;
  }

  return { endDate, startDate };
}

export function mergeDateWindows(windows: RoomDateWindow[]) {
  const normalized = windows
    .filter((window) => compareDateKeys(window.startDate, window.endDate) <= 0)
    .sort((left, right) => compareDateKeys(left.startDate, right.startDate));

  const merged: RoomDateWindow[] = [];

  for (const window of normalized) {
    const current = merged[merged.length - 1];

    if (!current) {
      merged.push({ ...window });
      continue;
    }

    const currentEndNext = addHotelDays(current.endDate, 1);

    if (currentEndNext && compareDateKeys(window.startDate, currentEndNext) <= 0) {
      if (compareDateKeys(window.endDate, current.endDate) > 0) {
        current.endDate = window.endDate;
      }
      continue;
    }

    merged.push({ ...window });
  }

  return merged;
}

export function buildAvailableDateWindows({
  blockedWindows,
  maxDate,
  minDate
}: {
  blockedWindows: RoomDateWindow[];
  maxDate: string;
  minDate: string;
}) {
  if (compareDateKeys(minDate, maxDate) > 0) {
    return [] as RoomDateWindow[];
  }

  const mergedBlocked = mergeDateWindows(
    blockedWindows
      .map((window) => {
        const startDate = compareDateKeys(window.startDate, minDate) < 0 ? minDate : window.startDate;
        const endDate = compareDateKeys(window.endDate, maxDate) > 0 ? maxDate : window.endDate;

        return compareDateKeys(startDate, endDate) <= 0 ? { endDate, startDate } : null;
      })
      .filter((window): window is RoomDateWindow => Boolean(window))
  );

  const availableWindows: RoomDateWindow[] = [];
  let cursor = minDate;

  for (const blocked of mergedBlocked) {
    if (compareDateKeys(cursor, blocked.startDate) < 0) {
      const endDate = addHotelDays(blocked.startDate, -1);

      if (endDate && compareDateKeys(cursor, endDate) <= 0) {
        availableWindows.push({ endDate, startDate: cursor });
      }
    }

    const nextCursor = addHotelDays(blocked.endDate, 1);

    if (!nextCursor) {
      return availableWindows;
    }

    if (compareDateKeys(nextCursor, cursor) > 0) {
      cursor = nextCursor;
    }
  }

  if (compareDateKeys(cursor, maxDate) <= 0) {
    availableWindows.push({ endDate: maxDate, startDate: cursor });
  }

  return availableWindows;
}

export function dateKeyInWindow(dateKey: string, window: RoomDateWindow) {
  return compareDateKeys(dateKey, window.startDate) >= 0 && compareDateKeys(dateKey, window.endDate) <= 0;
}
