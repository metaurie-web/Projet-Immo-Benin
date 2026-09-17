"use client";

import { useState, useTransition } from "react";
import {
  confirmVisitRequestAction,
  rejectVisitRequestAction,
} from "@/app/espace-proprietaire/actions";

/* Confirmer / refuser une demande de visite réelle (espace propriétaire). */
export default function ConfirmButton({
  requestId,
  initialStatus,
}: {
  requestId: number;
  initialStatus: string;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const done = status !== "en_attente";

  function act(kind: "confirmee" | "refusee") {
    setError(null);
    startTransition(async () => {
      const result =
        kind === "confirmee"
          ? await confirmVisitRequestAction(requestId)
          : await rejectVisitRequestAction(requestId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setStatus(kind);
    });
  }

  return (
    <div className="request-row__actions" data-done={done}>
      {error && (
        <p style={{ width: "100%", fontSize: 12.5, color: "#c0392b", margin: "0 0 6px" }}>
          {error}
        </p>
      )}
      <button
        className="btn btn--sm"
        type="button"
        onClick={() => act("confirmee")}
        disabled={done || pending}
      >
        {status === "confirmee" ? "Confirmée ✓" : "Confirmer"}
      </button>
      <button
        className="btn btn--sm btn--ghost"
        type="button"
        onClick={() => act("refusee")}
        disabled={done || pending}
      >
        {status === "refusee" ? "Refusée" : "Refuser"}
      </button>
    </div>
  );
}
