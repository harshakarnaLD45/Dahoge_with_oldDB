import { useState, useEffect, useMemo } from "react";
import "./HostArea.css";
import { useTranslation } from "react-i18next";

import { buildSlots } from "../utils/format";
import { isEmail } from "../utils/validate";
import { mailtoHref } from "../utils/mail";
import { tischLabel, distributeSeats } from "../utils/table";
import {
  dateKey,
  shortDate,
  dayShortName,
  dayLongName,
  WEEK_ORDER,
} from "../utils/dates";

import {
  listReservations,
  removeReservation,
  listNotifications,
  getPhotos,
  setPhotos,
  upsertVenue,
  setSetting,
  removeNotification,
  getOccupancy,
  setOccupancy,
  reauthenticateHost,
  updateHostPassword,
} from "../services/storage";

import { DayChips } from "./DayChips";
import { SeatStepper } from "./SeatStepper";
import { SlotEditor } from "./SlotEditor";
import { Sondertermine } from "./Sondertermine";
import { AktionenEditor } from "./AktionenEditor";
import { PhotoUploader } from "./PhotoUploader";

import { sendEmailJs } from "../services/mailer";
import { REGIONS, VENUE_TYPES } from "../services/data";

const normalizeFormData = (data) => {
  return {
    ...data,

    days: [...(data.days || [])].sort(
      (a, b) => WEEK_ORDER.indexOf(a) - WEEK_ORDER.indexOf(b),
    ),

    slots: [...(data.slots || [])].sort(),

    slotsByDay: Object.keys(data.slotsByDay || {})
      .sort((a, b) => Number(a) - Number(b))
      .reduce((acc, key) => {
        acc[key] = [...(data.slotsByDay[key] || [])].sort();
        return acc;
      }, {}),
  };
};

