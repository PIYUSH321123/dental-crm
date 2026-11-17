/**
 * Helpers for generating seed/demo dates relative to today so demo schedules,
 * clinical histories, invoices, and alerts never go stale.
 */

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const MONTHS_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const WEEKDAYS_LONG = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export function getRelativeDate(offsetDays = 0, baseDate: Date = new Date()): Date {
  const d = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  d.setDate(d.getDate() + offsetDays);
  return d;
}

export function getRelativeIsoDate(offsetDays = 0, baseDate: Date = new Date()): string {
  const d = getRelativeDate(offsetDays, baseDate);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function getRelativeIsoTimestamp(
  offsetDays = 0,
  hour = 10,
  minute = 0,
  baseDate: Date = new Date(),
): string {
  const d = getRelativeDate(offsetDays, baseDate);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

/** e.g. "17 Nov" */
export function formatRelativeDayMonth(offsetDays = 0, baseDate: Date = new Date()): string {
  const d = getRelativeDate(offsetDays, baseDate);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

/** e.g. "17 Nov 2026" */
export function formatRelativeFullDate(offsetDays = 0, baseDate: Date = new Date()): string {
  const d = getRelativeDate(offsetDays, baseDate);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

/** e.g. "Thu 19 Nov" */
export function formatRelativeWeekdayDayMonth(
  offsetDays = 0,
  baseDate: Date = new Date(),
): string {
  const d = getRelativeDate(offsetDays, baseDate);
  return `${WEEKDAYS_SHORT[d.getDay()]} ${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

/** e.g. "Tuesday, 17 November" */
export function formatRelativeHeaderDate(offsetDays = 0, baseDate: Date = new Date()): string {
  const d = getRelativeDate(offsetDays, baseDate);
  return `${WEEKDAYS_LONG[d.getDay()]}, ${d.getDate()} ${MONTHS_LONG[d.getMonth()]}`;
}

export function getCurrentYear(baseDate: Date = new Date()): number {
  return baseDate.getFullYear();
}
