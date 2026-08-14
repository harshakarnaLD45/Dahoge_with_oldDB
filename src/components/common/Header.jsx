import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import logo from "../../assets/logo.svg";
import { useTranslation } from "react-i18next";
import { DEFAULT_LANGUAGE } from "../../i18n";

import "./Header.css";

const Header = () => {
  const location = useLocation();

  const { t, i18n } = useTranslation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // i18n.language is still undefined on the first render (i18next initializes
  // asynchronously), so resolve the toggle from the same sources as src/i18n.js.
  const [lang, setLang] = useState(() =>
    (
      i18n.language ||
      localStorage.getItem("language") ||
      DEFAULT_LANGUAGE
    ).startsWith("de")
      ? "de"
      : "en",
  );

  /* =====================================================
     ACTIVE PAGE
     ===================================================== */

  const getActivePage = (pathname) => {
    // Tables section
    if (pathname === "/" || pathname.startsWith("/betrieb/")) {
      return "home";
    }

    // Hosts section
    // Covers /gastgeber and all nested host pages
    if (pathname === "/gastgeber" || pathname.startsWith("/gastgeber/")) {
      return "host";
    }

    // About
    if (pathname === "/ueber" || pathname.startsWith("/ueber/")) {
      return "about";
    }

    // Legal
    if (pathname === "/rechtliches" || pathname.startsWith("/rechtliches/")) {
      return "recht";
    }

    return "";
  };

  const activePage = getActivePage(location.pathname);

 

  /* =====================================================
     LANGUAGE HANDLING
     ===================================================== */

  const changeLang = async (next) => {
    await i18n.changeLanguage(next);

    // Persist the choice — localStorage "language" is the source of truth
    // read by src/i18n.js and the v()/getLanguage helpers.
    localStorage.setItem("language", next);

    setLang(next);

    document.documentElement.lang = next;
  };

  /* =====================================================
     LISTEN FOR LANGUAGE CHANGES
     ===================================================== */

  useEffect(() => {
    const handleLanguageChanged = (nextLanguage) => {
      const normalizedLanguage = nextLanguage?.startsWith("de") ? "de" : "en";

      setLang(normalizedLanguage);

      document.documentElement.lang = normalizedLanguage;
    };

    i18n.on("languageChanged", handleLanguageChanged);

    return () => {
      i18n.off("languageChanged", handleLanguageChanged);
    };
  }, [i18n]);

  /* =====================================================
     RESPONSIVE CHECK
     ===================================================== */

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;

      setIsMobile(mobile);

      if (!mobile) {
        setIsMobileMenuOpen(false);
      }
    };

    checkMobile();

    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  /* =====================================================
     CLOSE MENU AFTER NAVIGATION
     ===================================================== */

  const handleNavClick = () => {
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  /* =====================================================
     ESCAPE KEY
     ===================================================== */

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  /* =====================================================
     BODY SCROLL LOCK
     ===================================================== */

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  /* =====================================================
     RENDER
     ===================================================== */

  return (
    <header className="mt-wrap header">
      <div className="header-content">
        {/* ===============================================
            LEFT SIDE - LOGO
            =============================================== */}

        <div className="header-left">
          <NavLink
            to="/"
            className="logo-link"
            aria-label={t("accessibility.goHome")}
            onClick={handleNavClick}
          >
            <img src={logo} alt="DEHOGA Sachsen" className="logo-img" />
          </NavLink>
        </div>

        {/* ===============================================
            NAVIGATION
            =============================================== */}

        <nav
          id="main-navigation"
          className={`header-nav ${isMobileMenuOpen ? "mobile-open" : ""}`}
          aria-label={t("accessibility.mainNavigation")}
        >
          {/* ============================================
              MOBILE CLOSE BUTTON
              ============================================ */}

          {isMobile && (
            <button
              type="button"
              className="mobile-drawer-close"
              aria-label={t("accessibility.closeNavigation")}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span aria-hidden="true">×</span>
            </button>
          )}

          {/* ============================================
              TABLES
              ============================================ */}

          <NavLink
            to="/"
            end
            className={`nav-btn ${activePage === "home" ? "active" : ""}`}
            onClick={handleNavClick}
          >
            {t("navigation.tables")}
          </NavLink>
          {/* ============================================
              HOSTS
              ============================================ */}

          <NavLink
            to="/gastgeber"
            className={`nav-btn ${activePage === "host" ? "active" : ""}`}
            onClick={handleNavClick}
          >
            {t("navigation.hosts")}
          </NavLink>
          {/* ============================================
              ABOUT
              ============================================ */}

          <NavLink
            to="/ueber"
            className={`nav-btn ${activePage === "about" ? "active" : ""}`}
            onClick={handleNavClick}
          >
            {t("navigation.about")}
          </NavLink>

          {/* ============================================
              LANGUAGE SELECTOR
              ============================================ */}

          <div
            className="sprache"
            role="group"
            aria-label={t("accessibility.chooseLanguage")}
          >
            <button
              type="button"
              className={lang === "de" ? "lang-btn active" : "lang-btn"}
              onClick={() => changeLang("de")}
              aria-pressed={lang === "de"}
              lang="de"
            >
              DE
            </button>

            <button
              type="button"
              className={lang === "en" ? "lang-btn active" : "lang-btn"}
              onClick={() => changeLang("en")}
              aria-pressed={lang === "en"}
              lang="en"
            >
              EN
            </button>
          </div>
        </nav>

        {/* ===============================================
            MOBILE MENU BUTTON - RIGHT SIDE
            =============================================== */}

        <button
          type="button"
          className="mobile-menu-btn"
          aria-expanded={isMobileMenuOpen}
          aria-controls="main-navigation"
          aria-label={
            isMobileMenuOpen
              ? t("accessibility.closeNavigation")
              : t("accessibility.openNavigation")
          }
          onClick={() => setIsMobileMenuOpen((previous) => !previous)}
        >
          <span
            className={`hamburger ${isMobileMenuOpen ? "open" : ""}`}
            aria-hidden="true"
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </span>
        </button>
      </div>

      {/* ===============================================
          MOBILE OVERLAY
          =============================================== */}

      {isMobileMenuOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </header>
  );
};

export default Header;
