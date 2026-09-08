import Link from "next/link";
import Nav from "./Nav";

/* Composant serveur : rendu une fois côté serveur, aucun JavaScript envoyé au
   navigateur pour cette partie. La navigation (menu mobile, lien actif) est
   dans <Nav />, qui est un composant client. */
export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link className="brand" href="/">
          <span className="brand__name">Mon Appart</span>
          <span className="brand__tag">Location directe · Bénin</span>
        </Link>
        <Nav />
      </div>
    </header>
  );
}
