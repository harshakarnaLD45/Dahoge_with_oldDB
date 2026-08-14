
import { getEmailTemplate } from "./storage";
import { EMAIL_TEMPLATE_SEEDS } from "./emailTemplates";
import { shortDate, longDate } from "../utils/dates";
import {
  EMAIL_GASTGEBER_AG,
  EMAIL_VALIDATION,
  EMAIL_INTERNAL,
} from "../utils/mail";


// ============================================================
// TEXT TEMPLATE RENDERER
// ============================================================

// Current language, consistent with src/i18n.js (localStorage "language").
const getLanguage = () =>
  localStorage.getItem("language") || "de";

export async function renderTemplate(key, params = {}) {
  let tpl = null;

  // ----------------------------------------------------------
  // 1. Try Firestore
  // ----------------------------------------------------------

  try {
    tpl = await getEmailTemplate(key, getLanguage());

    if (!tpl) {
      tpl = await getEmailTemplate(key, "de");
    }
  } catch (error) {
    console.warn(
      "Firestore email template unavailable:",
      error
    );
  }

  // ----------------------------------------------------------
  // 2. Local fallback
  // ----------------------------------------------------------

  if (!tpl) {
    tpl = EMAIL_TEMPLATE_SEEDS.find(
      (item) =>
        item.key === key &&
        item.lang === getLanguage()
    );
  }

  // ----------------------------------------------------------
  // 3. German fallback
  // ----------------------------------------------------------

  if (!tpl) {
    tpl = EMAIL_TEMPLATE_SEEDS.find(
      (item) =>
        item.key === key &&
        item.lang === "de"
    );
  }

  if (!tpl) {
    console.error(
      "❌ EMAIL TEMPLATE NOT FOUND:",
      key,
      getLanguage(),
      EMAIL_TEMPLATE_SEEDS
    );

    throw new Error(
      "Email template missing: " + key
    );
  }

  // ----------------------------------------------------------
  // Replace {placeholder}
  // ----------------------------------------------------------

  const fill = (text) =>
    String(text || "").replace(
      /\{(\w+)\}/g,
      (match, name) =>
        name in params
          ? String(params[name] ?? "")
          : ""
    );

  return {
    subject: fill(tpl.subject),

    lines: (tpl.lines || [])
      .map(fill)
      .filter((line) => line !== ""),
  };
}


// ============================================================
// HTML TEMPLATE LOADER
// ============================================================
//
// IMPORTANT:
// Do NOT import HTML files from public.
//
// Correct:
// fetch("/mailtemplates/file.html")
//
// Vite's BASE_URL is used so this also works when the app is
// deployed under a sub-path.
// ============================================================

export async function renderHtmlTemplate(
  key,
  params = {}
) {
  const baseUrl =
    import.meta.env.BASE_URL || "/";

  const url =
    `${baseUrl}mailtemplates/${key}.html`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `HTML template missing: ${key}.html`
    );
  }

  const html = await response.text();

  // ----------------------------------------------------------
  // HTML escape dynamic values
  // ----------------------------------------------------------

  const escapeHtml = (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character]
    );

  // Supports both:
  //
  // {name}
  // {{name}}
  //
  return html.replace(
    /\{\{?(\w+)\}\}?/g,
    (match, name) =>
      name in params
        ? escapeHtml(params[name])
        : ""
  );
}


// ============================================================
// BOOKING EMAILS
// ============================================================
//
// Uses:
//
// 04_customer_booking_confirmation.html
// 05_restaurant_booking_notification.html
// ============================================================

