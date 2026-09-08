"use client";

import Link from "next/link";
import { useState } from "react";
import type { Listing } from "@/lib/types";
import { VISIT_SLOTS } from "@/lib/data";

/* Prise de rendez-vous — démonstration : la demande n'est pas encore
   transmise. Elle le sera via une route API + envoi d'email/SMS. */
export default function VisiteForm({ listing }: { listing: Listing }) {
  const l = listing;
  const [picked, setPicked] = useState(1);
  const [sent, setSent] = useState(false);

  const label = (i: number) => {
    const s = VISIT_SLOTS[i];
    return `${s.day} ${s.date}, ${s.time}`;
  };

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

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSent(true);
        }}
      >
        <p className="step-title">1 · Créneaux proposés</p>
        <div
          className="slot-grid"
          style={{ marginBottom: 34 }}
          role="group"
          aria-label="Créneaux disponibles"
        >
          {VISIT_SLOTS.map((s, i) => (
            <button
              key={i}
              type="button"
              className="slot"
              aria-pressed={i === picked}
              onClick={() => setPicked(i)}
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
              name="nom"
              placeholder="Ex. Hounkpatin Bernadette"
              required
              disabled={sent}
            />
          </label>
          <label className="field">
            <span className="field__label">Téléphone</span>
            <input
              className="input num"
              type="tel"
              name="tel"
              placeholder="+229 01 97 00 00 00"
              required
              disabled={sent}
            />
          </label>
        </div>
        <label className="field" style={{ marginBottom: 28 }}>
          <span className="field__label">Message au propriétaire (facultatif)</span>
          <textarea
            className="textarea"
            name="message"
            rows={3}
            placeholder="Je souhaite emménager début octobre."
            disabled={sent}
          />
        </label>

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
            <p className="h-serif h-serif--22">{label(picked)}</p>
          </div>
          <button className="btn" type="submit" disabled={sent}>
            Envoyer ma demande
          </button>
        </div>

        {sent && (
          <p className="notice" style={{ marginTop: 18 }}>
            Demande envoyée. Le propriétaire dispose de 24 heures pour confirmer ; vous
            recevrez un SMS dès sa réponse. (Démonstration : aucune donnée n&apos;est
            transmise.)
          </p>
        )}
      </form>

      <p className="fineprint" style={{ marginTop: 22 }}>
        Aucune somme n&apos;est à verser avant la visite. Si quelqu&apos;un vous demande de
        payer pour visiter ce bien, signalez-le : ce n&apos;est pas le propriétaire.
      </p>
    </section>
  );
}
