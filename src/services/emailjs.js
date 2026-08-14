import emailjs from "@emailjs/browser";

export const emailJSConfig = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
};

export const emailJsConfigured = Boolean(
  emailJSConfig.serviceId &&
    emailJSConfig.templateId &&
    emailJSConfig.publicKey,
);

export function initEmailJS() {
  if (!emailJSConfig.publicKey) {
    console.warn(
      "EmailJS public key is missing. Check VITE_EMAILJS_PUBLIC_KEY.",
    );

    return false;
  }

  emailjs.init({
    publicKey: emailJSConfig.publicKey,
  });

  
  return true;
}

export async function sendEmailJs({
  to,
  subject,
  replyTo,
  fromName = "Prasanna",
  html,
  ...values
}) {
  if (!emailJsConfigured) {
    return {
      success: false,
      error:
        "EmailJS is not configured. Check VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID and VITE_EMAILJS_PUBLIC_KEY.",
    };
  }

  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to.trim())) {
    return {
      success: false,
      error: "Invalid recipient email address.",
    };
  }

  try {
    const templateParams = {
      to_email: to.trim(),
      from_name: fromName,
      subject: subject || "",

      // The EmailJS template uses {{email}} for the Reply-To field —
      // both keys are provided so any template config works.
      email: replyTo || to.trim(),
      reply_to: replyTo || to.trim(),

      // IMPORTANT:
      // This contains your complete email HTML template
      full_html: html || "",

      // Keep all existing booking variables
      ...values,
    };

    // ------------------------------------------------------
    // DEBUG: log every parameter sent vs template expectations
    // ------------------------------------------------------
   

    const response = await emailjs.send(
      emailJSConfig.serviceId,
      emailJSConfig.templateId,
      templateParams,
      {
        publicKey: emailJSConfig.publicKey,
      },
    );

    

    return {
      success: response.status === 200,
      status: response.status,
      message: response.text,
    };
  } catch (error) {
    console.error("EmailJS send failed:", {
      status: error?.status,
      text: error?.text,
      message: error?.message,
      response: error?.response,
    });

    return {
      success: false,
      status: error?.status,
      error:
        error?.text ||
        error?.message ||
        "EmailJS failed to send the email.",
    };
  }
}

export default emailJSConfig;