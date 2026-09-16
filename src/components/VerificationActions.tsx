"use client";

import { useState, useTransition } from "react";
import { moderateVerification, type VerificationOutcome } from "@/app/admin/actions";

const LABELS: Record<VerificationOutcome, string> = {
  valid: "Identité validée ✓",
  reject: "Refusée",
};

/* Boutons Valider / Refuser d'une vérification d'identité en attente (page
   Admin). Appelle réellement moderateVerification() : le statut change en
   base et le propriétaire peut (ou non) publier dès l'instant suivant. */
export default function VerificationActions({ userId }: { userId: string }) {
  const [outcome, setOutcome] = useState<VerificationOutcome | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function act(o: VerificationOutcome) {
    setError(null);
    startTransition(async () => {
      const result = await moderateVerification(userId, o);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOutcome(o);
    });
  }

  if (outcome) {
    return (
      <div className="mod-card__actions">
        <span className="tag">{LABELS[outcome]}</span>
      </div>
    );
  }

  return (
    <div className="mod-card__actions">
      {error && (
        <p style={{ fontSize: 12, color: "#c0392b", margin: "0 0 6px", maxWidth: 180 }}>{error}</p>
      )}
      <button className="btn btn--sm" type="button" onClick={() => act("valid")} disabled={pending}>
        Valider
      </button>
      <button
        className="link-underline"
        type="button"
        onClick={() => act("reject")}
        disabled={pending}
        style={{ borderColor: "var(--hair)", color: "var(--grey)" }}
      >
        Refuser
      </button>
    </div>
  );
}
