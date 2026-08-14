import React from "react";
import { useTranslation } from "react-i18next";
import "./HostCta.css";
import { Link } from "react-router-dom";

export function HostCTA({ onLogin }) {
  const { t } = useTranslation();

  return (
    <section className="host-cta">
      <div className="host-cta__inner">
        {/* =====================================================
            LEFT CONTENT
            ===================================================== */}

        <div className="host-cta__content">
          {/* Eyebrow */}
          <div className="host-cta__eyebrow">{t("hostCta.eyebrow")}</div>

          {/* Main heading */}
          <h2 className="host-cta__title">{t("hostCta.title")}</h2>

          {/* Description */}
          <p className="host-cta__description">{t("hostCta.description")}</p>

          {/* Login button */}
          <Link to="/gastgeber" className="host-cta__button">
            {t("hostCta.login")}
          </Link>
        </div>

        {/* =====================================================
            FEATURE CARDS
            ===================================================== */}

        <div className="host-cta__features">
          {/* ===================================================
              FEATURE 1
              =================================================== */}

          <div className="host-cta__feature">
            <h3 className="host-cta__feature-title">
              {t("hostCta.features.manageTimes.title")}
            </h3>

            <p className="host-cta__feature-text">
              {t("hostCta.features.manageTimes.text")}
            </p>
          </div>

          {/* ===================================================
              FEATURE 2
              =================================================== */}

          <div className="host-cta__feature">
            <h3 className="host-cta__feature-title">
              {t("hostCta.features.capacity.title")}
            </h3>

            <p className="host-cta__feature-text">
              {t("hostCta.features.capacity.text")}
            </p>
          </div>

          {/* ===================================================
              FEATURE 3
              =================================================== */}

          <div className="host-cta__feature">
            <h3 className="host-cta__feature-title">
              {t("hostCta.features.reservations.title")}
            </h3>

            <p className="host-cta__feature-text">
              {t("hostCta.features.reservations.text")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HostCTA;
