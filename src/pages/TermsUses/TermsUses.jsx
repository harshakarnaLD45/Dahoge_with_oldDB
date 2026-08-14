import React,{useEffect} from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./TermsUses.css";

const TermsUses = () => {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="terms-page">
      <div className="mt-wrap terms-container">
        {/* Header */}
        <header className="terms-header">
          <p className="terms-eyebrow">{t("termsUses.header.eyebrow")}</p>

          <h1>{t("termsUses.header.title")}</h1>

          <p className="terms-updated">{t("termsUses.header.updated")}</p>
        </header>

        {/* 1. Platform Role */}
        <section className="terms-section">
          <h2>
            <span>1.</span> {t("termsUses.sections.platformRole.title")}
          </h2>

          <p>{t("termsUses.sections.platformRole.text")}</p>
        </section>

        {/* 2. Minimum Age */}
        <section className="terms-section">
          <h2>
            <span>2.</span> {t("termsUses.sections.minimumAge.title")}
          </h2>

          <p>{t("termsUses.sections.minimumAge.text")}</p>
        </section>

        {/* 3. Reservation */}
        <section className="terms-section">
          <h2>
            <span>3.</span> {t("termsUses.sections.reservation.title")}
          </h2>

          <p>{t("termsUses.sections.reservation.text")}</p>
        </section>

        {/* 4. Multiple Seats */}
        <section className="terms-section">
          <h2>
            <span>4.</span> {t("termsUses.sections.multipleSeats.title")}
          </h2>

          <p>{t("termsUses.sections.multipleSeats.text")}</p>
        </section>

        {/* 5. Accuracy */}
        <section className="terms-section">
          <h2>
            <span>5.</span> {t("termsUses.sections.accuracy.title")}
          </h2>

          <p>{t("termsUses.sections.accuracy.text")}</p>
        </section>

        {/* 6. Changes and Cancellations */}
        <section className="terms-section">
          <h2>
            <span>6.</span> {t("termsUses.sections.changesCancellations.title")}
          </h2>

          <p>{t("termsUses.sections.changesCancellations.text")}</p>
        </section>

        {/* 7. Host Changes */}
        <section className="terms-section">
          <h2>
            <span>7.</span> {t("termsUses.sections.hostChanges.title")}
          </h2>

          <p>{t("termsUses.sections.hostChanges.text")}</p>
        </section>

        {/* 8. Prices and Payments */}
        <section className="terms-section">
          <h2>
            <span>8.</span> {t("termsUses.sections.pricesPayments.title")}
          </h2>

          <p>{t("termsUses.sections.pricesPayments.text")}</p>
        </section>

        {/* 9. Promotions and Discounts */}
        <section className="terms-section">
          <h2>
            <span>9.</span> {t("termsUses.sections.promotionsDiscounts.title")}
          </h2>

          <p>{t("termsUses.sections.promotionsDiscounts.text")}</p>
        </section>

        {/* 10. Availability and Technical Errors */}
        <section className="terms-section">
          <h2>
            <span>10.</span> {t("termsUses.sections.availabilityErrors.title")}
          </h2>

          <p>{t("termsUses.sections.availabilityErrors.text")}</p>
        </section>

        {/* 11. Prohibited Use */}
        <section className="terms-section">
          <h2>
            <span>11.</span> {t("termsUses.sections.prohibitedUse.title")}
          </h2>

          <p>{t("termsUses.sections.prohibitedUse.text")}</p>
        </section>

        {/* 12. Liability */}
        <section className="terms-section">
          <h2>
            <span>12.</span> {t("termsUses.sections.liability.title")}
          </h2>

          <p>{t("termsUses.sections.liability.text")}</p>
        </section>

        {/* 13. Privacy */}
        <section className="terms-section">
          <h2>
            <span>13.</span> {t("termsUses.sections.privacy.title")}
          </h2>

          <p>
            {t("termsUses.sections.privacy.text")}{" "}
            <Link to="/privacy">{t("termsUses.sections.privacy.link")}</Link>
            {t("termsUses.sections.privacy.suffix")}
          </p>
        </section>

        {/* 14. Governing Law */}
        <section className="terms-section">
          <h2>
            <span>14.</span> {t("termsUses.sections.governingLaw.title")}
          </h2>

          <p>{t("termsUses.sections.governingLaw.text")}</p>
        </section>
      </div>
    </main>
  );
};

export default TermsUses;
