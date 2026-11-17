export type ClinicTimeFormat = "12h" | "24h";

/**
 * Parses a time value into minutes since midnight (0..1439).
 * Accepts:
 *  - decimal hours (e.g. 9.5 -> 570, 14.25 -> 855)
 *  - 24-hour strings (e.g. "09:30", "14:30")
 *  - 12-hour strings with AM/PM (e.g. "9:30 AM", "2:30 PM", "12:00 pm")
 *  - clinic-hour strings without AM/PM (e.g. "1:00" -> 13:00, "4:30" -> 16:30)
 */
export function parseTimeToMinutes(value: string | number): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    const total = Math.round(value * 60);
    return Math.max(0, Math.min(23 * 60 + 59, total));
  }

  const raw = String(value ?? "").trim();
  if (!raw || raw === "—") return 0;

  const match = raw.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (!match) return 0;

  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const meridiem = match[3]?.toLowerCase();

  if (meridiem === "am") {
    if (hours === 12) hours = 0;
  } else if (meridiem === "pm") {
    if (hours < 12) hours += 12;
  } else if (hours >= 1 && hours <= 7) {
    // Clinic operating hours are daytime (8:00 AM - 8:00 PM), so bare 1:00..7:59 means PM
    hours += 12;
  }

  return Math.max(0, Math.min(23 * 60 + 59, hours * 60 + minutes));
}

export function minutesToDecimalHour(minutes: number): number {
  return Math.round((minutes / 60) * 100) / 100;
}

/**
 * Formats a time (decimal hour or string) in a single consistent clinic format.
 * Default is 12-hour with uppercase AM/PM (e.g. "9:30 AM", "2:30 PM").
 */
export function formatClinicTime(
  value: string | number,
  format: ClinicTimeFormat = "12h",
): string {
  if (typeof value === "string" && (!value.trim() || value.trim() === "—")) {
    return "—";
  }

  const totalMinutes = parseTimeToMinutes(value);
  const hours24 = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  const mm = String(minutes).padStart(2, "0");

  if (format === "24h") {
    return `${String(hours24).padStart(2, "0")}:${mm}`;
  }

  const meridiem = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12}:${mm} ${meridiem}`;
}

export function formatTimeRange(
  start: string | number,
  end: string | number,
  format: ClinicTimeFormat = "12h",
): string {
  return `${formatClinicTime(start, format)} – ${formatClinicTime(end, format)}`;
}

/**
 * Returns a new array sorted chronologically by parsed time.
 */
export function sortByTime<T>(
  items: T[],
  getTime: (item: T) => string | number,
): T[] {
  return [...items].sort(
    (a, b) => parseTimeToMinutes(getTime(a)) - parseTimeToMinutes(getTime(b)),
  );
}
