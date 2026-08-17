// Sondertermine: geschlossene Tage ("zu") und Sonderöffnungen ("offen").
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { buildSlots } from "../utils/format";
import { shortDate } from "../utils/dates";
import { compressImage } from "../utils/images";

export function Sondertermine({ sonder, onChange, standardSlots, showToast }) {
  const { t } = useTranslation();

  let [date, setDate] = useState("");
  let [typ, setTyp] = useState("zu");
  let [von, setVon] = useState("18:00");
  let [bis, setBis] = useState("20:00");
  let [takt, setTakt] = useState(60);
  let [note, setNote] = useState("");
  let [bild, setBild] = useState(null);

  let fileRef = useRef(null);

  let entries = Object.entries(sonder || {}).sort((a, b) =>
    a[0].localeCompare(b[0]),
  );

  const pickBild = async (e) => {
    const file = e.target.files?.[0];

    e.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      if (showToast) {
        showToast(t("sondertermine.errors.imageOnly"));
      }

      return;
    }

    try {
      const imageData = await compressImage(file, 800, 0.7);

      setBild(imageData);
    } catch (err) {
      if (showToast) {
        showToast(t("sondertermine.errors.imageProcessing"));
      }
    }
  };

  const add = () => {
    if (!date) {
      return;
    }

    // Closed days only
    if (typ !== "zu") {
      return;
    }

    // IMPORTANT:
    // Closed days must NEVER contain an image.
    const entry = {
      typ: "zu",
      note: note.trim(),
      bild: "",
    };

   

    onChange(date, entry);

    // Reset form
    setDate("");
    setNote("");
    setBild(null);
  };

  const saveSpecialOpening = () => {
    if (!date) {
      return;
    }

    if (typ !== "offen") {
      return;
    }

    const slots = buildSlots(von, bis, takt);

    if (!slots.length) {
      return;
    }

    const entry = {
      typ: "offen",
      slots,
      note: note.trim(),
    };

    if (bild) {
      entry.bild = bild;
    }

    onChange(date, entry);
  };

  let remove = (d) => {
    onChange(d, null);
  };

  return (
    <div>
      {/* =========================
        EXISTING SPECIAL DATES
       ========================= */}
      {entries.length > 0 && (
        <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
          {entries.map(([d, entry]) => (
            <div
              key={d}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
                border: "1px solid var(--linie)",
                borderRadius: 10,
                padding: "8px 12px",
                fontSize: 14,
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  flex: "1 1 auto",
                  minWidth: 0,
                }}
              >
                {entry.bild && (
                  <img
                    src={entry.bild}
                    alt=""
                    style={{
                      width: 56,
                      height: 40,
                      objectFit: "cover",
                      borderRadius: 6,
                      border: "1px solid var(--linie)",
                    }}
                  />
                )}

                <span
                  style={{
                    minWidth: 0,
                    overflowWrap: "anywhere",
                  }}
                >
                  <b>{shortDate(d)}</b> ·{" "}

                  {entry.typ === "zu" ? (
                    <span style={{ color: "#B4443C" }}>
                      {t("sondertermine.status.closed")}
                    </span>
                  ) : (
                    <span style={{ color: "var(--moos)" }}>
                      {t("sondertermine.status.specialOpening")}{" "}
                      {(entry.slots || standardSlots).join(", ")}
                      {t("sondertermine.timeSuffix")}
                    </span>
                  )}

                  {entry.note && (
                    <span style={{ color: "#8A8FA3" }}>
                      {" "}
                      · {entry.note}
                    </span>
                  )}
                </span>
              </span>

              <button
                type="button"
                className="btn btn-danger btn-sm"
                sx={{ minWidth: "55px" }}
                style={{ flexShrink: 0 }}
                onClick={() => remove(d)}
              >
                {t("sondertermine.actions.remove")}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* =========================
        ADD SPECIAL DATE FORM
       ========================= */}
      <div className="form-grid">
        {/* DATE */}
        <div>
          <label
            className="label"
            htmlFor="so-datum"
            style={{ fontWeight: 500 }}
          >
            {t("sondertermine.form.date")}
          </label>

          <input
            id="so-datum"
            type="date"
            className="input"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
            }}
          />
        </div>

        {/* TYPE */}
        <div>
          <label
            className="label"
            htmlFor="so-typ"
            style={{ fontWeight: 500 }}
          >
            {t("sondertermine.form.type")}
          </label>

          <select
            id="so-typ"
            className="input"
            value={typ}
            onChange={(e) => {
              const newType = e.target.value;

              setTyp(newType);

              // Closed days must not keep an image
              if (newType === "zu") {
                setBild(null);
              }
            }}
          >
            <option value="zu">
              {t("sondertermine.types.closed")}
            </option>

            <option value="offen">
              {t("sondertermine.types.specialOpening")}
            </option>
          </select>
        </div>

        {/* SPECIAL OPENING */}
        {typ === "offen" && (
          <>
            <div>
              <label
                className="label"
                htmlFor="so-von"
                style={{ fontWeight: 500 }}
              >
                {t("sondertermine.form.bookableFrom")}
              </label>

              <input
                id="so-von"
                type="time"
                className="input"
                value={von}
                onChange={(e) => setVon(e.target.value)}
              />
            </div>

            <div>
              <label
                className="label"
                htmlFor="so-bis"
                style={{ fontWeight: 500 }}
              >
                {t("sondertermine.form.to")}
              </label>

              <input
                id="so-bis"
                type="time"
                className="input"
                value={bis}
                onChange={(e) => setBis(e.target.value)}
              />
            </div>

            <div>
              <label
                className="label"
                htmlFor="so-takt"
                style={{ fontWeight: 500 }}
              >
                {t("sondertermine.form.interval")}
              </label>

              <select
                id="so-takt"
                className="input"
                value={takt}
                onChange={(e) => setTakt(Number(e.target.value))}
              >
                <option value={30}>
                  {t("sondertermine.intervals.every30")}
                </option>

                <option value={60}>
                  {t("sondertermine.intervals.everyHour")}
                </option>

                <option value={90}>
                  {t("sondertermine.intervals.every90")}
                </option>

                <option value={120}>
                  {t("sondertermine.intervals.every2Hours")}
                </option>
              </select>
            </div>
          </>
        )}

        {/* NOTE */}
        <div>
          <label
            className="label"
            htmlFor="so-note"
            style={{ fontWeight: 500 }}
          >
            {t("sondertermine.form.internalNote")}
          </label>

          <input
            id="so-note"
            className="input"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t("sondertermine.form.notePlaceholder")}
          />
        </div>

        {/* IMAGE */}
        <div>
          <div className="label" style={{ fontWeight: 500 }}>
            {t("sondertermine.form.image")}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={pickBild}
            style={{ display: "none" }}
            aria-hidden="true"
            tabIndex={-1}
          />

          {bild ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <img
                src={bild}
                alt={t("sondertermine.form.preview")}
                style={{
                  width: 96,
                  height: 64,
                  objectFit: "cover",
                  borderRadius: 8,
                  border: "1px solid var(--linie)",
                }}
              />

              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setBild(null)}
              >
                {t("sondertermine.actions.removeImage")}
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() =>
                fileRef.current && fileRef.current.click()
              }
            >
              {t("sondertermine.actions.chooseImage")}
            </button>
          )}
        </div>
      </div>

      {/* =========================
        ADD BUTTON
       ========================= */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
          marginTop: 10,
          flexWrap: "wrap",
        }}
      >
        <span className="notice">
          {t("sondertermine.notice.closedDays")}
        </span>

        {typ === "zu" ? (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={!date}
            onClick={(e) => {
              e.preventDefault();
              add();
            }}
          >
            {t("sondertermine.actions.addDate")}
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={!date}
            onClick={(e) => {
              e.preventDefault();

              saveSpecialOpening();
            }}
          >
            {t("sondertermine.actions.applySpecialOpening")}
          </button>
        )}
      </div>
    </div>
  );
}