// Anmelden (jm) und Registrieren (Hm) für den Gastgeber-Bereich.
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { isEmail } from "../../utils/validate";
import { slugify } from "../../utils/strings";
import {
  createHostAccount,
  saveHostRegistration,
  setSession,
  signInHost,
} from "../../services/storage";
import { buildRegistrationMails } from "../../services/email";
import { sendRegistrationEmails } from "../../services/mailer";
import { REGIONS, VENUE_TYPES } from "../../services/data";

export function LoginForm({ onDone, showToast }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    // Clear previous error
    setError("");

    // Required fields
    if (!email.trim() || !pw.trim()) {
      setError(t("auth.login.required"));
      return;
    }

    // Invalid email format
    if (!isEmail(email.trim())) {
      setError(t("auth.login.invalidEmail"));
      return;
    }

    setBusy(true);

    try {
      const session = await signInHost(email.trim(), pw);

      await setSession(session);

      if (typeof onDone !== "function") {
        throw new Error("onDone is not a function");
      }

      onDone(session);

      if (typeof showToast === "function") {
        showToast(t("auth.login.welcomeBack"));
      }
    } catch (err) {
      // Firebase login errors
      if (
        err?.code === "auth/invalid-credential" ||
        err?.code === "auth/wrong-password" ||
        err?.code === "auth/user-not-found" ||
        err?.code === "auth/invalid-email"
      ) {
        setError(t("auth.login.incorrectCredentials"));
      } else {
        setError(t("auth.login.failed"));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="card"
      style={{
        display: "grid",
        gap: 12,
      }}
    >
      <div className="form-grid">
        <div>
          <label className="label" htmlFor="li-em">
            {t("auth.email")}
          </label>

          <input
            id="li-em"
            type="email"
            className="input"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            placeholder={t("auth.login.emailPlaceholder")}
          />
        </div>

        <div>
          <label className="label" htmlFor="li-pw">
            {t("auth.password")}
          </label>

          <input
            id="li-pw"
            type="password"
            className="input"
            value={pw}
            onChange={(e) => {
              setPw(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                submit();
              }
            }}
            placeholder="••••••"
          />
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div
          role="alert"
          style={{
            width: "fit-content",
            maxWidth: "100%",
            padding: "8px 12px",
            color: "#B4443C",
            fontSize: "13px",
            lineHeight: "1.4",
            fontWeight: 500,
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <button
          type="button"
          className="btn btn-primary"
          disabled={busy}
          onClick={submit}
        >
          {busy ? t("auth.login.checking") : t("auth.login.signIn")}
        </button>
      </div>
    </div>
  );
}

export function RegisterForm({ onHome, reload, showToast, onAbout, onRecht }) {
  const { t } = useTranslation();

  const [form, setForm] = useState({
    name: "",
    strasse: "",
    plz: "",
    city: "",
    region: REGIONS[0],
    type: VENUE_TYPES[0],
    inhaber: "",
    email: "",
    telefon: "",
    desc: "",
  });

  const [nv, setNv] = useState(false);
  const [ds, setDs] = useState(false);
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);
  const [error, setError] = useState("");

  const [confirmMail, setConfirmMail] = useState({
    sent: false,
    error: false,
    preview: null,
  });

  const field = (key) => (ev) => {
    setForm((f) => ({
      ...f,
      [key]: ev.target.value,
    }));

    setError("");
  };

  const errs = {
    name: form.name.trim().length < 3,
    strasse: form.strasse.trim().length < 3,
    plz: form.plz.trim().length < 4,
    city: form.city.trim().length < 2,
    inhaber: form.inhaber.trim().length < 3,
    email: !isEmail(form.email),

    nv: !nv,
    ds: !ds,
  };

  const valid = !Object.values(errs).some(Boolean);

  const inputCls = (key) => "input" + (tried && errs[key] ? " field-err" : "");

  const [generatedPassword] = useState(() =>
    Array.from({ length: 14 }, () =>
      "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$".charAt(
        Math.floor(Math.random() * 62),
      ),
    ).join(""),
  );

  const submit = async () => {
    setTried(true);

    setError("");

    if (!valid) {
      return;
    }

    setBusy(true);

    try {
      const account = await createHostAccount(
        form.email.trim(),
        generatedPassword,
      );

      const registration = {
        ...form,
        email: form.email.trim(),
        name: form.name.trim(),
        slug: slugify(form.name),
      };

      const venue = {
        ...registration,
        id: `b-${slugify(form.name)}-${slugify(form.city)}-${Date.now() % 100000}`,
        provisional: true,
      };

      const saved = await saveHostRegistration({
        venue,
        registration,
        profile: { inhaber: form.inhaber.trim() },
      });

      const session = {
        ...account,
        email: form.email.trim(),
      };

      await setSession(session);

      let mailResult = null;

      try {
        const mails = await buildRegistrationMails({
          venue,
          email: form.email.trim(),
          inhaber: form.inhaber.trim(),
          telefon: form.telefon.trim(),
          isNew: true,
          regCode: saved?.regCode || "",
          username: form.email.trim(),
          password: generatedPassword,
        });

        mailResult = await sendRegistrationEmails(mails);
      } catch (mailError) {
        console.error("Registration email failed:", mailError);
      }

      setConfirmMail({
        sent: Boolean(mailResult?.sent),
        error: !mailResult?.sent,
        preview: mailResult?.preview || null,
      });

      setDone({
        betrieb: registration,
        session,
      });

      if (typeof showToast === "function") {
        showToast(t("auth.register.success"));
      }

      if (typeof reload === "function") {
        reload();
      }

      // Registration creates the Firebase Auth account (an automatic
      // sign-in) — sign out so the user must log in manually.
      await setSession(null);
    } catch (err) {
      console.error("Registration failed:", err);

      if (err?.code === "auth/email-already-in-use") {
        setError(t("auth.register.emailInUse"));
      } else {
        setError(t("auth.register.failed"));
      }
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div>
        <div
          className="card"
          style={{
            textAlign: "center",
            padding: "28px 22px",
          }}
        >
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: "50%",
              background: "var(--kobalt)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              margin: "0 auto 12px",
            }}
          >
            ✓
          </div>

          <div
            className="f-display"
            style={{
              fontSize: 24,
              fontWeight: 600,
              color: "var(--kobalt-dunkel)",
            }}
          >
            {t("auth.register.saved")}
          </div>

          <p
            style={{
              color: "#3A4258",
              margin: "8px auto 0",
              maxWidth: "46ch",
            }}
          >
            {t("auth.register.accountFor")} <b>{done.betrieb.name}</b>{" "}
            {t("auth.register.accountCreated")} {done.session.email}.{" "}
            {confirmMail.sent
              ? confirmMail.preview
                ? t("auth.register.testConfirmation")
                : t("auth.register.confirmationSent")
              : confirmMail.error
                ? t("auth.register.confirmationFailed")
                : t("auth.register.confirmationSending")}
          </p>

          <div
            style={{
              marginTop: 12,
              padding: "10px 14px",
              border: "1px solid var(--honig)",
              background: "#FBF4E4",
              borderRadius: 10,
              fontSize: 14,
              textAlign: "left",
            }}
          >
            <b>{t("auth.register.underReview")}</b>{" "}
            {t("auth.register.reviewMessage")}
          </div>

          {confirmMail.preview && (
            <p
              className="notice"
              style={{
                marginTop: 8,
              }}
            >
              {t("auth.register.testMode")}{" "}
              <a href={confirmMail.preview} target="_blank" rel="noreferrer">
                {t("auth.register.viewTestEmail")}
              </a>
            </p>
          )}
        </div>

        <div
          style={{
            marginTop: 16,
          }}
        >
          <button className="btn btn-ghost" onClick={() => onHome && onHome()}>
            {t("auth.register.backHome")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="card"
      style={{
        display: "grid",
        gap: 16,
      }}
    >
      <div>
        <label className="label" htmlFor="rg-name">
          {t("auth.register.yourVenue")}
        </label>

        <input
          id="rg-name"
          className={inputCls("name")}
          value={form.name}
          onChange={field("name")}
          placeholder={t("auth.register.venuePlaceholder")}
        />
      </div>

      <div className="form-grid">
        <div>
          <label className="label" htmlFor="rg-str">
            {t("auth.register.street")}
          </label>

          <input
            id="rg-str"
            className={inputCls("strasse")}
            value={form.strasse}
            onChange={field("strasse")}
            placeholder={t("auth.register.streetPlaceholder")}
          />
        </div>

        <div>
          <label className="label" htmlFor="rg-plz">
            {t("auth.register.postcode")}
          </label>

          <input
            id="rg-plz"
            className={inputCls("plz")}
            value={form.plz}
            onChange={field("plz")}
            placeholder="01067"
          />
        </div>

        <div>
          <label className="label" htmlFor="rg-city">
            {t("auth.register.town")}
          </label>

          <input
            id="rg-city"
            className={inputCls("city")}
            value={form.city}
            onChange={field("city")}
            placeholder="Dresden"
          />
        </div>

        <div>
          <label className="label" htmlFor="rg-region">
            {t("auth.register.region")}
          </label>

          <select
            id="rg-region"
            className="input"
            value={form.region}
            onChange={field("region")}
          >
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="rg-type">
            {t("auth.register.venueType")}
          </label>

          <select
            id="rg-type"
            className="input"
            value={form.type}
            onChange={field("type")}
          >
            {VENUE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="rg-desc">
            {t("auth.register.description")}
          </label>

          <input
            id="rg-desc"
            className="input"
            value={form.desc}
            onChange={field("desc")}
            placeholder={t("auth.register.descriptionPlaceholder")}
          />
        </div>
      </div>

      <div className="form-grid">
        <div>
          <label className="label" htmlFor="rg-inh">
            {t("auth.register.owner")}
          </label>

          <input
            id="rg-inh"
            className={inputCls("inhaber")}
            value={form.inhaber}
            onChange={field("inhaber")}
            placeholder={t("auth.register.ownerPlaceholder")}
          />
        </div>

        <div>
          <label className="label" htmlFor="rg-em">
            {t("auth.register.email")}
          </label>

          <input
            id="rg-em"
            type="email"
            className={inputCls("email")}
            value={form.email}
            onChange={field("email")}
            placeholder={t("auth.login.emailPlaceholder")}
          />
        </div>

        <div>
          <label className="label" htmlFor="rg-tel">
            {t("auth.register.phone")}
          </label>

          <input
            id="rg-tel"
            type="tel"
            className="input"
            value={form.telefon}
            onChange={field("telefon")}
            placeholder={t("auth.register.phonePlaceholder")}
          />
        </div>
      </div>

      <label
        style={{
          display: "flex",
          gap: 10,
          alignItems: "flex-start",
          fontSize: 14,
          cursor: "pointer",
        }}
      >
        <input
          type="checkbox"
          checked={nv}
          onChange={(e) => setNv(e.target.checked)}
          style={{
            marginTop: 3,
          }}
        />

        <span>
          {t("auth.register.usageAgreement")}{" "}
          <button
            type="button"
            onClick={onAbout}
            style={{
              all: "unset",
              cursor: "pointer",
              color: "var(--kobalt)",
              fontWeight: 600,
              textDecoration: "underline",
            }}
          >
            {t("auth.register.seeSteps")}
          </button>
        </span>
      </label>

      <label
        style={{
          display: "flex",
          gap: 10,
          alignItems: "flex-start",
          fontSize: 14,
          cursor: "pointer",
        }}
      >
        <input
          type="checkbox"
          checked={ds}
          onChange={(e) => setDs(e.target.checked)}
          style={{
            marginTop: 3,
          }}
        />

        <span>
          {t("auth.register.privacyAgreement")}{" "}
          <Link
            to="/gastgeber-datenschutz"
            style={{
              color: "var(--kobalt)",
              fontWeight: 600,
              textDecoration: "underline",
            }}
          >
            {t("auth.register.privacyNotice")}
          </Link>
        </span>
      </label>

      {tried && !valid && (
        <div
          style={{
            color: "#B4443C",
            fontSize: 13.5,
          }}
        >
          {t("auth.register.requiredFields")}
          {errs.nv ? t("auth.register.confirmAgreement") : ""}
          {errs.ds ? t("auth.register.agreePrivacy") : ""}.
        </div>
      )}

      {error && (
        <div
          role="alert"
          style={{
            width: "fit-content",
            maxWidth: "100%",
            padding: "8px 12px",
            color: "#B4443C",
            fontSize: "13px",
            lineHeight: "1.4",
            fontWeight: 500,
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <span className="notice">{t("auth.register.prototype")}</span>

        <button className="btn btn-primary" disabled={busy} onClick={submit}>
          {busy ? t("auth.register.registering") : t("auth.register.register")}
        </button>
      </div>
    </div>
  );
}
