"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";

/* Un emplacement du formulaire /publier : au clic, ouvre le sélecteur de
   fichiers, envoie l'image DIRECTEMENT au navigateur vers Vercel Blob (pas
   par notre serveur — /api/upload ne fait que délivrer un jeton), puis
   affiche un aperçu. Tant qu'aucune photo n'est envoyée, `value` reste le
   libellé de démonstration ("Séjour", "Chambre"…). */
export default function PhotoUploadSlot({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isUploaded = /^https?:\/\//.test(value);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // permet de resélectionner le même fichier plus tard
    if (!file) return;

    setError(null);
    setUploading(true);
    try {
      const blob = await upload(`annonces/${Date.now()}-${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });
      onChange(blob.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'envoi.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label
        className="upload-slot"
        style={isUploaded ? { padding: 0, overflow: "hidden" } : undefined}
      >
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={handleFile}
          disabled={uploading}
        />
        {isUploaded ? (
          // eslint-disable-next-line @next/next/no-img-element -- aperçu local, next/image est inutile ici
          <img
            src={value}
            alt={label}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <>
            <span className="upload-slot__plus">{uploading ? "…" : "+"}</span>
            <span>{uploading ? "Envoi…" : label}</span>
          </>
        )}
      </label>
      {error && <p style={{ margin: "4px 0 0", fontSize: 11, color: "#c0392b" }}>{error}</p>}
    </div>
  );
}
