"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

const ERROR_MESSAGES: Record<string, string> = {
  Verification: "Ce lien a expiré ou a déjà été utilisé. Redemandez-en un ci-dessous.",
  Default: "Une erreur est survenue. Réessayez.",
};

export default function SignInForm({
  callbackUrl,
  error,
}: {
  callbackUrl?: string;
  error?: string;
}) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    // redirect: true (par défaut) => next-auth envoie vers /connexion/verification
    // en cas de succès, ou revient ici avec ?error=... en cas de problème.
    await signIn("email", { email, callbackUrl: callbackUrl || "/espace-proprietaire" });
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {error && (
        <p className="notice" style={{ borderColor: "#c0392b", color: "#c0392b" }}>
          {ERROR_MESSAGES[error] ?? ERROR_MESSAGES.Default}
        </p>
      )}

      <label className="field">
        <span className="field__label">Adresse email</span>
        <input
          className="input"
          type="email"
          name="email"
          required
          autoFocus
          placeholder="vous@exemple.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>

      <button className="btn" type="submit" disabled={sending || !email}>
        {sending ? "Envoi du lien…" : "Recevoir mon lien de connexion"}
      </button>
    </form>
  );
}
