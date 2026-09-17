"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { registerAccount } from "@/app/inscription/actions";

export default function SignUpForm({
  callbackUrl,
  initialEmail,
}: {
  callbackUrl?: string;
  initialEmail?: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState(initialEmail ?? "");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadyExists, setAlreadyExists] = useState(false);
  const [done, setDone] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  // Après validation du lien envoyé ci-dessous, l'utilisateur atterrit sur
  // /inscription/bienvenue (email confirmé) plutôt que directement dans son
  // espace — `next` porte la destination initialement demandée (ex. revenir
  // finir une prise de rendez-vous), gardée pour après ce passage.
  const verifyCallbackUrl = `/inscription/bienvenue?next=${encodeURIComponent(callbackUrl || "/mon-espace")}`;

  async function sendVerificationLink() {
    return signIn("email", { email, redirect: false, callbackUrl: verifyCallbackUrl });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);
    setAlreadyExists(false);

    const result = await registerAccount({ name, email });
    if (!result.ok) {
      setSending(false);
      setError(result.error);
      setAlreadyExists(!!result.alreadyExists);
      return;
    }

    // Le compte existe désormais, mais son adresse n'est pas encore
    // confirmée (User.emailVerified reste vide) : on envoie le même lien
    // "email" que /connexion, sans quitter la page, pour afficher un
    // message de bienvenue plutôt que le générique "vérifiez votre boîte
    // mail". C'est en cliquant ce lien que emailVerified est posé (next-auth
    // le fait automatiquement, voir callback-handler.js) — tant que ça
    // n'est pas fait, ce compte ne peut obtenir aucune session.
    const signInResult = await sendVerificationLink();
    setSending(false);

    if (signInResult?.error) {
      setError(
        "Ton compte a été créé, mais l'envoi du lien a échoué. Réessaie depuis la page de connexion.",
      );
      return;
    }
    setDone(true);
  }

  async function handleResend() {
    setResending(true);
    setResendError(null);
    const result = await sendVerificationLink();
    setResending(false);
    if (result?.error) {
      setResendError("L'envoi a échoué. Réessaie dans un instant.");
      return;
    }
    setResent(true);
  }

  if (done) {
    return (
      <div>
        <p className="notice">
          Un email de validation vient d&apos;être envoyé à <strong>{email}</strong>. Consulte ta
          boîte de réception et clique sur le lien de validation pour activer ton espace — il est
          valable 24 heures et ne sert qu&apos;une fois.
        </p>
        {resendError && (
          <p className="notice" style={{ marginTop: 12, borderColor: "#c0392b", color: "#c0392b" }}>
            {resendError}
          </p>
        )}
        {resent ? (
          <p style={{ margin: "12px 0 0", fontSize: 14, color: "var(--grey)" }}>
            Nouveau lien envoyé.
          </p>
        ) : (
          <button
            className="link-underline"
            type="button"
            onClick={handleResend}
            disabled={resending}
            style={{ margin: "12px 0 0", fontSize: 14 }}
          >
            {resending ? "Envoi…" : "Renvoyer l'email de validation"}
          </button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {error && (
        <p className="notice" style={{ borderColor: "#c0392b", color: "#c0392b" }}>
          {error}{" "}
          {alreadyExists && (
            <Link href="/connexion" className="link-underline">
              Se connecter
            </Link>
          )}
        </p>
      )}

      <label className="field">
        <span className="field__label">Nom et prénom</span>
        <input
          className="input"
          type="text"
          required
          autoFocus
          placeholder="Ex. Hounkpatin Bernadette"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>

      <label className="field">
        <span className="field__label">Adresse email</span>
        <input
          className="input"
          type="email"
          required
          placeholder="vous@exemple.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>

      <button className="btn" type="submit" disabled={sending || !name || !email}>
        {sending ? "Création…" : "Créer mon compte"}
      </button>

      <p style={{ margin: 0, fontSize: 14, color: "var(--grey)" }}>
        Déjà un compte ?{" "}
        <Link href="/connexion" className="link-underline">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
