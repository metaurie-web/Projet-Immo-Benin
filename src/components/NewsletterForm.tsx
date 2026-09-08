"use client";

import { useState } from "react";

/* Formulaire d'alerte SMS — pour l'instant une démonstration : rien n'est
   envoyé. Le branchement réel se fera avec une route API à l'étape « emails /
   notifications ». */
export default function NewsletterForm() {
  const [sent, setSent] = useState(false);

  return (
    <form
      className="hold newsletter"
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
    >
      <label className="field" style={{ flex: "1 1 180px" }}>
        <span className="field__label" style={{ position: "absolute", left: "-9999px" }}>
          Numéro de téléphone
        </span>
        <input
          className="input num"
          type="tel"
          name="tel"
          placeholder="+229 01 97 00 00 00"
          required
          disabled={sent}
        />
      </label>
      <button className="btn" type="submit" disabled={sent}>
        M&apos;avertir
      </button>
      {sent && (
        <p className="notice" style={{ flexBasis: "100%" }}>
          C&apos;est noté. Vous recevrez un SMS dès qu&apos;une annonce correspond à votre
          recherche. (Démonstration : aucun message n&apos;est réellement envoyé.)
        </p>
      )}
    </form>
  );
}
