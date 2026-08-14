// Tischform page: choose a table variant or arrange it yourself,
// including the surrounding environment.

import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  presetById,
  presetLabel,
  presetVariant,
  tischLabel,
  TABLE_PRESETS,
  UMGEBUNG,
  umgebungLabel,
} from "../utils/table";

import { slugify } from "../utils/strings";
import { upsertVenue, setSetting } from "../services/storage";
import { TableSvg } from "../components/TableSvg";
import { ChairEditor } from "../components/ChairEditor";

export function TischformPage({
  locations,
  preselect,
  reload,
  showToast,
  onDone,
  onBack,
}) {
  const { t } = useTranslation();

  const [selected, setSelected] = useState(preselect || "");
  const [name, setName] = useState("");
  const [kontakt, setKontakt] = useState("");
  const [modus, setModus] = useState("var");
  const [variant, setVariant] = useState("E8");
  const [shape, setShape] = useState("rect");
  const [slots, setSlots] = useState([]);
  const [notiz, setNotiz] = useState("");
  const [umgebung, setUmgebung] = useState({
    top: "",
    bottom: "",
    left: "",
    right: "",
  });

  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(null);

  const env =
    umgebung.top ||
    umgebung.bottom ||
    umgebung.left ||
    umgebung.right
      ? umgebung
      : null;

  const tisch = {
    ...(modus === "var"
      ? presetVariant(presetById(variant))
      : {
          variant: "custom",
          shape,
          custom: {
            shape,
            slots: [...slots].sort((a, b) => a - b),
          },
          seats: slots.length,
        }),
    umgebung: env,
  };

  const toggleSlot = (n) =>
    setSlots((cur) =>
      cur.includes(n)
        ? cur.filter((m) => m !== n)
        : [...cur, n]
    );

  const save = async () => {
    const loc = locations.find((l) => l.id === selected);
    const g = loc ? loc.name : name.trim();

    if (!g || g.length < 3) {
      showToast(t("tableForm.toasts.selectVenue"));
      return;
    }

    if (modus === "eigen" && slots.length < 4) {
      showToast(t("tableForm.toasts.minimumSeats"));
      return;
    }

    setSaving(true);

    try {
      const entry = {
        tisch,
        seats: tisch.seats,
        tischNote: notiz.trim(),
        tischKontakt: kontakt.trim(),
        tischEingereicht: new Date().toISOString(),
      };

      if (loc) {
        // upsertVenue replaces the entire row.
        // loc contains the complete venue data.
        await upsertVenue({
          ...loc,
          ...entry,
        });

        reload();
      } else {
        await setSetting(
          `tischform-new:${slugify(g)}-${Date.now() % 1e5}`,
          {
            name: g,
            ...entry,
          }
        );
      }

      const mail = {
        an: "",
        betreff: `${t("tableForm.mail.subject")} — ${g}`,

        lines: [
          `${t("tableForm.mail.venue")}: ${g}`,

          `${t("tableForm.mail.tableShape")}: ${tischLabel(tisch)}`,

          tisch.custom
            ? `${t("tableForm.mail.layout")}: ${t(
                "tableForm.mail.customArrangement"
              )} (${t("tableForm.mail.positions")} ${tisch.custom.slots
                .map((n) => n + 1)
                .join(", ")})`
            : `${t("tableForm.mail.chosenVariant")}: ${
                presetLabel(presetById(tisch.variant)) ||
                tisch.variant
              }`,

          env
            ? `${t("tableForm.mail.surroundings")}: ${[
                umgebung.top &&
                  `${t("tableForm.mail.above")} ${umgebungLabel(
                    umgebung.top
                  )}`,
                umgebung.bottom &&
                  `${t("tableForm.mail.below")} ${umgebungLabel(
                    umgebung.bottom
                  )}`,
                umgebung.left &&
                  `${t("tableForm.mail.left")} ${umgebungLabel(
                    umgebung.left
                  )}`,
                umgebung.right &&
                  `${t("tableForm.mail.right")} ${umgebungLabel(
                    umgebung.right
                  )}`,
              ]
                .filter(Boolean)
                .join(", ")}`
            : null,

          notiz.trim()
            ? `${t("tableForm.mail.notes")}: ${notiz.trim()}`
            : null,

          kontakt.trim()
            ? `${t("tableForm.mail.contact")}: ${kontakt.trim()}`
            : null,

          t("tableForm.mail.footer"),
        ].filter(Boolean),
      };

      setDone({
        name: g,
        tisch,
        mail,
        imSystem: !!loc,
      });

      showToast(t("tableForm.toasts.saved"));

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      console.error(err);
      showToast(t("tableForm.toasts.failed"));
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     SUCCESS SCREEN
     ========================================================= */

  if (done) {
    return (
      <div
        className="mt-wrap"
        style={{
          padding: "28px 20px 60px",
          maxWidth: 720,
        }}
      >
        <div
          className="card"
          style={{
            textAlign: "center",
            padding: "30px 22px",
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: "var(--kobalt)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              margin: "0 auto 12px",
            }}
          >
            ✓
          </div>

          <div
            className="f-display"
            style={{
              fontSize: 26,
              fontWeight: 600,
              color: "var(--kobalt-dunkel)",
            }}
          >
            {t("tableForm.success.title")}
          </div>

          <p
            style={{
              color: "#3A4258",
              margin: "8px auto 4px",
              maxWidth: "46ch",
            }}
          >
            <b>{done.name}</b> — {tischLabel(done.tisch)}.

            {done.imSystem
              ? ` ${t("tableForm.success.inSystem")}`
              : ` ${t("tableForm.success.notInSystem")}`}
          </p>
        </div>

        <div
          className="card"
          style={{
            marginTop: 14,
          }}
        >
          <TableSvg
            tisch={done.tisch}
            seats={done.tisch.seats}
            occupied={[]}
          />
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "center",
            flexWrap: "wrap",
            marginTop: 16,
          }}
        >
          {/*
          <a
            className="btn btn-primary"
            style={{
              textDecoration: "none",
              display: "inline-block",
            }}
            href={mailtoHref(done.mail)}
          >
            {t("tableForm.success.sendToTeam")}
          </a>
          */}

          <button
            className="btn btn-ghost"
            onClick={onDone}
          >
            {t("tableForm.success.done")}
          </button>
        </div>

        <p
          className="notice"
          style={{
            marginTop: 10,
            textAlign: "center",
          }}
        >
          {t("tableForm.success.emailNotice")}
        </p>
      </div>
    );
  }

  /* =========================================================
     MAIN FORM
     ========================================================= */

  return (
    <div
      className="mt-wrap"
      style={{
        padding: "20px 20px 60px",
        maxWidth: 820,
      }}
    >
      {/* Back button */}

      <button
        className="nav-btn"
        onClick={onBack}
        style={{
          marginLeft: -10,
        }}
      >
        ← {t("tableForm.back")}
      </button>

      {/* Eyebrow */}

      <div
        className="eyebrow"
        style={{
          marginTop: 10,
        }}
      >
        {t("tableForm.eyebrow")}
      </div>

      {/* Page title */}

      <h2
        className="f-display"
        style={{
          fontSize: "clamp(24px,4.2vw,36px)",
          fontWeight: 600,
          margin: "6px 0 8px",
          color: "var(--kobalt-dunkel)",
        }}
      >
        {t("tableForm.title")}
      </h2>

      {/* Description */}

      <p
        className="lead"
        style={{
          marginBottom: 20,
        }}
      >
        {t("tableForm.description")}
      </p>

      <div
        className="card"
        style={{
          display: "grid",
          gap: 16,
        }}
      >
        {/* =====================================================
            VENUE / CONTACT
            ===================================================== */}

        <div className="form-grid">
          {/*
          <div>
            <label
              className="label"
              htmlFor="tf-sel"
            >
              {t("tableForm.venue.label")}
            </label>

            <select
              id="tf-sel"
              className="input"
              value={selected}
              onChange={(e) =>
                setSelected(e.target.value)
              }
            >
              <option value="">
                — {t("tableForm.venue.choose")} —
              </option>

              {locations.map((l) => (
                <option
                  key={l.id}
                  value={l.id}
                >
                  {l.name} · {l.city}
                </option>
              ))}

              <option value="__frei">
                {t("tableForm.venue.notListed")}
              </option>
            </select>

            {selected === "__frei" && (
              <input
                className="input"
                style={{
                  marginTop: 8,
                }}
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder={t("tableForm.venue.namePlaceholder")}
                aria-label={t("tableForm.venue.nameLabel")}
              />
            )}
          </div>
          */}

          <div>
            <label
              className="label"
              htmlFor="tf-mail"
            >
              {t("tableForm.contact.label")}
            </label>

            <input
              id="tf-mail"
              type="email"
              className="input"
              value={kontakt}
              onChange={(e) =>
                setKontakt(e.target.value)
              }
              placeholder={t("tableForm.contact.placeholder")}
            />
          </div>
        </div>

        {/* =====================================================
            TABLE VARIANTS
            ===================================================== */}

        <div>
          <div className="label">
            {t("tableForm.variants.label")}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill,minmax(150px,1fr))",
              gap: 10,
            }}
          >
            {TABLE_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`varbtn ${
                  modus === "var" &&
                  variant === p.id
                    ? "on"
                    : ""
                }`}
                onClick={() => {
                  setModus("var");
                  setVariant(p.id);
                }}
                aria-pressed={
                  modus === "var" &&
                  variant === p.id
                }
              >
                <div
                  style={{
                    fontSize: 24,
                    lineHeight: 1,
                  }}
                >
                  {p.shape === "round"
                    ? "◯"
                    : p.shape === "square"
                    ? "▢"
                    : "▭"}
                </div>

                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    marginTop: 6,
                  }}
                >
                  {presetLabel(p)}
                </div>
              </button>
            ))}

            {/* Custom arrangement */}

            <button
              type="button"
              className={`varbtn ${
                modus === "eigen" ? "on" : ""
              }`}
              onClick={() => setModus("eigen")}
              aria-pressed={modus === "eigen"}
            >
              <div
                style={{
                  fontSize: 24,
                  lineHeight: 1,
                }}
              >
                ✎
              </div>

              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  marginTop: 6,
                }}
              >
                {t("tableForm.variants.custom")}
              </div>
            </button>
          </div>
        </div>

        {/* =====================================================
            PRESET PREVIEW / CUSTOM EDITOR
            ===================================================== */}

        {modus === "var" ? (
          <div>
            <div className="label">
              {t("tableForm.preview.label")}
            </div>

            <TableSvg
              tisch={tisch}
              seats={tisch.seats}
              occupied={[]}
            />
          </div>
        ) : (
          <div>
            <div className="label">
              {t("tableForm.custom.description")}
            </div>

            {/* Shape buttons */}

            <div
              style={{
                display: "flex",
                gap: 8,
                marginBottom: 10,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                className={`chip ${
                  shape === "rect" ? "on" : ""
                }`}
                onClick={() => {
                  setShape("rect");
                  setSlots([]);
                }}
                aria-pressed={shape === "rect"}
              >
                {t("tableForm.custom.rectangular")}
              </button>

              <button
                type="button"
                className={`chip ${
                  shape === "round" ? "on" : ""
                }`}
                onClick={() => {
                  setShape("round");
                  setSlots([]);
                }}
                aria-pressed={shape === "round"}
              >
                {t("tableForm.custom.round")}
              </button>

              <span
                className="notice"
                style={{
                  alignSelf: "center",
                }}
              >
                {slots.length}{" "}
                {slots.length === 1
                  ? t("tableForm.custom.seat")
                  : t("tableForm.custom.seats")}{" "}
                {t("tableForm.custom.set")}
              </span>
            </div>

            {/* Chair editor */}

            <ChairEditor
              shape={shape}
              slots={slots}
              onToggle={toggleSlot}
              umgebung={env}
            />
          </div>
        )}

        {/* =====================================================
            TABLE SURROUNDINGS
            ===================================================== */}

        <div>
          <div className="label">
            {t("tableForm.surroundings.description")}
          </div>

          <div className="form-grid">
            {[
              ["top", "top"],
              ["bottom", "bottom"],
              ["left", "left"],
              ["right", "right"],
            ].map(([key, translationKey]) => (
              <div key={key}>
                <label
                  className="label"
                  htmlFor={`tf-umg-${key}`}
                  style={{
                    fontWeight: 500,
                  }}
                >
                  {t(
                    `tableForm.surroundings.${translationKey}`
                  )}
                </label>

                <select
                  id={`tf-umg-${key}`}
                  className="input"
                  value={umgebung[key]}
                  onChange={(e) =>
                    setUmgebung((u) => ({
                      ...u,
                      [key]: e.target.value,
                    }))
                  }
                >
                  <option value="">
                    — {t("tableForm.surroundings.nothing")} —
                  </option>

                  {UMGEBUNG.map((opt) => (
                    <option
                      key={opt}
                      value={opt}
                    >
                      {umgebungLabel(opt)}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div
            className="notice"
            style={{
              marginTop: 6,
            }}
          >
            {t("tableForm.surroundings.notice")}
          </div>
        </div>

        {/* =====================================================
            NOTES
            ===================================================== */}

        <div>
          <label
            className="label"
            htmlFor="tf-note"
          >
            {t("tableForm.notes.label")}
          </label>

          <input
            id="tf-note"
            className="input"
            value={notiz}
            onChange={(e) =>
              setNotiz(e.target.value)
            }
            placeholder={t("tableForm.notes.placeholder")}
          />
        </div>

        {/* =====================================================
            SAVE AREA
            ===================================================== */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <span className="notice">
            {t("tableForm.save.notice")}
          </span>

          <button
            className="btn btn-primary"
            disabled={saving}
            onClick={save}
          >
            {saving
              ? t("tableForm.save.saving")
              : t("tableForm.save.button")}
          </button>
        </div>
      </div>
    </div>
  );
}