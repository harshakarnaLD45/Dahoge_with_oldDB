// Startseite: Hero, Regionen-Filter, Suche und Betriebs-Karten.
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { dateKey } from "../utils/dates";
import { TableSvg } from "../components/TableSvg";
import { LocCard } from "../components/LocCard";
import { REGIONS } from "../services/data";
import { HowMischtischWorks } from "./HowMischtischWorks";
import {HostCTA} from "./HostCta"

export function HomePage({ locations, onOpen, onHost }) {
  const { t } = useTranslation();

  const [region, setRegion] = useState("Alle Regionen");
  const [query, setQuery] = useState("");

  const todayKey = dateKey(new Date());

  const filtered = locations.filter(
    (loc) =>
      (region === "Alle Regionen" || loc.region === region) &&
      (query.trim() === "" ||
        `${loc.name} ${loc.city} ${loc.type}`
          .toLowerCase()
          .includes(query.trim().toLowerCase())),
  );

  const ambientTaken = [0, 2, 5, 7];

  return (
    <div
      className="mt-wrap home-page"
      style={{
        paddingBottom: 60,
        paddingLeft: "clamp(5px, 3vw, 20px)",
        paddingRight: "clamp(5px, 3vw, 20px)",
        minHeight: "100vh",
      }}
    >
      {/* Hero Section */}
      <div
        className="hero-panel"
        style={{
          marginTop: 18,
          padding: "clamp(10px, 4vw, 40px)",
          maxWidth: 960,
          marginLeft: "auto",
          marginRight: "auto",
          backgroundColor: "#FFFFFF",
          borderRadius: "clamp(12px, 2vw, 16px)",
          border: "1px solid #E8E6E1",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 28,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: "1 1 320px", minWidth: 280 }}>
            <div className="eyebrow">
              {t("home.hero.eyebrow")}
            </div>

            <h1 className="h1">
              {t("home.hero.titleLine1")} {" "}
              {/* <br /> */}
              {t("home.hero.titleLine2")}
            </h1>

            <p className="lead">
              {t("home.hero.description")}
            </p>

            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 18,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <button
                className="btn btn-primary"
                onClick={() =>
                  document
                    .getElementById("mt-liste")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                {t("home.hero.findSeat")}
              </button>

              <button className="btn btn-ghost" onClick={onHost}>
                {t("home.hero.forHosts")}
              </button>

              <span
                style={{
                  fontSize: "clamp(12px, 1.5vw, 13.5px)",
                  color: "#5B627A",
                }}
              >
                {locations.length}{" "}
                {t("home.hero.partnerVenues")} ·{" "}
                {new Set(locations.map((loc) => loc.region)).size}{" "}
                {t("home.hero.regions")} ·{" "}
                {t("home.hero.oneAccount")}
              </span>
            </div>
          </div>

          <div
            style={{
              flex: "1 1 300px",
              minWidth: 260,
            }}
          >
            <TableSvg
              seats={10}
              occupied={ambientTaken}
              ambient
            />

            <div
              style={{
                textAlign: "center",
                fontSize: "clamp(12px, 1.5vw, 13px)",
                color: "#8A8FA3",
                marginTop: 2,
              }}
            >
              {t("home.hero.tableCaption")}
            </div>
          </div>
        </div>
      </div>

      {/* Filter + Search + Cards Combined Section */}
      <div
        id="mt-liste"
        style={{
          marginTop: "clamp(24px, 4vw, 30px)",
          maxWidth: 960,
          marginLeft: "auto",
          marginRight: "auto",
          backgroundColor: "#FFFFFF",
          padding: "clamp(5px, 3vw, 24px)",
          borderRadius: "clamp(12px, 2vw, 16px)",
          border: "1px solid #E8E6E1",
        }}
      >
        {/* Region Filter + Search */}
        <div>
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: 12,
            }}
          >
            {["Alle Regionen", ...REGIONS].map((c) => (
              <button
                key={c}
                className={`chip ${c === region ? "on" : ""}`}
                onClick={() => setRegion(c)}
                aria-pressed={c === region}
              >
                {c === "Alle Regionen"
                  ? t("home.filters.allRegions")
                  : c}
              </button>
            ))}
          </div>

          <input
            className="input"
            style={{
              maxWidth: 380,
              width: "100%",
            }}
            placeholder={t("home.filters.searchPlaceholder")}
            value={query}
            onChange={(ev) => setQuery(ev.target.value)}
            aria-label={t("home.filters.searchLabel")}
          />
        </div>

        {/* Cards */}
        {filtered.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              color: "#5B627A",
              marginTop: "clamp(20px, 4vw, 30px)",
              padding: "clamp(24px, 4vw, 40px)",
            }}
          >
            {t("home.empty")}
          </div>
        ) : (
          <div
            className="grid-cards"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "20px",
              marginTop: "clamp(20px, 3vw, 24px)",
              width: "100%",
              paddingBottom: "clamp(4px, 1vw, 10px)",
            }}
          >
            {filtered.map((loc) => (
              <LocCard
                key={loc.id}
                loc={loc}
                todayKey={todayKey}
                onOpen={onOpen}
              />
            ))}
          </div>
        )}
      </div>

      <HowMischtischWorks/>
      <HostCTA/>

      <style>{`
        /* Mobile: 1 column */
        @media (max-width: 640px) {
          .grid-cards {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
        }

        /* Tablet: 2 columns */
        @media (min-width: 641px) and (max-width: 960px) {
          .grid-cards {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 16px !important;
          }
        }

        /* Desktop: 3 columns */
        @media (min-width: 961px) {
          .grid-cards {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 20px !important;
          }
        }

        /* Extra large: Keep 3 columns */
        @media (min-width: 1440px) {
          .grid-cards {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 20px !important;
          }
        }

        /* 4K: Keep 3 columns */
        @media (min-width: 2560px) {
          .grid-cards {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 24px !important;
          }
        }
      `}</style>
    </div>
  );
}