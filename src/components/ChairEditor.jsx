// Tischplan-Editor: Plätze auf einer Grundform setzen/entfernen (Km im Bundle).

import { useTranslation } from "react-i18next";
import { TableShape, UmgebungLabels } from "./TableSvg";
import { ROUND_SEATS, RECT_SEATS } from "../utils/table";

export function ChairEditor({ shape, slots, onToggle, umgebung }) {
  const { t } = useTranslation();
  const positions = shape === "round" ? ROUND_SEATS : RECT_SEATS;

  const chosen = new Set(slots);

  const umg =
    umgebung && Object.values(umgebung).some(Boolean) ? umgebung : null;

  const pad = umg ? 32 : 0;

  return (
    <svg
      viewBox={`0 ${-pad} 560 ${340 + 2 * pad}`}
      width="100%"
      style={{
        maxWidth: 560,
        display: "block",
        margin: "0 auto",
      }}
      role="group"
      aria-label={t("chairEditor.arrangeSeats")}
    >
      <TableShape shape={shape} />

      {umg && <UmgebungLabels umg={umg} />}

      {positions.map((pos, p) => {
        const on = chosen.has(p);

        return (
          <g
            key={p}
            className="ghostchair"
            role="button"
            tabIndex={0}
            aria-label={
              on
                ? t("chairEditor.removeSeat", {
                    number: p + 1,
                  })
                : t("chairEditor.addSeat", {
                    number: p + 1,
                  })
            }
            onClick={() => onToggle(p)}
            onKeyDown={(ev) => {
              if (ev.key === "Enter" || ev.key === " ") {
                ev.preventDefault();
                onToggle(p);
              }
            }}
          >
            <circle
              cx={pos.x}
              cy={pos.y}
              r={21}
              fill={on ? "var(--kobalt)" : "#fff"}
              stroke={on ? "var(--kobalt-dunkel)" : "#B9BECF"}
              strokeWidth={on ? 2.5 : 2}
              strokeDasharray={on ? "0" : "5 4"}
            />

            <text
              x={pos.x}
              y={pos.y + 5.5}
              textAnchor="middle"
              fontSize={on ? 17 : 15}
              fontWeight="700"
              fill={on ? "#fff" : "#9AA0B4"}
            >
              {on ? "✓" : "+"}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
