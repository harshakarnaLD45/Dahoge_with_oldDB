// Logo-Bereich: Anzeige im Kopf-/Fußbereich mit Austausch per Dateiauswahl.
import { useRef } from "react";
import { v } from "../utils/i18n";
import { setSetting } from "../services/storage";
import { DEHOGA_LOGO } from "../utils/logo";

// Kleiner "Logo austauschen"-Button (Fußzeile)
export function LogoSwapButton({ onLogo, showToast }) {
  let inputRef = useRef(null);
  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/svg+xml,image/webp"
        onChange={async (e) => {
          let file = e.target.files && e.target.files[0];
          e.target.value = "";
          if (!file) return;
          if (file.size > 15e5) {
            showToast(v("Die Datei ist größer als 1,5 MB.", "The file is larger than 1.5 MB."));
            return;
          }
          let reader = new FileReader();
          reader.onload = async () => {
            try {
              await setSetting("logo", reader.result);
              onLogo(reader.result);
              showToast(v("Logo ersetzt", "Logo replaced"));
            } catch {
              showToast(v("Speichern fehlgeschlagen.", "Saving failed."));
            }
          };
          reader.readAsDataURL(file);
        }}
        style={{ display: "none" }}
        aria-hidden="true"
        tabIndex={-1}
      />
      <button
        type="button"
        className="logo-edit"
        onClick={() => inputRef.current && inputRef.current.click()}
      >
        {v("Logo austauschen", "Swap logo")}
      </button>
    </>
  );
}

// Logo-Anzeige (Kopf- oder Fußzeile), Doppelklick tauscht das Logo
export function LogoPicker({ logo, onLogo, showToast, klein = false }) {
  let inputRef = useRef(null);
  return (
    <div className="logo-slot">
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/svg+xml,image/webp"
        onChange={async (e) => {
          let file = e.target.files && e.target.files[0];
          e.target.value = "";
          if (!file) return;
          if (!/^image\/(png|jpeg|svg\+xml|webp)$/.test(file.type)) {
            showToast(
              v(
                "Bitte eine Bilddatei wählen (SVG, PNG, JPG oder WebP).",
                "Please choose an image file (SVG, PNG, JPG or WebP).",
              ),
            );
            return;
          }
          if (file.size > 15e5) {
            showToast(
              v(
                "Die Datei ist größer als 1,5 MB — bitte eine kleinere Fassung verwenden.",
                "The file is larger than 1.5 MB — please use a smaller version.",
              ),
            );
            return;
          }
          let reader = new FileReader();
          reader.onload = async () => {
            try {
              await setSetting("logo", reader.result);
              onLogo(reader.result);
              showToast(v("Logo eingefügt", "Logo inserted"));
            } catch (err) {
              console.error(err);
              showToast(v("Das Logo konnte nicht gespeichert werden.", "The logo could not be saved."));
            }
          };
          reader.onerror = () => showToast(v("Die Datei konnte nicht gelesen werden.", "The file could not be read."));
          reader.readAsDataURL(file);
        }}
        style={{ display: "none" }}
        aria-hidden="true"
        tabIndex={-1}
      />
      <img
        src={logo || DEHOGA_LOGO}
        alt="DEHOGA Sachsen"
        className={`logo-img${klein ? " klein" : ""}`}
        title={v("In Kooperation mit dem DEHOGA Sachsen e. V.", "In cooperation with DEHOGA Sachsen e. V.")}
        onDoubleClick={() => inputRef.current && inputRef.current.click()}
      />
    </div>
  );
}
