import React, { useEffect, useState } from "react";
import "./AboutPage.css";
import { useTranslation } from "react-i18next";

export function AboutPage() {
  const{t} = useTranslation();

  

  const cards = [
    [
      "about.cards.oneTable.title",
      "about.cards.oneTable.text",
    ],
    [
      "about.cards.seatsNotTables.title",
      "about.cards.seatsNotTables.text",
    ],
    [
      "about.cards.oneAccount.title",
      "about.cards.oneAccount.text",
    ],
  ];

  return (
    <div
      className="about-page-container mt-wrap"
      style={{
        padding: "28px 20px 60px",
        maxWidth: 820,
      }}
    >
      <div className="eyebrow">
        {t("about.eyebrow")}
      </div>

      <h2
        className="f-display about-page-title"
        style={{
          fontSize: "clamp(26px,4.5vw,38px)",
          fontWeight: 600,
          margin: "6px 0 12px",
          color: "var(--kobalt-dunkel)",
        }}
      >
        {t("about.title")}
      </h2>

      <p
        className="lead about-page-lead"
        style={{ marginBottom: 22 }}
      >
        {t("about.lead")}
      </p>

      {/* Feature Cards Grid */}
      <div
        className="about-cards-grid"
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(230px,1fr))",
          gap: 14,
        }}
      >
        {cards.map(([titleKey, textKey]) => (
          <div
            key={titleKey}
            className="card about-card"
          >
            <div
              className="f-display about-card-title"
              style={{
                fontSize: 19,
                fontWeight: 600,
                color: "var(--kobalt-dunkel)",
                marginBottom: 6,
              }}
            >
              {t(titleKey)}
            </div>

            <div
              className="about-card-text"
              style={{
                fontSize: 14.5,
                color: "#3A4258",
              }}
            >
              {t(textKey)}
            </div>
          </div>
        ))}
      </div>

      {/* Campaign Claims */}
      <div
        className="about-claims"
        style={{
          marginTop: 14,
          fontSize: 14.5,
          color: "#3A4258",
        }}
      >
        {t("about.campaignClaims.prefix")}{" "}
        <i>{t("about.campaignClaims.claimOne")}</i>{" "}
        {t("about.campaignClaims.and")}{" "}
        <i>{t("about.campaignClaims.claimTwo")}</i>
      </div>

      {/* How to Join Section */}
      <div
        className="eyebrow about-section-eyebrow"
        style={{ margin: "36px 0 8px" }}
      >
        {t("about.join.eyebrow")}
      </div>

      <h3
        className="f-display about-section-title"
        style={{
          fontSize: "clamp(20px,3.5vw,26px)",
          fontWeight: 600,
          margin: "0 0 14px",
          color: "var(--kobalt-dunkel)",
        }}
      >
        {t("about.join.title")}
      </h3>

      {/* Steps Grid */}
      <div
        className="about-steps"
        style={{
          display: "grid",
          gap: 12,
        }}
      >
        {/* STEP 1 */}
        <div
          className="card about-step-card"
          style={{
            display: "flex",
            gap: 14,
            alignItems: "flex-start",
          }}
        >
          <div className="step-nr">1</div>

          <div>
            <div style={{ fontWeight: 700 }}>
              {t("about.steps.step1.title")}
            </div>

            <div
              className="step-text"
              style={{
                fontSize: 14.5,
                color: "#3A4258",
                marginTop: 2,
              }}
            >
              {t("about.steps.step1.textBeforeEmail")}{" "}
              <a
                href="mailto:info@gastgeber-ag.bayern?subject=MISCHTISCH%20in%20SACHSEN"
                className="about-link"
                style={{
                  color: "var(--kobalt)",
                  fontWeight: 600,
                }}
              >
                info@gastgeber-ag.bayern
              </a>{" "}
              {t("about.steps.step1.textAfterEmail")}
            </div>
          </div>
        </div>

        {/* STEP 2 */}
        <div
          className="card about-step-card"
          style={{
            display: "flex",
            gap: 14,
            alignItems: "flex-start",
          }}
        >
          <div className="step-nr">2</div>

          <div>
            <div style={{ fontWeight: 700 }}>
              {t("about.steps.step2.title")}
            </div>

            <div
              className="step-text"
              style={{
                fontSize: 14.5,
                color: "#3A4258",
                marginTop: 2,
              }}
            >
              {t("about.steps.step2.textBeforeLink")}{" "}
              <a
                href="https://www.misch-tisch.de"
                target="_blank"
                rel="noreferrer"
                className="about-link"
                style={{
                  color: "var(--kobalt)",
                  fontWeight: 600,
                }}
              >
                www.misch-tisch.de
              </a>{" "}
              {t("about.steps.step2.textAfterLink")}
            </div>
          </div>
        </div>

        {/* STEP 3 */}
        <div
          className="card about-step-card"
          style={{
            display: "flex",
            gap: 14,
            alignItems: "flex-start",
          }}
        >
          <div className="step-nr">3</div>

          <div>
            <div style={{ fontWeight: 700 }}>
              {t("about.steps.step3.title")}
            </div>

            <div
              className="step-text"
              style={{
                fontSize: 14.5,
                color: "#3A4258",
                marginTop: 2,
              }}
            >
              {t("about.steps.step3.text")}
            </div>
          </div>
        </div>

        {/* STEP 4 */}
        <div
          className="card about-step-card"
          style={{
            display: "flex",
            gap: 14,
            alignItems: "flex-start",
          }}
        >
          <div className="step-nr">4</div>

          <div>
            <div style={{ fontWeight: 700 }}>
              {t("about.steps.step4.title")}
            </div>

            <div
              className="step-text"
              style={{
                fontSize: 14.5,
                color: "#3A4258",
                marginTop: 2,
              }}
            >
              {t("about.steps.step4.text")}
            </div>
          </div>
        </div>
      </div>

      {/* Good to Know Card */}
      <div
        className="card about-info-card"
        style={{ marginTop: 16 }}
      >
        <div
          className="f-display about-info-title"
          style={{
            fontSize: 19,
            fontWeight: 600,
            color: "var(--kobalt-dunkel)",
            marginBottom: 8,
          }}
        >
          {t("about.goodToKnow.title")}
        </div>

        <div
          className="about-info-content"
          style={{
            fontSize: 14.5,
            color: "#3A4258",
            display: "grid",
            gap: 8,
          }}
        >
          <div>
            {t("about.goodToKnow.item1")}
          </div>

          <div>
            {t("about.goodToKnow.item2")}
          </div>

          <div>
            {t("about.goodToKnow.item3")}
          </div>

          <div>
            {t("about.goodToKnow.item4")}
          </div>
        </div>
      </div>

      {/* Notice */}
      <p
        className="notice about-notice"
        style={{ marginTop: 18 }}
      >
        {t("about.notice")}
      </p>
    </div>
  );
}