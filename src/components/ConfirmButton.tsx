"use client";

import { useState } from "react";

/* Bouton « Confirmer » d'une demande de visite (espace propriétaire).
   Démonstration : le clic change seulement l'affichage. */
export default function ConfirmButton() {
  const [done, setDone] = useState(false);

  return (
    <div className="request-row__actions" data-done={done}>
      <button
        className="btn btn--sm"
        type="button"
        onClick={() => setDone(true)}
        disabled={done}
      >
        {done ? "Confirmée ✓" : "Confirmer"}
      </button>
      <button className="btn btn--sm btn--ghost" type="button" disabled={done}>
        Proposer un autre créneau
      </button>
    </div>
  );
}
