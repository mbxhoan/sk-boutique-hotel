export const BOOKING_TIME_ZONE = "Asia/Ho_Chi_Minh";

function formatCalendarDateKey(date: Date, timeZone = BOOKING_TIME_ZONE) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric"
  });
  const parts = formatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const day = parts.find((part) => part.type === "day")?.value ?? "";

  return `${year}-${month}-${day}`;
}

export function parseCalendarDateKey(value: string, timeZone = BOOKING_TIME_ZONE) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return formatCalendarDateKey(date, timeZone);
}

export function getTodayCalendarDateKey(now = new Date(), timeZone = BOOKING_TIME_ZONE) {
  return formatCalendarDateKey(now, timeZone);
}

export function isCalendarDateBeforeToday(value: string, now = new Date(), timeZone = BOOKING_TIME_ZONE) {
  const dateKey = parseCalendarDateKey(value, timeZone);

  if (!dateKey) {
    return null;
  }

  return dateKey < getTodayCalendarDateKey(now, timeZone);
}

export function isBookingRequestStayWindowValid(stayStartAt: string, stayEndAt: string, now = new Date(), timeZone = BOOKING_TIME_ZONE) {
  const startKey = parseCalendarDateKey(stayStartAt, timeZone);
  const endKey = parseCalendarDateKey(stayEndAt, timeZone);

  if (!startKey || !endKey) {
    return false;
  }

  if (startKey < getTodayCalendarDateKey(now, timeZone)) {
    return false;
  }

  if (endKey <= startKey) {
    return false;
  }

  return true;
}
