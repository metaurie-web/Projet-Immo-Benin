import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vérifiez votre boîte mail",
};

export default function VerificationPage() {
  return (
    <section className="wrap section" style={{ maxWidth: 480 }}>
      <p className="eyebrow" style={{ marginBottom: 8 }}>
        Mon compte
      </p>
      <h1 className="display" style={{ fontSize: "clamp(30px, 3.6vw, 44px)", marginBottom: 18 }}>
        Vérifiez votre boîte mail
      </h1>
      <p className="prose" style={{ maxWidth: "none", marginBottom: 18 }}>
        Un lien de connexion vous a été envoyé. Cliquez dessus pour être connecté automatiquement
        — il est valable 24 heures et ne sert qu'une seule fois.
      </p>
      <p className="notice">
        En développement (tant qu'aucun service d'emails n'est configuré) : le lien est affiché
        dans le terminal où tourne <code>npm run dev</code>, pas envoyé pour de vrai.
      </p>
    </section>
  );
}
