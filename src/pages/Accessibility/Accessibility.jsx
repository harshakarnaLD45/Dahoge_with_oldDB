import React, { useEffect } from "react";
import "./Accessibility.css";
import { useTranslation } from "react-i18next";

const Accessibility = () => {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="accessibility-page">
      <div className="mt-wrap accessibility-container">
        {/* Header */}
        <header className="accessibility-header">
          <p className="accessibility-eyebrow">
            {t("accessibilityPage.eyebrow")}
          </p>

          <h1>{t("accessibilityPage.title")}</h1>

          <p className="accessibility-updated">
            {t("accessibilityPage.lastUpdated")}
          </p>
        </header>

        {/* Our Goal */}
        <section className="accessibility-section">
          <h2>{t("accessibilityPage.ourGoal.title")}</h2>

          <p>{t("accessibilityPage.ourGoal.text")}</p>
        </section>

        {/* Service Description */}
        <section className="accessibility-section">
          <h2>{t("accessibilityPage.serviceDescription.title")}</h2>

          <p>{t("accessibilityPage.serviceDescription.text")}</p>
        </section>

        {/* Accessibility Measures */}
        <section className="accessibility-section">
          <h2>{t("accessibilityPage.measures.title")}</h2>

          <p>{t("accessibilityPage.measures.text")}</p>
        </section>

        {/* Current Status */}
        <section className="accessibility-section">
          <h2>{t("accessibilityPage.currentStatus.title")}</h2>

          <p>{t("accessibilityPage.currentStatus.text")}</p>
        </section>

        {/* Report a Barrier */}
        <section className="accessibility-section">
          <h2>{t("accessibilityPage.reportBarrier.title")}</h2>

          <div className="accessibility-contact">
            <p>
              <strong>
                {t("accessibilityPage.reportBarrier.emailLabel")}:
              </strong>{" "}
              <a href="mailto:info@dehoga-sachsen.de">info@dehoga-sachsen.de</a>
            </p>

            <p>
              <strong>
                {t("accessibilityPage.reportBarrier.phoneLabel")}:
              </strong>{" "}
              <a href="tel:+493514289510">+49 (0)351 428 95 10</a>
            </p>
          </div>

          <p>{t("accessibilityPage.reportBarrier.text")}</p>
        </section>
      </div>
    </main>
  );
};

export default Accessibility;
