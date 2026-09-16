"use client";

import Link from "next/link";
import { useState } from "react";
import { COMMISSION } from "@/lib/data";
import { fcfa, fmt } from "@/lib/format";
import { publishListing, type PublishInput } from "@/app/publier/actions";
import PhotoUploadSlot from "@/components/PhotoUploadSlot";

const PHOTO_LABELS = ["Façade", "Séjour", "Chambre", "Cuisine et douche"] as const;

/* Assistant de publication en 2 étapes.
   L'identité du propriétaire se vérifie une seule fois, séparément (voir
   /verification-identite) — /publier lui-même la suppose déjà acquise, donc
   ce formulaire ne s'occupe plus que du bien à publier.
   Les informations sont réellement enregistrées en base (étape 2, bouton
   « Publier mon annonce ») : l'annonce part avec le statut « en attente »
   et n'apparaît publiquement qu'une fois validée depuis /admin.
   Reste à brancher : le paiement Mobile Money de la commission — la
   publication est gratuite en attendant. */

const STEPS = [
  { n: 1, label: "Informations et photos" },
  { n: 2, label: "Publication" },
];

const CITIES = ["Cotonou", "Abomey-Calavi", "Porto-Novo", "Ouidah"] as const;
const TYPES = ["Chambre-salon", "Appartement", "Maison basse", "Villa"] as const;
const WATERS = ["Forage + SONEB", "SONEB", "Forage"] as const;
const ADVANCES = ["1 mois", "2 mois", "3 mois", "6 mois"] as const;
const DEPOSITS = ["1 mois", "2 mois", "3 mois"] as const;

const INITIAL_FORM: PublishInput = {
  name: "",
  phone: "",
  city: "Cotonou",
  quartier: "",
  title: "",
  type: "Appartement",
  rooms: 2,
  furnished: false,
  meter: "individuel",
  water: "Forage + SONEB",
  parking: true,
  price: 90000,
  advance: "3 mois",
  deposit: "1 mois",
  landmark: "",
  description: "",
  photos: [...PHOTO_LABELS],
};

const commissionLabel = fmt(COMMISSION);

