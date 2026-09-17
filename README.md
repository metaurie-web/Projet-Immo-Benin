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

## 5. S'inscrire et se connecter (lien magique)

Le site utilise une connexion **sans mot de passe** : on indique son email,
on reçoit un lien, on clique dessus.

**Inscription et connexion sont deux pages séparées** (`/inscription` et
`/connexion`, reliées par un lien dans chaque sens) :

- `/inscription` **crée le compte** (nom + email) — refuse si l'email est
  déjà utilisé, avec un lien direct vers `/connexion`
- `/connexion` **exige qu'un compte existe déjà** — un email inconnu est
  refusé (« Aucun compte n'est associé à cet email »), avec un lien direct
  vers `/inscription`. Sans ce contrôle, next-auth aurait créé un compte
  pour n'importe quel email tapé là, ce qui aurait vidé l'inscription de
  son sens

Pour tester :

1. Aller sur <http://localhost:3000/inscription>, créer un compte
2. **Regarder le terminal** où tourne `npm run dev` : tant qu'aucun service
   d'emails n'est configuré (voir § 8), le lien s'affiche là plutôt que
   d'être vraiment envoyé — pratique pour tester sans rien créer
3. Copier-coller ce lien dans le navigateur → connecté, envoyé vers
   `/mon-espace` qui aiguille vers le bon espace selon le rôle

Par défaut, un compte est créé avec le rôle `"visiteur"` et atterrit sur
`/espace-visiteur` (profil + favoris). Pour te donner le rôle **admin**
(accès à `/admin`) :

```powershell
npm run make-admin -- ton-email@exemple.com
```

Pas besoin de se reconnecter après : la page `/admin` prend en compte le
nouveau rôle immédiatement.

---

## 6. Structure du projet

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
│  ├─ make-admin.mjs     Donne le rôle admin à un compte (par email)
│  └─ dev.db             La base SQLite locale (ignorée par git)
├─ public/               Fichiers servis tels quels (favicon…)
└─ src/
   ├─ app/               Les pages (routage par dossier)
   │  ├─ layout.tsx              En-tête + pied de page communs à toutes les pages
   │  ├─ globals.css             Le design system (repris du site statique)
   │  ├─ page.tsx                Accueil            → /
   │  ├─ not-found.tsx           Page 404
   │  ├─ connexion/
   │  │  ├─ page.tsx             Formulaire de connexion → /connexion
   │  │  ├─ actions.ts           ensureAccountExists() — refuse un email inconnu
   │  │  └─ verification/page.tsx  « Vérifiez votre boîte mail »
   │  ├─ inscription/
   │  │  ├─ page.tsx             Formulaire de création de compte → /inscription
   │  │  └─ actions.ts           registerAccount() — refuse un email déjà utilisé
   │  ├─ api/
   │  │  ├─ auth/[...nextauth]/route.ts  Routes de next-auth (ne pas modifier)
   │  │  ├─ upload/route.ts      Jeton d'upload Vercel Blob — photos (store public)
   │  │  └─ admin/identity-doc/[userId]/route.ts  Relaie un document privé à l'admin
   │  ├─ annonces/
   │  │  ├─ page.tsx             Liste + filtres    → /annonces (annonces "en_ligne" uniquement)
   │  │  └─ [ref]/
   │  │     ├─ page.tsx          Fiche d'un bien    → /annonces/MA-1042
   │  │     └─ visite/page.tsx   Prise de rendez-vous → /annonces/MA-1042/visite
   │  ├─ verification-identite/
   │  │  ├─ page.tsx             Statut + envoi de la pièce d'identité → /verification-identite
   │  │  └─ actions.ts           uploadIdentityDoc() + submitVerification()
   │  ├─ mon-espace/page.tsx     Aiguillage (sans interface) → le bon espace selon le rôle
   │  ├─ espace-visiteur/
   │  │  ├─ page.tsx             Profil + favoris (rôle visiteur/proprietaire) → /espace-visiteur
   │  │  └─ actions.ts           toggleFavorite() + updateProfile()
   │  ├─ publier/
   │  │  ├─ page.tsx             Assistant propriétaire (identité vérifiée requise) → /publier
   │  │  └─ actions.ts           Action serveur publishListing() — écrit en base
   │  ├─ espace-proprietaire/page.tsx  Mes annonces + leur statut (rôle proprietaire) → /espace-proprietaire
   │  └─ admin/                  Rôle admin requis sur chaque page
   │     ├─ page.tsx             Vue d'ensemble + files de modération → /admin
   │     ├─ annonces/
   │     │  ├─ page.tsx          Toutes les annonces, tous statuts → /admin/annonces
   │     │  └─ [ref]/modifier/page.tsx  Modifier une annonce
   │     ├─ proprietaires/page.tsx  Comptes propriétaires → /admin/proprietaires
   │     ├─ visiteurs/page.tsx   Comptes visiteurs → /admin/visiteurs
   │     ├─ parametres/page.tsx  Réglages généraux (commission…) → /admin/parametres
   │     └─ actions.ts           Toutes les actions admin (voir requireAdmin())
   │
   ├─ components/         Morceaux d'interface réutilisables
   │  ├─ SiteHeader.tsx / Nav.tsx / SiteFooter.tsx
   │  ├─ AuthProvider.tsx        Contexte de session (nécessaire à useSession())
   │  ├─ SignInForm.tsx          Formulaire de /connexion
   │  ├─ SignUpForm.tsx          Formulaire de /inscription
   │  ├─ ListingCard.tsx / Faq.tsx
   │  ├─ ListingPhoto.tsx        Vraie photo (URL) ou vignette de démonstration
   │  ├─ PhotoUploadSlot.tsx     Envoie une photo vers Vercel Blob (formulaire /publier)
   │  ├─ VerificationDocUpload.tsx  Envoie la pièce d'identité (store privé)
   │  ├─ VerificationForm.tsx    Formulaire de /verification-identite
   │  ├─ FavoriteButton.tsx      Bouton favori, sur toute carte/fiche d'annonce
   │  ├─ ProfileForm.tsx         Formulaire de /espace-visiteur
   │  ├─ AnnoncesBrowser.tsx     Filtres de recherche (interactif)
   │  ├─ VisiteForm.tsx          Choix du créneau + formulaire
   │  ├─ PublierWizard.tsx       Assistant 2 étapes
   │  ├─ NewsletterForm.tsx      Alerte SMS
   │  ├─ ConfirmButton.tsx       Bouton « Confirmer » (espace propriétaire)
   │  ├─ ModerationActions.tsx   Boutons Valider / Refuser une annonce (admin)
   │  ├─ VerificationActions.tsx Boutons Valider / Refuser une identité (admin)
   │  ├─ AdminNav.tsx            Sous-navigation des pages /admin/*
   │  ├─ AccountActions.tsx      Promouvoir/rétrograder/supprimer un compte (admin)
   │  ├─ AdminListingActions.tsx Changer le statut/modifier/supprimer une annonce (admin)
   │  ├─ EditListingForm.tsx     Formulaire de /admin/annonces/[ref]/modifier
   │  └─ SettingsForm.tsx        Formulaire de /admin/parametres
   │
   ├─ lib/                Code non visuel
   │  ├─ types.ts          Formes des données (Listing, User Role…)
   │  ├─ format.ts         fcfa(), fmt() — mise en forme des montants
   │  ├─ db.ts             L'instance unique de connexion à la base (Prisma)
   │  ├─ data.ts           Lecture des annonces en base + contenus éditoriaux
   │  ├─ verification.ts   Lecture/écriture du statut de vérification d'un compte
   │  ├─ favorites.ts      Favoris (getFavoriteRefs, withFavorites…)
   │  ├─ users.ts          Comptes par rôle, changement de rôle (admin)
   │  ├─ settings.ts       Réglages généraux (SiteSettings)
   │  ├─ auth.ts           Configuration next-auth (fournisseur, sessions, rôles)
   │  └─ mail.ts           Envoi de l'email de connexion (Resend, ou console)
   │
   └─ types/
      └─ next-auth.d.ts    Ajoute id/role/verificationStatus aux types de session
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

## 7. La base de données (Prisma)

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

Restent écrits en dur, pour l'instant : les villes, la FAQ, les témoignages
et les créneaux de visite (`src/lib/data.ts`).

---

## 8. L'authentification (Auth.js / next-auth)

Connexion **par lien magique uniquement** : pas de mot de passe, pas de
champ à sécuriser nous-mêmes.

- **Fournisseur** : `EmailProvider` de next-auth (`src/lib/auth.ts`)
- **Inscription** (`/inscription`, `src/app/inscription/actions.ts`,
  `registerAccount()`) : crée le `User` (nom + email, rôle `"visiteur"`)
  puis déclenche l'envoi du lien via le même `signIn("email", …)` que la
  connexion. Refuse si l'email existe déjà (comparaison normalisée en
  minuscules, pour éviter les doublons `Nom@X.com` / `nom@x.com`)
- **Connexion** (`/connexion`) : `ensureAccountExists()`
  (`src/app/connexion/actions.ts`) vérifie qu'un compte existe **avant**
  d'appeler `signIn()` — un email inconnu est refusé avec un lien vers
  `/inscription`, plutôt que de créer un compte silencieusement
- **Sessions** : stockées en base (table `Session`), pas en JWT — un
  changement de rôle prend effet tout de suite, sans reconnexion
- **Rôles** : chaque `User` a un `role` — `"visiteur"` (par défaut),
  `"proprietaire"` ou `"admin"`. Détail complet au § 12
- **Pages protégées** : chacune vérifie `session.user.role` et **redirige**
  vers le bon espace si ça ne correspond pas — voir le début de chaque
  `page.tsx`
- **Envoi de l'email** (`src/lib/mail.ts`) :
  - sans `RESEND_API_KEY` dans `.env` → le lien s'affiche dans le terminal
    (`npm run dev`), pratique pour développer sans rien créer
  - avec une clé Resend → l'email part pour de vrai. Compte gratuit sur
    <https://resend.com>, la clé se colle dans `.env` (`RESEND_API_KEY=...`)

---

## 9. Publier un bien et la modération

Le cycle de vie d'une annonce (`Listing.status`, dans `prisma/schema.prisma`) :

```
en_attente  →  en_ligne              (visible sur /annonces et sa fiche)
            →  correction_demandee   (l'admin demande une modification)
            →  refusee
```

- `/publier` (connexion requise) : le formulaire enregistre une vraie annonce
  via l'action serveur `publishListing()` (`src/app/publier/actions.ts`),
  validée avec **zod**. Elle part avec le statut `en_attente` et est liée au
  compte connecté (`ownerId`)
- `/admin` (rôle `admin` requis) lit la vraie file d'attente
  (`getPendingListings()`) ; les boutons Valider / Demander une correction /
  Refuser appellent `moderateListing()` (`src/app/admin/actions.ts`) qui
  change le statut en base
- `getAllListings()`, `getFeaturedListings()` et `getListing()` ne renvoient
  que les annonces `en_ligne` : c'est ce qui rend une annonce invisible du
  public tant qu'elle n'est pas validée
- `/espace-proprietaire` affiche les vraies annonces du compte connecté
  (`getListingsByOwner()`), avec leur statut

Depuis peu, `/publier` suppose l'identité du propriétaire déjà vérifiée (voir
§ 11) : le formulaire ne s'occupe plus que du bien lui-même, en 2 étapes.

Pas encore réel : le paiement de la commission (publication gratuite tant
que Mobile Money n'est pas branché).

---

## 10. L'envoi de photos (Vercel Blob)

Chaque emplacement de `/publier` (Façade, Séjour, Chambre, Cuisine) envoie la
photo **directement du navigateur vers Vercel Blob** — le fichier ne passe
jamais par notre serveur, ce qui évite les limites de taille des fonctions
serverless.

- `src/app/api/upload/route.ts` : ne transporte pas le fichier, délivre juste
  un jeton d'upload de courte durée — et vérifie qu'une personne est
  connectée avant de le délivrer
- `src/components/PhotoUploadSlot.tsx` : déclenche l'envoi via `upload()`
  (`@vercel/blob/client`), affiche un aperçu une fois terminé
- `src/components/ListingPhoto.tsx` : affiche la vraie photo si le champ
  contient une URL, sinon la vignette de démonstration habituelle — un
  emplacement resté vide n'empêche pas de publier
- Les photos sont servies via `next/image` (redimensionnement, formats
  optimisés) : le domaine Vercel Blob est autorisé dans `next.config.mjs`

Sans `BLOB_READ_WRITE_TOKEN` dans `.env`, les emplacements de photo restent
inertes et l'annonce garde ses vignettes de démonstration — aucune erreur,
juste pas de vraies photos. Jeton gratuit dans le dashboard Vercel,
**Storage → Blob**, en choisissant un store à **accès public** (un store
privé, pensé pour des fichiers sensibles, ne fonctionne pas pour des photos
destinées à être vues publiquement).

---

## 11. Vérification d'identité (une seule fois par compte)

L'identité d'un propriétaire se vérifie **une seule fois**, avant sa
première annonce — pas à chaque publication. Séparé de `Listing.status` :
c'est `User.verificationStatus` (`prisma/schema.prisma`) qui porte cet état.

```
non_verifie  →  en_attente  →  verifie   (peut publier, définitivement)
                            →  refuse    (peut réessayer, voir la raison)
```

- `/verification-identite` (connexion requise) : envoie une pièce d'identité
  et passe le compte en `en_attente` (`submitVerification()`,
  `src/app/verification-identite/actions.ts`)
- `/publier` vérifie `session.user.verificationStatus` **avant** d'afficher
  le formulaire : redirige vers `/verification-identite` si ce n'est pas
  encore `"verifie"` — voir `src/app/publier/page.tsx`
- `/admin` liste les vérifications en attente (`getPendingVerifications()`,
  `src/lib/verification.ts`) ; Valider / Refuser appellent
  `moderateVerification()` (`src/app/admin/actions.ts`)
- Le document est stocké dans un store Blob **PRIVÉ**, distinct de celui des
  photos (`BLOB_PRIVATE_READ_WRITE_TOKEN`). Contrairement aux photos (store
  public, upload direct navigateur → Blob), un store privé n'accepte pas
  cette voie : le fichier transite par une **action serveur**
  (`uploadIdentityDoc()`, `src/app/verification-identite/actions.ts`), la
  seule à détenir le jeton privé. L'admin consulte le document via
  `/api/admin/identity-doc/[userId]`, qui le relaie après avoir vérifié le
  rôle — jamais d'URL Blob privée exposée directement
- Sessions stockées en base (voir § 8) : dès qu'un admin valide, le compte
  peut publier à la requête suivante, sans reconnexion

Sans `BLOB_PRIVATE_READ_WRITE_TOKEN`, l'envoi du document échoue proprement
(message clair, pas de plantage) — la vérification reste indisponible tant
que ce jeton n'est pas renseigné.

---

## 12. Rôles et espaces

Trois espaces **strictement séparés**, un par rôle :

| Rôle | Espace | Accès |
|---|---|---|
| `visiteur` (par défaut à l'inscription) | `/espace-visiteur` | Profil, favoris |
| `proprietaire` | `/espace-proprietaire` | Ses propres annonces, uniquement |
| `admin` | `/admin` | Tout : comptes, annonces, réglages |

**Comment on devient propriétaire.** Il n'y a pas de bouton « devenir
propriétaire » séparé : un `visiteur` qui va au bout de `/publier` passe par
la vérification d'identité (§ 11), et c'est en la **validant** qu'un admin
le fait passer au rôle `proprietaire` (`moderateVerification()`,
`src/app/admin/actions.ts`). Un admin peut aussi changer le rôle d'un
compte à la main, depuis `/admin/proprietaires` ou `/admin/visiteurs`
(`changeUserRoleAction()`).

**`/mon-espace`** — aucune interface, juste un aiguillage : après
connexion (destination par défaut dans `SignInForm.tsx`), il redirige vers
`/admin`, `/espace-proprietaire` ou `/espace-visiteur` selon le rôle. Le
lien « Mon espace » du menu pointe toujours ici, jamais vers un espace en
dur — il est donc toujours correct, quel que soit qui est connecté.

**La sécurité ne repose jamais sur l'interface.** Chaque page protégée
revérifie elle-même `session.user.role` (`getServerSession` côté serveur) et
**redirige** vers le bon espace si ça ne correspond pas — modifier l'URL à la
main ne donne accès à rien de plus. Chaque action serveur fait de même
(`requireAdmin()` dans `src/app/admin/actions.ts`) : une page protégée ne
suffit pas, une action serveur est un point d'entrée public en soi.

**Favoris** (`src/lib/favorites.ts`, modèle `Favorite`) : bouton présent sur
toute carte ou fiche d'annonce (`FavoriteButton.tsx`). Non connecté → clic
renvoyé vers `/connexion` plutôt que d'appeler l'action.

**Admin élargi** (`/admin/*`, sous-navigation via `AdminNav.tsx`) :
- `/admin` — vue d'ensemble + files de modération (identités, annonces en attente)
- `/admin/annonces` — **toutes** les annonces, tous statuts ; changer le statut, modifier, supprimer
- `/admin/proprietaires`, `/admin/visiteurs` — comptes par rôle ; promouvoir/rétrograder, supprimer
- `/admin/parametres` — réglages généraux (montant de la commission, pour l'instant — `src/lib/settings.ts`, modèle `SiteSettings`)

---

## 13. Ce qui n'est PAS encore branché

| Action | État actuel | Étape suivante |
|---|---|---|
| Recherche / filtres | ✅ lit la base de données | — |
| Fiche d'un bien | ✅ lit la base de données | — |
| Inscription + connexion (lien magique) | ✅ pages séparées, 3 rôles (visiteur/proprietaire/admin) | — |
| Séparation des espaces | ✅ chacun redirigé vers le sien, gardes-fous serveur | — |
| Favoris | ✅ vrai (modèle `Favorite`) | — |
| Vérification d'identité | ✅ complet, une fois par compte, vrai document privé | — |
| Publier un bien | ✅ enregistré en base, 2 étapes, file de modération réelle | — |
| Photos | ✅ vrai upload (Vercel Blob) | — |
| Espace propriétaire | ✅ vraies annonces du compte connecté | demandes de visite réelles |
| Admin | ✅ comptes, annonces (toutes), réglages, modération | — |
| Demande de visite | affiche un message, rien n'est envoyé | enregistrement + email au propriétaire |
| Alerte SMS | idem | route API + service de SMS/email |
| Paiement de la commission | publication gratuite pour l'instant | intégration MTN MoMo / Moov Money |

---

## 14. Commandes utiles

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
| `npm run make-admin -- email@exemple.com` | Donne le rôle admin à ce compte |
