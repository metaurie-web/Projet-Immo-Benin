"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { Listing } from "@/lib/types";
import type { Slot } from "@/lib/visits";
import { submitVisitRequest } from "@/app/annonces/[ref]/visite/actions";
import { VISIT_FEE_FCFA } from "@/lib/payments";
import { fcfa } from "@/lib/format";
import { useKkiapayListeners } from "@/lib/useKkiapayListeners";

type PendingRequest = { name: string; phone: string; message?: string; slotLabel: string };

/* Prise de rendez-vous — réelle : payante (200 FCFA, Mobile Money via
   KKiaPay), la demande n'est enregistrée en base qu'après vérification du
   paiement côté serveur (voir src/app/annonces/[ref]/visite/actions.ts). */
export default function VisiteForm({
  listing,
  slots,
  initialName,
}: {
  listing: Listing;
  slots: Slot[];
  initialName: string;
}) {
  const l = listing;
  const [picked, setPicked] = useState(slots.length > 0 ? 0 : -1);
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ce que le widget de paiement doit enregistrer une fois le paiement
  // confirmé — capturé au moment de l'ouverture, pas relu depuis le state
  // React dans le listener (qui reste enregistré une seule fois, voir
  // useEffect ci-dessous : une closure sur `form` y serait obsolète).
  const pendingRef = useRef<PendingRequest | null>(null);

  const label = (i: number) => {
    const s = slots[i];
    return s ? `${s.day} ${s.date}, ${s.time}` : "";
  };

  useKkiapayListeners(
    async (response) => {
      const pending = pendingRef.current;
      pendingRef.current = null;
      if (!pending) return;

      const result = await submitVisitRequest(l.ref, { ...pending, transactionId: response.transactionId });
      setSending(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSent(true);
    },
    () => {
      pendingRef.current = null;
      setSending(false);
      setError("Le paiement a échoué ou a été annulé. Réessaie.");
    },
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (picked < 0) return;

    if (!window.openKkiapayWidget) {
      setError("Le module de paiement ne s'est pas chargé. Recharge la page et réessaie.");
      return;
    }

    setError(null);
    setSending(true);
    pendingRef.current = { name, phone, message: message || undefined, slotLabel: label(picked) };

    window.openKkiapayWidget({
      amount: VISIT_FEE_FCFA,
      key: process.env.NEXT_PUBLIC_KKIAPAY_PUBLIC_KEY ?? "",
      sandbox: process.env.NEXT_PUBLIC_KKIAPAY_SANDBOX !== "false",
      position: "center",
      data: JSON.stringify({ listingRef: l.ref }),
    });
  }

  return (
    <section className="wrap section" style={{ maxWidth: 900 }}>
      <Link className="link-back" href={`/annonces/${l.ref}`}>
        ← Retour au bien
      </Link>
      <p className="eyebrow" style={{ marginBottom: 8 }}>
        Réf. {l.ref} · {l.quartier}, {l.city}
      </p>
      <h1
        className="display"
        style={{ fontSize: "clamp(30px, 3.6vw, 44px)", marginBottom: 10 }}
      >
        Prendre rendez-vous de visite
      </h1>
      <p style={{ margin: "0 0 32px", color: "var(--muted)", maxWidth: "56ch", lineHeight: 1.7 }}>
        {l.owner} a proposé les créneaux ci-dessous. Choisissez celui qui vous convient,
        laissez votre numéro, et il confirme dans son espace propriétaire.
      </p>

      {slots.length === 0 ? (
        <p className="notice">
          {l.owner} n&apos;a pas encore proposé de créneau pour ce bien. Revenez un peu plus
          tard, ou contactez-le après validation de votre profil.
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
          <p className="step-title">1 · Créneaux proposés</p>
          <div
            className="slot-grid"
            style={{ marginBottom: 34 }}
            role="group"
            aria-label="Créneaux disponibles"
          >
            {slots.map((s, i) => (
              <button
                key={s.id}
                type="button"
                className="slot"
                aria-pressed={i === picked}
                onClick={() => setPicked(i)}
                disabled={sent}
              >
                <span className="slot__day">{s.day}</span>
                <span className="slot__date">{s.date}</span>
                <span className="slot__time">{s.time}</span>
              </button>
            ))}
          </div>

          <p className="step-title">2 · Vos coordonnées</p>
          <div
            className="form-grid"
            style={{
              maxWidth: "none",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              marginBottom: 18,
            }}
          >
            <label className="field">
              <span className="field__label">Nom et prénom</span>
              <input
                className="input"
                type="text"
                placeholder="Ex. Hounkpatin Bernadette"
                required
                disabled={sent}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="field">
              <span className="field__label">Téléphone</span>
              <input
                className="input num"
                type="tel"
                placeholder="+229 01 97 00 00 00"
                required
                disabled={sent}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </label>
          </div>
          <label className="field" style={{ marginBottom: 28 }}>
            <span className="field__label">Message au propriétaire (facultatif)</span>
            <textarea
              className="textarea"
              rows={3}
              placeholder="Je souhaite emménager début octobre."
              disabled={sent}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </label>

          {error && (
            <p className="notice" style={{ marginBottom: 18, borderColor: "#c0392b", color: "#c0392b" }}>
              {error}
            </p>
          )}

          <div
            className="panel panel--tint"
            style={{
              padding: 22,
              display: "flex",
              flexWrap: "wrap",
              gap: 20,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <p className="eyebrow eyebrow--muted" style={{ marginBottom: 4 }}>
                Créneau retenu
              </p>
              <p className="h-serif h-serif--22">{picked >= 0 ? label(picked) : "—"}</p>
            </div>
            <button className="btn" type="submit" disabled={sent || sending || picked < 0}>
              {sending ? "Paiement en cours…" : `Payer ${fcfa(VISIT_FEE_FCFA)} et envoyer`}
            </button>
          </div>

          {sent && (
            <p className="notice" style={{ marginTop: 18 }}>
              Paiement confirmé, demande envoyée. Le propriétaire dispose de 24 heures pour
              confirmer ; vous recevrez un email dès sa réponse. Retrouvez-la aussi dans{" "}
              <Link href="/espace-visiteur" className="link-underline">
                votre espace
              </Link>
              .
            </p>
          )}
        </form>
      )}

      <p className="fineprint" style={{ marginTop: 22 }}>
        Seuls les {fcfa(VISIT_FEE_FCFA)} de frais de prise de rendez-vous, réglés ci-dessus par
        Mobile Money, sont à payer. Aucune autre somme n&apos;est à verser avant la visite : si
        le propriétaire vous en demande, signalez-le.
      </p>
    </section>
  );
}
