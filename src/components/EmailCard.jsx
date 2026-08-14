// Vorschau-Karte für versendete E-Mails (Demo-Versand).

import { useTranslation } from "react-i18next";
import { MAIL_FROM } from "../utils/mail";

export function EmailCard({ typ, an, betreff, lines }) {
  const { t } = useTranslation();

  return (
    <div className="email-card">
      <div className="email-top">
        <span>✉ {typ}</span>

        <span>{t("emailCard.demoDispatch")}</span>
      </div>

      <div className="email-head">
        <div>
          <b>{t("emailCard.from")}</b> {MAIL_FROM}
        </div>

        <div>
          <b>{t("emailCard.to")}</b> {an}
        </div>

        <div>
          <b>{t("emailCard.subject")}</b> {betreff}
        </div>
      </div>

      <div className="email-body">
        {lines.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
    </div>
  );
}
