"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { ensureAccountExists } from "@/app/connexion/actions";

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
  const [noAccount, setNoAccount] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setNoAccount(false);

    // On vérifie d'abord qu'un compte existe : sinon next-auth en créerait
    // un silencieusement, ce qui viderait /inscription de son sens.
    const check = await ensureAccountExists(email);
    if (!check.ok) {
      setSending(false);
      setNoAccount(true);
      return;
    }

    // redirect: true (par défaut) => next-auth envoie vers /connexion/verification
    // en cas de succès, ou revient ici avec ?error=... en cas de problème.
    // Sans callbackUrl explicite (lien "Connexion" du menu) : /mon-espace
    // aiguille automatiquement vers le bon espace selon le rôle.
    await signIn("email", { email, callbackUrl: callbackUrl || "/mon-espace" });
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {noAccount && (
        <p className="notice" style={{ borderColor: "#c0392b", color: "#c0392b" }}>
          Aucun compte n&apos;est associé à cet email.{" "}
          <Link href={`/inscription?email=${encodeURIComponent(email)}`} className="link-underline">
            Créer un compte
          </Link>
        </p>
      )}
      {!noAccount && error && (
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
          onChange={(e) => {
            setEmail(e.target.value);
            setNoAccount(false);
          }}
        />
      </label>

      <button className="btn" type="submit" disabled={sending || !email}>
        {sending ? "Envoi du lien…" : "Recevoir mon lien de connexion"}
      </button>

      <p style={{ margin: 0, fontSize: 14, color: "var(--grey)" }}>
        Pas encore de compte ?{" "}
        <Link href="/inscription" className="link-underline">
          Créer un compte
        </Link>
      </p>
    </form>
  );
}
