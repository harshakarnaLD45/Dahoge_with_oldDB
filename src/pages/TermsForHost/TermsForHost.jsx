import React, {useEffect} from "react";
import { useTranslation } from "react-i18next";
import "./TermsForHost.css";

const HostTerms = () => {
  const { t } = useTranslation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="host-terms-page">
      <div className="mt-wrap host-terms-container">

        {/* Header */}
        <header className="host-terms-header">
          <p className="host-terms-eyebrow">
            {t("hostTerms.header.eyebrow")}
          </p>

          <h1>
            {t("hostTerms.header.title")}
          </h1>

          <p className="host-terms-updated">
            {t("hostTerms.header.updated")}
          </p>
        </header>


        {/* 1. Purpose and Scope */}
        <section className="host-terms-section">
          <h2>
            <span>1.</span>{" "}
            {t("hostTerms.sections.purpose.title")}
          </h2>

          <p>
            {t("hostTerms.sections.purpose.text")}
          </p>
        </section>


        {/* 2. Registration and Activation */}
        <section className="host-terms-section">
          <h2>
            <span>2.</span>{" "}
            {t("hostTerms.sections.registration.title")}
          </h2>

          <p>
            {t("hostTerms.sections.registration.text1")}
          </p>

          <p>
            {t("hostTerms.sections.registration.text2")}
          </p>
        </section>


        {/* 3. Login Credentials */}
        <section className="host-terms-section">
          <h2>
            <span>3.</span>{" "}
            {t("hostTerms.sections.credentials.title")}
          </h2>

          <p>
            {t("hostTerms.sections.credentials.text")}
          </p>
        </section>


        {/* 4. One Mischtisch per Host */}
        <section className="host-terms-section">
          <h2>
            <span>4.</span>{" "}
            {t("hostTerms.sections.oneTable.title")}
          </h2>

          <p>
            {t("hostTerms.sections.oneTable.text")}
          </p>
        </section>


        {/* 5. Schedules and Capacity */}
        <section className="host-terms-section">
          <h2>
            <span>5.</span>{" "}
            {t("hostTerms.sections.schedules.title")}
          </h2>

          <p>
            {t("hostTerms.sections.schedules.intro")}
          </p>

          <ul className="host-terms-list">
            <li>{t("hostTerms.sections.schedules.items.bookingDays")}</li>
            <li>{t("hostTerms.sections.schedules.items.times")}</li>
            <li>{t("hostTerms.sections.schedules.items.capacity")}</li>
            <li>{t("hostTerms.sections.schedules.items.specialOpenings")}</li>
            <li>{t("hostTerms.sections.schedules.items.closureDates")}</li>
            <li>{t("hostTerms.sections.schedules.items.other")}</li>
          </ul>

          <p>
            {t("hostTerms.sections.schedules.text")}
          </p>
        </section>


        {/* 6. Reservations */}
        <section className="host-terms-section">
          <h2>
            <span>6.</span>{" "}
            {t("hostTerms.sections.reservations.title")}
          </h2>

          <p>
            {t("hostTerms.sections.reservations.text1")}
          </p>

          <p>
            {t("hostTerms.sections.reservations.text2")}
          </p>
        </section>


        {/* 7. Photos, Logos and Other Content */}
        <section className="host-terms-section">
          <h2>
            <span>7.</span>{" "}
            {t("hostTerms.sections.content.title")}
          </h2>

          <p>
            {t("hostTerms.sections.content.text1")}
          </p>

          <p>
            {t("hostTerms.sections.content.text2")}
          </p>

          <p>
            {t("hostTerms.sections.content.text3")}
          </p>
        </section>


        {/* 8. Promotions, Discounts and Special Offers */}
        <section className="host-terms-section">
          <h2>
            <span>8.</span>{" "}
            {t("hostTerms.sections.promotions.title")}
          </h2>

          <p>
            {t("hostTerms.sections.promotions.text1")}
          </p>

          <p>
            {t("hostTerms.sections.promotions.intro")}
          </p>

          <ul className="host-terms-list">
            <li>
              {t("hostTerms.sections.promotions.items.content")}
            </li>

            <li>
              {t("hostTerms.sections.promotions.items.validity")}
            </li>

            <li>
              {t("hostTerms.sections.promotions.items.eligibility")}
            </li>

            <li>
              {t("hostTerms.sections.promotions.items.limitations")}
            </li>

            <li>
              {t("hostTerms.sections.promotions.items.price")}
            </li>

            <li>
              {t("hostTerms.sections.promotions.items.availability")}
            </li>
          </ul>

          <p>
            {t("hostTerms.sections.promotions.text2")}
          </p>

          <p>
            {t("hostTerms.sections.promotions.text3")}
          </p>
        </section>


        {/* 9. Privacy and Confidentiality */}
        <section className="host-terms-section">
          <h2>
            <span>9.</span>{" "}
            {t("hostTerms.sections.privacy.title")}
          </h2>

          <p>
            {t("hostTerms.sections.privacy.text1")}
          </p>

          <p>
            {t("hostTerms.sections.privacy.text2")}
          </p>

          <p>
            {t("hostTerms.sections.privacy.text3")}
          </p>
        </section>


        {/* 10. Privacy Requests from Guests */}
        <section className="host-terms-section">
          <h2>
            <span>10.</span>{" "}
            {t("hostTerms.sections.privacyRequests.title")}
          </h2>

          <p>
            {t("hostTerms.sections.privacyRequests.text1")}
          </p>

          <p>
            {t("hostTerms.sections.privacyRequests.text2")}
          </p>
        </section>


        {/* 11. Public Profile Information */}
        <section className="host-terms-section">
          <h2>
            <span>11.</span>{" "}
            {t("hostTerms.sections.publicProfile.title")}
          </h2>

          <p>
            {t("hostTerms.sections.publicProfile.intro")}
          </p>

          <ul className="host-terms-list">
            <li>
              {t("hostTerms.sections.publicProfile.items.venueName")}
            </li>

            <li>
              {t("hostTerms.sections.publicProfile.items.address")}
            </li>

            <li>
              {t("hostTerms.sections.publicProfile.items.venueType")}
            </li>

            <li>
              {t("hostTerms.sections.publicProfile.items.contact")}
            </li>

            <li>
              {t("hostTerms.sections.publicProfile.items.images")}
            </li>

            <li>
              {t("hostTerms.sections.publicProfile.items.description")}
            </li>

            <li>
              {t("hostTerms.sections.publicProfile.items.times")}
            </li>

            <li>
              {t("hostTerms.sections.publicProfile.items.specialDates")}
            </li>

            <li>
              {t("hostTerms.sections.publicProfile.items.promotions")}
            </li>
          </ul>

          <p>
            {t("hostTerms.sections.publicProfile.text")}
          </p>
        </section>


        {/* 12. Technical Operation */}
        <section className="host-terms-section">
          <h2>
            <span>12.</span>{" "}
            {t("hostTerms.sections.technical.title")}
          </h2>

          <p>
            {t("hostTerms.sections.technical.text")}
          </p>
        </section>


        {/* 13. Suspension and Termination */}
        <section className="host-terms-section">
          <h2>
            <span>13.</span>{" "}
            {t("hostTerms.sections.suspension.title")}
          </h2>

          <p>
            {t("hostTerms.sections.suspension.text1")}
          </p>

          <p>
            {t("hostTerms.sections.suspension.text2")}
          </p>

          <ul className="host-terms-list">
            <li>
              {t("hostTerms.sections.suspension.items.falseInfo")}
            </li>

            <li>
              {t("hostTerms.sections.suspension.items.misuse")}
            </li>

            <li>
              {t("hostTerms.sections.suspension.items.security")}
            </li>

            <li>
              {t("hostTerms.sections.suspension.items.thirdParty")}
            </li>

            <li>
              {t("hostTerms.sections.suspension.items.guestData")}
            </li>

            <li>
              {t("hostTerms.sections.suspension.items.reservationProblems")}
            </li>
          </ul>

          <p>
            {t("hostTerms.sections.suspension.text3")}
          </p>
        </section>


        {/* 14. Liability */}
        <section className="host-terms-section">
          <h2>
            <span>14.</span>{" "}
            {t("hostTerms.sections.liability.title")}
          </h2>

          <p>
            {t("hostTerms.sections.liability.text")}
          </p>
        </section>


        {/* 15. Privacy */}
        <section className="host-terms-section">
          <h2>
            <span>15.</span>{" "}
            {t("hostTerms.sections.hostPrivacy.title")}
          </h2>

          <p>
            {t("hostTerms.sections.hostPrivacy.text")}
          </p>
        </section>


        {/* 16. Changes */}
        <section className="host-terms-section">
          <h2>
            <span>16.</span>{" "}
            {t("hostTerms.sections.changes.title")}
          </h2>

          <p>
            {t("hostTerms.sections.changes.text")}
          </p>
        </section>

      </div>
    </main>
  );
};

export default HostTerms;