export async function buildBookingMails({
  loc,
  res,
  date,
  slots,
  day,
  slotLabel,
  chairList,
  people,
  name,
  seatCount,
  remainingSeats,
}) {
  const multiSlots =
    slots.length > 1
      ? " (multiple time slots)"
      : "";

  const aktionLine = day.aktion
    ? `Promotion: ${day.aktion.titel}`
    : loc.angebot
      ? "Offer available"
      : "";

  const noteLine = res.note
    ? `• Your message to the host: “${res.note}”`
    : "";

  // ----------------------------------------------------------
  // TEXT VERSION - GUEST
  // ----------------------------------------------------------

  const guest = await renderTemplate(
    "booking.guest",
    {
      name,
      venueName: loc.name,
      city: loc.city,
      type: loc.type,
      dateShort: shortDate(date),
      dateLong: longDate(date),
      slotLabel,
      multiSlots,
      people,
      chairList,
      buchungsNr: res.id,
      aktionLine,
      noteLine,
    }
  );

  const guestMail = {
    typ: "Confirmation for the guest",
    an: res.email,
    betreff: guest.subject,
    lines: guest.lines,
  };

  // ----------------------------------------------------------
  // TEXT VERSION - HOST
  // ----------------------------------------------------------

  const host = await renderTemplate(
    "booking.host",
    {
      venueName: loc.name,
      dateShort: shortDate(date),
      dateLong: longDate(date),
      slotLabel,
      multiSlots,
      people,
      chairList,
      buchungsNr: res.id,
      aktionLine: day.aktion
        ? `Promotion: ${day.aktion.titel}`
        : "",
      langHint: "",
      gastName: name,
      email: res.email,
      telefon: res.telefon,
      adresseLine: res.strasse
        ? `Address: ${res.strasse}, ${res.plzort}`
        : "",
      noteLine: res.note
        ? `Message from the guest: “${res.note}”`
        : "",
    }
  );

  // ----------------------------------------------------------
  // Common HTML data
  // ----------------------------------------------------------

  const totalSeats =
    (loc.tisch && loc.tisch.seats) ||
    loc.seats ||
    0;

  const htmlParams = {
    venueName: loc.name || "",
    venueRegion: loc.region || "",
    venueType: loc.type || "",

    bookingDate: longDate(date),
    bookingTime: slotLabel || "",

    seatCount: String(seatCount ?? ""),
    totalSeats: String(totalSeats),
    remainingSeats: String(
      remainingSeats ?? ""
    ),

    customerFirstName:
      res.vorname || "",

    customerLastName:
      res.nachname || "",

    customerEmail:
      res.email || "",

    customerPhone:
      res.telefon || "",

    customerStreet:
      res.strasse || "",

    customerPostalCodeCity:
      res.plzort || "",

    customerMessage:
      res.note || "",

    chairNumbers: chairList || "",

    hostName:
      loc.inhaber || "",
  };

  // ----------------------------------------------------------
  // HTML TEMPLATE 04
  // Customer booking confirmation
  // ----------------------------------------------------------

  let guestHtml = "";

  try {
    guestHtml =
      await renderHtmlTemplate(
        "04_customer_booking_confirmation",
        htmlParams
      );
  } catch (error) {
    console.error(
      "❌ Failed to load template 04:",
      error
    );
  }

  // ----------------------------------------------------------
  // HTML TEMPLATE 05
  // Restaurant notification
  // ----------------------------------------------------------

  let venueHtml = "";

  try {
    venueHtml =
      await renderHtmlTemplate(
        "05_restaurant_booking_notification",
        htmlParams
      );
  } catch (error) {
    console.error(
      "❌ Failed to load template 05:",
      error
    );
  }

  // ----------------------------------------------------------
  // Final guest email
  // ----------------------------------------------------------

  const customerAddress = [
    res.strasse,
    res.plzort,
  ]
    .filter(Boolean)
    .join(", ");

  guestMail.html = guestHtml;

  guestMail.rows = [
    ["Venue", loc.name],
    ["Region", loc.region || ""],
    ["Type", loc.type || ""],
    ["Date", longDate(date)],
    ["Time", slotLabel],
    ["Seats", String(seatCount)],
    ["Total seats", String(totalSeats)],
    [
      "Remaining seats",
      String(remainingSeats),
    ],
    ["Name", name],
    ["Email", res.email || ""],
    ["Phone", res.telefon || ""],
    ["Address", customerAddress],
    [
      "Message to the host",
      res.note || "",
    ],
  ];

  // ----------------------------------------------------------
  // Final venue email
  // ----------------------------------------------------------

  const venueMail = {
    typ: "Notification to the venue",

    an:
      loc.email ||
      "— to be stored by the venue in the host area —",

    betreff: host.subject,

    lines: host.lines,

    html: venueHtml,

    rows: [
      ["Venue", loc.name],
      ["Date", longDate(date)],
      ["Time", slotLabel],
      ["Seats", String(seatCount)],
      ["Total seats", String(totalSeats)],
      [
        "Remaining seats",
        String(remainingSeats),
      ],
      ["Guest", name],
      ["Email", res.email || ""],
      ["Phone", res.telefon || ""],
      ["Address", customerAddress],
      [
        "Message from the guest",
        res.note || "",
      ],
    ],
  };

  return {
    guestMail,
    venueMail,
  };
}


