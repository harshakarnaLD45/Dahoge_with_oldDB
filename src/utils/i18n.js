// Zweisprachiger Kurzhelfer für Komponenten: v(Deutsch, Englisch).
// Liest die Sprache bei jedem Aufruf, damit Sprachwechsel ohne Neuladen greifen.
export const v = (de, en) =>
  (localStorage.getItem("language") || "de").startsWith("de") ? de : en;
