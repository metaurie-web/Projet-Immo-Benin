"use client";

import Link from "next/link";
import { useState } from "react";
import type { Listing } from "@/lib/types";
import type { Slot } from "@/lib/visits";
import { submitVisitRequest } from "@/app/annonces/[ref]/visite/actions";

/* Prise de rendez-vous — réelle : la demande est enregistrée en base et un
   email part au propriétaire (s'il a un compte réel). */
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

  const label = (i: number) => {
    const s = slots[i];
    return s ? `${s.day} ${s.date}, ${s.time}` : "";
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (picked < 0) return;
    setSending(true);
    setError(null);
    const result = await submitVisitRequest(l.ref, {
      slotLabel: label(picked),
      name,
      phone,
      message: message || undefined,
    });
    setSending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSent(true);
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
              {sending ? "Envoi…" : "Envoyer ma demande"}
            </button>
          </div>

          {sent && (
            <p className="notice" style={{ marginTop: 18 }}>
              Demande envoyée. Le propriétaire dispose de 24 heures pour confirmer ; vous
              recevrez un email dès sa réponse. Retrouvez-la aussi dans{" "}
              <Link href="/espace-visiteur" className="link-underline">
                votre espace
              </Link>
              .
            </p>
          )}
        </form>
      )}

      <p className="fineprint" style={{ marginTop: 22 }}>
        Aucune somme n&apos;est à verser avant la visite. Si quelqu&apos;un vous demande de
        payer pour visiter ce bien, signalez-le : ce n&apos;est pas le propriétaire.
      </p>
    </section>
  );
}
