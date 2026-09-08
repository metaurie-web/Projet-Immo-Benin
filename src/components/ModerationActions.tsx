"use client";

import { useState } from "react";

type Outcome = "valid" | "fix" | "reject";

const LABELS: Record<Outcome, string> = {
  valid: "Validée ✓",
  fix: "Correction demandée",
  reject: "Refusée",
};

/* Boutons de modération d'une annonce en attente (page Admin).
   Démonstration : le clic remplace les boutons par une étiquette. */
export default function ModerationActions() {
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  if (outcome) {
    return (
      <div className="mod-card__actions">
        <span className="tag">{LABELS[outcome]}</span>
      </div>
    );
  }

  return (
    <div className="mod-card__actions">
      <button className="btn btn--sm" type="button" onClick={() => setOutcome("valid")}>
        Valider
      </button>
      <button
        className="btn btn--sm btn--ghost"
        type="button"
        onClick={() => setOutcome("fix")}
      >
        Demander une correction
      </button>
      <button
        className="link-underline"
        type="button"
        onClick={() => setOutcome("reject")}
        style={{ borderColor: "var(--hair)", color: "var(--grey)" }}
      >
        Refuser
      </button>
    </div>
  );
}
