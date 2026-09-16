import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import ModerationActions from "@/components/ModerationActions";

export const metadata: Metadata = {
  title: "Administration · Modération",
  description:
    "File de validation des annonces : contrôle de l'identité du propriétaire, du titre de " +
    "propriété, de la cohérence du loyer et de la qualité des photos avant publication.",
};

const STATS = [
  { k: "En attente", v: "14" },
  { k: "Validées cette semaine", v: "37" },
  { k: "Refusées", v: "5" },
  { k: "Commissions encaissées", v: "185 000" },
];

type Badge = { label: string; cls: string };

const PENDING: {
  ref: string;
  when: string;
  title: string;
  line: string;
  photos: string;
  badges: Badge[];
}[] = [
  {
    ref: "MA-1088",
    when: "il y a 2 h",
    title: "Appartement 2 chambres, Zogbadjè",
    line: "M. Ahouandjinou Félix · Zogbadjè, Abomey-Calavi · 80 000 FCFA · avance 3 mois",
    photos: "6 photos",
    badges: [
      { label: "Pièce d'identité ✓", cls: "tag" },
      { label: "Titre de propriété ✓", cls: "tag" },
      { label: "Commission payée ✓", cls: "tag" },
    ],
  },
  {
    ref: "MA-1087",
    when: "il y a 5 h",
    title: "Villa 4 chambres, Djègan-Daho",
    line: "Mme Agbodjan Reine · Djègan-Daho, Porto-Novo · 220 000 FCFA · avance 6 mois",
    photos: "9 photos",
    badges: [
      { label: "Pièce d'identité ✓", cls: "tag" },
      { label: "Titre de propriété — illisible", cls: "tag tag--warn" },
      { label: "Commission payée ✓", cls: "tag" },
    ],
  },
  {
    ref: "MA-1086",
    when: "hier",
    title: "Chambre-salon, Ouidah centre",
    line: "M. Gbaguidi Marius · Ouidah · 30 000 FCFA · avance 2 mois",
    photos: "3 photos",
    badges: [
      { label: "Pièce d'identité ✓", cls: "tag" },
      { label: "Titre de propriété ✓", cls: "tag" },
      { label: "Commission en attente", cls: "tag tag--neutral" },
    ],
  },
];

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/connexion?callbackUrl=/admin");

  if (session.user.role !== "admin") {
    return (
      <section className="wrap section">
        <div className="panel" style={{ maxWidth: 560 }}>
          <p className="eyebrow eyebrow--muted" style={{ marginBottom: 10 }}>
            Accès refusé
          </p>
          <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.7 }}>
            Cette page est réservée aux administrateurs. Le compte{" "}
            <strong>{session.user.email}</strong> est connecté avec le rôle «&nbsp;{session.user.role}
            &nbsp;». Si tu penses que c&apos;est une erreur, promeus ce compte avec{" "}
            <code>npm run make-admin -- {session.user.email}</code>.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="wrap section">
      <p className="eyebrow" style={{ marginBottom: 8 }}>
        Administration · Modération
      </p>
      <h1 className="display" style={{ fontSize: "clamp(30px, 3.6vw, 44px)", marginBottom: 10 }}>
        File de validation
      </h1>
      <p style={{ margin: "0 0 32px", color: "var(--muted)", maxWidth: "60ch", lineHeight: 1.7 }}>
        Chaque annonce est contrôlée avant publication : identité du propriétaire, titre de
        propriété, cohérence du loyer et de l&apos;avance, qualité des photos. C&apos;est ce
        filtre qui tient les pratiques trompeuses hors du site.
      </p>

      <div className="kpi-band" style={{ marginBottom: 38 }}>
        {STATS.map((s) => (
          <div className="kpi" key={s.k}>
            <p className="kpi__key">{s.k}</p>
            <p className="kpi__value num">{s.v}</p>
          </div>
        ))}
      </div>

      <div>
        {PENDING.map((p) => (
          <article className="mod-card" key={p.ref}>
            <div className="mod-card__media">
              <div className="photo photo--square">
                <span>{p.photos}</span>
              </div>
            </div>
            <div className="mod-card__body">
              <p className="mod-card__ref">
                {p.ref} · déposée {p.when}
              </p>
              <h2 className="mod-card__title">{p.title}</h2>
              <p className="mod-card__line">{p.line}</p>
              <div className="mod-card__badges">
                {p.badges.map((b) => (
                  <span className={b.cls} key={b.label}>
                    {b.label}
                  </span>
                ))}
              </div>
            </div>
            <ModerationActions />
          </article>
        ))}
      </div>
    </section>
  );
}
