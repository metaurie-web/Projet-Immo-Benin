import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getListingStatusCounts, getPendingListings } from "@/lib/data";
import { getPendingVerifications } from "@/lib/verification";
import { getAccountCounts } from "@/lib/users";
import { relativeTime } from "@/lib/format";
import AdminNav from "@/components/AdminNav";
import ModerationActions from "@/components/ModerationActions";
import VerificationActions from "@/components/VerificationActions";

export const metadata: Metadata = {
  title: "Administration",
  description:
    "Vue d'ensemble de la plateforme : comptes, annonces et vérifications d'identité en attente.",
};

// Toujours relire la base de données : la file de modération doit être à jour.
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/connexion?callbackUrl=/admin");

  // Espace strictement réservé aux administrateurs : personne d'autre ne
  // doit pouvoir y rester, même en tapant l'URL directement.
  if (session.user.role !== "admin") redirect("/mon-espace");

  const [pending, counts, pendingVerifications, accountCounts] = await Promise.all([
    getPendingListings(),
    getListingStatusCounts(),
    getPendingVerifications(),
    getAccountCounts(),
  ]);

  const stats = [
    { k: "Identités en attente", v: pendingVerifications.length },
    { k: "Annonces en attente", v: counts.en_attente },
    { k: "Propriétaires", v: accountCounts.proprietaire },
    { k: "Visiteurs", v: accountCounts.visiteur },
  ];

  return (
    <section className="wrap section">
      <p className="eyebrow" style={{ marginBottom: 8 }}>
        Administration
      </p>
      <h1 className="display" style={{ fontSize: "clamp(30px, 3.6vw, 44px)", marginBottom: 10 }}>
        Vue d&apos;ensemble
      </h1>
      <p style={{ margin: "0 0 32px", color: "var(--muted)", maxWidth: "60ch", lineHeight: 1.7 }}>
        L&apos;identité d&apos;un propriétaire se vérifie une seule fois, avant sa première
        annonce. Chaque annonce, elle, est contrôlée individuellement. C&apos;est ce double
        filtre qui tient les pratiques trompeuses hors du site.
      </p>

      <AdminNav active="/admin" />

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
