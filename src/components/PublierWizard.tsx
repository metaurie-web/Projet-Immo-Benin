"use client";

import Link from "next/link";
import { useState } from "react";
import { COMMISSION } from "@/lib/data";
import { fmt } from "@/lib/format";

/* Assistant de publication en 3 étapes.
   Démonstration : aucune donnée n'est enregistrée, aucun paiement n'est
   effectué. Les branchements (upload de photos, vérification, paiement Mobile
   Money) viendront ensuite. */

const STEPS = [
  { n: 1, label: "Informations et photos" },
  { n: 2, label: "Vérification" },
  { n: 3, label: "Paiement de la commission" },
];

const commissionLabel = fmt(COMMISSION);

export default function PublierWizard() {
  const [step, setStep] = useState(1);
  const [pay, setPay] = useState<"momo" | "moov">("momo");
  const [paid, setPaid] = useState(false);

  const go = (n: number) => {
    setStep(Math.min(3, Math.max(1, n)));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="wrap section" style={{ maxWidth: 960 }}>
      <p className="eyebrow" style={{ marginBottom: 8 }}>
        Espace propriétaire · Inscription
      </p>
      <h1
        className="display"
        style={{ fontSize: "clamp(30px, 3.8vw, 46px)", maxWidth: "26ch", marginBottom: 34 }}
      >
        Publiez votre bien en trois étapes.
      </h1>

      <ol className="wizard-steps">
        {STEPS.map((s) => (
          <li className="wizard-steps__item" key={s.n} data-active={step === s.n}>
            <span className="wizard-steps__n">Étape {s.n}</span>
            <p className="wizard-steps__label">{s.label}</p>
          </li>
        ))}
      </ol>

      {/* Étape 1 */}
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
            <input className="input" type="text" placeholder="Ex. Adjovi Kossi" required />
          </label>
          <label className="field">
            <span className="field__label">Téléphone (MoMo ou Moov)</span>
            <input className="input num" type="tel" placeholder="+229 01 96 00 00 00" required />
          </label>
          <label className="field">
            <span className="field__label">Ville du bien</span>
            <select className="select" defaultValue="Cotonou">
              <option>Cotonou</option>
              <option>Abomey-Calavi</option>
              <option>Porto-Novo</option>
              <option>Ouidah</option>
            </select>
          </label>
          <label className="field">
            <span className="field__label">Quartier</span>
            <input className="input" type="text" placeholder="Ex. Fidjrossè" required />
          </label>
          <label className="field">
            <span className="field__label">Loyer mensuel (FCFA)</span>
            <input
              className="input num"
              type="text"
              inputMode="numeric"
              placeholder="90 000"
              required
            />
          </label>
          <label className="field">
            <span className="field__label">Avance exigée</span>
            <select className="select" defaultValue="3 mois">
              <option>1 mois</option>
              <option>2 mois</option>
              <option>3 mois</option>
              <option>6 mois</option>
            </select>
          </label>
          <div className="form-grid__full">
            <span className="filters__legend" style={{ marginBottom: 9 }}>
              Photos du bien — 4 minimum
            </span>
            <div className="upload-grid">
              {["Façade", "Séjour", "Chambre", "Cuisine et douche"].map((p) => (
                <div className="upload-slot" key={p}>
                  <span className="upload-slot__plus">+</span>
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="form-grid__full" style={{ display: "flex", justifyContent: "flex-end" }}>
            <button className="btn" type="submit">
              Continuer vers la vérification
            </button>
          </div>
        </form>
      )}

      {/* Étape 2 */}
      {step === 2 && (
        <div style={{ maxWidth: 760 }}>
          <p className="prose" style={{ maxWidth: "none", marginBottom: 24 }}>
            Nous vérifions chaque propriétaire avant de publier son annonce. C&apos;est ce
            qui permet aux locataires de faire confiance à la plateforme et de ne plus
            passer par un démarcheur. Vos documents ne sont jamais visibles publiquement.
          </p>
          <div
            className="form-grid"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              marginBottom: 26,
            }}
          >
            <div className="doc-card">
              <p className="doc-card__title">Pièce d&apos;identité</p>
              <p className="doc-card__body">
                CIP, passeport ou carte d&apos;identité en cours de validité, au nom du
                propriétaire.
              </p>
              <span className="eyebrow eyebrow--muted" style={{ color: "var(--deep)" }}>
                + Joindre un fichier
              </span>
            </div>
            <div className="doc-card">
              <p className="doc-card__title">Titre de propriété</p>
              <p className="doc-card__body">
                Attestation de recasement, convention de vente ou titre foncier du bien mis
                en location.
              </p>
              <span className="eyebrow eyebrow--muted" style={{ color: "var(--deep)" }}>
                + Joindre un fichier
              </span>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
            <button className="link-underline" type="button" onClick={() => go(1)}>
              ← Revenir aux informations
            </button>
            <button className="btn" type="button" onClick={() => go(3)}>
              Continuer vers le paiement
            </button>
          </div>
        </div>
      )}

      {/* Étape 3 */}
      {step === 3 && (
        <div className="wrap-flex" style={{ gap: 38 }}>
          <div className="grow">
            <p className="prose" style={{ maxWidth: "56ch", marginBottom: 16 }}>
              La commission de publication est de {commissionLabel} FCFA par annonce, pour
              30 jours de visibilité. Choisissez votre moyen de paiement : vous recevrez une
              demande de validation sur votre téléphone.
            </p>
            <div className="stack stack--12" style={{ marginBottom: 24, maxWidth: 480 }}>
              {(
                [
                  ["momo", "MTN MoMo", "Validation par code USSD sur votre téléphone"],
                  ["moov", "Moov Money", "Validation par code USSD sur votre téléphone"],
                ] as const
              ).map(([key, name, note]) => (
                <button
                  key={key}
                  type="button"
                  className="pay-option"
                  aria-pressed={pay === key}
                  onClick={() => setPay(key)}
                >
                  <span className="pay-option__radio" aria-hidden="true" />
                  <span>
                    <span className="pay-option__name">{name}</span>
                    <span className="pay-option__note">{note}</span>
                  </span>
                </button>
              ))}
            </div>
            <label className="field" style={{ maxWidth: 320, marginBottom: 24 }}>
              <span className="field__label">Numéro à débiter</span>
              <input className="input num" type="tel" placeholder="+229 01 96 00 00 00" />
            </label>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
              <button className="link-underline" type="button" onClick={() => go(2)}>
                ← Revenir à la vérification
              </button>
              <button className="btn" type="button" onClick={() => setPaid(true)} disabled={paid}>
                Payer {commissionLabel} FCFA
              </button>
            </div>
            {paid && (
              <p className="notice" style={{ marginTop: 20 }}>
                Paiement simulé. Votre annonce part en validation ; elle sera en ligne sous
                24 heures ouvrées. Suivez-la depuis votre{" "}
                <Link href="/espace-proprietaire">espace propriétaire</Link>. (Démonstration :
                aucun débit n&apos;est effectué.)
              </p>
            )}
          </div>
          <aside className="recap hold" style={{ flex: "1 1 290px" }}>
            <p className="recap__title">Récapitulatif</p>
            <table>
              <tbody>
                <tr>
                  <td>Publication d&apos;une annonce</td>
                  <td>{commissionLabel} FCFA</td>
                </tr>
                <tr>
                  <td>Durée</td>
                  <td>30 jours</td>
                </tr>
                <tr>
                  <td>Demandes de visite</td>
                  <td>Illimitées</td>
                </tr>
                <tr className="total">
                  <td>Total</td>
                  <td>{commissionLabel} FCFA</td>
                </tr>
              </tbody>
            </table>
            <p style={{ margin: "16px 0 0", fontSize: 13, color: "var(--grey)", lineHeight: 1.65 }}>
              Votre annonce part en validation dès le paiement. Elle est en ligne sous 24
              heures ouvrées.
            </p>
          </aside>
        </div>
      )}
    </section>
  );
}
