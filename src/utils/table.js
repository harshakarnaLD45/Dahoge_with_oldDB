// Tischplan-Geometrie: Varianten, Sitzpositionen und Verteilung der Plätze.

import i18n from "i18next";
import { useTranslation } from "react-i18next";

// =========================================================
// Translation helper
// =========================================================

const defaultT = (key, options) => i18n.t(key, options);

// =========================================================
// Translation hook
// =========================================================

export function useTableTranslation() {
  const { t } = useTranslation();

  return { t };
}

// =========================================================
// Zehn vordefinierte Tischvarianten
// =========================================================

export const TABLE_PRESETS = [
  {
    id: "E6",
    label: "Eckig · 6 Plätze (3+3)",
    translationKey: "table.presets.E6",
    shape: "rect",
    layout: {
      top: 3,
      bottom: 3,
      left: 0,
      right: 0,
    },
  },

  {
    id: "E8",
    label: "Eckig · 8 Plätze (4+4)",
    translationKey: "table.presets.E8",
    shape: "rect",
    layout: {
      top: 4,
      bottom: 4,
      left: 0,
      right: 0,
    },
  },

  {
    id: "E8S",
    label: "Eckig · 8 mit Stirnplätzen",
    translationKey: "table.presets.E8S",
    shape: "rect",
    layout: {
      top: 3,
      bottom: 3,
      left: 1,
      right: 1,
    },
  },

  {
    id: "E10",
    label: "Eckig · 10 Plätze (5+5)",
    translationKey: "table.presets.E10",
    shape: "rect",
    layout: {
      top: 5,
      bottom: 5,
      left: 0,
      right: 0,
    },
  },

  {
    id: "E10S",
    label: "Eckig · 10 mit Stirnplätzen",
    translationKey: "table.presets.E10S",
    shape: "rect",
    layout: {
      top: 4,
      bottom: 4,
      left: 1,
      right: 1,
    },
  },

  {
    id: "E12",
    label: "Lange Tafel · 12 Plätze",
    translationKey: "table.presets.E12",
    shape: "rect",
    layout: {
      top: 6,
      bottom: 6,
      left: 0,
      right: 0,
    },
  },

  {
    id: "Q8",
    label: "Quadratisch · 8 Plätze",
    translationKey: "table.presets.Q8",
    shape: "square",
    layout: {
      top: 2,
      bottom: 2,
      left: 2,
      right: 2,
    },
  },

  {
    id: "R6",
    label: "Rund · 6 Plätze",
    translationKey: "table.presets.R6",
    shape: "round",
    n: 6,
  },

  {
    id: "R8",
    label: "Rund · 8 Plätze",
    translationKey: "table.presets.R8",
    shape: "round",
    n: 8,
  },

  {
    id: "R10",
    label: "Rund · 10 Plätze",
    translationKey: "table.presets.R10",
    shape: "round",
    n: 10,
  },
];

// =========================================================
// Preset label
// =========================================================

export function presetLabel(preset, t = defaultT) {
  if (!preset) {
    return "";
  }

  return t(
    preset.translationKey || `table.presets.${preset.id}`,
    {
      defaultValue: preset.label,
    },
  );
}

// =========================================================
// Feste Sitzpositionen für rechteckige Tische
// =========================================================

export const RECT_SEATS = (() => {
  const top = [...Array(6)].map(
    (_t, n) => 150 + (260 * n) / 5,
  );

  return [
    ...top.map((x) => ({
      x,
      y: 76,
    })),

    ...top.map((x) => ({
      x,
      y: 264,
    })),

    {
      x: 70,
      y: 170,
    },

    {
      x: 490,
      y: 170,
    },
  ];
})();

// =========================================================
// Feste Sitzpositionen für runde Tische
// =========================================================

export const ROUND_SEATS = [...Array(12)].map((_e, t) => {
  const a = -Math.PI / 2 + (t * Math.PI) / 6;

  return {
    x: 280 + 145 * Math.cos(a),
    y: 170 + 145 * Math.sin(a),
  };
});

// =========================================================
// Preset by ID
// =========================================================

export function presetById(id) {
  return TABLE_PRESETS.find((p) => p.id === id);
}

// =========================================================
// Preset -> Table variant
// =========================================================

export function presetVariant(preset) {
  const seats =
    preset.shape === "round"
      ? preset.n
      : preset.layout.top +
        preset.layout.bottom +
        preset.layout.left +
        preset.layout.right;

  return {
    variant: preset.id,
    shape: preset.shape,
    layout: preset.layout || null,
    n: preset.n || null,
    seats,
  };
}

// =========================================================
// Standard layout
// =========================================================

export function standardLayout(seats) {
  const half = Math.floor(
    Math.min(seats, 14) / 2,
  );

  return {
    variant: "standard",

    shape: "rect",

    layout: {
      top: half,
      bottom: half,
      left: 0,
      right: seats % 2 === 1 ? 1 : 0,
    },

    seats,
  };
}

// =========================================================
// Table label
// =========================================================

