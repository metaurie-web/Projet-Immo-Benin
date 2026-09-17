"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";

/* « use client » : ce composant a besoin d'état (menu ouvert/fermé), de
   savoir sur quelle page on est, et de la session de connexion. Il tourne
   donc dans le navigateur. */

const LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/annonces", label: "Annonces" },
  { href: "/publier", label: "Publier un bien" },
];

export default function Nav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
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
      <nav className="nav" id="site-nav" aria-label="Navigation principale" hidden={navHidden}>
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} aria-current={isActive(l.href) ? "page" : undefined}>
            {l.label}
          </Link>
        ))}
        <span className="nav__sep" aria-hidden="true" />

        {status === "authenticated" && (
          <Link
            href="/mon-espace"
            aria-current={
              isActive("/espace-proprietaire") || isActive("/espace-visiteur") ? "page" : undefined
            }
          >
            Mon espace
          </Link>
        )}

        {session?.user.role === "admin" && (
          <Link href="/admin" aria-current={isActive("/admin") ? "page" : undefined}>
            Admin
          </Link>
        )}

        {status === "authenticated" ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 13px" }}>
            <span style={{ fontSize: 13, color: "var(--grey)" }}>{session.user.email}</span>
            <button
              type="button"
              className="link-underline"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Se déconnecter
            </button>
          </div>
        ) : status === "unauthenticated" ? (
          <Link href="/connexion" aria-current={isActive("/connexion") ? "page" : undefined}>
            Connexion
          </Link>
        ) : null /* "loading" : on n'affiche rien pour éviter un clignotement */}
      </nav>
    </>
  );
}
