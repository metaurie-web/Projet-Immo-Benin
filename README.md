# Mon Appart — application Next.js

Location immobilière directe entre propriétaires et locataires, au Bénin
(Cotonou, Abomey-Calavi, Porto-Novo, Ouidah).

Cette application reprend la maquette et le site statique (`../maquette-html/`)
et les transforme en **application Next.js** (React + TypeScript), prête à
recevoir une base de données et un service d'envoi d'emails.

---

## 1. Installer Node.js (à faire une seule fois)

Next.js a besoin de **Node.js** pour fonctionner. C'est le moteur qui exécute
le JavaScript en dehors du navigateur.

1. Aller sur <https://nodejs.org>
2. Télécharger la version **LTS** (le gros bouton de gauche)
3. Lancer l'installateur, tout laisser par défaut, cliquer « Next » jusqu'au
   bout, puis « Finish »
4. **Fermer puis rouvrir** le terminal (PowerShell), sinon il ne voit pas
   encore Node
5. Vérifier :

   ```powershell
   node --version
   npm --version
   ```

   Les deux commandes doivent afficher un numéro de version (par ex. `v22.9.0`
   et `10.8.3`). Si oui, Node est installé.

---

## 2. Installer les dépendances du projet

Dans le terminal, se placer dans ce dossier puis lancer l'installation :

```powershell
cd "C:\Users\User\Downloads\Projet Immob\mon-appart"
npm install
```

`npm install` lit `package.json` et télécharge tout ce dont le projet a besoin
dans un dossier `node_modules/` (créé automatiquement, jamais à modifier à la
main). Ça peut prendre une à deux minutes la première fois.

> **npm 11+** peut afficher un avertissement « install scripts not covered by
> allowScripts » et proposer `npm install-scripts approve <pkg>`. C'est une
> sécurité : les paquets autorisés sont listés dans `package.json` (champ
> `allowScripts`) et déjà validés pour ce projet.

---

## 3. Préparer la base de données (à faire une seule fois)

Le projet utilise **SQLite** en local : la base est un simple fichier,
`prisma/dev.db`, créé par les commandes ci-dessous. Rien à installer.

```powershell
Copy-Item .env.example .env
npm run db:migrate
npm run db:seed
```

- `Copy-Item .env.example .env` crée le fichier `.env` avec `DATABASE_URL="file:./dev.db"`
- `npm run db:migrate` crée les tables (`Listing`, `Review`) dans `prisma/dev.db`
- `npm run db:seed` y insère les 12 annonces de démonstration

Pour **repartir de zéro** (vider et re-remplir la base) : `npm run db:reset`.

---

## 4. Lancer le site en développement

```powershell
npm run dev
```

Puis ouvrir <http://localhost:3000> dans le navigateur.

Le serveur reste actif : à chaque fois qu'un fichier est enregistré, la page se
recharge toute seule. Pour arrêter le serveur : `Ctrl + C` dans le terminal.

---

## 5. Structure du projet