export default function PublierWizard() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<PublishInput>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publishedRef, setPublishedRef] = useState<string | null>(null);

  function set<K extends keyof PublishInput>(key: K, value: PublishInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const go = (n: number) => {
    setStep(Math.min(2, Math.max(1, n)));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  async function handlePublish() {
    setSubmitting(true);
    setError(null);
    const result = await publishListing(form);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setPublishedRef(result.ref);
  }

  const advanceMonths = parseInt(form.advance, 10);
  const depositMonths = parseInt(form.deposit, 10);
  const totalIn = form.price * advanceMonths + form.price * depositMonths;

  return (
    <section className="wrap section" style={{ maxWidth: 960 }}>
      <p className="eyebrow" style={{ marginBottom: 8 }}>
        Espace propriétaire · Publication
      </p>
      <h1
        className="display"
        style={{ fontSize: "clamp(30px, 3.8vw, 46px)", maxWidth: "26ch", marginBottom: 34 }}
      >
        Publiez votre bien en deux étapes.
      </h1>

      <ol className="wizard-steps">
        {STEPS.map((s) => (
          <li className="wizard-steps__item" key={s.n} data-active={step === s.n}>
            <span className="wizard-steps__n">Étape {s.n}</span>
            <p className="wizard-steps__label">{s.label}</p>
          </li>
        ))}
      </ol>

      {/* Étape 1 — informations */}
      {step === 1 && (
        <form
          className="form-grid"
          onSubmit={(e) => {
            e.preventDefault();
            go(2);
          }}
        >
          <label className="field">
            <span className="field__label">Nom et prénom</span>
            <input
              className="input"
              type="text"
              placeholder="Ex. Adjovi Kossi"
              required
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </label>
          <label className="field">
            <span className="field__label">Téléphone (MoMo ou Moov)</span>
            <input
              className="input num"
              type="tel"
              placeholder="+229 01 96 00 00 00"
              required
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
          </label>

          <label className="field">
            <span className="field__label">Titre de l&apos;annonce</span>
            <input
              className="input"
              type="text"
              placeholder="Ex. Appartement 2 chambres, cour clôturée"
              required
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </label>
          <label className="field">
            <span className="field__label">Type de bien</span>
            <select
              className="select"
              value={form.type}
              onChange={(e) => set("type", e.target.value as PublishInput["type"])}
            >
              {TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field__label">Ville du bien</span>
            <select
              className="select"
              value={form.city}
              onChange={(e) => set("city", e.target.value as PublishInput["city"])}
            >
              {CITIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field__label">Quartier</span>
            <input
              className="input"
              type="text"
              placeholder="Ex. Fidjrossè"
              required
              value={form.quartier}
              onChange={(e) => set("quartier", e.target.value)}
            />
          </label>

          <label className="field">
            <span className="field__label">Chambres</span>
            <select
              className="select num"
              value={form.rooms}
              onChange={(e) => set("rooms", Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n} {n > 1 ? "chambres" : "chambre"}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field__label">Loyer mensuel (FCFA)</span>
            <input
              className="input num"
              type="number"
              min={5000}
              step={1000}
              required
              value={form.price}
              onChange={(e) => set("price", Number(e.target.value))}
            />
          </label>

          <label className="field">
            <span className="field__label">Compteur SBEE</span>
            <select
              className="select"
              value={form.meter}
              onChange={(e) => set("meter", e.target.value as PublishInput["meter"])}
            >
              <option value="individuel">Individuel</option>
              <option value="partagé">Partagé</option>
            </select>
          </label>
          <label className="field">
            <span className="field__label">Eau</span>
            <select
              className="select"
              value={form.water}
              onChange={(e) => set("water", e.target.value)}
            >
              {WATERS.map((w) => (
                <option key={w}>{w}</option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field__label">Avance exigée</span>
            <select
              className="select"
              value={form.advance}
              onChange={(e) => set("advance", e.target.value as PublishInput["advance"])}
            >
              {ADVANCES.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field__label">Caution</span>
            <select
              className="select"
              value={form.deposit}
              onChange={(e) => set("deposit", e.target.value as PublishInput["deposit"])}
            >
              {DEPOSITS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field__label">Point de repère</span>
            <input
              className="input"
              type="text"
              placeholder="Ex. Voie pavée de Fidjrossè"
              required
              value={form.landmark}
              onChange={(e) => set("landmark", e.target.value)}
            />
          </label>
          <div className="field" style={{ justifyContent: "center" }}>
            <label className="check">
              <input
                type="checkbox"
                checked={form.furnished}
                onChange={(e) => set("furnished", e.target.checked)}
              />
              <span>Meublé</span>
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={form.parking}
                onChange={(e) => set("parking", e.target.checked)}
              />
              <span>Place de parking dans la cour</span>
            </label>
          </div>

          <label className="field form-grid__full">
            <span className="field__label">Description</span>
            <textarea
              className="textarea"
              rows={4}
              required
              minLength={30}
              placeholder="Décrivez le logement : pièces, état, ce qui décide vraiment un emménagement…"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </label>

          <div className="form-grid__full">
            <span className="filters__legend" style={{ marginBottom: 9 }}>
              Photos du bien — clique sur un emplacement pour envoyer une image
            </span>
            <div className="upload-grid">
              {PHOTO_LABELS.map((label, i) => (
                <PhotoUploadSlot
                  key={label}
                  label={label}
                  value={form.photos[i]}
                  onChange={(url) =>
                    setForm((f) => {
                      const photos = [...f.photos];
                      photos[i] = url;
                      return { ...f, photos };
                    })
                  }
                />
              ))}
            </div>
            <p style={{ margin: "10px 0 0", fontSize: 12.5, color: "var(--grey)" }}>
              JPEG, PNG ou WebP, 8 Mo maximum par photo. Un emplacement laissé vide garde une
              vignette de démonstration à sa place.
            </p>
          </div>

          <div className="form-grid__full" style={{ display: "flex", justifyContent: "flex-end" }}>
            <button className="btn" type="submit">
              Continuer vers la publication
            </button>
          </div>
        </form>
      )}

      {/* Étape 2 — récapitulatif + publication réelle */}
      {step === 2 && (
        <div className="wrap-flex" style={{ gap: 38 }}>
          <div className="grow">
            <p className="prose" style={{ maxWidth: "56ch", marginBottom: 16 }}>
              La commission de publication sera de {commissionLabel} FCFA par annonce, pour
              30 jours de visibilité, une fois le paiement Mobile Money branché. En
              attendant, la publication est <strong>gratuite</strong>.
            </p>

            {error && (
              <p className="notice" style={{ borderColor: "#c0392b", color: "#c0392b", marginBottom: 20 }}>
                {error}
              </p>
            )}

            {publishedRef ? (
              <p className="notice" style={{ marginBottom: 20 }}>
                Annonce <strong>{publishedRef}</strong> enregistrée et envoyée en validation.
                Elle sera en ligne dès qu&apos;un administrateur l&apos;aura contrôlée. Suis-la
                depuis ton{" "}
                <Link href="/espace-proprietaire" className="link-underline">
                  espace propriétaire
                </Link>
                .
              </p>
            ) : (
              <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
                <button className="link-underline" type="button" onClick={() => go(1)}>
                  ← Revenir aux informations
                </button>
                <button className="btn" type="button" onClick={handlePublish} disabled={submitting}>
                  {submitting ? "Publication…" : "Publier mon annonce"}
                </button>
              </div>
            )}
          </div>

          <aside className="recap hold" style={{ flex: "1 1 290px" }}>
            <p className="recap__title">Récapitulatif</p>
            <table>
              <tbody>
                <tr>
                  <td>Loyer mensuel</td>
                  <td>{fcfa(form.price)}</td>
                </tr>
                <tr>
                  <td>Avance ({form.advance})</td>
                  <td>{fcfa(form.price * advanceMonths)}</td>
                </tr>
                <tr>
                  <td>Caution ({form.deposit})</td>
                  <td>{fcfa(form.price * depositMonths)}</td>
                </tr>
                <tr className="total">
                  <td>Total à l&apos;entrée</td>
                  <td>{fcfa(totalIn)}</td>
                </tr>
              </tbody>
            </table>
            <p style={{ margin: "16px 0 0", fontSize: 13, color: "var(--grey)", lineHeight: 1.65 }}>
              Ton annonce part en validation dès la publication. Elle est en ligne dès
              qu&apos;un administrateur l&apos;a contrôlée.
            </p>
          </aside>
        </div>
      )}
    </section>
  );
}
