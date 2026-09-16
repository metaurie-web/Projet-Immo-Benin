import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getListingStatusCounts, getPendingListings } from "@/lib/data";
import { getPendingVerifications } from "@/lib/verification";
import { relativeTime } from "@/lib/format";
import ModerationActions from "@/components/ModerationActions";
import VerificationActions from "@/components/VerificationActions";

export const metadata: Metadata = {
  title: "Administration · Modération",
  description:
    "File de validation des annonces : contrôle de l'identité du propriétaire, du titre de " +
    "propriété, de la cohérence du loyer et de la qualité des photos avant publication.",
};

// Toujours relire la base de données : la file de modération doit être à jour.
export const dynamic = "force-dynamic";

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

  const [pending, counts, pendingVerifications] = await Promise.all([
    getPendingListings(),
    getListingStatusCounts(),
    getPendingVerifications(),
  ]);

  const stats = [
    { k: "Identités en attente", v: pendingVerifications.length },
    { k: "Annonces en attente", v: counts.en_attente },
    { k: "En ligne", v: counts.en_ligne },
    { k: "Refusées", v: counts.refusee },
  ];

  return (
    <section className="wrap section">
      <p className="eyebrow" style={{ marginBottom: 8 }}>
        Administration · Modération
      </p>
      <h1 className="display" style={{ fontSize: "clamp(30px, 3.6vw, 44px)", marginBottom: 10 }}>
        File de validation
      </h1>
      <p style={{ margin: "0 0 32px", color: "var(--muted)", maxWidth: "60ch", lineHeight: 1.7 }}>
        L&apos;identité d&apos;un propriétaire se vérifie une seule fois, avant sa première
        annonce. Chaque annonce, elle, est contrôlée individuellement : cohérence du loyer et
        de l&apos;avance, qualité de la description. C&apos;est ce double filtre qui tient les
        pratiques trompeuses hors du site.
      </p>

      <div className="kpi-band" style={{ marginBottom: 38 }}>
        {stats.map((s) => (
          <div className="kpi" key={s.k}>
            <p className="kpi__key">{s.k}</p>
            <p className="kpi__value num">{s.v}</p>
          </div>
        ))}
      </div>

      <h2
        className="h-serif h-serif--26"
        style={{ borderBottom: "1px solid var(--hair)", paddingBottom: 10, marginBottom: 22 }}
      >
        Vérifications d&apos;identité en attente
      </h2>
      {pendingVerifications.length === 0 ? (
        <p className="muted" style={{ padding: "0 0 24px" }}>
          Aucune vérification en attente.
        </p>
      ) : (
        <div style={{ marginBottom: 8 }}>
          {pendingVerifications.map((v) => (
            <article className="mod-card" key={v.id}>
              <div className="mod-card__body">
                <p className="mod-card__ref">déposée {relativeTime(v.createdAt)}</p>
                <h2 className="mod-card__title">{v.name || v.email}</h2>
                <p className="mod-card__line">{v.email}</p>
                <div className="mod-card__badges">
                  {v.identityDocUrl ? (
                    <a
                      className="tag"
                      href={`/api/admin/identity-doc/${v.id}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Voir le document ↗
                    </a>
                  ) : (
                    <span className="tag tag--warn">Aucun document</span>
                  )}
                </div>
              </div>
              <VerificationActions userId={v.id} />
            </article>
          ))}
        </div>
      )}

      <h2
        className="h-serif h-serif--26"
        style={{ margin: "40px 0 22px", borderBottom: "1px solid var(--hair)", paddingBottom: 10 }}
      >
        Annonces en attente
      </h2>
      {pending.length === 0 ? (
        <p className="muted" style={{ padding: "24px 0" }}>
          Aucune annonce en attente pour le moment.
        </p>
      ) : (
        <div>
          {pending.map((l) => (
            <article className="mod-card" key={l.ref}>
              <div className="mod-card__media">
                <div className="photo photo--square">
                  <span>
                    {l.photos.length} photo{l.photos.length > 1 ? "s" : ""}
                  </span>
                </div>
              </div>
              <div className="mod-card__body">
                <p className="mod-card__ref">
                  {l.ref} · déposée {relativeTime(l.createdAt)}
                </p>
                <h2 className="mod-card__title">{l.title}</h2>
                <p className="mod-card__line">
                  {l.owner} · {l.quartier}, {l.city} · {l.price.toLocaleString("fr-FR")} FCFA ·
                  avance {l.advance}
                </p>
                <div className="mod-card__badges">
                  <span className="tag">Compte vérifié par email</span>
                </div>
              </div>
              <ModerationActions listingRef={l.ref} />
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
