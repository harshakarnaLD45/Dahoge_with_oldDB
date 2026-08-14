// Reservierungs-Beleg für die Bestätigungsseite und "Meine Plätze".

import { useTranslation } from "react-i18next";
import { longDate } from "../utils/dates";
import { DEHOGA_LOGO } from "../utils/logo";
import "./Beleg.css";

// Current language, consistent with src/i18n.js (localStorage "language").
const getLanguage = () =>
  localStorage.getItem("language") || "de";

export function Beleg({ res, loc }) {
  const { t } = useTranslation();

  const slots = (res.slots || [res.slot]).filter(Boolean).join(" & ");

  const seats = Array.isArray(res.seats)
    ? res.seats.map((s) => s + 1).join(", ")
    : "";

  const reservationId = res.id ? res.id.split("-")[0] : "";

  const createdDate = res.createdAt
    ? new Date(res.createdAt).toLocaleDateString(
        getLanguage() === "en" ? "en-GB" : "de-DE",
      )
    : "";

  return (
    <div className="beleg">
      {/* =========================
          HEADER
      ========================= */}
      <div className="beleg-kopf">
        <div>
          <div
            className="f-display"
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "var(--kobalt-dunkel)",
              letterSpacing: ".5px",
            }}
          >
            MISCH·TISCH SACHSEN
          </div>

          <div
            style={{
              fontSize: 12,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "#6A7288",
            }}
          >
            {t("beleg.ReservationConfirmation")}
          </div>
        </div>

        <div className="beleg-logo">
          {DEHOGA_LOGO && <img src={DEHOGA_LOGO} alt="DEHOGA Sachsen" />}

          <span>
            {t("beleg.Number")} {reservationId}
            <br />
            {createdDate}
          </span>
        </div>
      </div>

      {/* =========================
          RESERVATION DETAILS
      ========================= */}

      {/* Venue */}
      <div className="beleg-zeile">
        <b>{t("beleg.Venue")}</b>

        <span>
          {res.locName || "—"}
          {res.city ? `, ${res.city}` : ""}
        </span>
      </div>

      {/* Date */}
      <div className="beleg-zeile">
        <b>{t("beleg.Date")}</b>

        <span>{res.dateKey ? longDate(res.dateKey) : "—"}</span>
      </div>

      {/* Time */}
      <div className="beleg-zeile">
        <b>{t("beleg.Time")}</b>

        <span>
          {slots || "—"}
          {slots ? ` ${t("beleg.ClockSuffix")}` : ""}
        </span>
      </div>

      {/* People */}
      <div className="beleg-zeile">
        <b>{t("beleg.People")}</b>

        <span>
          {res.persons === 1
            ? t("beleg.OnePerson")
            : t("beleg.ManyPeople", {
                count: res.persons || 0,
              })}

          {seats && (
            <>
              {" · "}
              {t("beleg.Chair")} {seats}
            </>
          )}
        </span>
      </div>

      {/* Guest */}
      <div className="beleg-zeile">
        <b>{t("beleg.Guest")}</b>

        <span>
          {res.vorname || ""}
          {res.nachname ? ` ${res.nachname}` : ""}
        </span>
      </div>

      {/* Contact */}
      <div className="beleg-zeile">
        <b>{t("beleg.Contact")}</b>

        <span>
          {res.email || "—"}

          {res.telefon && (
            <>
              {" · "}
              {res.telefon}
            </>
          )}
        </span>
      </div>

      {/* Address */}
      {res.strasse && (
        <div className="beleg-zeile">
          <b>{t("beleg.Address")}</b>

          <span>
            {res.strasse}

            {res.plzort ? `, ${res.plzort}` : ""}
          </span>
        </div>
      )}

      {/* Promotion */}
      {res.aktion && (
        <div className="beleg-zeile">
          <b>{t("beleg.Promotion")}</b>

          <span>
            {res.aktion}

            {res.angebot ? ` — ${res.angebot}` : ""}
          </span>
        </div>
      )}

      {/* Message */}
      {res.note && (
        <div className="beleg-zeile">
          <b>{t("beleg.Message")}</b>

          <span>{res.note}</span>
        </div>
      )}

      {/* Venue Contact */}
      {loc && (loc.oeffnungText || loc.telefon) && (
        <div className="beleg-zeile">
          <b>{t("beleg.VenueReachable")}</b>

          <span>
            {[loc.telefon, loc.oeffnungText].filter(Boolean).join(" · ")}
          </span>
        </div>
      )}

      {/* =========================
          FOOTNOTE
      ========================= */}
      <div className="beleg-footnote">{t("beleg.Footnote")}</div>
    </div>
  );
}

/* =========================
   PRINT RESERVATION
========================= */

export function printBeleg() {
  window.setTimeout(() => {
    window.print();
  }, 60);
}
