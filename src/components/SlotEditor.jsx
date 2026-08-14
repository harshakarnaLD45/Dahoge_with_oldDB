import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";

function buildTimeRanges(interval) {
  const ranges = [];
  const totalMinutes = 24 * 60;

  for (let start = 0; start < totalMinutes; start += interval) {
    const end = start + interval;

    if (end > totalMinutes) {
      break;
    }

    const startHour = String(Math.floor(start / 60)).padStart(2, "0");
    const startMinute = String(start % 60).padStart(2, "0");

    const endHour = String(Math.floor(end / 60)).padStart(2, "0");
    const endMinute = String(end % 60).padStart(2, "0");

    ranges.push({
      start: `${startHour}:${startMinute}`,
      end: `${endHour}:${endMinute}`,
    });
  }

  return ranges;
}

function TimeRangeSelect({ ranges, selectedSlots, onToggle }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const selectedCount = ranges.filter((range) =>
    selectedSlots.has(range.start),
  ).length;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          width: "100%",
          height: 54,
          padding: "0 14px",
          borderRadius: 10,
          border: "1px solid #D4D1C8",
          background: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: "#1F2F5B",
          fontSize: 15,
          cursor: "pointer",
          textAlign: "left",
          boxSizing: "border-box",
        }}
      >
        <span>
          {t("host.cfg.times.selectedCount", {
            selected: selectedCount,
            total: ranges.length,
          })}
        </span>

        <span
          style={{
            fontSize: 16,
            color: "#1F2F5B",
          }}
        >
          {open ? "▲" : "▼"}
        </span>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            zIndex: 1000,
            background: "#FFFFFF",
            border: "1px solid #D4D1C8",
            borderRadius: 10,
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
            maxHeight: 300,
            overflowY: "auto",
            padding: 6,
          }}
        >
          {ranges.map((range) => {
            const selected = selectedSlots.has(range.start);

            return (
              <button
                key={range.start}
                type="button"
                onClick={() => onToggle(range)}
                style={{
                  width: "100%",
                  minHeight: 42,
                  padding: "8px 10px",
                  border: "none",
                  borderRadius: 7,
                  background: selected ? "#EEF2FA" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  color: "#1F2F5B",
                  cursor: "pointer",
                  fontSize: 14,
                  textAlign: "left",
                }}
              >
                <span
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    border: selected
                      ? "1px solid #1F376D"
                      : "1px solid #B8B8B8",
                    background: selected ? "#1F376D" : "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FFFFFF",
                    fontSize: 12,
                    flexShrink: 0,
                  }}
                >
                  {selected ? "✓" : ""}
                </span>

                <span>
                  {range.start} – {range.end}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatDisplayDate(date, language) {
  return date.toLocaleDateString(language === "de" ? "de-DE" : "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function SlotEditor({
  dayName,
  slots,
  onChange,

  // Pass the reservation belonging to this particular weekday.
  existingReservation = null,

  // Called when the user removes the day's times (e.g. unselect the chip).
  onRemove,
}) {
  const { t, i18n } = useTranslation();

  const [takt, setTakt] = useState(60);

  const timeRanges = useMemo(() => buildTimeRanges(takt), [takt]);

  const selectedSet = useMemo(() => new Set(slots), [slots]);

  const hasSelection = slots.length > 0;

  const hasExistingReservation = Boolean(existingReservation);

  const effectiveDate = useMemo(() => {
    if (!existingReservation?.date) {
      return null;
    }

    const date = new Date(`${existingReservation.date}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date;
  }, [existingReservation]);

  const toggleTimeRange = useCallback(
    (range) => {
      const value = range.start;

      const next = selectedSet.has(value)
        ? slots.filter((slot) => slot !== value)
        : [...slots, value].sort();

      onChange(next);
    },
    [slots, selectedSet, onChange],
  );

  const clearAll = useCallback(() => {
    onChange([]);

    // Unselect the day chip as well: removing a day's times means the day
    // is no longer bookable at all.
    if (typeof onRemove === "function") {
      onRemove();
    }
  }, [onChange, onRemove]);

  const getTimeRangeLabel = () => {
    if (takt === 30) {
      return t("host.cfg.times.slotCount", { count: 48 });
    }

    if (takt === 60) {
      return t("host.cfg.times.hourCount", { count: 24 });
    }

    if (takt === 90) {
      return t("host.cfg.times.slotCount", { count: 16 });
    }

    return t("host.cfg.times.slotCount", { count: 12 });
  };

  return (
    <div>
      {/* =====================================================
          EXISTING RESERVATION WARNING
          ===================================================== */}

      {hasExistingReservation && effectiveDate && (
        <div
          style={{
            marginBottom: 10,
            padding: "8px 10px",
            border: "1px solid #D8B36A",
            borderRadius: 7,
            background: "#FFF8E8",
            color: "#5B4A2A",
            fontSize: 12,
            lineHeight: 1.4,
          }}
        >
          <strong>
            {t("host.cfg.times.existingReservationTitle", {
              dayName,
            })}
          </strong>

          <div style={{ marginTop: 3 }}>
            {t("host.cfg.times.existingReservationText", {
              date: formatDisplayDate(effectiveDate, i18n.language),
            })}
          </div>
        </div>
      )}

      {/* =====================================================
          NO EXISTING RESERVATION
          ===================================================== */}

      {!hasExistingReservation && (
        <div
          style={{
            marginBottom: 12,
            fontSize: 12,
            color: "#5B627A",
          }}
        >
          {t("host.cfg.times.noExistingReservation")}
        </div>
      )}

      {/* =====================================================
          NO SLOTS SELECTED
          ===================================================== */}

      {!hasSelection ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: 14,
              color: "#5B627A",
            }}
          >
            {t("host.cfg.times.unavailable")}
          </span>

          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => {
              onChange(timeRanges.map((range) => range.start));
            }}
            title={t("host.cfg.times.addTimeSlots")}
          >
            + {t("host.cfg.times.timeSlots")}
          </button>
        </div>
      ) : (
        <div>
          {/* =================================================
              INTERVAL + TIME RANGE
              ================================================= */}

          <div
            className="slot-editor-controls"
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(180px, 1fr) minmax(250px, 1fr)",
              gap: 14,
              marginBottom: 10,
            }}
          >
            {/* INTERVAL */}

            <div>
              <label
                className="label"
                style={{
                  fontWeight: 600,
                }}
              >
                {t("host.cfg.times.interval")}
              </label>

              <select
                className="input"
                value={takt}
                onChange={(e) => setTakt(Number(e.target.value))}
                style={{
                  height: 54,
                  borderRadius: 10,
                  width: "100%",
                  boxSizing: "border-box",
                }}
              >
                <option value={30}>
                  {t("host.cfg.times.minutes", { count: 30 })}
                </option>

                <option value={60}>
                  {t("host.cfg.times.minutes", { count: 60 })}
                </option>

                <option value={90}>
                  {t("host.cfg.times.minutes", { count: 90 })}
                </option>

                <option value={120}>
                  {t("host.cfg.times.minutes", { count: 120 })}
                </option>
              </select>
            </div>

            {/* TIME RANGE */}

            <div>
              <label
                className="label"
                style={{
                  fontWeight: 600,
                }}
              >
                {getTimeRangeLabel()}
              </label>

              <TimeRangeSelect
                ranges={timeRanges}
                selectedSlots={selectedSet}
                onToggle={toggleTimeRange}
              />
            </div>
          </div>

          {/* =================================================
              REMOVE
              ================================================= */}

          <div
            style={{
              display: "flex",
              gap: 8,
              marginTop: 12,
            }}
          >
            <button
              type="button"
              onClick={clearAll}
              style={{
                color: "#B4443C",
                width: "80px",
                height: "40px",
                borderRadius: "12px",
                fontSize: "14px",
                border: "1px solid #B4443C",
                background: "#FFFFFF",
                cursor: "pointer",
              }}
            >
              {t("host.cfg.times.remove")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}