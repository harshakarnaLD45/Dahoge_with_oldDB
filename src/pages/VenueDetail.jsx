// Betriebs-Detailseite: Datum/Uhrzeit, Tischplan, Kontaktformular, Bestätigung

import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import "./VenueDetail.css";

import { dateKey, longDate, daysList, dayShortName } from "../utils/dates";
import { isEmail, isPhone } from "../utils/validate";
import { mailtoHref } from "../utils/mail";
import { downloadIcs } from "../utils/ics";

import {
  activeAktion,
  activeAktionen,
  nextAktion,
  aktionRange,
  dayStatus,
} from "../utils/aktion";

import {
  getAccount,
  setAccount,
  getOccupancy,
  setOccupancy as saveOccupancy,
  addReservation,
  getPhotos,
  withTransaction,
} from "../services/storage";

import { pushNotification } from "../services/notify";

import { buildBookingMails } from "../services/email";
import { emailJsConfigured, sendEmailJs } from "../services/emailjs";

import { TableSvg, Legend } from "../components/TableSvg";
import { Beleg, printBeleg } from "../components/Beleg";
import { EmailCard } from "../components/EmailCard";

export function VenueDetail({
  loc,
  profile,
  onBooked,
  onBack,
  showToast,
  onRecht,
}) {
 

  const { t } = useTranslation();


  const clearBookingData = () => {
    setForm(createEmptyForm());
    setSelected([]);
    setTried(false);
    setBusy(false);
  };



  const days = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const total = new Date(year, month + 1, 0).getDate();

    return Array.from(
      { length: total },
      (_, i) => new Date(year, month, i + 1),
    );
  }, []);

  const todayKey = dateKey(new Date());

  const isPast = (dk) => dk < todayKey;

  const initial =
    days.find(
      (d) =>
        !isPast(dateKey(d)) &&
        dayStatus(loc, dateKey(d), d.getDay()).status === "offen",
    ) ||
    days.find((d) => !isPast(dateKey(d))) ||
    days[0];

  const [date, setDate] = useState(dateKey(initial));

  const [slots, setSlots] = useState(() => {
    const st = dayStatus(loc, dateKey(initial), initial.getDay());

    return st.slots.length ? [st.slots[0]] : [];
  });

  const [occupancy, setOccupancy] = useState({});
  const [selected, setSelected] = useState([]);

  // =========================================================
  // FORM
  // =========================================================

  const createEmptyForm = () => ({
    vorname: "",
    nachname: "",
    email: "",
    telefon: "",
    strasse: "",
    plzort: "",
    note: "",
    einwilligung: false,
  });

  const [form, setForm] = useState(createEmptyForm);

  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [booked, setBooked] = useState(null);

  const [fotos, setFotos] = useState([]);
  const [fotoIdx, setFotoIdx] = useState(0);

  // =========================================================
  // LOAD PHOTOS
  // =========================================================

  useEffect(() => {
    let alive = true;

    (async () => {
      const stored = await getPhotos(loc.id);

      if (alive && stored && stored.length) {
        setFotos(stored);
        setFotoIdx(0);
      }
    })();

    return () => {
      alive = false;
    };
  }, [loc.id]);

  // =========================================================
  // FORM FIELD
  // =========================================================

  const field = (key) => (ev) =>
    setForm((f) => ({
      ...f,
      [key]: ev.target.value,
    }));

  // =========================================================
  // DATE HELPERS
  // =========================================================

  const dowOf = (key) => {
    const [y, m, d] = key.split("-").map(Number);

    return new Date(y, m - 1, d).getDay();
  };

  const weekday = dowOf(date);

  const day = dayStatus(loc, date, weekday);

  const sonderEntry = (loc.sonder || {})[date] || null;

  const daySlots = day.slots;

  const isOpen = day.status === "offen";

  const isFull = day.status === "voll";

  // =========================================================
  // DATE / OCCUPANCY CHANGE
  // =========================================================

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  useEffect(() => {
    let alive = true;

    setSelected([]);
    setOccupancy({});

    const st = dayStatus(loc, date, dowOf(date));

    setSlots(st.slots.length ? [st.slots[0]] : []);

    (async () => {
      try {
        const occ = await getOccupancy(loc.id, date);

        if (alive && occ) {
          setOccupancy(occ);
        }
      } catch (err) {
        if (alive) {
          setOccupancy({});
        }
      }
    })();



    return () => {
      alive = false;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loc.id, date]);



  const seatCount = (loc.tisch && loc.tisch.seats) || loc.seats;

  const occupiedSet = new Set();

  if (isOpen) {
    slots.forEach((s) => {
      (occupancy[s] || []).forEach((n) => {
        occupiedSet.add(n);
      });
    });
  }

  const taken = isFull
    ? [...Array(seatCount).keys()]
    : Array.from(occupiedSet).filter((n) => n < seatCount);

  const free = seatCount - taken.length;

  // =========================================================
  // SEAT SELECTION
  // =========================================================

  const toggleSeat = (n) =>
    setSelected((cur) =>
      cur.includes(n) ? cur.filter((m) => m !== n) : [...cur, n],
    );

  // =========================================================
  // SLOT SELECTION
  // =========================================================

  const toggleSlot = (s) => {
    if (loc.mehrfach) {
      setSlots((cur) =>
        cur.includes(s)
          ? cur.length > 1
            ? cur.filter((m) => m !== s)
            : cur
          : [...cur, s].sort(),
      );
    } else {
      setSlots([s]);
    }

    setSelected([]);
  };

  // =========================================================
  // VALIDATION
  // =========================================================

  const slotLabel = slots.join(" & ");

  const errors = {
    vorname: form.vorname.trim().length < 2,

    nachname: form.nachname.trim().length < 2,

    email: !isEmail(form.email),

    telefon: !isPhone(form.telefon),

    strasse: form.strasse.trim().length > 0 && form.strasse.trim().length < 3,

    plzort: form.plzort.trim().length > 0 && form.plzort.trim().length < 3,

    einwilligung: !form.einwilligung,
  };

  const valid = !Object.values(errors).some(Boolean);

  const canBook =
    isOpen && slots.length > 0 && selected.length > 0 && valid && !busy;

  // =========================================================
  // SUBMIT BOOKING
  // =========================================================

  const submit = async () => {
    setTried(true);

    if (!canBook) {
      return;
    }

    setBusy(true);

    try {
      const count = selected.length;

      const seats = [...selected].sort((a, b) => a - b);

      const name = `${form.vorname.trim()} ${form.nachname.trim()}`;

      let res = null;

      await withTransaction(async () => {
        const occ = {
          ...((await getOccupancy(loc.id, date)) || {}),
        };

        slots.forEach((s) => {
          occ[s] = Array.from(new Set([...(occ[s] || []), ...seats])).sort(
            (a, b) => a - b,
          );
        });

        await saveOccupancy(loc.id, date, occ);

        setOccupancy(occ);

        res = {
          id: `${Date.now()}-${Math.floor(Math.random() * 9999)}`,

          locId: loc.id,
          locName: loc.name,
          hostUid: loc.hostUid || "",
          city: loc.city,

          dateKey: date,

          slot: slots[0],
          slots: [...slots],

          seats,
          persons: count,

          aktion: day.aktion ? day.aktion.titel : "",

          angebot: day.aktion ? day.aktion.angebot || "" : loc.angebot || "",

          vorname: form.vorname.trim(),

          nachname: form.nachname.trim(),

          email: form.email.trim(),

          telefon: form.telefon.trim(),

          strasse: form.strasse.trim(),

          plzort: form.plzort.trim(),

          note: form.note.trim(),

          createdAt: new Date().toISOString(),
        };

        await addReservation(res);

        await setAccount({
          profile: {
            vorname: res.vorname,
            nachname: res.nachname,
            email: res.email,
            telefon: res.telefon,
            strasse: res.strasse,
            plzort: res.plzort,
            einwilligungAm: new Date().toISOString(),
          },
        });
      });

      const account = await getAccount();

      onBooked(account);

      const chairList = seats.map((n) => n + 1).join(", ");

      const people =
        count === 1
          ? t("venue.people.single", {
              count,
              defaultValue: `${count} Person`,
            })
          : t("venue.people.multiple", {
              count,
              defaultValue: `${count} Personen`,
            });

      let guestMail = null;
      let venueMail = null;

      try {
        const mails = await buildBookingMails({
          loc,
          res,
          date,
          slots,
          day,
          slotLabel,
          chairList,
          people,
          name,
          seatCount: count,
          remainingSeats: free,
        });

        guestMail = mails.guestMail;
        venueMail = mails.venueMail;
      } catch (err) {
        console.error("Email build failed:", err);
      }

      // =====================================================
      // EMAIL
      // =====================================================

      const apiSent = {
        guest: false,
        venue: false,
        test: false,
        previews: [],
      };

      try {
        if (!guestMail) {
          console.error("Guest email skipped — template build failed");
        } else {
          const g = emailJsConfigured
            ? await sendEmailJs({
                to: res.email,
                subject: guestMail.betreff,
                html: guestMail.html,
                replyTo: loc.email || res.email,
              })
            : null;

          apiSent.guest = !!g?.success;

          if (!g?.success) {
            console.error(
              "Guest email send failed:",
              g?.error || "EmailJS not configured",
            );
          } else {
            console.log("Guest email sent OK →", res.email);
          }

          if (g?.mode === "ethereal") {
            apiSent.test = true;

            if (g.previewUrl) {
              apiSent.previews.push(g.previewUrl);
            }
          }
        }
      } catch (err) {
        console.error("Guest email exception:", err);
      }

      try {
        if (!venueMail) {
          console.error("Host email skipped — template build failed");
        } else if (isEmail(venueMail.an)) {
          const vn = emailJsConfigured
            ? await sendEmailJs({
                to: venueMail.an,
                subject: venueMail.betreff,
                html: venueMail.html,
                replyTo: res.email,
              })
            : null;

          apiSent.venue = !!vn?.success;

          if (!vn?.success) {
            console.error(
              "Host email send failed:",
              vn?.error || "EmailJS not configured",
            );
          } else {
            console.log("Host email sent OK →", venueMail.an);
          }

          if (vn?.mode === "ethereal" && vn.previewUrl) {
            apiSent.previews.push(vn.previewUrl);
          }
        } else {
          console.warn(
            "Host email skipped — no valid venue email address:",
            venueMail.an,
          );
        }
      } catch (err) {
        console.error("Host email exception:", err);
      }

      const push = apiSent.venue
        ? {
            ok: true,
            weg: "smtp",
          }
        : venueMail
          ? await pushNotification(loc, venueMail, res)
          : { ok: false, weg: "no-email-data" };

      setBooked({
        res,
        mails: [guestMail, venueMail].filter(Boolean),
        push,
        apiSent,
      });

      // =====================================================
      // TOAST
      // =====================================================

      showToast(
        apiSent.test
          ? t("venue.toast.testMode")
          : apiSent.venue
            ? t("venue.toast.emailsSent")
            : push.ok
              ? t("venue.toast.venueNotified")
              : t("venue.toast.booked"),
      );

      await setAccount({
        profile: {
          vorname: res.vorname,
          nachname: res.nachname,
          email: res.email,
          telefon: res.telefon,
          strasse: res.strasse,
          plzort: res.plzort,
          einwilligungAm: new Date().toISOString(),
        },
      });

      window.scrollTo({
        top: 0,
      });
    } catch (err) {
      showToast(t("venue.toast.error"));
    } finally {
      setBusy(false);
    }
  };

  // =========================================================
  // BOOKING CONFIRMATION
  // =========================================================

  if (booked) {
    const r = booked.res;

    return (
      <div className="venue-detail-page">
        <div className="venue-detail-container venue-confirmation-container">
          <div
            className="card no-print"
            style={{
              textAlign: "center",
              padding: "32px 24px",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "var(--kobalt)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 30,
                margin: "0 auto 14px",
              }}
            >
              ✓
            </div>

            <div
              className="f-display"
              style={{
                fontSize: 28,
                fontWeight: 600,
                color: "var(--kobalt-dunkel)",
              }}
            >
              {t("venue.confirmation.title")}
            </div>

            <p
              style={{
                color: "#3A4258",
                margin: "10px auto 4px",
                maxWidth: "46ch",
              }}
            >
              {r.persons === 1
                ? t("venue.confirmation.oneSeat")
                : t("venue.confirmation.multipleSeats", {
                    count: r.persons,
                    defaultValue: `${r.persons} Plätze`,
                  })}{" "}
              {t("venue.confirmation.atTable")} <b>{loc.name}</b>, {loc.city} —
              {longDate(r.dateKey)}, {(r.slots || [r.slot]).join(" & ")}
              {t("venue.confirmation.hour")}.
            </p>

            <div
              style={{
                fontSize: 13.5,
                color: "#5B627A",
              }}
            >
              {t("venue.confirmation.chair")}{" "}
              {r.seats.map((n) => n + 1).join(", ")}
            </div>

            {r.aktion && (
              <div
                style={{
                  fontSize: 14,
                  color: "var(--eiche)",
                  marginTop: 6,
                }}
              >
                ★ {r.aktion}
                {r.angebot ? ` — ${r.angebot}` : ""}
              </div>
            )}

            <div
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "center",
                flexWrap: "wrap",
                marginTop: 18,
              }}
            >
              <button className="btn btn-ghost btn-sm" onClick={printBeleg}>
                {t("venue.confirmation.print")}
              </button>

              <button
                className="btn btn-ghost btn-sm"
                onClick={() => downloadIcs(r)}
              >
                {t("venue.confirmation.calendar")}
              </button>
            </div>
          </div>

          <div
            className="print-area"
            style={{
              marginTop: 16,
            }}
          >
            <Beleg res={r} loc={loc} />
          </div>

          <div
            className="no-print"
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "center",
              flexWrap: "wrap",
              marginTop: 14,
            }}
          >
            <button className="btn btn-ghost" onClick={onBack}>
              {t("venue.confirmation.moreTables")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // INPUT CLASS
  // =========================================================

  const inputCls = (key) =>
    "input" + (tried && errors[key] ? " field-err" : "");

  // =========================================================
  // MAIN VENUE DETAIL
  // =========================================================

  return (
    <div className="venue-detail-page">
      <div className="venue-detail-container">
        <button
          className="nav-btn"
          onClick={onBack}
          style={{
            marginLeft: -10,
          }}
        >
          {t("venue.navigation.allTables")}
        </button>

        {/* ===================================================
            VENUE HEADER
            =================================================== */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: 12,
            flexWrap: "wrap",
            margin: "10px 0 4px",
          }}
        >
          <div>
            <div className="eyebrow">
              {loc.region} · {loc.type}
            </div>

            <h2
              className="f-display"
              style={{
                fontSize: "clamp(26px,4.5vw,38px)",
                fontWeight: 600,
                margin: "6px 0 4px",
                color: "var(--kobalt-dunkel)",
              }}
            >
              {loc.name}
            </h2>

            <div
              style={{
                color: "#5B627A",
              }}
            >
              {loc.city} 
              {/* · {loc.desc} */}
            </div>
          </div>

          <span className="tag">
            {seatCount} {t("venue.seats.oneTable")}
          </span>
        </div>

        {/* ===================================================
            GALLERY
            =================================================== */}

        {fotos.length > 0 && (
          <figure
            className="galerie"
            style={{
              margin: "16px 0 0",
            }}
          >
            {/* <img
              className="gross"
              src={fotos[fotoIdx].gross}
              alt={`${loc.name}, ${t("venue.gallery.image", {
                defaultValue: "Bild",
              })} ${fotoIdx + 1} ${t("venue.gallery.of", {
                defaultValue: "von",
              })} ${fotos.length}`}
            /> */}

            {fotos.length > 1 && (
              <div className="mini-reihe">
                {fotos.map((f, i) => (
                  <img
                    key={f.id}
                    src={f.klein || f.gross}
                    alt={`${t("venue.gallery.image")} ${i + 1} ${t("venue.gallery.show")}`}
                    className={`mini ${i === fotoIdx ? "on" : ""}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => setFotoIdx(i)}
                    onKeyDown={(ev) => {
                      if (ev.key === "Enter" || ev.key === " ") {
                        ev.preventDefault();
                        setFotoIdx(i);
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </figure>
        )}

        {/* ===================================================
            PROMOTIONS
            =================================================== */}

        {(activeAktionen(loc, date).length > 0 ||
          nextAktion(loc, dateKey(new Date()))) &&
          (() => {
            const aktionen = activeAktionen(loc, date);

            const next = nextAktion(loc, dateKey(new Date()));

            if (aktionen.length === 0 && !next) {
              return null;
            }

            const cols = Math.min(4, aktionen.length || 1);

            return (
              <div
                style={{
                  marginTop: 14,
                  display: "grid",
                  gridTemplateColumns: `repeat(${cols}, 1fr)`,
                  gap: 12,
                }}
              >
                {aktionen.length > 0
                  ? aktionen.map((a) => (
                      <div key={a.titel} className="aktion-box">
                        <span className="aktion-tag">
                          {t("venue.promotion.today")}
                        </span>

                        <div
                          className="f-display"
                          style={{
                            fontSize: 19,
                            fontWeight: 600,
                            margin: "6px 0 2px",
                            color: "var(--kobalt-dunkel)",
                          }}
                        >
                          {a.titel}
                        </div>

                        <div
                          style={{
                            fontSize: 14,
                            color: "#3A4258",
                          }}
                        >
                          {aktionRange(a)}

                          {a.alleTage ? t("venue.promotion.daily") : ""}
                        </div>

                        {a.angebot && (
                          <div
                            style={{
                              fontSize: 14.5,
                              color: "#3A4258",
                              marginTop: 6,
                            }}
                          >
                            {a.angebot}
                          </div>
                        )}
                      </div>
                    ))
                  : next && (
                      <div className="aktion-box">
                        <span className="aktion-tag">
                          {t("venue.promotion.upcoming")}
                        </span>

                        <div
                          className="f-display"
                          style={{
                            fontSize: 19,
                            fontWeight: 600,
                            margin: "6px 0 2px",
                            color: "var(--kobalt-dunkel)",
                          }}
                        >
                          {next.titel}
                        </div>

                        <div
                          style={{
                            fontSize: 14,
                            color: "#3A4258",
                          }}
                        >
                          {aktionRange(next)}

                          {next.alleTage ? t("venue.promotion.daily") : ""}
                        </div>

                        {next.angebot && (
                          <div
                            style={{
                              fontSize: 14.5,
                              color: "#3A4258",
                              marginTop: 6,
                            }}
                          >
                            {next.angebot}
                          </div>
                        )}
                      </div>
                    )}
              </div>
            );
          })()}

        {/* ===================================================
            DATE
            =================================================== */}

        <div
          style={{
            margin: "18px 0 8px",
          }}
          className="label"
        >
          {t("venue.date")}
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            overflowX: "auto",
            paddingBottom: 6,
          }}
        >
          {days.map((d) => {
            const dk = dateKey(d);

            const st = dayStatus(loc, dk, d.getDay()).status;

            const past = isPast(dk);

            return (
              <button
                key={dk}
                className={`daybtn ${dk === date ? "on" : ""} ${
                  st === "kein" || st === "ruhetag" || past ? "off" : ""
                }`}
                onClick={() => setDate(dk)}
                disabled={past}
                aria-pressed={dk === date}
              >
                <div className="dow">{dayShortName(d.getDay())}</div>

                <div className="dom">{d.getDate()}</div>

                <div
                  style={{
                    fontSize: 9,
                    lineHeight: 1,
                    height: 10,
                    color: dk === date ? "var(--honig)" : "var(--eiche)",
                  }}
                >
                  {(loc.sonder || {})[dk]?.typ === "offen"
                    ? "★"
                    : activeAktion(loc, dk)
                      ? "●"
                      : ""}
                </div>
              </button>
            );
          })}
        </div>

        {/* ===================================================
            CLOSED
            =================================================== */}

        {sonderEntry?.typ === "zu" ? (
          <div
            className="card"
            style={{
              marginTop: 14,
              textAlign: "center",
              color: "#5B627A",
            }}
          >
            <b
              style={{
                color: "var(--tinte)",
              }}
            >
              {t("venue.closed.title")}
            </b>

            {" — "}

            {t("venue.closed.message", {
              venue: loc.name,
              defaultValue: `${loc.name} hat an diesem Tag geschlossen.`,
            })}
          </div>
        ) : day.status === "kein" ? (
          <div
            className="card"
            style={{
              marginTop: 14,
              textAlign: "center",
              color: "#5B627A",
            }}
          >
            {t("venue.closed.noTable", {
              venue: loc.name,
              defaultValue: `${loc.name} deckt den Mischtisch an diesem Tag nicht.`,
            })}{" "}
            {t("venue.closed.tableDays")} <b>{daysList(loc.days || [])}</b>.
          </div>
        ) : isFull ? (
          <div
            className="card"
            style={{
              marginTop: 18,
              paddingTop: 14,
            }}
          >
            <div
              style={{
                textAlign: "center",
                fontSize: 14,
                color: "#3A4258",
                marginBottom: 2,
              }}
            >
              {longDate(date)} —{" "}
              <b
                style={{
                  color: "#B4443C",
                }}
              >
                {t("venue.fullyBooked")}
              </b>
            </div>

            <div
              style={{
                fontSize: 13,
                color: "#8A8FA3",
                textAlign: "center",
                marginBottom: 6,
              }}
            >
              {t("venue.fullyBookedMessage")}
            </div>

            <TableSvg seats={seatCount} tisch={loc.tisch} occupied={taken} />

            <Legend />
          </div>
        ) : (
          <>
            {/* =================================================
                TIME
                ================================================= */}

            <div
              style={{
                margin: "14px 0 8px",
              }}
              className="label"
            >
              {t("venue.time")}

              {loc.mehrfach && (
                <span
                  style={{
                    fontWeight: 400,
                    color: "#6A7288",
                  }}
                >
                  {t("venue.multipleSlots")}
                </span>
              )}
            </div>

            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              {daySlots.map((s) => (
                <button
                  key={s}
                  className={`slot ${slots.includes(s) ? "on" : ""}`}
                  onClick={() => toggleSlot(s)}
                  aria-pressed={slots.includes(s)}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* =================================================
                SPECIAL DATE
                ================================================= */}

            {sonderEntry && (
              <div
                className="aktion-box"
                style={{
                  marginTop: 14,
                  display: "flex",
                  gap: 14,
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    flex: "1 1 220px",
                    minWidth: 0,
                  }}
                >
                  <span className="aktion-tag">{t("venue.specialDate")}</span>

                  <div
                    className="f-display"
                    style={{
                      fontSize: 19,
                      fontWeight: 600,
                      margin: "6px 0 2px",
                      color: "var(--kobalt-dunkel)",
                    }}
                  >
                    {longDate(date)}
                  </div>

                  <div
                    style={{
                      fontSize: 14,
                      color: "#3A4258",
                    }}
                  >
                    {sonderEntry.typ === "offen"
                      ? `${t("venue.specialOpening")} · ${(sonderEntry.slots || []).join(", ")}${t(
                          "venue.hour",
                        )}`
                      : t("venue.specialClosed")}
                  </div>

                  {sonderEntry.note && (
                    <div
                      style={{
                        fontSize: 14.5,
                        color: "#3A4258",
                        marginTop: 6,
                      }}
                    >
                      {sonderEntry.note}
                    </div>
                  )}

                  <div
                    className="notice"
                    style={{
                      marginTop: 8,
                    }}
                  >
                    {t("venue.specialNotice")}
                  </div>
                </div>

                {sonderEntry.bild && (
                  <img
                    src={sonderEntry.bild}
                    alt={t("venue.specialImage")}
                    style={{
                      flex: "0 0 auto",
                      width: 180,
                      maxHeight: 170,
                      objectFit: "cover",
                      borderRadius: 10,
                      border: "1px solid var(--honig)",
                    }}
                  />
                )}
              </div>
            )}

            {loc.mehrfach && slots.length > 1 && (
              <div
                className="notice"
                style={{
                  marginTop: 8,
                }}
              >
                {t("venue.multipleBookingNotice", {
                  count: slots.length,
                  // defaultValue: `Deine Plätze werden für alle ${slots.length} gewählten Zeitfenster reserviert.`,
                })}
              </div>
            )}

            {loc.provisional && (
              <div
                className="notice"
                style={{
                  marginTop: 8,
                }}
              >
                {t("venue.provisionalNotice")}
              </div>
            )}

            {/* =================================================
                TABLE
                ================================================= */}

            <div
              className="card"
              style={{
                marginTop: 18,
                paddingTop: 14,
              }}
            >
              <div
                style={{
                  textAlign: "center",
                  fontSize: 14,
                  color: "#3A4258",
                  marginBottom: 2,
                }}
              >
                {longDate(date)}, {slotLabel}
                {t("venue.hour")} —{" "}
                <b
                  style={{
                    color: free > 0 ? "var(--moos)" : "#B4443C",
                  }}
                >
                  {free > 0
                    ? t("venue.freeSeats", {
                        free,
                        total: seatCount,
                        defaultValue: `${free} von ${seatCount} Plätzen frei`,
                      })
                    : t("venue.fullyBooked")}
                </b>
              </div>

              <div
                style={{
                  fontSize: 13,
                  color: "#8A8FA3",
                  textAlign: "center",
                  marginBottom: 6,
                }}
              >
                {t("venue.selectChair")}
              </div>

              <TableSvg
                seats={seatCount}
                tisch={loc.tisch}
                occupied={taken}
                selected={selected}
                onToggle={toggleSeat}
              />

              <Legend />
            </div>

            {/* =================================================
                CONTACT FORM
                ================================================= */}

            <div
              className="card"
              style={{
                marginTop: 16,
              }}
            >
              <div
                className="f-display"
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  marginBottom: 12,
                }}
              >
                {selected.length === 0
                  ? t("venue.contact.title")
                  : selected.length === 1
                    ? t("venue.contact.onePerson")
                    : t("venue.contact.multiplePeople", {
                        count: selected.length,
                      })}
              </div>

              <div className="form-grid">
                {/* FIRST NAME */}

                <div>
                  <label className="label" htmlFor="mt-vn">
                    {t("venue.form.firstName")}
                  </label>

                  <input
                    id="mt-vn"
                    className={inputCls("vorname")}
                    value={form.vorname}
                    onChange={field("vorname")}
                    placeholder={t("venue.form.firstNamePlaceholder")}
                  />
                </div>

                {/* LAST NAME */}

                <div>
                  <label className="label" htmlFor="mt-nn">
                    {t("venue.form.lastName")}
                  </label>

                  <input
                    id="mt-nn"
                    className={inputCls("nachname")}
                    value={form.nachname}
                    onChange={field("nachname")}
                    placeholder={t("venue.form.lastNamePlaceholder")}
                  />
                </div>

                {/* EMAIL */}

                <div>
                  <label className="label" htmlFor="mt-em">
                    {t("venue.form.email")}
                  </label>

                  <input
                    id="mt-em"
                    type="email"
                    className={inputCls("email")}
                    value={form.email}
                    onChange={field("email")}
                    placeholder={t("venue.form.emailPlaceholder")}
                  />
                </div>

                {/* PHONE */}

                <div>
                  <label className="label" htmlFor="mt-tel">
                    {t("venue.form.phone")}
                  </label>

                  <input
                    id="mt-tel"
                    type="tel"
                    className={inputCls("telefon")}
                    value={form.telefon}
                    onChange={field("telefon")}
                    placeholder={t("venue.form.phonePlaceholder")}
                  />
                </div>

                {/* STREET */}

                <div>
                  <label className="label" htmlFor="mt-str">
                    {t("venue.form.street")}{" "}
                    <span
                      style={{
                        fontWeight: 400,
                        color: "#8A8FA3",
                      }}
                    >
                      {t("venue.form.optional")}
                    </span>
                  </label>

                  <input
                    id="mt-str"
                    className={inputCls("strasse")}
                    value={form.strasse}
                    onChange={field("strasse")}
                    placeholder={t("venue.form.streetPlaceholder")}
                  />
                </div>

                {/* POSTCODE */}

                <div>
                  <label className="label" htmlFor="mt-plz">
                    {t("venue.form.postcode")}{" "}
                    <span
                      style={{
                        fontWeight: 400,
                        color: "#8A8FA3",
                      }}
                    >
                      {t("venue.form.optional")}
                    </span>
                  </label>

                  <input
                    id="mt-plz"
                    className={inputCls("plzort")}
                    value={form.plzort}
                    onChange={field("plzort")}
                    placeholder={t("venue.form.postcodePlaceholder")}
                  />
                </div>
              </div>

              {/* MESSAGE */}

              <div
                style={{
                  marginTop: 12,
                }}
              >
                <label className="label" htmlFor="mt-note">
                  {t("venue.form.message")}
                </label>

                <input
                  id="mt-note"
                  className="input"
                  value={form.note}
                  onChange={field("note")}
                  placeholder={t("venue.form.messagePlaceholder")}
                />
              </div>

              {/* CONSENT */}

              <label
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                  cursor: "pointer",
                  fontSize: 14,
                  marginTop: 14,
                }}
              >
                <input
                  type="checkbox"
                  checked={form.einwilligung}
                  onChange={(ev) =>
                    setForm((f) => ({
                      ...f,
                      einwilligung: ev.target.checked,
                    }))
                  }
                  style={{
                    marginTop: 3,
                  }}
                />

                <span>
                  {t("venue.form.consent", {
                    venue: loc.name,
                  })}{" "}
                  <Link
                    to="/privacy"
                    style={{
                      color: "var(--kobalt)",
                      fontWeight: 600,
                      textDecoration: "underline",
                    }}
                  >
                    {t("venue.form.privacy")}
                  </Link>
                </span>
              </label>

              {/* ERRORS */}

              {tried && !valid && (
                <div
                  style={{
                    color: "#B4443C",
                    fontSize: 13.5,
                    marginTop: 10,
                  }}
                >
                  {errors.einwilligung
                    ? t("venue.validation.consent")
                    : t("venue.validation.required")}
                </div>
              )}

              {tried && valid && selected.length === 0 && (
                <div
                  style={{
                    color: "#B4443C",
                    fontSize: 13.5,
                    marginTop: 10,
                  }}
                >
                  {t("venue.validation.selectChair")}
                </div>
              )}

              {/* BOOK BUTTON */}

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  gap: 12,
                  marginTop: 16,
                }}
              >
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={false}
                  onClick={() => {
                    submit();
                  }}
                >
                  {busy
                    ? t("venue.booking.booking")
                    : t("venue.booking.bookNow")}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
