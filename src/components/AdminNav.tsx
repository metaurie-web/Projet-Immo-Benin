import Link from "next/link";

const LINKS = [
  { href: "/admin", label: "Vue d'ensemble" },
  { href: "/admin/annonces", label: "Annonces" },
  { href: "/admin/proprietaires", label: "Propriétaires" },
  { href: "/admin/visiteurs", label: "Visiteurs" },
  { href: "/admin/parametres", label: "Réglages" },
];

/* Sous-navigation de l'espace admin. Composant serveur : `active` est
   calculé par la page elle-même (pas de usePathname, pas besoin de client). */
export default function AdminNav({ active }: { active: string }) {
  return (
    <nav
      aria-label="Sections d'administration"
      style={{
        display: "flex",
        gap: 4,
        flexWrap: "wrap",
        borderBottom: "1px solid var(--hair)",
        marginBottom: 32,
        paddingBottom: 2,
      }}
    >
      {LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          aria-current={active === l.href ? "page" : undefined}
          style={{
            padding: "9px 13px",
            borderRadius: 4,
            fontSize: 13.5,
            textDecoration: "none",
            color: active === l.href ? "var(--deep)" : "var(--grey)",
            background: active === l.href ? "var(--light)" : "transparent",
            boxShadow: active === l.href ? "inset 0 -2px 0 var(--blue)" : "none",
          }}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