// ============================================================
// REGISTRATION EMAILS
// ============================================================
//
// Uses:
//
// 01_restaurant_registration_confirmation.html
// 02_external_verification_request.html
// 03_internal_generated_credentials.html
//
// These are loaded from:
//
// public/mailtemplates/
// ============================================================

export async function buildRegistrationMails({
  venue,
  email,
  inhaber,
  telefon,
  isNew,
  anschrift,
  mischtisch,
  regCode = "",

  // Optional credentials.
  // If template 03 does not need them, they simply remain empty.
  username = "",
  password = "",
}) {
  // ----------------------------------------------------------
  // Registration data
  // ----------------------------------------------------------

  const registrationData = {
    venueName: venue.name || "",
    venueType: venue.type || "—",
    anschrift: anschrift || "—",
    region: venue.region || "—",
    inhaber: inhaber || "—",
    email: email || "—",
    telefon: telefon || "—",
    mischtisch: mischtisch || "—",

    neuerEintrag: isNew
      ? "This is a new listing."
      : "Existing partner venue, new platform access.",

    agEmail:
      EMAIL_GASTGEBER_AG || "",

    city: venue.city || "—",

    strasse:
      venue.strasse || "—",

    plzOrt:
      [venue.plz, venue.city]
        .filter(Boolean)
        .join(" ") || "—",

    // Optional credentials
    username: username || "",
    password: password || "",
  };

  // ==========================================================
  // TEXT FALLBACK TEMPLATES
  // ==========================================================

  const defaultTemplates = {
    dehoga: {
      subject:
        "New Mischtisch Registration",

      lines: [
        "Hello DEHOGA Sachsen Team,",
        "",
        "A new Mischtisch registration has been submitted.",
        "",
        `Venue: ${registrationData.venueName}`,
        `Venue type: ${registrationData.venueType}`,
        `Address: ${registrationData.anschrift}`,
        `Region: ${registrationData.region}`,
        `Owner / leaseholder: ${registrationData.inhaber}`,
        `Email: ${registrationData.email}`,
        `Phone: ${registrationData.telefon}`,
        "",
        registrationData.neuerEintrag,
        "",
        `Mischtisch: ${registrationData.mischtisch}`,
        "",
        "Please review the registration.",
        "",
        "Best regards,",
        "Mischtisch Team",
      ],
    },

    ag: {
      subject:
        "Mischtisch Usage Agreement / New Registration",

      lines: [
        "Hello Bayerische Gastgeber AG Team,",
        "",
        "A new Mischtisch registration has been submitted.",
        "",
        `Venue: ${registrationData.venueName}`,
        `Address: ${registrationData.strasse}, ${registrationData.plzOrt}`,
        `Owner / leaseholder: ${registrationData.inhaber}`,
        `Email: ${registrationData.email}`,
        "",
        "The signed usage agreement is to be submitted with the subject:",
        '"MISCHTISCH in SACHSEN"',
        "",
        "Best regards,",
        "Mischtisch Team",
      ],
    },

    confirmation: {
      subject:
        "Mischtisch Registration Received",

      lines: [
        `Dear ${registrationData.inhaber},`,
        "",
        `Thank you for registering your venue "${registrationData.venueName}".`,
        "",
        "Your registration has been received and is currently under review.",
        "",
        `Registration email: ${registrationData.email}`,
        "",
        "You will receive further information after the review.",
        "",
        "Best regards,",
        "Mischtisch Team",
      ],
    },
  };

  // ==========================================================
  // TEXT TEMPLATES
  // ==========================================================

  let dehoga;
  let ag;
  let confirmation;

  try {
    dehoga = await renderTemplate(
      "registration.dehoga",
      registrationData
    );
  } catch (error) {
    console.warn(
      "Using DEHOGA text fallback."
    );

    dehoga =
      defaultTemplates.dehoga;
  }

  try {
    ag = await renderTemplate(
      "registration.ag",
      registrationData
    );
  } catch (error) {
    console.warn(
      "Using AG text fallback."
    );

    ag = defaultTemplates.ag;
  }

  try {
    confirmation =
      await renderTemplate(
        "registration.confirmation",
        registrationData
      );
  } catch (error) {
    console.warn(
      "Using confirmation text fallback."
    );

    confirmation =
      defaultTemplates.confirmation;
  }

  // ==========================================================
  // HTML TEMPLATE DATA
  // ==========================================================

  const registrationDate = new Date().toLocaleDateString("de-DE");

  const htmlParams = {
    // Placeholders used by templates 01–03
    companyName: venue.name || "",
    hostName: inhaber || "",
    phone: telefon || "",
    street: venue.strasse || "",
    postalCode: venue.plz || "",
    region: venue.region || "",
    registrationNumber: regCode || "",
    registrationDate,
    verificationTeamName:
      import.meta.env.VITE_VERIFICATION_TEAM_NAME || "",
    accountEmail: email || "",
    temporaryPassword: password || "",
    credentialsCreatedAt: registrationDate,

    // General venue information
    venueName:
      venue.name || "",

    venueType:
      venue.type || "",

    venueRegion:
      venue.region || "",

    city:
      venue.city || "",

    strasse:
      venue.strasse || "",

    plz:
      venue.plz || "",

    plzOrt:
      [venue.plz, venue.city]
        .filter(Boolean)
        .join(" "),

    address:
      anschrift ||
      [venue.strasse, venue.plz, venue.city]
        .filter(Boolean)
        .join(", "),

    // Owner/contact
    inhaber:
      inhaber || "",

    email:
      email || "",

    telefon:
      telefon || "",

    // Registration information
    mischtisch:
      mischtisch || "",

    neuerEintrag:
      registrationData.neuerEintrag,

    agEmail:
      EMAIL_GASTGEBER_AG || "",

    // Credentials for template 03
    username:
      username || "",

    password:
      password || "",
  };

  // ==========================================================
  // TEMPLATE 01
  // Restaurant Registration Confirmation
  // ==========================================================

  let confirmationHtml = "";

  try {
    confirmationHtml =
      await renderHtmlTemplate(
        "01_restaurant_registration_confirmation",
        htmlParams
      );
  } catch (error) {
    console.error(
      "❌ Template 01 could not be loaded:",
      error
    );
  }

  // ==========================================================
  // TEMPLATE 02
  // External Verification Request
  // ==========================================================

  let externalVerificationHtml = "";

  try {
    externalVerificationHtml =
      await renderHtmlTemplate(
        "02_external_verification_request",
        htmlParams
      );
  } catch (error) {
    console.error(
      "❌ Template 02 could not be loaded:",
      error
    );
  }

  // ==========================================================
  // TEMPLATE 03
  // Internal Generated Credentials
  // ==========================================================

  let credentialsHtml = "";

  try {
    credentialsHtml =
      await renderHtmlTemplate(
        "03_internal_generated_credentials",
        htmlParams
      );
  } catch (error) {
    console.error(
      "❌ Template 03 could not be loaded:",
      error
    );
  }

  // ==========================================================
  // RETURN ALL 3 REGISTRATION EMAILS
  // ==========================================================

  return [
    {
      // TEMPLATE 02
      typ: "External verification request",

      an: EMAIL_VALIDATION,

      betreff: dehoga.subject,

      lines: dehoga.lines,

      html: externalVerificationHtml,

      rows: [
        ["Venue", venue.name || ""],
        ["Venue type", venue.type || ""],
        ["Region", venue.region || ""],
        ["Address", htmlParams.address],
        ["Owner / leaseholder", inhaber || ""],
        ["Email", email || ""],
        ["Phone", telefon || ""],
        ["Mischtisch", mischtisch || ""],
      ],
    },

    {
      // TEMPLATE 03
      typ: "Internal generated credentials",

      an: EMAIL_INTERNAL,

      betreff: ag.subject,

      lines: ag.lines,

      html: credentialsHtml,

      rows: [
        ["Venue", venue.name || ""],
        ["Address", htmlParams.address],
        ["Owner / leaseholder", inhaber || ""],
        ["Email", email || ""],
        ["Username", username || ""],
        ["Password", password || ""],
      ],
    },

    {
      // TEMPLATE 01
      typ: "Confirmation to your venue",

      an: email,

      betreff: confirmation.subject,

      lines: confirmation.lines,

      html: confirmationHtml,

      rows: [
        ["Venue", venue.name || ""],
        ["Venue type", venue.type || ""],
        ["Region", venue.region || ""],
        ["Address", htmlParams.address],
        ["Owner / leaseholder", inhaber || ""],
        ["Email", email || ""],
        ["Phone", telefon || ""],
        ["Mischtisch", mischtisch || ""],
      ],
    },
  ];
}