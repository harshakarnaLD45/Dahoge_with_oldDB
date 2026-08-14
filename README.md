# Mischtisch Sachsen - Frontend Application

A React + Vite frontend application for the Mischtisch Sachsen reservation platform, matching the reference website design exactly.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production (runs scripts/fix-import-casing.mjs first, then vite build)
npm run build

# Run linting
npm run lint
```

Copy `.env.example` to `.env` and fill in your Firebase and EmailJS credentials before running (see [Environment Variables](#-environment-variables)).

## 🎨 Design System (from Reference Website)

### Colors
Defined as CSS variables in `src/index.css`:

```css
--kobalt: #1f3c8f;          /* Primary blue */
--kobalt-dunkel: #16295f;   /* Dark blue */
--tinte: #131c33;           /* Near black text */
--porzellan: #f5f3ec;       /* Cream background */
--papier: #ffffff;          /* White */
--eiche: #7c5230;           /* Oak brown */
--eiche-hell: #9a6c42;      /* Light oak */
--honig: #d9a441;           /* Honey gold */
--linie: #dad4c6;           /* Border lines */
--moos: #4c7a4f;            /* Moss green */
```

### Typography
```css
--sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
--serif: Georgia, "Iowan Old Style", "Palatino Linotype", "Times New Roman", serif;
```

### Container Widths (Responsive)
| Area | Max Width | Breakpoint |
|------|-----------|------------|
| Header | 1440px | Default |
| Header | 1600px | ≥1920px |
| Header | 1700px | ≥2560px |
| General content wrapper (`.mt-wrap`) | 1060px | Default |
| Content pages (Home, Host, VenueDetail, Legal pages) | 960px | Default; ≤768px falls back to 100% |
| About page | 820px / 900px | Responsive |
| Legal pages (Terms, Privacy, Imprint, Accessibility) | 960px | ≥1600px |

## 🧭 Navigation Structure

### Header Navigation (Desktop & Mobile)
```
Tables → Hosts → About → DE/EN Toggle
```

- **Tables** → `/` (Home)
- **Hosts** → `/gastgeber`
- **About** → `/ueber`
- **DE/EN Toggle** → Language switcher (persists in `localStorage` under the `language` key)

### Footer Navigation
Two link columns (defined in `src/components/common/Footer.jsx`):

**Legal**
- **Imprint** → `/impressum`
- **Privacy** → `/privacy`
- **Terms of Use** → `/rechtliches`
- **Accessibility** → `/barrierefreiheit`

**For Hosts**
- **Host Terms** → `/gastgeber-bedingungen`
- **Host Privacy** → `/gastgeber-datenschutz`

## 📄 Pages Implemented

All routes are defined in `src/App.jsx`; unknown routes redirect to `/`.

| Route | Page | Key Features |
|-------|------|--------------|
| `/` | Home (`HomePage`) | Hero, region filter chips, search, venue cards grid (`LocCard`) |
| `/betrieb/:id` | Venue Detail (`VenueDetail`) | Image gallery, date/time selection, table plan (`TableSvg`), booking form with validation, confirmation receipt (`Beleg`) |
| `/gastgeber` | Host Page (`HostPage`) | Login/Register forms (`AuthForms`), host dashboard (`HostArea`) with reservations, actions and venue management |
| `/gastgeber/tischform/:id` | Table Configuration (`TischformPage`) | Table shape editor, seats, slots, sketch pad, special dates |
| `/ueber` | About (`AboutPage`) | Feature cards, campaign claims, steps to join, good-to-know, disclaimer |
| `/impressum` | Imprint (`Imprint`) | DEHOGA Sachsen e.V. legal notice |
| `/privacy` | Privacy Policy (`PrivacyPolicy`) | Data processing and user rights |
| `/rechtliches` | Terms of Use (`TermsUses`) | Terms and legal notices for guests |
| `/barrierefreiheit` | Accessibility (`Accessibility`) | Accessibility statement (BFSG) |
| `/gastgeber-bedingungen` | Host Terms (`TermsForHost`) | Terms for hosts |
| `/gastgeber-datenschutz` | Host Privacy (`PrivacyForHost`) | Privacy information for hosts |

## 🌐 Internationalization (i18n)

The app uses **i18next** with `react-i18next` and `i18next-http-backend`.

- Configuration: `src/i18n.js` (imported once in `App.jsx`)
- Translation files: `public/locals/en/en.json` and `public/locals/de/de.json`, loaded from `/locals/{{lng}}/{{lng}}.json`
- Default and fallback language: English (`en`)
- Components translate via the `useTranslation()` hook: `const { t } = useTranslation()`

### Language Toggle (DE/EN)
- Located in the Header after the "About" navigation item
- Calls `i18n.changeLanguage(lang)` and updates `document.documentElement.lang`
- Choice persists in `localStorage` (`language` key) and is restored on load

### Translation Usage in Components
Components use the `useTranslation` hook from `react-i18next` with dot-notation keys into the JSON resources:

```javascript
import { useTranslation } from "react-i18next";

const { t } = useTranslation();

// Renders the translated string for the current language,
// e.g. "The idea" (en) from public/locals/en/en.json
<p className="eyebrow">{t("about.eyebrow")}</p>
```



## 🔧 Integrations

### Firebase (Auth, Firestore, Storage)
- Initialization: `src/services/firebase.js`, exposed through `FirebaseContext` (`src/context/FirebaseContext.jsx`)
- **Authentication**: Email/Password sign-in and registration (`src/services/auth.js`)
- **Firestore**: venue, booking and account data (`src/services/data.js`, `src/services/database.js`)
- **Cloud Storage**: venue logos and photos (`src/services/storage.js`)
- Configuration via `VITE_FIREBASE_*` variables in `.env`
- Graceful degradation: if env vars are missing, the app runs without a backend and logs a warning (`firebaseReady` flag)

### EmailJS (Transactional Emails)
- Initialization: `src/services/emailjs.js` (`initEmailJS()` is called once at app startup)
- Sends transactional emails (registration confirmation, booking confirmation, host notifications); HTML templates live in `public/mailtemplates/`
- Configuration via `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, `VITE_EMAILJS_PUBLIC_KEY` in `.env`
- Setup guide: `EMAILJS_SETUP.md`; Firebase guide: `FIREBASE_SETUP.md`

### Routing
- React Router v7 (`react-router-dom`)
- Routes defined in `src/App.jsx`
- All navigation uses `NavLink` for active states

## 🛠 Development Commands

```bash
npm run dev       # Start Vite dev server (HMR)
npm run build     # Fix import casing (scripts/fix-import-casing.mjs) + production build to dist/
npm run preview   # Preview production build locally
npm run lint      # Lint with oxlint
```

## 📋 Environment Variables

Create `.env` from `.env.example`:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# EmailJS Configuration
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```
