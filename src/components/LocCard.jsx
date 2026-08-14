// Karte eines Partnerbetriebs auf der Startseite.
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { dayStatus, nextAktion, aktionRange } from "../utils/aktion";
import { getOccupancy } from "../services/storage";

export function LocCard({ loc, todayKey, onOpen }) {
  /*
   * ============================================================
   * TRANSLATION
   * ============================================================
   */
  const { t } = useTranslation();

  /*
   * ============================================================
   * STATE
   * ============================================================
   */
  const [taken, setTaken] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  /*
   * ============================================================
   * EXISTING BUSINESS LOGIC
   * ============================================================
   */

  const status = dayStatus(
    loc,
    todayKey,
    new Date().getDay(),
  ).status;

  /*
   * Promotion logic
   */
  const aktion = nextAktion(loc, todayKey);

  /*
   * First configured slot
   */
  const firstSlot =
    ((loc.slotsByDay || {})[new Date().getDay()] ||
      loc.slots ||
      [])[0];

  /*
   * Seat information
   */
  const seatCount =
    (loc.tisch && loc.tisch.seats) ||
    loc.seats ||
    0;

  /*
   * ============================================================
   * HOST CONFIGURATION LOGIC
   * ============================================================
   */

  const hasSlotByDay =
    Object.keys(loc.slotsByDay || {}).length > 0;

  const configured = !!(
    (loc.days || []).length &&
    ((loc.slots || []).length || hasSlotByDay)
  );

  /*
   * Keep existing slot information available.
   * It is intentionally not displayed in the card.
   */
  const displaySlots =
    hasSlotByDay &&
    loc.days &&
    loc.days.length
      ? loc.slotsByDay[loc.days[0]] ||
        loc.slots ||
        []
      : loc.slots || [];

  /*
   * Prevent unused-variable warnings.
   */
  void displaySlots;

  /*
   * ============================================================
   * OCCUPANCY LOGIC
   * ============================================================
   */

  useEffect(() => {
    let active = true;

    const loadOccupancy = async () => {
      if (status !== "offen") {
        return;
      }

      try {
        const occ = await getOccupancy(
          loc.id,
          todayKey,
        );

        if (
          active &&
          occ &&
          firstSlot &&
          occ[firstSlot]
        ) {
          setTaken(
            occ[firstSlot].filter(
              (s) => s < seatCount,
            ).length,
          );
        } else if (active) {
          setTaken(0);
        }
      } catch (error) {
        console.error(
          "OCCUPANCY LOAD ERROR:",
          error,
        );

        if (active) {
          setTaken(0);
        }
      }
    };

    loadOccupancy();

    return () => {
      active = false;
    };
  }, [
    loc.id,
    todayKey,
    firstSlot,
    status,
    seatCount,
  ]);

  /*
   * Occupancy is intentionally not displayed.
   */
  void taken;

  /*
   * ============================================================
   * IMAGE LOGIC
   * ============================================================
   */

  const specialImage =
    (loc.sonder || {})[todayKey] &&
    (loc.sonder || {})[todayKey].bild;

  const mainImage = loc.titelbild;

  const displayImage =
    specialImage || mainImage;

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoaded(false);
    setImageError(true);
  };

  /*
   * ============================================================
   * CARD UI
   * ============================================================
   */

  return (
    <div
      className="card card-hover"
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        minHeight: "390px",
        backgroundColor: "#FFFFFF",
        border: "1px solid #DED8CE",
        borderRadius: "12px",
        overflow: "hidden",
        boxSizing: "border-box",
        padding: 0,
      }}
    >
      {/* ======================================================
          IMAGE
          ====================================================== */}

      <div
        style={{
          position: "relative",
          width: "100%",
          height: "140px",
          minHeight: "136px",
          margin: 0,
          padding: 0,
          backgroundColor: "#F1F0EC",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {displayImage && !imageError ? (
          <img
            src={displayImage}
            alt={`${loc.name} in ${loc.city}`}
            className="karte-bild"
            loading="lazy"
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{
              display: "block",
              width: "100%",
              height: "100%",
              margin: 0,
              padding: 0,
              border: 0,
              objectFit: "cover",
              opacity: imageLoaded ? 1 : 0.5,
              transition:
                "opacity 0.3s ease-in-out",
            }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              background:
                "linear-gradient(180deg, #F8F7F4 0%, #E4E2DE 100%)",
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                border: "1px solid #D3CCBF",
                backgroundColor: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxSizing: "border-box",
              }}
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#8A8FA3"
                strokeWidth="1.3"
              >
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="2"
                />

                <circle
                  cx="8.5"
                  cy="8.5"
                  r="1.5"
                />

                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>

            <span
              style={{
                fontSize: 8,
                lineHeight: 1.2,
                fontWeight: 500,
                color: "#65708A",
              }}
            >
              {t("locCard.noImage")}
            </span>
          </div>
        )}

        {/* ====================================================
            TYPE BADGE
            ==================================================== */}

        {loc.type && (
          <div
            style={{
              position: "absolute",
              top: 9,
              right: 9,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 18,
              padding: "3px 8px",
              backgroundColor: "#FFFFFF",
              color: "#A95718",
              border: "1px solid #E3D9C9",
              borderRadius: "999px",
              fontSize: 7,
              lineHeight: 1,
              fontWeight: 800,
              letterSpacing: "0.45px",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              boxSizing: "border-box",
            }}
          >
            {loc.type}
          </div>
        )}
      </div>

      {/* ======================================================
          CARD CONTENT
          ====================================================== */}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
          padding: "12px 14px",
          boxSizing: "border-box",
        }}
      >
        {/* ====================================================
            RESTAURANT / VENUE NAME
            ==================================================== */}

        <div
          className="f-display"
          style={{
            color: "#173A7A",
            fontSize: "18px",
            lineHeight: 1.12,
            fontWeight: 700,
            margin: 0,
            padding: 0,
            overflowWrap: "anywhere",
          }}
        >
          {loc.name}
        </div>

        {/* ====================================================
            LOCATION
            ==================================================== */}

        <div
          style={{
            color: "#788096",
            fontSize: "12px",
            lineHeight: 1.25,
            fontWeight: 500,
            marginTop: 3,
            overflowWrap: "anywhere",
          }}
        >
          {loc.city} · {loc.region}
        </div>

        {/* ====================================================
            PROMOTION
            ==================================================== */}

        {aktion && (
          <div
            style={{
              marginTop: 9,
              backgroundColor: "#FFF9EF",
              border: "1px solid #E8D7BB",
              borderRadius: 7,
              padding: "7px 8px",
              boxSizing: "border-box",
            }}
          >
            {/* Promotion header */}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 6,
                marginBottom: 5,
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#F1E0C4",
                  color: "#74451F",
                  borderRadius: "999px",
                  padding: "3px 6px",
                  fontSize: 6,
                  lineHeight: 1,
                  fontWeight: 800,
                  letterSpacing: "0.45px",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                }}
              >
                {t("locCard.promotion", {
                  defaultValue: "Promotion",
                })}
              </span>

              {/* Promotion date */}

              <span
                style={{
                  color: "#74451F",
                  fontSize: 6,
                  lineHeight: 1.1,
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
              >
                {aktionRange(aktion)}
              </span>
            </div>

            {/* Promotion title */}

            <div
              style={{
                color: "#173A7A",
                fontSize: 8,
                lineHeight: 1.2,
                fontWeight: 800,
                marginBottom:
                  aktion.angebot ? 3 : 0,
              }}
            >
              {aktion.titel}
            </div>

            {/* Promotion description */}

            {aktion.angebot && (
              <div
                style={{
                  color: "#65708A",
                  fontSize: 6.5,
                  lineHeight: 1.3,
                  fontWeight: 400,
                }}
              >
                {aktion.angebot}
              </div>
            )}
          </div>
        )}

        {/* ====================================================
            SPECIAL OFFER
            ==================================================== */}

        {loc.angebot && (
          <div
            style={{
              marginTop: aktion ? 6 : 9,
              backgroundColor: "#FBF9F4",
              border: "1px solid #E3DCCF",
              borderRadius: 7,
              padding: "6px 7px",
              display: "flex",
              alignItems: "center",
              gap: 7,
              boxSizing: "border-box",
            }}
          >
            {/* % circle */}

            <div
              style={{
                width: 24,
                height: 24,
                minWidth: 24,
                borderRadius: "50%",
                border: "1px solid #D6C8B1",
                backgroundColor: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#74451F",
                fontSize: 11,
                fontWeight: 700,
                lineHeight: 1,
                boxSizing: "border-box",
              }}
            >
              %
            </div>

            {/* Offer content */}

            <div
              style={{
                minWidth: 0,
                flex: 1,
              }}
            >
              <div
                style={{
                  color: "#173A7A",
                  fontSize: 7,
                  lineHeight: 1.2,
                  fontWeight: 800,
                  marginBottom: 2,
                }}
              >
                {t("locCard.offer", {
                  defaultValue: "Mischtisch Offer",
                })}
              </div>

              <div
                style={{
                  color: "#65708A",
                  fontSize: 6.5,
                  lineHeight: 1.25,
                  fontWeight: 400,
                  overflowWrap: "anywhere",
                }}
              >
                {loc.angebot}
              </div>
            </div>
          </div>
        )}

        {/* ====================================================
            FLEX SPACE
            ==================================================== */}

        <div
          style={{
            flex: 1,
            minHeight: 6,
          }}
        />

        {/* ====================================================
            CHECK AVAILABILITY
            ==================================================== */}

        <button
          className="btn btn-primary"
          disabled={!configured}
          title={
            configured
              ? ""
              : t("locCard.notBookable", {
                  defaultValue: "Noch nicht buchbar",
                })
          }
          onClick={() => {
            if (configured && onOpen) {
              onOpen(loc);
            }
          }}
          style={{
            width: "100%",
            height: "40px",
            minHeight: "40px",
            marginTop: 6,
            padding: "0 10px",
            borderRadius: 6,
            border: "none",
            backgroundColor: configured
              ? "#193A7A"
              : "#9AA8C8",
            color: "#FFFFFF",
            fontSize: "14px",
            lineHeight: 1,
            fontWeight: 700,
            cursor: configured
              ? "pointer"
              : "not-allowed",
            opacity: 1,
            boxSizing: "border-box",
            transition:
              "background-color 0.2s ease, transform 0.2s ease",
          }}
        >
         {t("locCard.chooseSeat")}
        </button>
      </div>
    </div>
  );
}