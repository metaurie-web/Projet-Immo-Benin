import Link from "next/link";

export default function NotFound() {
  return (
    <section className="wrap section" style={{ maxWidth: 640 }}>
      <p className="eyebrow" style={{ marginBottom: 8 }}>
        Erreur 404
      </p>
      <h1 className="display" style={{ fontSize: "clamp(30px, 3.6vw, 44px)", marginBottom: 16 }}>
        Cette page n&apos;existe pas.
      </h1>
      <p style={{ color: "var(--muted)", lineHeight: 1.7, marginBottom: 24 }}>
        L&apos;annonce a peut-être été retirée, ou le lien est incomplet.
      </p>
      <Link className="btn" href="/annonces">
        Voir les annonces
      </Link>
    </section>
  );
}
