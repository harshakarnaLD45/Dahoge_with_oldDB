import i18n from "i18next";

// ============================================================
// TRANSLATION HELPER
// ============================================================

const t = (key, options) => i18n.t(key, options);

// ============================================================
// WEEK ORDER
// Monday -> Sunday
// ============================================================

export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

// ============================================================
// DAY KEYS
// ============================================================

const DAY_KEYS = {
  0: "sunday",
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
};

// ============================================================
// DAY NAMES
// IMPORTANT:
// These are functions, not static objects.
// They always read the current i18next language.
// ============================================================

export function dayShortName(dayIndex) {
  const key = DAY_KEYS[dayIndex];

  return t(`dates.days.short.${key}`, {
    defaultValue: key,
  });
}

export function dayLongName(dayIndex) {
  const key = DAY_KEYS[dayIndex];

  return t(`dates.days.long.${key}`, {
    defaultValue: key,
  });
}

// ============================================================
// MONTH KEYS
// ============================================================

const MONTH_KEYS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

// ============================================================
// MONTH NAME
// ============================================================

export function monthName(monthIndex) {
  const key = MONTH_KEYS[monthIndex];

  return t(`dates.months.${key}`, {
    defaultValue: new Intl.DateTimeFormat("en-US", {
      month: "long",
    }).format(new Date(2020, monthIndex, 1)),
  });
}

// ============================================================
// DATE KEY
// ============================================================

export function dateKey(date) {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// ============================================================
// NEXT DAYS
// ============================================================

export function nextDays(count) {
  const result = [];

  const now = new Date();

  now.setHours(0, 0, 0, 0);

  for (let i = 0; i < count; i++) {
    const d = new Date(now);

    d.setDate(now.getDate() + i);

    result.push(d);
  }

  return result;
}

// ============================================================
// SHORT DATE
// Example: Mon, 04.08.
// ============================================================

export function shortDate(dateKeyStr) {
  const [y, m, d] = dateKeyStr.split("-").map(Number);

  const date = new Date(y, m - 1, d);

  return `${dayShortName(date.getDay())}, ${String(d).padStart(
    2,
    "0",
  )}.${String(m).padStart(2, "0")}.`;
}

// ============================================================
// LONG DATE
// Example: Monday, 4. August 2026
// ============================================================

export function longDate(dateKeyStr) {
  const [y, m, d] = dateKeyStr.split("-").map(Number);

  const date = new Date(y, m - 1, d);

  return `${dayLongName(date.getDay())}, ${d}. ${monthName(m - 1)} ${y}`;
}

// ============================================================
// DAYS LIST
// ============================================================

export function daysList(days) {
  const list = WEEK_ORDER.filter((i) => days.includes(i));

  if (list.length === 7) {
    return t("dates.daily", {
      defaultValue: "Daily",
    });
  }

  const indexes = list.map((i) => WEEK_ORDER.indexOf(i));

  let contiguous = true;

  for (let i = 1; i < indexes.length; i++) {
    if (indexes[i] !== indexes[i - 1] + 1) {
      contiguous = false;
    }
  }

  if (contiguous && list.length > 2) {
    return `${dayShortName(list[0])}–${dayShortName(
      list[list.length - 1],
    )}`;
  }

  return list.map((i) => dayShortName(i)).join(", ");
}