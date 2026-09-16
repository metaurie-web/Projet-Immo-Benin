"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";

/* Envoi de la pièce d'identité (formulaire /verification-identite).
   Comme PhotoUploadSlot, le fichier part directement du navigateur vers
   Vercel Blob — mais ici vers le store PRIVÉ (/api/upload-identity), et le
   document n'est jamais affiché tel quel (voir /api/admin/identity-doc). */
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
      const blob = await upload(`identite/${Date.now()}-${file.name}`, file, {
        access: "public", // ignoré : le store cible (privé) impose son propre mode
        handleUploadUrl: "/api/upload-identity",
      });
      setFileName(file.name);
      onChange(blob.url, file.name);
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
