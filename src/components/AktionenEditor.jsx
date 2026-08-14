// Aktions-Editor: Zeitraum, Titel, Angebot, optional eigene Zeiten / täglich.

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { buildSlots } from "../utils/format";
import { aktionRange } from "../utils/aktion";

export function AktionenEditor({ aktionen, onChange, showToast }) {

  const{t}=useTranslation();
  let [titel, setTitel] = useState("");
  let [von, setVon] = useState("");
  let [bis, setBis] = useState("");
  let [angebot, setAngebot] = useState("");
  let [alleTage, setAlleTage] = useState(false);
  let [eigeneZeiten, setEigeneZeiten] = useState(false);
  let [zvon, setZvon] = useState("18:00");
  let [zbis, setZbis] = useState("20:00");
  let [takt, setTakt] = useState(60);

  let sorted = (aktionen || [])
    .slice()
    .sort((a, b) => a.von.localeCompare(b.von));

  let add = () => {
    if (titel.trim().length < 3 || !von || !bis) return;

    if (bis < von) {
      showToast?.(
        t("aktionen.validation.invalidDateRange"),
      );
      return;
    }

    let entry = {
      id: `a-${Date.now() % 1e6}`,
      titel: titel.trim(),
      von,
      bis,
      angebot: angebot.trim(),
      alleTage,
      slots: eigeneZeiten ? buildSlots(zvon, zbis, takt) : [],
    };

    onChange([...(aktionen || []), entry]);

    setTitel("");
    setVon("");
    setBis("");
    setAngebot("");
    setAlleTage(false);
    setEigeneZeiten(false);
  };

  let remove = (id) =>
    onChange((aktionen || []).filter((a) => a.id !== id));

  return (
    <div>
      {sorted.length > 0 && (
        <div
          style={{
            display: "grid",
            gap: 8,
            marginBottom: 12,
          }}
        >
          {sorted.map((a) => (
            <div
              key={a.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 10,
                flexWrap: "wrap",
                border: "1px solid var(--honig)",
                background: "#FDF6E7",
                borderRadius: 10,
                padding: "10px 12px",
                fontSize: 14,
              }}
            >
              <span>
                <b>{a.titel}</b> · {aktionRange(a)}

                {a.slots && a.slots.length > 0 && (
                  <span style={{ color: "#5B627A" }}>
                    {" "}
                    · {a.slots.join(", ")}
                    {t("aktionen.time.hour")}
                  </span>
                )}

                {a.alleTage && (
                  <span style={{ color: "var(--moos)" }}>
                    {" "}
                    · {t("aktionen.dailyBookable")}
                  </span>
                )}

                {a.angebot && (
                  <div style={{ color: "#5B627A" }}>
                    {a.angebot}
                  </div>
                )}
              </span>

              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => remove(a.id)}
              >
                {t("aktionen.remove")}
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="form-grid">
        <div>
          <label
            className="label"
            htmlFor="ak-titel"
            style={{ fontWeight: 500 }}
          >
            {t("aktionen.form.title")}
          </label>

          <input
            id="ak-titel"
            className="input"
            value={titel}
            onChange={(e) => setTitel(e.target.value)}
            placeholder={t("aktionen.form.titlePlaceholder")}
          />
        </div>

        <div>
          <label
            className="label"
            htmlFor="ak-von"
            style={{ fontWeight: 500 }}
          >
            {t("aktionen.form.from")}
          </label>

          <input
            id="ak-von"
            type="date"
            className="input"
            value={von}
            onChange={(e) => setVon(e.target.value)}
          />
        </div>

        <div>
          <label
            className="label"
            htmlFor="ak-bis"
            style={{ fontWeight: 500 }}
          >
            {t("aktionen.form.to")}
          </label>

          <input
            id="ak-bis"
            type="date"
            className="input"
            value={bis}
            onChange={(e) => setBis(e.target.value)}
          />
        </div>

        <div>
          <label
            className="label"
            htmlFor="ak-angebot"
            style={{ fontWeight: 500 }}
          >
            {t("aktionen.form.specialOffer")}
          </label>

          <input
            id="ak-angebot"
            className="input"
            value={angebot}
            onChange={(e) => setAngebot(e.target.value)}
            placeholder={t("aktionen.form.specialOfferPlaceholder")}
          />
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gap: 8,
          marginTop: 10,
        }}
      >
        <label
          style={{
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          <input
            type="checkbox"
            checked={alleTage}
            onChange={(e) => setAlleTage(e.target.checked)}
            style={{ marginTop: 3 }}
          />

          <span>
            {t("aktionen.dailyPeriod")}{" "}
            <b>{t("aktionen.daily")}</b>{" "}
            {t("aktionen.dailyDescription")}
          </span>
        </label>

        <label
          style={{
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          <input
            type="checkbox"
            checked={eigeneZeiten}
            onChange={(e) => setEigeneZeiten(e.target.checked)}
            style={{ marginTop: 3 }}
          />

          <span>
            {t("aktionen.customTimes")}
          </span>
        </label>

        {eigeneZeiten && (
          <div className="form-grid">
            <div>
              <label
                className="label"
                htmlFor="ak-zvon"
                style={{ fontWeight: 500 }}
              >
                {t("aktionen.form.bookableFrom")}
              </label>

              <input
                id="ak-zvon"
                type="time"
                className="input"
                value={zvon}
                onChange={(e) => setZvon(e.target.value)}
              />
            </div>

            <div>
              <label
                className="label"
                htmlFor="ak-zbis"
                style={{ fontWeight: 500 }}
              >
                {t("aktionen.form.to")}
              </label>

              <input
                id="ak-zbis"
                type="time"
                className="input"
                value={zbis}
                onChange={(e) => setZbis(e.target.value)}
              />
            </div>

            <div>
              <label
                className="label"
                htmlFor="ak-takt"
                style={{ fontWeight: 500 }}
              >
                {t("aktionen.form.interval")}
              </label>

              <select
                id="ak-takt"
                className="input"
                value={takt}
                onChange={(e) => setTakt(Number(e.target.value))}
              >
                <option value={30}>
                  {t("aktionen.intervals.every30")}
                </option>

                <option value={60}>
                  {t("aktionen.intervals.every60")}
                </option>

                <option value={90}>
                  {t("aktionen.intervals.every90")}
                </option>

                <option value={120}>
                  {t("aktionen.intervals.every120")}
                </option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
          marginTop: 12,
          flexWrap: "wrap",
        }}
      >
        <span className="notice">
          {t("aktionen.notice")}
        </span>

        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={add}
          disabled={titel.trim().length < 3 || !von || !bis}
        >
          {t("aktionen.add")}
        </button>
      </div>
    </div>
  );
}