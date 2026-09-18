import Image from "next/image";
import Link from "next/link";
import logo from "../../public/logo.png";

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer__top">
        <div>
          <Image src={logo} alt="Mon Appart" className="brand__logo--footer" />
          <p style={{ marginTop: 10 }}>Cotonou · Abomey-Calavi · Porto-Novo · Ouidah</p>
          <p>Location directe, sans frais de démarcheur.</p>
        </div>
        <nav className="site-footer__links" aria-label="Liens de pied de page">
          <Link href="/annonces">Annonces</Link>
          <Link href="/publier">Publier un bien</Link>
          <Link href="/mon-espace">Mon espace</Link>
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
