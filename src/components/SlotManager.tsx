"use client";

import { useState, useTransition } from "react";
import type { Slot } from "@/lib/visits";
import { addVisitSlotAction, removeVisitSlotAction } from "@/app/espace-proprietaire/actions";

/* Créneaux de visite proposés pour UNE annonce (espace propriétaire) :
   ajout et suppression, en direct sur la base. */
export default function SlotManager({
  listingRef,
  initialSlots,
}: {
  listingRef: string;
  initialSlots: Slot[];
}) {
  const [slots, setSlots] = useState(initialSlots);
  const [adding, setAdding] = useState(false);
  const [day, setDay] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submitSlot(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await addVisitSlotAction(listingRef, { day, date, time });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      // Le créneau réel a un id généré côté base ; on rafraîchit la liste
      // affichée en relisant plus simplement via un id temporaire négatif
      // n'est pas fiable — on force un rechargement de la page à la place.
      window.location.reload();
    });
  }

  function remove(slotId: number) {
    setError(null);
    startTransition(async () => {
      const result = await removeVisitSlotAction(listingRef, slotId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSlots((s) => s.filter((x) => x.id !== slotId));
    });
  }

  return (
    <div>
      {error && (
        <p style={{ fontSize: 12.5, color: "#c0392b", margin: "0 0 8px" }}>{error}</p>
      )}
      <div className="slot-tags">
        {slots.map((s) => (
          <button
            key={s.id}
            type="button"
            className="slot-tag"
            onClick={() => remove(s.id)}
            disabled={pending}
            title="Retirer ce créneau"
            style={{ cursor: "pointer" }}
          >
            {s.day} {s.date} · {s.time} ✕
          </button>
        ))}
        {!adding && (
          <button
            className="slot-tag slot-tag--add"
            type="button"
            onClick={() => setAdding(true)}
          >
            + Ajouter un créneau
          </button>
        )}
      </div>

      {adding && (
        <form
          onSubmit={submitSlot}
          style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end", padding: "10px 0" }}
        >
          <label className="field" style={{ minWidth: 130 }}>
            <span className="field__label">Jour</span>
            <input
              className="input"
              type="text"
              placeholder="Samedi"
              required
              value={day}
              onChange={(e) => setDay(e.target.value)}
            />
          </label>
          <label className="field" style={{ minWidth: 130 }}>
            <span className="field__label">Date</span>
            <input
              className="input"
              type="text"
              placeholder="20 sept."
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <label className="field" style={{ minWidth: 160 }}>
            <span className="field__label">Heure</span>
            <input
              className="input"
              type="text"
              placeholder="09h00 – 09h30"
              required
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </label>
          <button className="btn btn--sm" type="submit" disabled={pending}>
            {pending ? "Ajout…" : "Ajouter"}
          </button>
          <button
            className="btn btn--sm btn--ghost"
            type="button"
            onClick={() => setAdding(false)}
            disabled={pending}
          >
            Annuler
          </button>
        </form>
      )}
    </div>
  );
}
