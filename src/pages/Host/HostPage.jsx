import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./HostPage.css";

import {
  getSession,
  getVenue,
  setSession as saveSession,
} from "../../services/storage.js";

import { LoginForm, RegisterForm } from "../../components/AuthForms";
import { HostArea } from "../../components/HostArea.jsx";

export function HostPage({
  locations,
  reload,
  showToast,
  onAbout,
  onTischform,
  onSeen,
  onRecht,
  onHome,
  onCodes,
}) {
  const { t } = useTranslation();

  const safeShowToast =
    typeof showToast === "function"
      ? showToast
      : (message) => console.warn("Toast:", message);

  const safeReload =
    typeof reload === "function"
      ? reload
      : () => {
          console.warn("reload function is not available");
        };

  const [session, setSession] = useState(undefined);
  const [mode, setMode] = useState("login");
  const [regBetrieb, setRegBetrieb] = useState(null);

  // True once the direct venue read has settled (found or missing). While it
  // is false the venue may simply still be loading — the "venue not found"
  // error must not flash on page load before Firebase restored the session.
  const [venueLoaded, setVenueLoaded] = useState(false);

  // Session restoration is asynchronous (Firebase rehydrates auth state on
  // page load); getSession() waits for it, so a signed-in host is not shown
  // the login form right after loading the page.
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const s = await getSession();

        if (!alive) return;

        setSession(s || null);
      } catch {
        if (alive) {
          setSession(null);
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // The host's own venue is fetched directly via a public single-doc read so
  // the host area does not depend on the global venue list from AppContext.
  useEffect(() => {
    if (!session?.betriebId) {
      setVenueLoaded(true);
      return;
    }

    let alive = true;

    setVenueLoaded(false);

    (async () => {
      try {
        const venue = await getVenue(session.betriebId);
        if (alive && venue) setRegBetrieb(venue);
      } catch {
        // Read failed — treat as missing below once the fetch has settled.
      } finally {
        if (alive) setVenueLoaded(true);
      }
    })();

    return () => {
      alive = false;
    };
  }, [session]);

  const onDone = (s, betrieb) => {
    if (betrieb) {
      setRegBetrieb(betrieb);
    }

    setSession(s);
  };

  const logout = async () => {
    try {
      await saveSession(null);
    } catch {}

    setSession(null);
    safeShowToast(t("hostPage.signedOut"));
  };
 useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const renderAuth = (notice) => (
    <div
      className="host-page-container mt-wrap"
      style={{ padding: "28px 20px 60px", maxWidth: 960 }}
    >
      <div className="eyebrow">
        {t("hostPage.eyebrow")}
      </div>

      <h2
        className="f-display host-page-title"
        style={{
          fontSize: "clamp(26px,4.5vw,38px)",
          fontWeight: 600,
          margin: "6px 0 10px",
          color: "var(--kobalt-dunkel)",
        }}
      >
        {t("hostPage.title")}
      </h2>

      <p className="host-lead" style={{ marginBottom: 20 }}>
        {t("hostPage.lead")}
      </p>

      {notice && (
        <div
          className="card"
          style={{
            marginBottom: 14,
            borderColor: "var(--honig)",
            background: "#FDF6E7",
            fontSize: 14,
          }}
        >
          {notice}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <button
          className={`chip ${mode === "login" ? "on" : ""}`}
          onClick={() => setMode("login")}
          aria-pressed={mode === "login"}
        >
          {t("hostPage.signIn")}
        </button>

        <button
          className={`chip ${mode === "register" ? "on" : ""}`}
          onClick={() => setMode("register")}
          aria-pressed={mode === "register"}
        >
          {t("hostPage.register")}
        </button>
      </div>

      {mode === "login" ? (
        <>
          <LoginForm
            onDone={onDone}
            showToast={safeShowToast}
          />

          <p className="notice" style={{ marginTop: 10 }}>
            {t("hostPage.noAccount")}
          </p>
        </>
      ) : (
        <RegisterForm
          reload={reload}
          onHome={onHome}
          showToast={safeShowToast}
          onAbout={onAbout}
          onRecht={onRecht}
        />
      )}

      <div
        className="card"
        style={{
          marginTop: 14,
          background: "var(--kobalt)",
          border: "none",
          color: "#F1F3FB",
        }}
      >
        <div
          className="f-display"
          style={{
            fontSize: 19,
            fontWeight: 600,
            marginBottom: 6,
          }}
        >
          {t("hostPage.joinTitle")}
        </div>

        <div style={{ fontSize: 14.5, opacity: 0.92 }}>
          {t("hostPage.joinText")}
        </div>

        <button
          className="btn btn-sm"
          style={{
            marginTop: 12,
            background: "transparent",
            border: "1.5px solid #F1F3FB",
            color: "#F1F3FB",
          }}
          onClick={onAbout}
        >
          {t("hostPage.seeSteps")}
        </button>
      </div>
    </div>
  );

  const loadingScreen = (
    <div
      className="mt-wrap"
      style={{ padding: "40px 20px 60px", maxWidth: 960 }}
    >
      <span className="notice">
        {t("hostPage.loading")}
      </span>
    </div>
  );

  if (session === undefined) {
    return loadingScreen;
  }

  if (session) {
    const loc =
      (locations ?? []).find((l) => {
        return l?.id === session.betriebId;
      }) ||
      (regBetrieb && regBetrieb.id === session.betriebId
        ? regBetrieb
        : null);

    if (loc) {
      return (
        <div className="host-page-container">
          <HostArea
            key={loc.id}
            loc={loc}
            session={session}
            onLogout={logout}
            reload={safeReload}
            showToast={safeShowToast}
            onTischform={() => {
              if (typeof onTischform !== "function") {
                safeShowToast(
                  t("hostPage.tableShapeNavigationNotConfigured"),
                );
                return;
              }

              onTischform(loc.id);
            }}
            onSeen={onSeen}
          />
        </div>
      );
    }

    // The venue read is still in flight — keep the loading state instead of
    // prematurely declaring the venue missing right after session restore.
    if (!venueLoaded) {
      return loadingScreen;
    }

    return renderAuth(t("hostPage.venueNotFound"));
  }

  return renderAuth(null);
}