export function HostArea({
  loc,
  session,
  onLogout,
  reload,
  showToast,
  onTischform,
  onSeen,
  onDirtyChange,
}) {
  const { t } = useTranslation();
  const [tab, setTab] = useState("res");

  const [seats, setSeats] = useState(
    (loc.tisch && loc.tisch.seats) || loc.seats || 8,
  );

  const [days, setDays] = useState(loc.days || []);
  const [slots, setSlots] = useState(loc.slots || []);

  const [slotsByDay, setSlotsByDay] = useState(() => {
    const existing = loc.slotsByDay || {};

    if (
      Object.keys(existing).length === 0 &&
      (loc.slots || []).length > 0 &&
      (loc.days || []).length > 0
    ) {
      const map = {};

      loc.days.forEach((d) => {
        map[d] = [...loc.slots];
      });

      return map;
    }

    return existing;
  });

  const [effectiveFromByDay, setEffectiveFromByDay] = useState(
    loc.effectiveFromByDay || {},
  );

  const [fensterVon, setFensterVon] = useState(
    (loc.fenster && loc.fenster.von) || (loc.slots && loc.slots[0]) || "18:00",
  );

  const [fensterBis, setFensterBis] = useState(
    (loc.fenster && loc.fenster.bis) ||
      (loc.slots && loc.slots[loc.slots.length - 1]) ||
      "20:00",
  );

  const [takt, setTakt] = useState((loc.fenster && loc.fenster.takt) || 60);

  const [mehrfach, setMehrfach] = useState(!!loc.mehrfach);
  const [masse, setMasse] = useState(loc.masse || "");
  const [sonder, setSonder] = useState(loc.sonder || {});

  useEffect(() => {
    setSonder(loc.sonder || {});
  }, [loc.sonder]);

  const [aktionen, setAktionen] = useState(loc.aktionen || []);
  const [angebot, setAngebot] = useState(loc.angebot || "");
  const [webhook, setWebhook] = useState(loc.webhook || "");
  const [pending, setPending] = useState([]);
  const [fotos, setFotos] = useState([]);
  const [email, setEmail] = useState(loc.email || "");
  const [desc, setDesc] = useState(loc.desc || "");

  const [name, setName] = useState(loc.name || "");
  const [strasse, setStrasse] = useState(loc.strasse || "");
  const [plz, setPlz] = useState(loc.plz || "");
  const [city, setCity] = useState(loc.city || "");
  const [region, setRegion] = useState(loc.region || "");
  const [type, setType] = useState(loc.type || "");
  const [telefon, setTelefon] = useState(loc.telefon || "");

  const [inhaber, setInhaber] = useState(session?.inhaber || loc.inhaber || "");
  const normalizedInitialSlotsByDay = useMemo(() => {
    const existing = loc.slotsByDay || {};

    if (
      Object.keys(existing).length === 0 &&
      (loc.slots || []).length > 0 &&
      (loc.days || []).length > 0
    ) {
      const map = {};

      loc.days.forEach((d) => {
        map[d] = [...loc.slots];
      });

      return map;
    }

    return existing;
  }, [loc]);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwTried, setPwTried] = useState(false);
  const [pwCurrentWrong, setPwCurrentWrong] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resList, setResList] = useState(null);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const initialFormData = useMemo(
    () => ({
      seats: (loc.tisch && loc.tisch.seats) || loc.seats || 8,

      days: [...(loc.days || [])].sort(
        (a, b) => WEEK_ORDER.indexOf(a) - WEEK_ORDER.indexOf(b),
      ),

      slots: [...(loc.slots || [])].sort(),

      slotsByDay: normalizedInitialSlotsByDay,
      effectiveFromByDay: loc.effectiveFromByDay || {},

      fensterVon:
        (loc.fenster && loc.fenster.von) ||
        (loc.slots && loc.slots[0]) ||
        "18:00",

      fensterBis:
        (loc.fenster && loc.fenster.bis) ||
        (loc.slots && loc.slots[loc.slots.length - 1]) ||
        "20:00",

      takt: (loc.fenster && loc.fenster.takt) || 60,

      mehrfach: !!loc.mehrfach,

      masse: loc.masse || "",

      sonder: loc.sonder || {},

      aktionen: loc.aktionen || [],

      angebot: loc.angebot || "",

      webhook: loc.webhook || "",

      email: loc.email || "",

      desc: loc.desc || "",

      name: loc.name || "",

      strasse: loc.strasse || "",

      plz: loc.plz || "",

      city: loc.city || "",

      region: loc.region || "",

      type: loc.type || "",

      telefon: loc.telefon || "",

      inhaber: session?.inhaber || loc.inhaber || "",
    }),
    [loc, session, normalizedInitialSlotsByDay],
  );

  // =========================================================
  // CURRENT FORM DATA
  // =========================================================

  const currentFormData = useMemo(
    () => ({
      seats,

      days: [...days].sort(
        (a, b) => WEEK_ORDER.indexOf(a) - WEEK_ORDER.indexOf(b),
      ),

      slots: [...slots].sort(),

      slotsByDay,
      effectiveFromByDay,

      fensterVon,

      fensterBis,

      takt,

      mehrfach,

      masse,

      sonder,

      aktionen,

      angebot,

      webhook,

      email,

      desc,

      name,

      strasse,

      plz,

      city,

      region,

      type,

      telefon,

      inhaber,
    }),
    [
      seats,
      days,
      slots,
      slotsByDay,
      effectiveFromByDay,
      fensterVon,
      fensterBis,
      takt,
      mehrfach,
      masse,
      sonder,
      aktionen,
      angebot,
      webhook,
      email,
      desc,
      name,
      strasse,
      plz,
      city,
      region,
      type,
      telefon,
      inhaber,
    ],
  );

  const isDirty = useMemo(() => {
    return JSON.stringify(currentFormData) !== JSON.stringify(initialFormData);
  }, [currentFormData, initialFormData]);

  useEffect(() => {
    if (onDirtyChange) {
      onDirtyChange(isDirty);
    }
  }, [isDirty, onDirtyChange]);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res = await listReservations(loc.id);

        if (alive) {
          setResList(res || []);
        }

        const pend = await listNotifications(loc.id);

        if (alive) {
          setPending(pend || []);
        }

        const fot = await getPhotos(loc.id);

        if (alive) {
          setFotos(fot || []);
        }
      } catch (err) {
        //console.warn("Could not load host data", err?.code || err);

        if (alive) {
          setResList([]);
        }
      }

      try {
        await setSetting(`seen:${loc.id}`, new Date().toISOString());

        if (onSeen) {
          onSeen();
        }
      } catch {}
    })();

    return () => {
      alive = false;
    };
  }, [loc.id]);

  const profileValid = [name, strasse, plz, city, inhaber].every((f) =>
    f.trim(),
  );

  const pwErrs = {
    current: !currentPw
      ? t("host.profil.pwErrors.currentRequired")
      : pwCurrentWrong
        ? t("host.profil.pwErrors.currentWrong")
        : null,

    neu: !newPw
      ? t("host.profil.pwErrors.newRequired")
      : newPw.length < 8
        ? t("host.profil.pwErrors.minLength")
        : null,

    confirm: !confirmPw
      ? t("host.profil.pwErrors.confirmRequired")
      : confirmPw !== newPw
        ? t("host.profil.pwErrors.mismatch")
        : null,
  };

  const requestNavigation = (action) => {
    if (typeof action !== "function") return;

    if (isDirty) {
      setPendingAction(() => action);
      setShowDiscardModal(true);
      return;
    }

    action();
  };

  const save = async (requireConfig = true) => {
    if (!profileValid) {
      showToast(t("host.toasts.fillProfile"));
      return;
    }

    if (!isEmail(email)) {
      showToast(t("host.toasts.emailRequired"));
      return;
    }

    if (requireConfig && days.length === 0) {
      showToast(t("host.toasts.dayRequired"));
      return;
    }

    const hasAnySlots = Object.values(slotsByDay).some(
      (daySlots) => Array.isArray(daySlots) && daySlots.length > 0,
    );

    if (requireConfig && !hasAnySlots) {
      showToast(t("host.toasts.slotRequired"));
      return;
    }

    if (requireConfig) {
      const missing = days.filter((d) => {
        const daySlots = slotsByDay[d];

        return !Array.isArray(daySlots) || daySlots.length === 0;
      });

      if (missing.length > 0) {
        showToast(
          t("host.toasts.missingDayTimes", {
            days: missing.map((d) => dayShortName[d % 7]).join(", "),
          }),
        );
        return;
      }
    }

    setSaving(true);

    try {
      const pwActive = Boolean(currentPw || newPw || confirmPw);

      if (pwActive) {
        setPwTried(true);
        setPwCurrentWrong(false);

        if (pwErrs.current || pwErrs.neu || pwErrs.confirm) {
          showToast(t("host.toasts.checkPasswordFields"));
          return;
        }
      }

      if (pwActive) {
        try {
          await reauthenticateHost(currentPw);
        } catch (error) {
          const wrongPassword = [
            "auth/invalid-credential",
            "auth/invalid-login-credentials",
            "auth/wrong-password",
          ].includes(error?.code);

          if (wrongPassword) {
            setPwCurrentWrong(true);
          }

          showToast(
            wrongPassword
              ? t("host.toasts.passwordWrong")
              : t("host.toasts.passwordNotVerified"),
          );

          return;
        }
      }

      const savedPhotos = await setPhotos(loc.id, fotos);

      setFotos(savedPhotos);

      const overrides = {
        seats,
        tisch: loc.tisch ? distributeSeats(loc.tisch, seats) : null,

        titelbild: savedPhotos[0] ? savedPhotos[0].klein : "",

        fotoAnzahl: savedPhotos.length,

        days: [...days].sort((a, b) => a - b),

        slots: [...slots].sort(),

        slotsByDay: Object.fromEntries(
          Object.entries(slotsByDay).filter(([day]) =>
            days.includes(Number(day)),
          ),
        ),

        effectiveFromByDay,

        fenster: {
          von: fensterVon,
          bis: fensterBis,
          takt,
        },

        mehrfach,
        masse: masse.trim(),
        sonder,
        aktionen,
        angebot: angebot.trim(),
        webhook: webhook.trim(),
        email: email.trim(),
        desc: desc.trim(),
        name: name.trim(),
        strasse: strasse.trim(),
        plz: plz.trim(),
        city: city.trim(),
        region,
        type,
        inhaber: inhaber.trim(),
        telefon: telefon.trim(),
        provisional: false,
      };

      await upsertVenue({
        ...loc,
        ...overrides,
      });

      if (pwActive) {
        await updateHostPassword(newPw);

        setCurrentPw("");
        setNewPw("");
        setConfirmPw("");
        setPwTried(false);
        setPwCurrentWrong(false);
      }

      if (typeof reload === "function") {
        reload();
      }

      showToast(t("host.toasts.saved"));
    } catch (err) {
      showToast(
        err?.message
          ? t("host.toasts.saveFailedWithMessage", { message: err.message })
          : t("host.toasts.saveFailed"),
      );
    } finally {
      setSaving(false);
    }
  };

  const cancel = async (r) => {
    try {
      const occ = {
        ...((await getOccupancy(loc.id, r.dateKey)) || {}),
      };

      (r.slots || [r.slot]).forEach((s) => {
        occ[s] = (occ[s] || []).filter((n) => !r.seats.includes(n));
      });

      await setOccupancy(loc.id, r.dateKey, occ);

      const list = (await listReservations(loc.id)).filter(
        (x) => x.id !== r.id,
      );

      await removeReservation(loc.id, r.id);

      setResList(list);

      showToast(t("host.toasts.cancelled"));
    } catch (err) {
      showToast(t("host.toasts.cancelFailed"));
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayKey = dateKey(today);

  // Only current and future reservations matter — past ones are hidden from
  // the list and ignored by the reservation-protection indicators.
  const activeReservations = (resList || []).filter(
    (r) => r.dateKey >= todayKey,
  );

  const sorted = activeReservations.slice().sort((a, b) => {
    const dateCompare = a.dateKey.localeCompare(b.dateKey);

    if (dateCompare !== 0) {
      return dateCompare;
    }

    return (a.slot || "").localeCompare(b.slot || "");
  });

  // Group the sorted list into consecutive runs that share a dateKey, so
  // the reservations list can be rendered under one date heading per day.
  const grouped = [];

  sorted.forEach((r) => {
    const last = grouped[grouped.length - 1];

    if (last && last.dateKey === r.dateKey) {
      last.items.push(r);
    } else {
      grouped.push({ dateKey: r.dateKey, items: [r] });
    }
  });

  // Weekdays that already have current/future reservations (any date, not
  // only the next occurrence) — drives the protective banner above the day
  // chips and the per-day warnings in the slot editor.
  const reservationWeekdays = new Set(
    activeReservations
      .map((r) => {
        const d = new Date(`${r.dateKey}T00:00:00`);
        return Number.isNaN(d.getTime()) ? null : d.getDay();
      })
      .filter((day) => day !== null),
  );

  const sendNow = async (n) => {
    const an = n.an || email;

    try {
      const res = await sendEmailJs({
        to: an,
        subject: n.betreff,
        text: (n.lines || []).join("\n\n"),
        html: n.html || "",
      });

      if (res.success) {
        await removeNotification(loc.id, n.id);

        setPending((p) => p.filter((x) => x.id !== n.id));

        showToast(t("host.toasts.emailSent"));
        return;
      }
    } catch (err) {
      console.warn("Email sending failed:", err);
    }

    window.location.href = mailtoHref({
      ...n,
      an,
    });
  };

  const getNextWeekdayDate = (dayIndex) => {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const currentDay = today.getDay();

    let difference = dayIndex - currentDay;

    if (difference < 0) {
      difference += 7;
    }

    const date = new Date(today);
    date.setDate(date.getDate() + difference);

    return date;
  };
  const formatFullDate = (date) => {
    return date.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };
  return (
    <div className="mt-wrap">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 20,
          flexWrap: "wrap",
          margin: "12px 0 14px",
          width: "100%",
        }}
      >
        {/* Host information */}
        <div 
         >
          <div className="eyebrow">
            {t("host.areaLabel", { city: loc.city })}
          </div>

          <h2
            className="f-display"
            style={{
              fontSize: "clamp(24px,4vw,34px)",
              fontWeight: 600,
              margin: "6px 0 2px",
              color: "var(--kobalt-dunkel)",
            }}
          >
            {loc.name}
          </h2>

          <div className="notice">
            {t("host.notificationsGoTo")}{" "}
            <b>{email || t("host.noEmailOnFile")}</b>
          </div>
        </div>

        {/* Sign out + Registration code */}
        <div className="signoutcontainer"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => requestNavigation(onLogout)}
          >
            {t("host.signOut")}
          </button>

          <div
            className="card"
            style={{
              padding: "10px 16px",
              textAlign: "right",
              minWidth: 188,
            }}
          >
            <div className="label" style={{ marginBottom: 2 }}>
              {t("host.registrationCode")}
            </div>

            <div
              style={{
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: 18,
                letterSpacing: 1.5,
                fontWeight: 700,
                color: "var(--kobalt-dunkel)",
              }}
            >
              {loc.regCode || "—"}
            </div>
          </div>
        </div>
      </div>

      <div className="tabbar">
        <button
          className={`tab ${tab === "res" ? "on" : ""}`}
          onClick={() => requestNavigation(() => setTab("res"))}
        >
          {t("host.tabs.reservations")}
          {sorted.length > 0 && ` (${sorted.length})`}
        </button>

        <button
          className={`tab ${tab === "cfg" ? "on" : ""}`}
          onClick={() => requestNavigation(() => setTab("cfg"))}
        >
          {t("host.tabs.myMischtisch")}
        </button>

        <button
          className={`tab ${tab === "profil" ? "on" : ""}`}
          onClick={() => requestNavigation(() => setTab("profil"))}
        >
          {t("host.tabs.profile")}
        </button>
      </div>

      {tab === "res" && (
        <div className="tabpanel">
          <section className="card mt-section">
            <div className="mt-section-head">
              <div>
                <h1 className="mt-section-title lg">{t("host.res.title")}</h1>
                <p className="mt-section-subtitle">{t("host.res.subtitle")}</p>
              </div>

              {sorted.length > 0 && (
                <span className="count-badge">{sorted.length}</span>
              )}
            </div>

            <div className="mt-section-body">
              {pending.length > 0 && (
                <div
                  className="card"
                  style={{
                    borderColor: "var(--honig)",
                    background: "#FDF6E7",
                  }}
                >
                  <div
                    className="f-display"
                    style={{
                      fontSize: 18,
                      fontWeight: 600,
                      color: "var(--kobalt-dunkel)",
                    }}
                  >
                    {pending.length === 1
                      ? t("host.res.notificationsWaitingOne")
                      : t("host.res.notificationsWaitingMany", {
                          count: pending.length,
                        })}
                  </div>

                  <div
                    style={{
                      fontSize: 14,
                      color: "#3A4258",
                      margin: "6px 0 10px",
                    }}
                  >
                    {t("host.res.pendingText")}
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gap: 8,
                    }}
                  >
                    {pending.map((n) => (
                      <div
                        key={n.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 10,
                          alignItems: "center",
                          flexWrap: "wrap",
                          fontSize: 14,
                        }}
                      >
                        <span>{n.betreff}</span>

                        <span
                          style={{
                            display: "flex",
                            gap: 8,
                          }}
                        >
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => sendNow(n)}
                          >
                            {t("host.res.sendNow")}
                          </button>

                          <button
                            className="btn btn-danger btn-sm"
                            onClick={async () => {
                              const rest = pending.filter((x) => x.id !== n.id);

                              setPending(rest);

                              await removeNotification(loc.id, n.id);
                            }}
                          >
                            {t("host.res.done")}
                          </button>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {resList === null ? (
                <div className="notice">{t("host.res.loading")}</div>
              ) : sorted.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "20px 10px",
                    color: "#5B627A",
                  }}
                >
                  {t("host.res.empty")}
                  <br />
                  <span className="notice">{t("host.res.emptyHint")}</span>
                </div>
              ) : (
                <div className="res-groups">
                  {grouped.map((g) => (
                    <div key={g.dateKey} className="res-group">
                      {/* Date heading */}
                      <div className="res-group-label">
                        {shortDate(g.dateKey)}
                      </div>

                      <div className="res-group-list">
                        {g.items.map((r) => (
                          <div key={r.id} className="res-row">
                            {/* LEFT: time + chair */}
                            <div className="res-time-area">
                              <div className="res-row-time">
                                {(r.slots || [r.slot]).join(" & ")} ·{" "}
                                {r.persons === 1
                                  ? t("host.res.personsOne")
                                  : t("host.res.personsMany", {
                                      count: r.persons,
                                    })}
                              </div>

                              <span className="res-chip">
                                {r.seats.length === 1
                                  ? t("host.res.chair")
                                  : t("host.res.chairs")}{" "}
                                {r.seats.map((n) => n + 1).join(", ")}
                              </span>
                            </div>

                            {/* MIDDLE: guest information */}
                            <div className="res-guest-area">
                              <div className="res-guest">
                                {r.vorname} {r.nachname}
                              </div>

                              <div className="res-contact">
                                <a href={`mailto:${r.email}`}>{r.email}</a>
                                {" · "}
                                {r.telefon}
                              </div>

                              <div className="res-contact">
                                {r.strasse}, {r.plzort}
                              </div>

                              {r.aktion && (
                                <div className="res-promotion">
                                  {t("host.res.promotion", {
                                    aktion: r.aktion,
                                  })}
                                </div>
                              )}

                              {r.note && (
                                <div className="res-note">
                                  {t("host.res.message", { note: r.note })}
                                </div>
                              )}
                            </div>

                            {/* RIGHT: confirmed only */}
                            <div className="res-status">
                              <span className="status-pill confirmed">
                                <span className="status-dot"></span>
                                {t("host.res.confirmed")}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {tab === "cfg" && (
        <div className="tabpanel">
          <div className="mt-head">
            <h1 className="mt-title">{t("host.cfg.title")}</h1>
            <p className="mt-subtitle">{t("host.cfg.subtitle")}</p>
          </div>

          <div className="mt-sections">
            {/* ---------------------------------------------------
                Table & seats
            --------------------------------------------------- */}
            <section className="card mt-section">
              <div className="mt-section-head">
                <div>
                  <h3 className="mt-section-title">
                    {t("host.cfg.table.title")}
                  </h3>
                  <p className="mt-section-subtitle">
                    {t("host.cfg.table.subtitle")}
                  </p>
                </div>

                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    if (typeof onTischform !== "function") {
                      showToast?.(t("host.cfg.table.shapePageError"));
                      return;
                    }

                    requestNavigation(() => onTischform(loc.id));
                  }}
                >
                  {t("host.cfg.table.setChangeShape")}
                </button>
              </div>

              <div className="mt-section-body">
                <div className="mt-row-2">
                  <div>
                    <div className="label">{t("host.cfg.table.shape")}</div>

                    <div className="static-box">
                      {loc.tisch
                        ? tischLabel(loc.tisch)
                        : t("host.cfg.table.standardLayout")}
                    </div>
                  </div>

                  <div>
                    <div className="label">{t("host.cfg.table.size")}</div>

                    <SeatStepper seats={seats} onChange={setSeats} />

                    {loc.tisch && seats !== loc.tisch.seats && (
                      <div className="notice" style={{ marginTop: 6 }}>
                        {t("host.cfg.table.redistribute", {
                          shape: tischLabel(loc.tisch).split(" · ")[0],
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="label" htmlFor="hg-masse">
                    {t("host.cfg.table.dimensions")}
                  </label>

                  <input
                    id="hg-masse"
                    className="input"
                    value={masse}
                    onChange={(e) => {
                      setMasse(e.target.value);
                    }}
                    placeholder={t("host.cfg.table.dimensionsPlaceholder")}
                  />
                </div>
              </div>
            </section>

            {/* ---------------------------------------------------
                Photos
            --------------------------------------------------- */}
            <section className="card mt-section">
              <div className="mt-section-head">
                <div>
                  <h3 className="mt-section-title">
                    {t("host.cfg.photos.title")}
                  </h3>
                  <p className="mt-section-subtitle">
                    {t("host.cfg.photos.subtitle")}
                  </p>
                </div>
              </div>

              <div className="mt-section-body">
                <div className="photo-drop">
                  <PhotoUploader
                    fotos={fotos}
                    onChange={setFotos}
                    showToast={showToast}
                  />
                </div>
              </div>
            </section>

            {/* ---------------------------------------------------
                Weekly bookable times
            --------------------------------------------------- */}
            <section className="card mt-section">
              <div className="mt-section-head">
                <div>
                  <h3 className="mt-section-title">
                    {t("host.cfg.times.title")}
                  </h3>
                  <p className="mt-section-subtitle">
                    {t("host.cfg.times.subtitle")}
                  </p>
                </div>
              </div>

              <div className="mt-section-body">
                {days.some((day) => reservationWeekdays.has(day)) && (
                  <div
                    role="status"
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "flex-start",
                      marginBottom: 12,
                      padding: "10px 12px",
                      border: "1px solid #D8B36A",
                      borderRadius: 7,
                      background: "#FFF8E8",
                      color: "#5B4A2A",
                      fontSize: 12,
                      lineHeight: 1.45,
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        flexShrink: 0,
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        border: "1.5px solid #B98A2F",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 13,
                        fontWeight: 700,
                        marginTop: 1,
                      }}
                    >
                      i
                    </span>

                    <div>
                      <strong>
                        {t("host.cfg.times.protectionTitle")}
                      </strong>

                      <div style={{ marginTop: 2, color: "#6B5A3E" }}>
                        {t("host.cfg.times.protectionText")}
                      </div>
                    </div>
                  </div>
                )}

                <DayChips
                  days={days}
                  onChange={setDays}
                  protectedDays={reservationWeekdays}
                />

                {days.length === 0 ? (
                  <span className="notice">
                    {t("host.cfg.times.selectDaysFirst")}
                  </span>
                ) : (
                  <div className="day-slot-list">
                    {days.map((day) => {
                      const dayDate = getNextWeekdayDate(day);

                      const dayDateKey = dateKey(dayDate);

                      const dayReservations = (resList || []).filter(
                        (reservation) => reservation.dateKey === dayDateKey,
                      );

                      // Any reservation on this weekday (not only the next
                      // occurrence) marks the day as protected.
                      const hasReservation = reservationWeekdays.has(day);

                      return (
                        <div key={day} className="day-slot-card">
                          <div className="day-slot-label">
                            {dayLongName(day)}
                          </div>

                          <SlotEditor
                            dayName={dayLongName(day)}
                            slots={slotsByDay[day] || []}
                            existingReservation={
                              hasReservation
                                ? {
                                    date: dayDateKey,
                                    reservations: dayReservations,
                                  }
                                : null
                            }
                            onRemove={() => {
                              setDays((prev) =>
                                prev.filter((d) => d !== day),
                              );

                              setSlotsByDay((prev) => {
                                const next = { ...prev };
                                delete next[day];
                                return next;
                              });

                              setEffectiveFromByDay((prev) => {
                                const next = { ...prev };
                                delete next[day];
                                return next;
                              });
                            }}
                            onChange={(newSlots) => {
                              setSlotsByDay((prev) => ({
                                ...prev,
                                [day]: newSlots,
                              }));

                              /*
                               * If this day already has a reservation,
                               * the new schedule becomes effective from
                               * this week's occurrence of that weekday.
                               *
                               * Example:
                               * Saturday reservation
                               * -> 2026-08-22
                               */
                              if (hasReservation) {
                                setEffectiveFromByDay((prev) => ({
                                  ...prev,
                                  [day]: dayDateKey,
                                }));
                              } else {
                                /*
                                 * No reservation means the new schedule
                                 * applies immediately.
                                 */
                                setEffectiveFromByDay((prev) => {
                                  const next = { ...prev };
                                  delete next[day];
                                  return next;
                                });
                              }
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            {/* ---------------------------------------------------
                Special dates
            --------------------------------------------------- */}
            <section className="card mt-section">
              <div className="mt-section-head">
                <div>
                  <h3 className="mt-section-title">
                    {t("host.cfg.specialDates.title")}
                  </h3>
                  <p className="mt-section-subtitle">
                    {t("host.cfg.specialDates.subtitle")}
                  </p>
                </div>
              </div>

              <div className="mt-section-body">
                <Sondertermine
                  sonder={sonder}
                  onChange={(date, entry) => {
                    setSonder((prev) => {
                      const next = { ...prev };

                      if (entry === null) {
                        delete next[date];
                      } else {
                        next[date] = entry;
                      }

                      return next;
                    });
                  }}
                  standardSlots={slots}
                  showToast={showToast}
                />
              </div>
            </section>

            {/* ---------------------------------------------------
                Offers & promotions
            --------------------------------------------------- */}
            <section className="card mt-section">
              <div className="mt-section-head">
                <div>
                  <h3 className="mt-section-title">
                    {t("host.cfg.offers.title")}
                  </h3>
                  <p className="mt-section-subtitle">
                    {t("host.cfg.offers.subtitle")}
                  </p>
                </div>
              </div>

              <div className="mt-section-body">
                {/* <div
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "flex-start",
                    cursor: "pointer",
                    fontSize: 14.5,
                  }}
                  onClick={() => setMehrfach(!mehrfach)}
                >
                  Toggle Switch
                  <div
                    style={{
                      position: "relative",
                      display: "inline-flex",
                      width: "55px",
                      height: 27,
                      backgroundColor: mehrfach
                        ? "var(--kobalt, #1b3a6b)"
                        : "#d0d0d0",
                      borderRadius: 16,
                      padding: 0,
                      cursor: "pointer",
                      marginTop: 2,
                      transition: "background-color 0.3s ease",
                      alignItems: "center",
                      justifyContent: mehrfach ? "flex-end" : "flex-start",
                      flexShrink: 0,
                      border: "none",
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        backgroundColor: "white",
                        borderRadius: "50%",
                        margin: "2px",
                        transition: "all 0.3s ease",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                      }}
                    />
                  </div>

                  <span>
                    <b>{t("host.cfg.offers.allowMultiple")}</b>
                    <br />
                    <span
                      style={{
                        color: "#5B627A",
                        fontSize: 14,
                      }}
                    >
                      {t("host.cfg.offers.allowMultipleHint")}
                    </span>
                  </span>
                </div> */}

                <div>
                  <label className="label" htmlFor="hg-angebot">
                    {t("host.cfg.offers.permanentOffer")}
                  </label>

                  <input
                    id="hg-angebot"
                    className="input"
                    value={angebot}
                    onChange={(e) => {
                      setAngebot(e.target.value);
                    }}
                    placeholder={t("host.cfg.offers.permanentOfferPlaceholder")}
                  />
                </div>

                <div>
                  <div className="label">
                    {t("host.cfg.offers.promotionWeeks")}
                  </div>

                  <div className="notice" style={{ marginBottom: 10 }}>
                    {t("host.cfg.offers.promotionWeeksHint")}
                  </div>

                  <AktionenEditor
                    aktionen={aktionen}
                    onChange={setAktionen}
                    showToast={showToast}
                  />
                </div>
              </div>
            </section>

            {/* ---------------------------------------------------
                Confirmation information
            --------------------------------------------------- */}
            {/* <section className="card mt-section">
              <div className="mt-section-head">
                <div>
                  <h3 className="mt-section-title">Confirmation information</h3>
                  <p className="mt-section-subtitle">
                    Where booking confirmations are sent and what guests see
                    about your Mischtisch.
                  </p>
                </div>
              </div>

              <div className="mt-section-body">
                <div className="form-grid">
                  <div>
                    <label className="label" htmlFor="hg-em">
                      Email for reservation confirmations *
                    </label>

                    <input
                      id="hg-em"
                      type="email"
                      className="input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="reservations@your-venue.example"
                    />
                  </div>

                  <div>
                    <label className="label" htmlFor="hg-desc">
                      Short description (visible to guests)
                    </label>

                    <input
                      id="hg-desc"
                      className="input"
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                      placeholder="What makes your Mischtisch special?"
                    />
                  </div>
                </div>
              </div>
            </section>
            */}
          </div>

          <div
            className="mt-save-bar"
            style={{
              position: "sticky",
              bottom: 10,
              zIndex: 50,
              background: "var(--porzellan)",
              padding: "12px",
              marginTop: 20,
              borderTop: "1px solid #D4D1C8",
            }}
          >
            <span className="notice">{t("host.cfg.changesApply")}</span>

            <button
              className="btn btn-primary"
              disabled={saving}
              onClick={() => save(true)}
            >
              {saving ? t("host.cfg.saving") : t("host.cfg.saveChanges")}
            </button>
          </div>
        </div>
      )}

      {tab === "profil" && (
        <div className="tabpanel">
          <div className="mt-head">
            <h1 className="mt-title">{t("host.profil.title")}</h1>
            <p className="mt-subtitle">{t("host.profil.subtitle")}</p>
          </div>

          <div className="mt-sections">
            {/* ---------------------------------------------------
                Venue details
            --------------------------------------------------- */}
            <section className="card mt-section">
              <div className="mt-section-head">
                <div>
                  <h3 className="mt-section-title">
                    {t("host.profil.venueDetails")}
                  </h3>
                </div>
              </div>

              <div className="mt-section-body">
                <div className="form-grid">
                  <div>
                    <label className="label" htmlFor="hg-name">
                      {t("host.profil.venueName")}
                    </label>

                    <input
                      id="hg-name"
                      className="input"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                      }}
                    />
                  </div>

                  <div>
                    <label className="label" htmlFor="hg-inh">
                      {t("host.profil.owner")}
                    </label>

                    <input
                      id="hg-inh"
                      className="input"
                      value={inhaber}
                      onChange={(e) => {
                        setInhaber(e.target.value);
                      }}
                    />
                  </div>

                  <div>
                    <label className="label" htmlFor="hg-str">
                      {t("host.profil.street")}
                    </label>

                    <input
                      id="hg-str"
                      className="input"
                      value={strasse}
                      onChange={(e) => {
                        setStrasse(e.target.value);
                      }}
                    />
                  </div>

                  <div>
                    <label className="label" htmlFor="hg-plz">
                      {t("host.profil.postcode")}
                    </label>

                    <input
                      id="hg-plz"
                      className="input"
                      value={plz}
                      onChange={(e) => {
                        setPlz(e.target.value);
                      }}
                      placeholder="01067"
                    />
                  </div>

                  <div>
                    <label className="label" htmlFor="hg-city">
                      {t("host.profil.town")}
                    </label>

                    <input
                      id="hg-city"
                      className="input"
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value);
                      }}
                    />
                  </div>

                  <div>
                    <label className="label" htmlFor="hg-region">
                      {t("host.profil.region")}
                    </label>

                    <select
                      id="hg-region"
                      className="input"
                      value={region}
                      onChange={(e) => {
                        setRegion(e.target.value);
                      }}
                    >
                      {REGIONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label" htmlFor="hg-type">
                      {t("host.profil.venueType")}
                    </label>

                    <select
                      id="hg-type"
                      className="input"
                      value={type}
                      onChange={(e) => {
                        setType(e.target.value);
                      }}
                    >
                      {VENUE_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label" htmlFor="hg-tel">
                      {t("host.profil.phone")}
                    </label>

                    <input
                      id="hg-tel"
                      type="tel"
                      className="input"
                      value={telefon}
                      onChange={(e) => {
                        setTelefon(e.target.value);
                      }}
                      placeholder="+49 351 1234567"
                    />
                  </div>
                </div>

                <p className="notice">{t("host.profil.detailsNotice")}</p>
              </div>
            </section>

            {/* ---------------------------------------------------
                Change password
            --------------------------------------------------- */}
            <section className="card mt-section">
              <div className="mt-section-head">
                <div>
                  <h3 className="mt-section-title">
                    {t("host.profil.changePassword")}
                  </h3>
                </div>
              </div>

              <div className="mt-section-body">
                <div className="form-grid">
                  <div>
                    <label className="label" htmlFor="hg-pw-alt">
                      {t("host.profil.currentPassword")}
                    </label>

                    <input
                      id="hg-pw-alt"
                      type="password"
                      className={`input${
                        pwTried && pwErrs.current ? " field-err" : ""
                      }`}
                      value={currentPw}
                      onChange={(e) => {
                        setCurrentPw(e.target.value);
                      }}
                      autoComplete="current-password"
                    />

                    {pwTried && pwErrs.current && (
                      <div className="field-error">{pwErrs.current}</div>
                    )}
                  </div>

                  <div>
                    <label className="label" htmlFor="hg-pw-neu">
                      {t("host.profil.newPassword")}
                    </label>

                    <input
                      id="hg-pw-neu"
                      type="password"
                      className={`input${
                        pwTried && pwErrs.neu ? " field-err" : ""
                      }`}
                      value={newPw}
                      onChange={(e) => {
                        setNewPw(e.target.value);
                      }}
                      autoComplete="new-password"
                    />

                    {pwTried && pwErrs.neu && (
                      <div className="field-error">{pwErrs.neu}</div>
                    )}
                  </div>

                  <div>
                    <label className="label" htmlFor="hg-pw-wdh">
                      {t("host.profil.confirmPassword")}
                    </label>

                    <input
                      id="hg-pw-wdh"
                      type="password"
                      className={`input${
                        pwTried && pwErrs.confirm ? " field-err" : ""
                      }`}
                      value={confirmPw}
                      onChange={(e) => {
                        setConfirmPw(e.target.value);
                      }}
                      autoComplete="new-password"
                    />

                    {pwTried && pwErrs.confirm && (
                      <div className="field-error">{pwErrs.confirm}</div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: 20,
            }}
          >
            <button
              className="btn btn-primary"
              disabled={saving}
              onClick={() => save(false)}
            >
              {saving ? t("host.cfg.saving") : t("host.profil.saveProfile")}
            </button>
          </div>
        </div>
      )}
      {showDiscardModal && (
        <div className="modal-overlay">
          <div className="card modal-box">
            <h3 className="f-display" style={{ marginTop: 0 }}>
              {t("host.modal.title")}
            </h3>
            <p className="notice">{t("host.modal.text")}</p>
            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}
            >
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setShowDiscardModal(false);
                  setPendingAction(null);
                }}
              >
                {t("host.modal.keepEditing")}
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => {
                  setShowDiscardModal(false);
                  if (pendingAction) {
                    pendingAction();
                  }
                  setPendingAction(null);
                }}
              >
                {t("host.modal.discard")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
