import Link from "next/link";

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer__top">
        <div>
          <p className="brand__name" style={{ fontSize: 22 }}>
            Mon Appart
          </p>
          <p style={{ marginTop: 6 }}>Cotonou · Abomey-Calavi · Porto-Novo · Ouidah</p>
          <p>Location directe, sans frais de démarcheur.</p>
        </div>
        <nav className="site-footer__links" aria-label="Liens de pied de page">
          <Link href="/annonces">Annonces</Link>
          <Link href="/publier">Publier un bien</Link>
          <Link href="/espace-proprietaire">Espace propriétaire</Link>
          <Link href="/#faq">Questions fréquentes</Link>
          <Link href="/admin">Administration</Link>
        </nav>
      </div>
      <div className="site-footer__legal">
        © {year} Mon Appart. Les montants sont indiqués en francs CFA. Aucun paiement
        n&apos;est demandé aux locataires.
      </div>
    </footer>
  );
}