```
mon-appart/
├─ package.json          Dépendances et commandes (dev, build, db:*…)
├─ tsconfig.json         Réglages TypeScript
├─ next.config.mjs       Configuration Next.js
├─ .env.example          Modèle de .env (à copier en .env)
├─ prisma/
│  ├─ schema.prisma      Description des tables de la base de données
│  ├─ migrations/        Historique des changements de schéma (à committer)
│  ├─ seed.mjs           Insère les 12 annonces de démonstration
│  └─ dev.db             La base SQLite locale (ignorée par git)
├─ public/               Fichiers servis tels quels (favicon…)
└─ src/
   ├─ app/               Les pages (routage par dossier)
   │  ├─ layout.tsx              En-tête + pied de page communs à toutes les pages
   │  ├─ globals.css             Le design system (repris du site statique)
   │  ├─ page.tsx                Accueil            → /
   │  ├─ not-found.tsx           Page 404
   │  ├─ annonces/
   │  │  ├─ page.tsx             Liste + filtres    → /annonces
   │  │  └─ [ref]/
   │  │     ├─ page.tsx          Fiche d'un bien    → /annonces/MA-1042
   │  │     └─ visite/page.tsx   Prise de rendez-vous → /annonces/MA-1042/visite
   │  ├─ publier/page.tsx        Assistant propriétaire → /publier
   │  ├─ espace-proprietaire/page.tsx  Tableau de bord → /espace-proprietaire
   │  └─ admin/page.tsx          File de modération → /admin
   │
   ├─ components/         Morceaux d'interface réutilisables
   │  ├─ SiteHeader.tsx / Nav.tsx / SiteFooter.tsx
   │  ├─ ListingCard.tsx / Faq.tsx
   │  ├─ AnnoncesBrowser.tsx     Filtres de recherche (interactif)
   │  ├─ VisiteForm.tsx          Choix du créneau + formulaire
   │  ├─ PublierWizard.tsx       Assistant 3 étapes
   │  ├─ NewsletterForm.tsx      Alerte SMS
   │  ├─ ConfirmButton.tsx       Bouton « Confirmer » (espace propriétaire)
   │  └─ ModerationActions.tsx   Boutons Valider / Refuser (admin)
   │
   └─ lib/               Code non visuel
      ├─ types.ts         Formes des données (Listing, City…)
      ├─ format.ts        fcfa(), fmt() — mise en forme des montants
      ├─ db.ts            L'instance unique de connexion à la base (Prisma)
      └─ data.ts          Lecture des annonces en base + contenus éditoriaux
```

### Composant « serveur » ou « client » ?

- Par défaut, un composant est **serveur** : il est calculé une fois côté
  serveur, aucun JavaScript n'est envoyé au navigateur pour lui. Idéal pour du
  contenu (pages, listes, textes).
- Un fichier qui commence par `"use client";` est un composant **client** : il
  tourne dans le navigateur. Nécessaire dès qu'il y a de l'interactivité
  (clic, champ de saisie, état qui change). Ici : le menu, les filtres, les
  formulaires, l'assistant.

---

## 6. La base de données (Prisma)

**Prisma** est l'outil qui parle à la base en TypeScript. Le principe :

1. On décrit les tables dans `prisma/schema.prisma`
2. `npm run db:migrate` applique les changements à la vraie base
3. Dans le code, on écrit `prisma.listing.findMany()` etc. — jamais de SQL à la main

Voir et modifier les données à la souris, dans le navigateur :

```powershell
npm run db:studio
```

Aujourd'hui, **les annonces viennent de la base**. Les fonctions
`getAllListings()`, `getFeaturedListings()` et `getListing()` de
`src/lib/data.ts` font une requête Prisma (elles sont donc `async` — les pages
les « attendent » avec `await`).

Restent écrits en dur, pour l'instant : les villes, la FAQ, les témoignages,
les créneaux de visite (`src/lib/data.ts`) et les données des pages
**espace propriétaire** et **admin**.

---

## 7. Ce qui n'est PAS encore branché

| Action | État actuel | Étape suivante |
|---|---|---|
| Recherche / filtres | ✅ lit la base de données | — |
| Fiche d'un bien | ✅ lit la base de données | — |
| Demande de visite | affiche un message, rien n'est envoyé | route API + enregistrement + email au propriétaire |
| Alerte SMS | idem | route API + service de SMS/email |
| Publier un bien | assistant complet, rien n'est enregistré | authentification + enregistrement + upload photos |
| Paiement de la commission | bouton « simulé » | intégration MTN MoMo / Moov Money |
| Espace propriétaire / Admin | données écrites en dur | base de données + authentification |

---

## 8. Commandes utiles

| Commande | Effet |
|---|---|
| `npm run dev` | Lance le site en développement (rechargement auto) |
| `npm run build` | Fabrique la version optimisée pour la mise en ligne |
| `npm start` | Lance la version fabriquée par `build` |
| `npm run lint` | Vérifie le style du code |
| `npm run db:migrate` | Applique les changements de `schema.prisma` à la base |
| `npm run db:seed` | (Re)remplit la base avec les 12 annonces de démo |
| `npm run db:reset` | Vide la base, rejoue les migrations, re-remplit |
| `npm run db:studio` | Ouvre l'explorateur de base dans le navigateur |
