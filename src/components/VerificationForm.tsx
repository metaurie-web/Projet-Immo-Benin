"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import VerificationDocUpload from "@/components/VerificationDocUpload";
import { submitVerification } from "@/app/verification-identite/actions";

export default function VerificationForm() {
  const router = useRouter();
  const [docUrl, setDocUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!docUrl) return;
    setSubmitting(true);
    setError(null);
    const result = await submitVerification(docUrl);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    // Recharge la page serveur : elle affichera désormais le statut "en_attente".
    router.refresh();
  }

  return (
    <div style={{ maxWidth: 480 }}>
      <VerificationDocUpload value={docUrl} onChange={(url) => setDocUrl(url)} />
      {error && (
        <p className="notice" style={{ marginTop: 16, borderColor: "#c0392b", color: "#c0392b" }}>
          {error}
        </p>
      )}
      <button
        className="btn"
        type="button"
        style={{ marginTop: 20 }}
        onClick={handleSubmit}
        disabled={!docUrl || submitting}
      >
        {submitting ? "Envoi…" : "Envoyer pour vérification"}
      </button>
    </div>
  );
}
