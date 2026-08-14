// Re-export the shared EmailJS sender from ./emailjs.
// It builds the correct template parameters (to_email, subject, email,
// full_html) expected by the EmailJS template — the duplicate copy here
// previously sent `to`/`html` and caused HTTP 422.
import { sendEmailJs } from "./emailjs";
export { sendEmailJs };

export async function sendRegistrationEmails(mails) {
  const list = Array.isArray(mails) ? mails : [mails];
  const results = [];

  for (const mail of list) {
    try {
      const result = await sendEmailJs({
        to: mail.an,
        subject: mail.betreff,
        html: mail.html,
        replyTo: mail.an,
      });

      results.push(result);
    } catch (error) {
      console.error("Registration email send failed:", error);
      results.push({ success: false, error });
    }
  }

  return { sent: results.some((r) => r?.success), results };
}
