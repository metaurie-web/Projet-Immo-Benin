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

    // Le compte existe désormais : on envoie le lien de connexion, comme
    // sur /connexion, mais sans quitter la page pour afficher un message
    // de bienvenue plutôt que le générique "vérifiez votre boîte mail".
    const signInResult = await signIn("email", {
      email,
      redirect: false,
      callbackUrl: callbackUrl || "/mon-espace",
    });
    setSending(false);

    if (signInResult?.error) {
      setError(
        "Ton compte a été créé, mais l'envoi du lien a échoué. Réessaie depuis la page de connexion.",
      );
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <p className="notice">
        Compte créé pour <strong>{email}</strong>. Vérifie ta boîte mail pour activer ton
        compte et te connecter — le lien est valable 24 heures et ne sert qu&apos;une fois.
      </p>
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
