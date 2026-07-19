/**
 * ISO-8601 week helpers.
 *
 * Everything here works in UTC internally and treats dates as plain calendar
 * dates ('YYYY-MM-DD'), matching Postgres `date` columns. "Today" is resolved
 * against Europe/Oslo rather than the host clock — Vercel runs in UTC, which
 * would otherwise flip the current week an hour or two early.
 */

const TIMEZONE = 'Europe/Oslo';
const MS_PER_DAY = 86_400_000;

export type IsoWeek = { year: number; week: number };

const osloParts = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** Today's calendar date in Oslo, as 'YYYY-MM-DD'. */
export function todayIso(now: Date = new Date()): string {
  return osloParts.format(now); // en-CA formats as YYYY-MM-DD
}

/** Parse 'YYYY-MM-DD' into a UTC-midnight Date. */
export function parseIsoDate(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** Format a UTC Date back to 'YYYY-MM-DD'. */
export function formatIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

/** ISO weekday: 1 = Monday … 7 = Sunday. */
export function isoWeekday(date: Date): number {
  return date.getUTCDay() || 7;
}

/**
 * ISO week number and ISO week-year for a date.
 *
 * The ISO year is not always the calendar year: 2027-01-01 falls in week 53 of
 * ISO year 2026, so the year is read off the Thursday of the same week.
 */
export function getIsoWeek(date: Date): IsoWeek {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  d.setUTCDate(d.getUTCDate() + 4 - isoWeekday(d)); // jump to this week's Thursday
  const yearStart = Date.UTC(d.getUTCFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - yearStart) / MS_PER_DAY + 1) / 7);
  return { year: d.getUTCFullYear(), week };
}

export function currentIsoWeek(now: Date = new Date()): IsoWeek {
  return getIsoWeek(parseIsoDate(todayIso(now)));
}

/** Monday (UTC midnight) that starts the given ISO week. */
export function isoWeekStart({ year, week }: IsoWeek): Date {
  // Jan 4 is by definition always in ISO week 1.
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const week1Monday = addDays(jan4, 1 - isoWeekday(jan4));
  return addDays(week1Monday, (week - 1) * 7);
}

/** The seven dates of an ISO week, Monday first. */
export function isoWeekDates(week: IsoWeek): Date[] {
  const start = isoWeekStart(week);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

/** ISO years contain either 52 or 53 weeks. */
export function weeksInIsoYear(year: number): number {
  const jan1Weekday = (y: number) =>
    isoWeekday(new Date(Date.UTC(y, 0, 1)));
  const dec31Weekday = (y: number) =>
    isoWeekday(new Date(Date.UTC(y, 11, 31)));
  return jan1Weekday(year) === 4 || dec31Weekday(year) === 4 ? 53 : 52;
}

export function shiftIsoWeek(current: IsoWeek, delta: number): IsoWeek {
  let { year, week } = current;
  week += delta;
  while (week < 1) {
    year -= 1;
    week += weeksInIsoYear(year);
  }
  let max = weeksInIsoYear(year);
  while (week > max) {
    week -= max;
    year += 1;
    max = weeksInIsoYear(year);
  }
  return { year, week };
}

// --- Display ----------------------------------------------------------------

const dayLabel = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'UTC',
  weekday: 'short',
  day: 'numeric',
  month: 'short',
});

const shortLabel = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'UTC',
  day: 'numeric',
  month: 'short',
});

/** e.g. "Mon 21 Jul" */
export function formatDayLabel(value: string | Date): string {
  const date = typeof value === 'string' ? parseIsoDate(value) : value;
  return dayLabel.format(date);
}

/** e.g. "21 Jul" */
export function formatShort(value: string | Date): string {
  const date = typeof value === 'string' ? parseIsoDate(value) : value;
  return shortLabel.format(date);
}

/** e.g. "20 Jul – 26 Jul" */
export function formatWeekRange(week: IsoWeek): string {
  const dates = isoWeekDates(week);
  return `${formatShort(dates[0])} – ${formatShort(dates[6])}`;
}

export const WEEKDAY_NAMES = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const WEEKDAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * Next on-site date at or after `from`, given ISO weekday numbers.
 * Returns null when no days are configured.
 */
export function nextOnSiteDate(
  onSiteDays: number[],
  from: string = todayIso(),
): string | null {
  if (!onSiteDays.length) return null;
  const start = parseIsoDate(from);
  for (let i = 0; i < 14; i++) {
    const candidate = addDays(start, i);
    if (onSiteDays.includes(isoWeekday(candidate))) {
      return formatIsoDate(candidate);
    }
  }
  return null;
}
