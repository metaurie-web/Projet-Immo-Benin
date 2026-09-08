"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/* « use client » : ce composant a besoin d'état (menu ouvert/fermé) et de
   savoir sur quelle page on est. Il tourne donc dans le navigateur. */

const LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/annonces", label: "Annonces" },
  { href: "/publier", label: "Publier un bien" },
];
const RIGHT = { href: "/espace-proprietaire", label: "Espace propriétaire" };

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 820px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Referme le menu quand on change de page.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const navHidden = isMobile && !open;

  return (
    <>
      <button
        className="nav-toggle"
        type="button"
        aria-expanded={open}
        aria-controls="site-nav"
        onClick={() => setOpen((v) => !v)}
      >
        Menu
      </button>
      <nav
        className="nav"
        id="site-nav"
        aria-label="Navigation principale"
        hidden={navHidden}
      >
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            aria-current={isActive(l.href) ? "page" : undefined}
          >
            {l.label}
          </Link>
        ))}
        <span className="nav__sep" aria-hidden="true" />
        <Link
          href={RIGHT.href}
          aria-current={isActive(RIGHT.href) ? "page" : undefined}
        >
          {RIGHT.label}
        </Link>
      </nav>
    </>
  );
}
