// Foto-Upload mit automatischer Verkleinerung (max. 6 Fotos).
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { compressImage } from "../utils/images";

const MAX_IMAGE_BYTES = 1 * 1024 * 1024; // 1 MB user limit
const FIRESTORE_SAFE_BYTES = 700 * 1024; // ~700 KB before Base64

function dataUrlToBytes(dataUrl) {
  const base64 = dataUrl.split(",")[1] || "";
  return Math.ceil((base64.length * 3) / 4);
}

async function compressToFirestoreSize(file) {
  let width = 1400;
  let quality = 0.75;

  for (let i = 0; i < 8; i++) {
    const dataUrl = await compressImage(file, width, quality);

    const bytes = dataUrlToBytes(dataUrl);

    if (bytes <= FIRESTORE_SAFE_BYTES) {
      return dataUrl;
    }

    width = Math.max(600, Math.floor(width * 0.85));
    quality = Math.max(0.35, quality - 0.07);
  }

  throw new Error("IMAGE_TOO_LARGE");
}

export function PhotoUploader({ fotos, onChange, showToast }) {
  const { t } = useTranslation();

  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const max = 1;

  const handleFiles = async (e) => {
    const files = [...(e.target.files || [])];

    e.target.value = "";

    if (!files.length) return;

    // Only use the first selected image.
    const file = files[0];

    if (!/^image\//.test(file.type)) {
      showToast(t("photoUploader.errors.imagesOnly"));
      return;
    }

    // Original selected file must not exceed 1 MB.
    if (file.size > MAX_IMAGE_BYTES) {
      showToast(
        t("photoUploader.errors.tooLarge", {
          fileName: file.name,
        }),
      );
      return;
    }

    setBusy(true);

    try {
      // Main image
      const gross = await compressToFirestoreSize(file);

      // Small preview
      const klein = await compressImage(file, 420, 0.6);

      const newFoto = {
        id: `f-${Date.now()}-${Math.floor(Math.random() * 999999)}`,

        // Base64 data URL
        gross,

        // Base64 preview
        klein,

        titel: file.name.replace(/\.[^.]+$/, "").slice(0, 60),
      };

      // IMPORTANT:
      // Replace the existing image instead of adding another one.
      onChange([newFoto]);

      showToast(
        fotos.length
          ? t("photoUploader.success.replaced")
          : t("photoUploader.success.added"),
      );
    } catch (err) {
      console.error("IMAGE PROCESSING ERROR:", err);

      showToast(
        t("photoUploader.errors.processing", {
          fileName: file.name,
        }),
      );
    } finally {
      setBusy(false);
    }
  };

  const remove = (id) => {
    onChange(fotos.filter((f) => f.id !== id));
  };

  const makeMain = (id) => {
    const main = fotos.find((f) => f.id === id);

    onChange([main, ...fotos.filter((f) => f.id !== id)]);
  };

  return (
    <div>
      {fotos.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))",
            gap: 10,
            marginBottom: 12,
          }}
        >
          {fotos.map((foto, i) => (
            <div key={foto.id} className="foto-kachel">
              <img
                src={foto.klein || foto.gross}
                alt={
                  foto.titel ||
                  t("photoUploader.alt.venuePhoto")
                }
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />

              <button
                type="button"
                className="foto-weg"
                onClick={() => remove(foto.id)}
                aria-label={t("photoUploader.remove")}
              >
                ✕
              </button>

              <button
                type="button"
                className={`foto-haupt ${i === 0 ? "on" : ""}`}
                onClick={() => makeMain(foto.id)}
              >
                {i === 0
                  ? t("photoUploader.coverImage")
                  : t("photoUploader.makeCover")}
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFiles}
        style={{ display: "none" }}
        aria-hidden="true"
        tabIndex={-1}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <span className="notice" style={{ maxWidth: "46ch" }}>
          {t("photoUploader.notice.limit")}{" "}
          {t("photoUploader.notice.compression")}
        </span>

        <button
          type="button"
          className="btn btn-ghost btn-sm"
          disabled={busy}
          onClick={() =>
            inputRef.current && inputRef.current.click()
          }
        >
          {busy
            ? t("photoUploader.buttons.processing")
            : fotos.length
              ? t("photoUploader.buttons.replace")
              : t("photoUploader.buttons.choose")}
        </button>
      </div>
    </div>
  );
}