export function tischLabel(tisch, t = defaultT) {
  if (!tisch) {
    return "";
  }

  const shape = tisch.custom
    ? tisch.custom.shape
    : tisch.shape;

  const shapeName =
    shape === "round"
      ? t("table.shapes.round", {
          defaultValue: "Round",
        })
      : shape === "square"
        ? t("table.shapes.square", {
            defaultValue: "Square",
          })
        : t("table.shapes.rectangular", {
            defaultValue: "Rectangular",
          });

  return `${shapeName} · ${tisch.seats} ${t(
    "table.seats",
    {
      defaultValue: "seats",
    },
  )}${
    tisch.custom
      ? ` · ${t("table.customLayout", {
          defaultValue: "Custom layout",
        })}`
      : ""
  }`;
}

// =========================================================
// Seat positions
// =========================================================

export function seatPositions(tisch) {
  if (!tisch) {
    return [];
  }

  if (tisch.custom) {
    const fixed =
      tisch.custom.shape === "round"
        ? ROUND_SEATS
        : RECT_SEATS;

    return tisch.custom.slots
      .map((s) => fixed[s])
      .filter(Boolean);
  }

  if (tisch.shape === "round") {
    const n = tisch.n || tisch.seats;

    return [...Array(n)].map((_a, i) => {
      const angle =
        -Math.PI / 2 +
        (i * 2 * Math.PI) / n;

      return {
        x: 280 + 145 * Math.cos(angle),
        y: 170 + 145 * Math.sin(angle),
      };
    });
  }

  const layout =
    tisch.layout ||
    standardLayout(tisch.seats).layout;

  const row = (count, a, b) =>
    count <= 0
      ? []
      : count === 1
        ? [(a + b) / 2]
        : [...Array(count)].map(
            (_s, i) =>
              a +
              ((b - a) * i) /
                (count - 1),
          );

  const seats = [];

  if (tisch.shape === "square") {
    row(
      layout.top,
      220,
      340,
    ).forEach((x) =>
      seats.push({
        x,
        y: 48,
      }),
    );

    row(
      layout.bottom,
      220,
      340,
    ).forEach((x) =>
      seats.push({
        x,
        y: 292,
      }),
    );

    row(
      layout.left,
      120,
      220,
    ).forEach((y) =>
      seats.push({
        x: 150,
        y,
      }),
    );

    row(
      layout.right,
      120,
      220,
    ).forEach((y) =>
      seats.push({
        x: 410,
        y,
      }),
    );
  } else {
    row(
      layout.top,
      150,
      410,
    ).forEach((x) =>
      seats.push({
        x,
        y: 76,
      }),
    );

    row(
      layout.bottom,
      150,
      410,
    ).forEach((x) =>
      seats.push({
        x,
        y: 264,
      }),
    );

    row(
      layout.left,
      140,
      200,
    ).forEach((y) =>
      seats.push({
        x: 70,
        y,
      }),
    );

    row(
      layout.right,
      140,
      200,
    ).forEach((y) =>
      seats.push({
        x: 490,
        y,
      }),
    );
  }

  return seats;
}

// =========================================================
// Distribute seats
// =========================================================

export function distributeSeats(tisch, seats) {
  const shape =
    tisch && tisch.custom
      ? tisch.custom.shape
      : (tisch && tisch.shape) || "rect";

  const umgebung =
    (tisch && tisch.umgebung) || null;

  if (shape === "round") {
    return {
      variant: "round",
      shape: "round",
      n: seats,
      seats,
      umgebung,
    };
  }

  if (shape === "square") {
    const base = Math.floor(seats / 4);
    const rest = seats % 4;

    return {
      variant: "square",
      shape: "square",

      layout: {
        top: base + (rest > 0 ? 1 : 0),
        bottom: base + (rest > 1 ? 1 : 0),
        left: base + (rest > 2 ? 1 : 0),
        right: base,
      },

      seats,
      umgebung,
    };
  }

  const side =
    seats % 2 === 1 ? 1 : 0;

  const pair = seats - side;

  return {
    variant: "rect",
    shape: "rect",

    layout: {
      top: Math.ceil(pair / 2),
      bottom: Math.floor(pair / 2),
      left: 0,
      right: side,
    },

    seats,
    umgebung,
  };
}

// =========================================================
// Umgebung
// =========================================================

export const UMGEBUNG = [
  "Küche",
  "Eingang",
  "Fenster",
  "Theke / Bar",
  "Terrasse",
  "Wand",
  "Kachelofen",
  "Garten",
];

const UMGEBUNG_KEYS = {
  Küche: "kitchen",
  Eingang: "entrance",
  Fenster: "window",
  "Theke / Bar": "counterBar",
  Terrasse: "terrace",
  Wand: "wall",
  Kachelofen: "tiledStove",
  Garten: "garden",
};

// =========================================================
// Umgebung label
// =========================================================

export function umgebungLabel(value, t = defaultT) {
  if (!value) {
    return "";
  }

  const key = UMGEBUNG_KEYS[value];

  return key
    ? t(`table.environment.${key}`, {
        defaultValue: value,
      })
    : value;
}