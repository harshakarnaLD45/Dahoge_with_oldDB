import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useParams,
} from "react-router-dom";

import "./i18n";

import { useTranslation } from "react-i18next";

import { initEmailJS } from "./services/emailjs";

// Initialize EmailJS once at startup
initEmailJS();

import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import { HomePage } from "./pages/HomePage";

import { AboutPage } from "./pages/AboutPage";
import { HostPage } from "./pages/Host/HostPage";
import { TischformPage } from "./pages/TischformPage";
import { VenueDetail } from "./pages/VenueDetail";

import Imprint from "./pages/Imprint/Imprint";
import PrivacyPolicy from "./pages/privacypolicy/PrivacyPolicy";
import TermsUses from "./pages/TermsUses/TermsUses";

import Accessibility from "./pages/Accessibility/Accessibility";
import HostTerms from "./pages/TermsForHost/TermsForHost";
import HostPrivacy from "./pages/PrivacyForHost/PrivacyForHost";

import { FirebaseProvider } from "./context/FirebaseContext";
import { AppProvider, useApp } from "./context/AppContext";

import "./App.css";

function TischformRoute() {
  const { locations, reload, showToast } = useApp();
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <TischformPage
      locations={locations}
      preselect={id}
      reload={reload}
      showToast={showToast}
      onDone={() => navigate("/gastgeber")}
      onBack={() => navigate("/gastgeber")}
    />
  );
}

function VenueDetailRoute() {
  const { t } = useTranslation();

  const { showToast, locations, profile } = useApp();
  const navigate = useNavigate();
  const { id } = useParams();

  if (!locations || locations.length === 0) {
    return (
      <div
        style={{
          padding: "60px 20px",
          textAlign: "center",
          color: "#5B627A",
        }}
      >
        {t("app.loadingVenue")}
      </div>
    );
  }

  const loc = locations.find(
    (location) => String(location.id) === String(id),
  );

  if (!loc) {
    return (
      <div
        style={{
          padding: "60px 20px",
          textAlign: "center",
        }}
      >
        <h2>{t("app.venueNotFound")}</h2>

        <p
          style={{
            color: "#5B627A",
          }}
        >
          {t("app.venueNotFoundMessage")}
        </p>
      </div>
    );
  }

  const handleBooked = (account) => {
    // console.log("Booking successful:", account);
  };

  const handleBack = () => {
    navigate("/");
  };

  const handleRecht = () => {
    navigate("/rechtliches");
  };

  return (
    <VenueDetail
      loc={loc}
      profile={profile}
      onBooked={handleBooked}
      onBack={handleBack}
      showToast={showToast}
      onRecht={handleRecht}
    />
  );
}

function AppContent() {
  const { locations, reload, showToast } = useApp();
  const navigate = useNavigate();

  // Handle opening a specific venue detail view

  const handleOpenVenue = (venueOrId) => {
    if (!venueOrId) return;

    const venueId =
      typeof venueOrId === "object" ? venueOrId.id : venueOrId;

    if (!venueId) {
      console.error("Venue ID is missing:", venueOrId);
      return;
    }

    console.log("Opening venue:", venueId);

    navigate(`/betrieb/${venueId}`);
  };

  // Handle navigation to the host area

  const handleHostNavigation = () => {
    navigate("/gastgeber");
  };

  return (
    <div className="app mt-root">
      <Header />

      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                locations={locations}
                onOpen={handleOpenVenue}
                onHost={handleHostNavigation}
              />
            }
          />

          <Route
            path="/betrieb/:id"
            element={<VenueDetailRoute />}
          />

          <Route
            path="/gastgeber"
            element={
              <HostPage
                locations={locations}
                reload={reload}
                showToast={showToast}
                onAbout={() => navigate("/ueber")}
                onTischform={(venueId) =>
                  navigate(`/gastgeber/tischform/${venueId}`)
                }
                onSeen={() => {}}
                onRecht={() => navigate("/rechtliches")}
                onHome={() => navigate("/")}
                onCodes={() => {}}
              />
            }
          />

          <Route
            path="/gastgeber/tischform/:id"
            element={<TischformRoute />}
          />

          <Route
            path="/ueber"
            element={<AboutPage />}
          />

          <Route
            path="/impressum"
            element={<Imprint />}
          />

          <Route
            path="/privacy"
            element={<PrivacyPolicy />}
          />

          <Route
            path="/rechtliches"
            element={<TermsUses />}
          />

          <Route
            path="/barrierefreiheit"
            element={<Accessibility />}
          />

          <Route
            path="/gastgeber-bedingungen"
            element={<HostTerms />}
          />

          <Route
            path="/gastgeber-datenschutz"
            element={<HostPrivacy />}
          />

          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </main>

      <Footer locationCount={locations.length} />
    </div>
  );
}

// ---------------------------------------------------------
// Root App
// ---------------------------------------------------------

function App() {
  return (
    <Router>
      <FirebaseProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </FirebaseProvider>
    </Router>
  );
}

export default App;