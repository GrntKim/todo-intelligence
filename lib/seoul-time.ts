// Asia/Seoul has been a fixed UTC+9 offset with no DST since 1961, so plain
// offset arithmetic is correct here without pulling in a timezone library.
const SEOUL_OFFSET_MS = 9 * 60 * 60 * 1000;

function seoulParts(date: Date) {
  const shifted = new Date(date.getTime() + SEOUL_OFFSET_MS);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth(),
    date: shifted.getUTCDate(),
    day: shifted.getUTCDay(), // 0 = Sunday
  };
}

function seoulMidnightUTC(year: number, month: number, date: number): Date {
  return new Date(Date.UTC(year, month, date, 0, 0, 0, 0) - SEOUL_OFFSET_MS);
}

/** Start/end (inclusive) of today's calendar date in Seoul, as UTC instants. */
export function seoulDayRange(now: Date): { start: Date; end: Date } {
  const { year, month, date } = seoulParts(now);
  return {
    start: seoulMidnightUTC(year, month, date),
    end: new Date(seoulMidnightUTC(year, month, date + 1).getTime() - 1),
  };
}

/** Start (00:00) of this calendar week's Monday in Seoul, as a UTC instant. */
export function seoulWeekStart(now: Date): Date {
  const { year, month, date, day } = seoulParts(now);
  const daysSinceMonday = (day + 6) % 7; // Sunday(0) -> 6, Monday(1) -> 0, ...
  return seoulMidnightUTC(year, month, date - daysSinceMonday);
}

/** End (23:59:59.999) of this calendar week's Sunday in Seoul, as a UTC instant. */
export function seoulWeekEnd(now: Date): Date {
  const { year, month, date, day } = seoulParts(now);
  const daysUntilSunday = (7 - day) % 7;
  return new Date(
    seoulMidnightUTC(year, month, date + daysUntilSunday + 1).getTime() - 1,
  );
}

/** "YYYY-MM-DD" label for a UTC instant, read as its Seoul calendar date. */
export function seoulDateLabel(date: Date): string {
  const { year, month, date: day } = seoulParts(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}
