"use client";

import { useState, useTransition } from "react";
import { moderateListing, type ModerationOutcome } from "@/app/admin/actions";

const LABELS: Record<ModerationOutcome, string> = {
  valid: "Validée ✓",
  fix: "Correction demandée",
  reject: "Refusée",
};

/* Boutons de modération d'une annonce en attente (page Admin).
   Appelle réellement moderateListing() : le statut change en base. */
export default function ModerationActions({ listingRef }: { listingRef: string }) {
  const [outcome, setOutcome] = useState<ModerationOutcome | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function act(o: ModerationOutcome) {
    setError(null);
    startTransition(async () => {
      const result = await moderateListing(listingRef, o);
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
        className="btn btn--sm btn--ghost"
        type="button"
        onClick={() => act("fix")}
        disabled={pending}
      >
        Demander une correction
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
