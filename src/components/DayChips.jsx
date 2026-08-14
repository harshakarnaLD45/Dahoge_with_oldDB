// Weekday selection as chips (Monday to Sunday).

import { dayLongName, WEEK_ORDER } from "../utils/dates";

export function DayChips({ days = [], onChange, protectedDays = new Set() }) {
  const toggle = (day) => {
    let nextDays;

    if (days.includes(day)) {
      nextDays = days.filter((d) => d !== day);
    } else {
      nextDays = [...days, day];
    }

    // Always keep Monday → Sunday order.
    nextDays.sort(
      (a, b) => WEEK_ORDER.indexOf(a) - WEEK_ORDER.indexOf(b),
    );

    onChange(nextDays);
  };

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
      }}
    >
      {WEEK_ORDER.map((day) => {
        const selected = days.includes(day);

        const protectedDay = protectedDays.has(day);

        return (
          <button
            key={day}
            type="button"
            className={`chip ${selected ? "on" : ""} ${
              protectedDay ? "protect" : ""
            }`}
            onClick={() => toggle(day)}
            aria-pressed={selected}
          >
            {dayLongName(day)}

            {protectedDay && (
              <span className="chip-dot" aria-hidden="true" />
            )}
          </button>
        );
      })}
    </div>
  );
}