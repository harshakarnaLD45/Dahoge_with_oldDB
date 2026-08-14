import React, {useEffect} from "react";
import { useTranslation } from "react-i18next";
import "./PrivacyPolicy.css";


const PrivacyPolicy = () => {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="privacy-page">
      <div className="mt-wrap privacy-container">
        {/* Header */}
        <header className="privacy-header">
          <p className="privacy-eyebrow">{t("privacyPolicy.header.eyebrow")}</p>

          <h1>{t("privacyPolicy.header.title")}</h1>

          <p className="privacy-updated">{t("privacyPolicy.header.updated")}</p>
        </header>

        {/* 1. Controller */}
        <section className="privacy-section">
          <h2>
            <span>1.</span> {t("privacyPolicy.sections.controller.title")}
          </h2>

          <div className="privacy-content">
            <p className="privacy-company">
              DEHOGA Hotel- und Gaststättenverband Sachsen e.V.
            </p>

            <p>
              Tharandter Straße 5
              <br />
              01159 Dresden
              <br />
              {t("privacyPolicy.header.title") === "Datenschutzerklärung"
                ? "Deutschland"
                : "Germany"}
            </p>

            <p>
              <strong>{t("privacyPolicy.contact.phone")}:</strong>{" "}
              <a href="tel:+493514289510">+49 (0)351 428 95 10</a>
              <br />
              <strong>{t("privacyPolicy.contact.email")}:</strong>{" "}
              <a href="mailto:info@dehoga-sachsen.de">info@dehoga-sachsen.de</a>
              <br />
              {t("privacyPolicy.contact.dataProtection")}
            </p>
          </div>
        </section>

        {/* 2. General Principle */}
        <section className="privacy-section">
          <h2>
            <span>2.</span> {t("privacyPolicy.sections.general.title")}
          </h2>

          <p>{t("privacyPolicy.sections.general.text")}</p>
        </section>

        {/* 3. Website Access and Hosting */}
        <section className="privacy-section">
          <h2>
            <span>3.</span> {t("privacyPolicy.sections.hosting.title")}
          </h2>

          <p>
            {t("privacyPolicy.sections.hosting.text1")}{" "}
            <a
              href="https://mischtisch-sachsen.de/"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://mischtisch-sachsen.de/
            </a>{" "}
            {t("privacyPolicy.sections.hosting.text2")}
          </p>

          <p>{t("privacyPolicy.sections.hosting.text3")}</p>

          <p>{t("privacyPolicy.sections.hosting.text4")}</p>

          <p>
            {t("privacyPolicy.sections.hosting.furtherInfo")}{" "}
            <a
              href="https://www.hostinger.com/legal/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("privacyPolicy.links.hostingerPrivacy")}
            </a>{" "}
            {t("privacyPolicy.sections.hosting.and")}{" "}
            <a
              href="https://www.hostinger.com/legal/dpa"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("privacyPolicy.links.hostingerDpa")}
            </a>
          </p>
        </section>

        {/* 4. Guest Reservations */}
        <section className="privacy-section">
          <h2>
            <span>4.</span> {t("privacyPolicy.sections.reservations.title")}
          </h2>

          <p>{t("privacyPolicy.sections.reservations.text1")}</p>

          <p>{t("privacyPolicy.sections.reservations.text2")}</p>

          <div className="privacy-note">
            <strong>{t("privacyPolicy.labels.recommendation")}</strong>{" "}
            {t("privacyPolicy.sections.reservations.recommendation")}
          </div>
        </section>

        {/* 5. Disclosure to the Selected Host */}
        <section className="privacy-section">
          <h2>
            <span>5.</span> {t("privacyPolicy.sections.selectedHost.title")}
          </h2>

          <p>{t("privacyPolicy.sections.selectedHost.text")}</p>
        </section>

        {/* 6. Reservation Emails */}
        <section className="privacy-section">
          <h2>
            <span>6.</span> {t("privacyPolicy.sections.email.title")}
          </h2>

          <p>{t("privacyPolicy.sections.email.text1")}</p>

          <p>{t("privacyPolicy.sections.email.text2")}</p>

          <p>{t("privacyPolicy.sections.email.text3")}</p>

          <p>{t("privacyPolicy.sections.email.text4")}</p>

          <p>
            {t("privacyPolicy.sections.email.furtherInfo")}{" "}
            <a
              href="https://www.emailjs.com/legal/data-protection-agreement/"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("privacyPolicy.links.emailjsDpa")}
            </a>{" "}
            {t("privacyPolicy.sections.email.and")}{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("privacyPolicy.links.googlePrivacy")}
            </a>
          </p>

          <div className="privacy-note">
            <strong>{t("privacyPolicy.labels.technicalRecommendation")}</strong>{" "}
            {t("privacyPolicy.sections.email.recommendation")}
          </div>
        </section>

        {/* 7. Google Firebase */}
        <section className="privacy-section">
          <h2>
            <span>7.</span> {t("privacyPolicy.sections.firebase.title")}
          </h2>

          <p>{t("privacyPolicy.sections.firebase.text")}</p>

          <div className="privacy-note">
            <strong>{t("privacyPolicy.labels.recommendation")}</strong>{" "}
            {t("privacyPolicy.sections.firebase.recommendation")}
          </div>
        </section>

        {/* 8. Technically Necessary Storage */}
        <section className="privacy-section">
          <h2>
            <span>8.</span> {t("privacyPolicy.sections.storage.title")}
          </h2>

          <p>{t("privacyPolicy.sections.storage.text")}</p>
        </section>

        {/* 9. No Automated Decision-Making */}
        <section className="privacy-section">
          <h2>
            <span>9.</span> {t("privacyPolicy.sections.automated.title")}
          </h2>

          <p>{t("privacyPolicy.sections.automated.text")}</p>
        </section>

        {/* 10. Recommended Retention */}
        <section className="privacy-section">
          <h2>
            <span>10.</span> {t("privacyPolicy.sections.retention.title")}
          </h2>

          <ul className="privacy-list">
            <li>
              <strong>
                {t("privacyPolicy.sections.retention.items.operational.label")}
              </strong>{" "}
              {t("privacyPolicy.sections.retention.items.operational.text")}
            </li>

            <li>{t("privacyPolicy.sections.retention.items.deletion")}</li>

            <li>
              <strong>
                {t("privacyPolicy.sections.retention.items.logs.label")}
              </strong>{" "}
              {t("privacyPolicy.sections.retention.items.logs.text")}
            </li>

            <li>
              <strong>
                {t("privacyPolicy.sections.retention.items.host.label")}
              </strong>{" "}
              {t("privacyPolicy.sections.retention.items.host.text")}
            </li>

            <li>
              <strong>
                {t("privacyPolicy.sections.retention.items.images.label")}
              </strong>{" "}
              {t("privacyPolicy.sections.retention.items.images.text")}
            </li>

            <li>
              <strong>
                {t("privacyPolicy.sections.retention.items.email.label")}
              </strong>{" "}
              {t("privacyPolicy.sections.retention.items.email.text")}
            </li>

            <li>{t("privacyPolicy.sections.retention.items.dispute")}</li>
          </ul>
        </section>

        {/* 11. Rights */}
        <section className="privacy-section">
          <h2>
            <span>11.</span> {t("privacyPolicy.sections.rights.title")}
          </h2>

          <p>
            {t("privacyPolicy.sections.rights.text")}{" "}
            <a href="mailto:info@dehoga-sachsen.de">info@dehoga-sachsen.de</a>.
          </p>
        </section>

        {/* 12. Complaint */}
        <section className="privacy-section">
          <h2>
            <span>12.</span> {t("privacyPolicy.sections.complaint.title")}
          </h2>

          <p>{t("privacyPolicy.sections.complaint.text")}</p>
        </section>

        {/* 13. Changes */}
        <section className="privacy-section">
          <h2>
            <span>13.</span> {t("privacyPolicy.sections.changes.title")}
          </h2>

          <p>{t("privacyPolicy.sections.changes.text")}</p>
        </section>
      </div>
    </main>
  );
};

export default PrivacyPolicy;
