import React, {useEffect} from "react";
import "./PrivacyForHost.css";

import { useTranslation } from 'react-i18next';
const HostPrivacy = () => {

const { t } = useTranslation();
useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="host-privacy-page">
      <div className="mt-wrap host-privacy-container">

        <header className="host-privacy-header">
          <p className="host-privacy-label">
            {t("hostPrivacy.header.label")}
          </p>

          <h1>
            {t("hostPrivacy.header.title")}
          </h1>

          <p className="host-privacy-updated">
            {t("hostPrivacy.header.updated")}
          </p>
        </header>

        <section className="host-privacy-section">
          <h2>
            <span>1.</span> {t("hostPrivacy.sections.controller.title")}
          </h2>

          <div className="host-privacy-content">
            <p className="host-privacy-company">
              DEHOGA Hotel- und Gaststättenverband Sachsen e.V.
            </p>

            <p>
              Tharandter Straße 5
              <br />
              01159 Dresden
              <br />
              Germany
            </p>

            <p>
              <strong>
                {t("hostPrivacy.contact.email")}:
              </strong>{" "}
              <a href="mailto:info@dehoga-sachsen.de">
                info@dehoga-sachsen.de
              </a>
              <br />

              <strong>
                {t("hostPrivacy.contact.phone")}:
              </strong>{" "}
              <a href="tel:+493514289510">
                +49 (0)351 428 95 10
              </a>
            </p>
          </div>
        </section>

        <section className="host-privacy-section">
          <h2>
            <span>2.</span> {t("hostPrivacy.sections.hostData.title")}
          </h2>

          <p>
            {t("hostPrivacy.sections.hostData.intro")}
          </p>

          <ul className="host-privacy-list">
            {t("hostPrivacy.sections.hostData.items").map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="host-privacy-section">
          <h2>
            <span>3.</span> {t("hostPrivacy.sections.purposes.title")}
          </h2>

          <p>
            {t("hostPrivacy.sections.purposes.text1")}
          </p>

          <p>
            {t("hostPrivacy.sections.purposes.text2")}
          </p>
        </section>

        <section className="host-privacy-section">
          <h2>
            <span>4.</span> {t("hostPrivacy.sections.firebaseAuth.title")}
          </h2>

          <p>
            {t("hostPrivacy.sections.firebaseAuth.text")}
          </p>
        </section>

        <section className="host-privacy-section">
          <h2>
            <span>5.</span> {t("hostPrivacy.sections.firestore.title")}
          </h2>

          <p>
            {t("hostPrivacy.sections.firestore.text1")}
          </p>

          <p>
            {t("hostPrivacy.sections.firestore.text2")}
          </p>
        </section>

        <section className="host-privacy-section">
          <h2>
            <span>6.</span> {t("hostPrivacy.sections.emailNotifications.title")}
          </h2>

          <p>
            {t("hostPrivacy.sections.emailNotifications.text")}
          </p>

          <div className="host-privacy-note">
            <strong>Recommendation:</strong>{" "}
            {t("hostPrivacy.sections.emailNotifications.recommendation")}
          </div>
        </section>

        <section className="host-privacy-section">
          <h2>
            <span>7.</span>{" "}
            {t("hostPrivacy.sections.publicProfile.title")}
          </h2>

          <p>
            {t("hostPrivacy.sections.publicProfile.text1")}
          </p>

          <p>
            {t("hostPrivacy.sections.publicProfile.text2")}
          </p>
        </section>

        <section className="host-privacy-section">
          <h2>
            <span>8.</span>{" "}
            {t("hostPrivacy.sections.guestData.title")}
          </h2>

          <p>
            {t("hostPrivacy.sections.guestData.text1")}
          </p>

          <p>
            {t("hostPrivacy.sections.guestData.text2")}
          </p>
        </section>

        <section className="host-privacy-section">
          <h2>
            <span>9.</span>{" "}
            {t("hostPrivacy.sections.retention.title")}
          </h2>

          <ul className="host-privacy-list">
            <li>
              {t("hostPrivacy.sections.retention.items.account.label")}{" "}
              {t("hostPrivacy.sections.retention.items.account.text")}
            </li>

            <li>
              {t("hostPrivacy.sections.retention.items.deactivation.label")}{" "}
              {t("hostPrivacy.sections.retention.items.deactivation.text")}
            </li>

            <li>
              {t("hostPrivacy.sections.retention.items.images.label")}{" "}
              {t("hostPrivacy.sections.retention.items.images.text")}
            </li>

            <li>
              {t("hostPrivacy.sections.retention.items.logs.label")}{" "}
              {t("hostPrivacy.sections.retention.items.logs.text")}
            </li>

            <li>
              {t("hostPrivacy.sections.retention.items.claims.label")}{" "}
              {t("hostPrivacy.sections.retention.items.claims.text")}
            </li>
          </ul>
        </section>

        <section className="host-privacy-section">
          <h2>
            <span>10.</span>{" "}
            {t("hostPrivacy.sections.rights.title")}
          </h2>

          <p>
            {t("hostPrivacy.sections.rights.text1")}
          </p>

          <p>
            {t("hostPrivacy.sections.rights.text2")}{" "}
            <a href="mailto:info@dehoga-sachsen.de">
              info@dehoga-sachsen.de
            </a>
          </p>
        </section>

        <section className="host-privacy-section">
          <h2>
            <span>11.</span>{" "}
            {t("hostPrivacy.sections.complaint.title")}
          </h2>

          <p>
            {t("hostPrivacy.sections.complaint.text")}
          </p>
        </section>

        <section className="host-privacy-section">
          <h2>
            <span>12.</span>{" "}
            {t("hostPrivacy.sections.changes.title")}
          </h2>

          <p>
            {t("hostPrivacy.sections.changes.text")}
          </p>
        </section>

      </div>
    </main>
  );
};

export default HostPrivacy;