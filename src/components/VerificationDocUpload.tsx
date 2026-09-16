"use client";

import { useState } from "react";
import { uploadIdentityDoc } from "@/app/verification-identite/actions";

/* Envoi de la pièce d'identité (formulaire /verification-identite).
   Contrairement aux photos (store public, upload direct navigateur → Blob),
   le document passe par une action serveur — seule détentrice du jeton
   Blob PRIVÉ — plutôt qu'un upload direct depuis le navigateur. */
export default function VerificationDocUpload({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (url: string, fileName: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadIdentityDoc(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setFileName(file.name);
      onChange(result.url, file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'envoi.");
    } finally {
      setUploading(false);
    }
  }

  const isUploaded = !!value;

  return (
    <div>
      <label className="doc-card" style={{ display: "block", cursor: "pointer" }}>
        <input
          type="file"
          accept="image/jpeg,image/png,application/pdf"
          className="sr-only"
          onChange={handleFile}
          disabled={uploading}
        />
        <p className="doc-card__title">Pièce d&apos;identité</p>
        <p className="doc-card__body">
          CIP, passeport ou carte d&apos;identité en cours de validité, au format JPEG, PNG ou
          PDF (10 Mo maximum).
        </p>
        <span className="eyebrow eyebrow--muted" style={{ color: "var(--deep)" }}>
          {uploading
            ? "Envoi en cours…"
            : isUploaded
              ? `✓ ${fileName ?? "Document envoyé"} — cliquer pour remplacer`
              : "+ Joindre un fichier"}
        </span>
      </label>
      {error && <p style={{ margin: "8px 0 0", fontSize: 12.5, color: "#c0392b" }}>{error}</p>}
    </div>
  );
}
