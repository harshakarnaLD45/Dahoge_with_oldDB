import React, {useEffect} from "react";
import { useTranslation } from "react-i18next";
import "./Imprint.css";


const Imprint = () => {
  const { t } = useTranslation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="imprint-page">
      <div className="mt-wrap imprint-container">

        {/* Header */}
        <header className="imprint-header">
          <p className="imprint-eyebrow">
            {t("imprint.eyebrow")}
          </p>

          <h1>
            {t("imprint.title")}
          </h1>

          <p className="imprint-updated">
            {t("imprint.lastUpdated")}
          </p>
        </header>

        {/* Provider */}
        <section className="imprint-section">
          <h2>
            {t("imprint.provider.title")}
          </h2>

          <div className="imprint-content">
            <p className="imprint-company">
              {t("imprint.provider.company")}
              <br />
              {t("imprint.provider.companyShort")}
            </p>

            <p>
              {t("imprint.provider.address")}
              <br />
              {t("imprint.provider.city")}
              <br />
              {t("imprint.provider.country")}
            </p>

            <p>
              <strong>
                {t("imprint.provider.phone")}
              </strong>{" "}
              <a href="tel:+493514289510">
                +49 (0)351 428 95 10
              </a>

              <br />

              <strong>
                {t("imprint.provider.email")}
              </strong>{" "}
              <a href="mailto:info@dehoga-sachsen.de">
                info@dehoga-sachsen.de
              </a>

              <br />

              <strong>
                {t("imprint.provider.website")}
              </strong>{" "}
              <a
                href="https://mischtisch-sachsen.de/"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://mischtisch-sachsen.de/
              </a>
            </p>
          </div>
        </section>

        {/* Authorised Representative */}
        <section className="imprint-section">
          <h2>
            {t("imprint.representative.title")}
          </h2>

          <p>
            {t("imprint.representative.text")}{" "}
            <strong>Axel Klein</strong>
          </p>
        </section>

        {/* Register */}
        <section className="imprint-section">
          <h2>
            {t("imprint.register.title")}
          </h2>

          <p>
            {t("imprint.register.text")}
            <br />
            {t("imprint.register.court")}
            <br />
            {t("imprint.register.number")}
          </p>
        </section>

        {/* Mischtisch Saxony */}
        <section className="imprint-section">
          <h2>
            {t("imprint.mischtisch.title")}
          </h2>

          <p>
            {t("imprint.mischtisch.text1")}
          </p>

          <p>
            {t("imprint.mischtisch.text2")}
          </p>
        </section>

        {/* Consumer Dispute Resolution */}
        <section className="imprint-section">
          <h2>
            {t("imprint.consumerDispute.title")}
          </h2>

          <p>
            {t("imprint.consumerDispute.text")}
          </p>
        </section>

        {/* Content and Image Rights */}
        <section className="imprint-section">
          <h2>
            {t("imprint.contentRights.title")}
          </h2>

          <p>
            {t("imprint.contentRights.text")}
          </p>
        </section>

      </div>
    </main>
  );
};

export default Imprint;