import React from "react";
import { useTranslation } from "react-i18next";
import "./HowMischtischWorks.css";

export function HowMischtischWorks() {
  const { t } = useTranslation();

  const steps = [
    {
      number: "01",
      title: t("howMischtischWorks.steps.01.title"),
      text: t("howMischtischWorks.steps.01.text"),
    },
    {
      number: "02",
      title: t("howMischtischWorks.steps.02.title"),
      text: t("howMischtischWorks.steps.02.text"),
    },
    {
      number: "03",
      title: t("howMischtischWorks.steps.03.title"),
      text: t("howMischtischWorks.steps.03.text"),
    },
    {
      number: "04",
      title: t("howMischtischWorks.steps.04.title"),
      text: t("howMischtischWorks.steps.04.text"),
    },
  ];

  return (
    <section className="how-mischtisch">
      <div className="how-mischtisch__container">
        <div className="how-mischtisch__eyebrow">
          {t("howMischtischWorks.eyebrow")}
        </div>

        <h2 className="how-mischtisch__title">
          {t("howMischtischWorks.title")}
        </h2>

        <div className="how-mischtisch__grid">
          {steps.map((step) => (
            <article
              className="how-mischtisch__card"
              key={step.number}
            >
              <div className="how-mischtisch__number">
                {step.number}
              </div>

              <h3 className="how-mischtisch__card-title">
                {step.title}
              </h3>

              <p className="how-mischtisch__card-text">
                {step.text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}