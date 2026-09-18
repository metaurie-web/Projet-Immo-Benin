import Image from "next/image";
import Link from "next/link";
import Nav from "./Nav";
import logo from "../../public/logo.png";

/* Composant serveur : rendu une fois côté serveur, aucun JavaScript envoyé au
   navigateur pour cette partie. La navigation (menu mobile, lien actif) est
   dans <Nav />, qui est un composant client. */
export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link className="brand" href="/">
          <Image src={logo} alt="Mon Appart" className="brand__logo" priority />
        </Link>
        <Nav />
      </div>
    </header>
  );
}
