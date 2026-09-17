import Link from "next/link";
import ListingCard from "@/components/ListingCard";
import Faq from "@/components/Faq";
import NewsletterForm from "@/components/NewsletterForm";
import { CITIES, TESTIMONIALS, getFeaturedListings } from "@/lib/data";
import { withFavorites } from "@/lib/favorites";

// Relire la base de données à chaque visite.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featured = await withFavorites(await getFeaturedListings());

  return (
    <>
      {/* Hero */}
      <section className="wrap section">
        <h1 className="display" style={{ marginBottom: 30 }}>
          <span style={{ display: "block" }}>Trouvez votre logement</span>
          <span style={{ display: "block" }}>
            chez <em>son propriétaire</em>.
          </span>
        </h1>
        <div className="two-col-prose">
          <p className="lede">
            Mon Appart réunit les appartements et les maisons à louer à Cotonou,
            Abomey-Calavi, Porto-Novo et Ouidah, publiés par les propriétaires eux-mêmes.
            Le loyer, l&apos;avance et la caution sont affichés avant la visite, et vous
            prenez rendez-vous directement avec la personne qui détient les clés.
          </p>
          <p className="lede">
            Chercher un logement au Bénin passe presque toujours par un démarcheur : un
            loyer qui monte entre l&apos;annonce et la visite, une avance découverte le jour
            de la signature, un ou deux mois de commission pour un service que personne
            n&apos;a demandé. Ce site retire cet intermédiaire de l&apos;équation.
          </p>
        </div>
      </section>

      {/* Barre de recherche (envoie vers /annonces avec les critères en paramètres) */}
      <section className="wrap section--tight">
        <form className="search-bar" action="/annonces" method="get">
          <label className="field">
            <span className="field__label">Ville et quartier</span>
            <select className="select select--underline" name="ville" defaultValue="">
              <option value="">Cotonou — tous quartiers</option>
              <option>Cotonou — Fidjrossè</option>
              <option>Cotonou — Cadjèhoun</option>
              <option>Cotonou — Akpakpa</option>
              <option>Abomey-Calavi — Tankpè</option>
              <option>Porto-Novo — Ouando</option>
              <option>Ouidah</option>
            </select>
          </label>
          <label className="field">
            <span className="field__label">Budget mensuel</span>
            <select className="select select--underline num" name="budget" defaultValue="50000">
              <option value="50000">Jusqu&apos;à 50 000 FCFA</option>
              <option value="100000">50 000 – 100 000 FCFA</option>
              <option value="200000">100 000 – 200 000 FCFA</option>
              <option value="300000">Plus de 200 000 FCFA</option>
            </select>
          </label>
          <label className="field">
            <span className="field__label">Type de bien</span>
            <select className="select select--underline" name="type" defaultValue="">
              <option value="">Tous les types</option>
              <option>Chambre-salon</option>
              <option>Appartement</option>
              <option>Maison basse</option>
              <option>Villa</option>
            </select>
          </label>
          <label className="field">
            <span className="field__label">Chambres</span>
            <select className="select select--underline num" name="chambres" defaultValue="">
              <option value="">Peu importe</option>
              <option value="1">1 chambre</option>
              <option value="2">2 chambres</option>
              <option value="3">3 chambres et plus</option>
            </select>
          </label>
          <button className="btn" type="submit">
            Rechercher
          </button>
        </form>
      </section>

      {/* Chiffres */}
      <section className="wrap section">
        <hr className="rule" />
        <div className="stat-grid" style={{ padding: "34px 0" }}>
          <div className="stat">
            <p className="stat__value num">214</p>
            <p className="stat__label">biens à louer, publiés par leur propriétaire</p>
          </div>
          <div className="stat">
            <p className="stat__value stat__value--accent num">4</p>
            <p className="stat__label">villes couvertes au lancement</p>
          </div>
          <div className="stat">
            <p className="stat__value num">0 FCFA</p>
            <p className="stat__label">de frais de démarcheur, à la visite comme au bail</p>
          </div>
          <div className="stat">
            <p className="stat__value num">24 h</p>
            <p className="stat__label">de contrôle avant la mise en ligne d&apos;une annonce</p>
          </div>
        </div>
        <hr className="rule" />
      </section>

      {/* Comparatif */}
      <section className="wrap section">
        <span className="eyebrow" style={{ marginBottom: 14 }}>
          Ce que change la publication directe
        </span>
        <div className="wrap-flex">
          <div className="hold">
            <h2 className="display" style={{ maxWidth: "22ch", marginBottom: 18 }}>
              Le même appartement, deux façons de le louer.
            </h2>
            <p className="prose prose--narrow">
              Un démarcheur vit de sa commission, donc de l&apos;écart qu&apos;il crée entre
              ce que le propriétaire demande et ce que vous acceptez. Tant que
              l&apos;information passe par lui, cet écart reste invisible.
            </p>
            <p className="prose prose--narrow">
              Quand le propriétaire publie lui-même, les chiffres sont écrits une fois pour
              toutes et lus par tout le monde en même temps. Il n&apos;y a plus rien à
              négocier en cachette.
            </p>
          </div>
          <div style={{ flex: "999 1 460px", minWidth: 0 }}>
            <div className="compare">
              <div className="compare__head" style={{ gridColumn: 1 }} />
              <div className="compare__head">Par un démarcheur</div>
              <div className="compare__head compare__head--after">Sur Mon Appart</div>

              {[
                [
                  "Qui vous fait visiter",
                  "Un intermédiaire que vous ne connaissez pas et qui ne détient pas les clés.",
                  "Le propriétaire, dont l'identité et le titre de propriété ont été vérifiés.",
                ],
                [
                  "Le loyer annoncé",
                  "Un ordre de grandeur, qui monte entre l'appel et la visite.",
                  "Le montant écrit sur l'annonce, sans ajout au moment de signer.",
                ],
                [
                  "L'avance et la caution",
                  "Découvertes le jour de la signature, parfois six mois d'un coup.",
                  "Affichées sur l'annonce, avant même la demande de visite.",
                ],
                [
                  "Frais d'intermédiaire",
                  "Un à deux mois de loyer, à votre charge.",
                  "Aucun. Seul le propriétaire paie la publication de son annonce.",
                ],
                [
                  "Le rendez-vous",
                  "Au téléphone, reporté, parfois oublié.",
                  "Un créneau que le propriétaire a lui-même publié, confirmé par écrit.",
                ],
              ].map(([k, before, after]) => (
                <div className="compare__row" key={k}>
                  <div className="compare__key">{k}</div>
                  <div className="compare__cell compare__before">{before}</div>
                  <div className="compare__cell compare__after">{after}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Garanties */}
      <section className="wrap section">
        <span className="eyebrow" style={{ marginBottom: 22 }}>
          Ce que nous vous garantissons
        </span>
        <div className="pillars">
          {[
            [
              "Le propriétaire, pas un démarcheur",
              "Chaque annonce est déposée par le propriétaire du bien, dont l'identité et le titre de propriété sont vérifiés avant publication.",
            ],
            [
              "Le prix en entier, à l'avance",
              "Loyer, avance exigée, caution et charges figurent sur l'annonce. Rien ne s'ajoute au moment de signer.",
            ],
            [
              "Une visite, pas un acompte",
              "Vous choisissez un créneau proposé par le propriétaire. Aucun paiement n'est demandé pour visiter.",
            ],
          ].map(([title, body]) => (
            <div className="pillar" key={title}>
              <p className="pillar__title">{title}</p>
              <p className="pillar__body">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Annonces récentes */}
      <section className="wrap section">
        <div className="section-head">
          <h2 className="h-serif h-serif--30">Annonces récentes</h2>
          <Link className="link-underline" href="/annonces">
            Voir toutes les annonces
          </Link>
        </div>
        <div className="card-grid">
          {featured.map((l) => (
            <ListingCard key={l.ref} listing={l} />
          ))}
        </div>
      </section>

      {/* Les annonces : photos réelles */}
      <section className="wrap section">
        <div className="wrap-flex" style={{ alignItems: "center" }}>
          <div className="grow">
            <span className="eyebrow" style={{ marginBottom: 14 }}>
              Les annonces
            </span>
            <h2 className="display" style={{ maxWidth: "24ch", marginBottom: 18 }}>
              Des photos du bien, pas des photos d&apos;ambiance.
            </h2>
            <p className="prose">
              Quatre photos au minimum, prises dans le logement mis en location : la façade,
              le séjour, une chambre, la cuisine et la douche. Nous refusons les annonces
              illustrées par des images trouvées ailleurs.
            </p>
            <p className="prose">
              S&apos;ajoutent les détails qui décident vraiment d&apos;un emménagement au
              Bénin : compteur SBEE individuel ou partagé, forage ou eau SONEB, état de la
              cour, place pour une voiture et des motos, et le point de repère le plus
              proche.
            </p>
          </div>
          <figure className="hold" style={{ margin: 0, maxWidth: 380 }}>
            <div className="photo photo--tall">
              <span>
                Photo verticale —<br />
                séjour d&apos;un appartement<br />
                mis en location
              </span>
            </div>
          </figure>
        </div>
      </section>

      {/* Témoignages */}
      <section className="wrap section">
        <span className="eyebrow" style={{ marginBottom: 26 }}>
          Témoignages
        </span>
        <figure style={{ margin: "0 0 44px" }}>
          <blockquote className="quote-lead">
            « J&apos;ai visité trois appartements en deux jours, toujours avec le
            propriétaire lui-même. Le loyer n&apos;a pas bougé d&apos;un franc entre
            l&apos;annonce et la signature du bail. »
          </blockquote>
          <figcaption>— Bernadette H., locataire à Fidjrossè depuis juillet 2026</figcaption>
        </figure>
        <hr className="rule" />
        <div className="testimonial-grid" style={{ paddingTop: 32 }}>
          {TESTIMONIALS.map((t) => (
            <figure className="testimonial" key={t.who}>
              <blockquote className="testimonial__text">{t.text}</blockquote>
              <figcaption className="testimonial__cite">
                {t.who}
                <br />
                <span>{t.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Villes */}
      <section className="wrap section">
        <h2
          className="h-serif h-serif--30"
          style={{ borderBottom: "1px solid var(--hair)", paddingBottom: 12, marginBottom: 26 }}
        >
          Où cherchez-vous ?
        </h2>
        <div className="city-grid">
          {CITIES.map((c) => (
            <div className="city" key={c.name}>
              <p className="city__name">
                {c.name}
                <span className="city__count num">{c.count}</span>
              </p>
              <p className="city__areas">{c.areas}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Propriétaires */}
      <section className="wrap section">
        <hr className="rule" />
        <div style={{ paddingTop: 34 }}>
          <span className="eyebrow" style={{ marginBottom: 14 }}>
            Vous êtes propriétaire
          </span>
          <h2 className="display" style={{ maxWidth: "24ch", marginBottom: 30 }}>
            Votre bien mérite mieux qu&apos;un bouche-à-oreille.
          </h2>
          <div className="pillars">
            {[
              [
                "Votre bien, votre annonce",
                "Vous décrivez le logement, vous fixez le loyer et l'avance, vous ajoutez vos photos. Personne ne parle à votre place et personne ne prélève sa part sur votre loyer.",
              ],
              [
                "Des visiteurs déjà informés",
                "Le loyer, l'avance, la caution et les charges sont lus avant la demande de visite. Vous ne déplacez plus des gens pour rien et vous ne discutez plus le prix sur le pas de la porte.",
              ],
              [
                "Vos créneaux, votre agenda",
                "Vous publiez les moments où vous êtes disponible. Les visiteurs réservent à l'intérieur, vous confirmez depuis votre espace, et l'historique reste écrit.",
              ],
            ].map(([title, body]) => (
              <div className="pillar" key={title}>
                <p className="pillar__title">{title}</p>
                <p className="pillar__body">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commission */}
      <section className="wrap section">
        <div className="panel split">
          <div>
            <p className="eyebrow eyebrow--muted" style={{ marginBottom: 10 }}>
              Commission de publication
            </p>
            <p className="prose" style={{ maxWidth: "50ch" }}>
              Après vérification de votre pièce d&apos;identité et de votre titre de
              propriété, votre annonce est visible par toute la population béninoise, et les
              demandes de visite vous parviennent directement.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>
            <p className="num" style={{ fontFamily: "var(--font-display)", fontSize: 46, lineHeight: 1 }}>
              5 000{" "}
              <span style={{ fontSize: 15, fontFamily: "var(--font-body)", color: "var(--grey)" }}>
                FCFA
              </span>
            </p>
            <p style={{ color: "var(--muted)", fontSize: 14 }}>
              par annonce, pour 30 jours de publication.
              <br />
              Paiement MTN MoMo ou Moov Money.
            </p>
            <Link className="btn" href="/publier">
              Publier mon bien
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="wrap section">
        <span className="eyebrow" style={{ marginBottom: 22 }}>
          Questions fréquentes
        </span>
        <Faq />
      </section>

      {/* Alerte SMS */}
      <section className="wrap section">
        <hr className="rule" />
        <div className="wrap-flex" style={{ paddingTop: 34, alignItems: "flex-start" }}>
          <div className="grow">
            <h2
              className="display"
              style={{ fontSize: "clamp(26px, 2.8vw, 34px)", maxWidth: "26ch", marginBottom: 12 }}
            >
              Les nouvelles annonces de votre quartier, par SMS.
            </h2>
            <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.72, maxWidth: "52ch" }}>
              Dites-nous où vous cherchez et jusqu&apos;à combien. Vous recevez un message
              quand un bien correspondant est mis en ligne, avant qu&apos;il ne parte.
              Gratuit, et vous vous désabonnez par un mot.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </section>
    </>
  );
}
