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

Le projet utilise **PostgreSQL** (par exemple [Neon](https://neon.tech),
gratuit) — y compris en local : crée une base dédiée au développement,
**séparée de celle de production**, pour ne jamais mélanger tes tests avec
de vraies données.

```powershell
Copy-Item .env.example .env
# Renseigne DATABASE_URL et DIRECT_URL dans .env avec ta base de dev
npm run db:migrate
npm run db:seed
```

- `Copy-Item .env.example .env` crée le fichier `.env` à remplir
- `npm run db:migrate` crée les tables dans ta base de dev
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
│  └─ make-admin.mjs     Donne le rôle admin à un compte (par email)
├─ public/               Fichiers servis tels quels (logo.png…)
└─ src/
   ├─ app/               Les pages (routage par dossier)
   │  ├─ layout.tsx              En-tête + pied de page communs à toutes les pages
   │  ├─ globals.css             Le design system (repris du site statique)
   │  ├─ icon.png / apple-icon.png  Favicon (détecté automatiquement par Next.js)
   │  ├─ page.tsx                Accueil            → /
   │  ├─ not-found.tsx           Page 404
   │  ├─ connexion/
   │  │  ├─ page.tsx             Formulaire de connexion → /connexion
   │  │  ├─ actions.ts           ensureAccountExists() — refuse un email inconnu
   │  │  └─ verification/page.tsx  « Vérifiez votre boîte mail »
   │  ├─ inscription/
   │  │  ├─ page.tsx             Formulaire de création de compte → /inscription
   │  │  ├─ actions.ts           registerAccount() — refuse un email déjà utilisé
   │  │  └─ bienvenue/page.tsx   Confirmation après clic sur le lien envoyé à l'inscription
   │  ├─ api/
   │  │  ├─ auth/[...nextauth]/route.ts  Routes de next-auth (ne pas modifier)
   │  │  ├─ upload/route.ts      Jeton d'upload Vercel Blob — photos (store public)
   │  │  └─ admin/identity-doc/[userId]/route.ts  Relaie un document privé à l'admin
   │  ├─ annonces/
   │  │  ├─ page.tsx             Liste + filtres    → /annonces (annonces "en_ligne" uniquement)
   │  │  └─ [ref]/
   │  │     ├─ page.tsx          Fiche d'un bien    → /annonces/MA-1042
   │  │     └─ visite/
   │  │        ├─ page.tsx       Prise de rendez-vous (connexion requise) → /annonces/MA-1042/visite
   │  │        └─ actions.ts     submitVisitRequest() — enregistre la demande, alerte le propriétaire
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
   │  ├─ espace-proprietaire/
   │  │  ├─ page.tsx             Annonces, demandes de visite, créneaux (rôle proprietaire) → /espace-proprietaire
   │  │  └─ actions.ts           addVisitSlotAction, removeVisitSlotAction, confirmVisitRequestAction, rejectVisitRequestAction
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
   │  ├─ VisiteForm.tsx          Choix d'un créneau, paiement KKiaPay (200 FCFA), puis submitVisitRequest
   │  ├─ PublierWizard.tsx       Assistant 2 étapes, paiement KKiaPay de la commission à l'étape 2
   │  ├─ NewsletterForm.tsx      Alerte SMS
   │  ├─ ConfirmButton.tsx       Confirmer/refuser une demande de visite (espace propriétaire)
   │  ├─ SlotManager.tsx         Ajouter/retirer les créneaux d'une annonce (espace propriétaire)
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
   │  ├─ visits.ts          Créneaux et demandes de visite (par annonce, par compte)
   │  ├─ users.ts          Comptes par rôle, changement de rôle (admin)
   │  ├─ settings.ts       Réglages généraux (SiteSettings)
   │  ├─ auth.ts           Configuration next-auth (fournisseur, sessions, rôles)
   │  ├─ mail.ts           Envoi des emails (Brevo, ou console)
   │  ├─ payments.ts        Constantes de paiement (VISIT_FEE_FCFA)
   │  ├─ kkiapay.ts          Vérification serveur d'un paiement KKiaPay
   │  └─ useKkiapayListeners.ts  Hook : enregistre les listeners du widget KKiaPay
   │
   └─ types/
      ├─ next-auth.d.ts    Ajoute id/role/verificationStatus aux types de session
      └─ kkiapay.d.ts      Types de window.openKkiapayWidget / addSuccessListener…
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

## 7. La base de données (Prisma + PostgreSQL)

**Prisma** est l'outil qui parle à la base en TypeScript. Le principe :

1. On décrit les tables dans `prisma/schema.prisma`
2. `npm run db:migrate` applique les changements à la vraie base (en local) ;
   `prisma migrate deploy` fait de même en production — lancé automatiquement
   à chaque déploiement Vercel, voir `package.json` (`"build"`)
3. Dans le code, on écrit `prisma.listing.findMany()` etc. — jamais de SQL à la main

`DATABASE_URL` (connexion "pooled") et `DIRECT_URL` (connexion directe,
réservée aux commandes `prisma migrate` — le pooling gêne les opérations de
schéma) pointent toutes les deux la même base ; Neon fournit les deux formes
séparément dans son tableau de bord.

Voir et modifier les données à la souris, dans le navigateur :

```powershell
npm run db:studio
```

Aujourd'hui, **les annonces viennent de la base**. Les fonctions
`getAllListings()`, `getFeaturedListings()` et `getListing()` de
`src/lib/data.ts` font une requête Prisma (elles sont donc `async` — les pages
les « attendent » avec `await`).

Restent écrits en dur, pour l'instant : les villes, la FAQ et les témoignages
(`src/lib/data.ts`). Les créneaux et demandes de visite viennent aussi de la
base (`VisitSlot`, `VisitRequest` — voir § 13).

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
- **Envoi de l'email** (`src/lib/mail.ts`, appel direct à l'API Brevo, sans SDK) :
  - sans `BREVO_API_KEY` dans `.env` → le lien s'affiche dans le terminal
    (`npm run dev`), pratique pour développer sans rien créer
  - avec une clé Brevo → l'email part pour de vrai. Compte gratuit sur
    <https://www.brevo.com>, la clé se colle dans `.env`
    (`BREVO_API_KEY=...`) — `EMAIL_FROM` doit être une adresse déjà
    validée comme expéditeur dans Brevo (Senders, Domains & Dedicated IPs),
    sinon l'envoi échoue quel que soit le destinataire

### Confirmation de l'adresse email à l'inscription

Pas de deuxième système de jeton : l'inscription réutilise **exactement**
le même mécanisme "lien magique" que la connexion — un `VerificationToken`
à usage unique (aléatoire, haché en base, expire après 24 h — voir le cœur
de next-auth, `callback-handler.js`) — avec une seule différence, la page
d'arrivée après le clic.

- `SignUpForm.tsx` crée le compte (`User.emailVerified` reste vide à ce
  stade) puis appelle `signIn("email", …)` avec
  `callbackUrl: "/inscription/bienvenue?next=..."` au lieu du
  `/mon-espace` utilisé par la connexion
- **Tant que ce lien n'a pas été cliqué, le compte ne peut obtenir aucune
  session** : c'est next-auth lui-même qui pose `emailVerified` au moment
  où le jeton est validé, qu'il s'agisse d'une inscription ou d'une
  connexion — il n'y a donc pas de garde supplémentaire à écrire ailleurs
  dans l'app, un compte "non confirmé" n'a structurellement accès à rien
- `/inscription/bienvenue` (connexion requise) affiche la confirmation et
  un bouton vers `next` (la destination initialement demandée, ex.
  reprendre une prise de rendez-vous interrompue par l'inscription)
- **Renvoyer l'email** : bouton sur l'écran "compte créé" de
  `SignUpForm.tsx`, qui rappelle `signIn("email", …)` — next-auth n'annule
  pas l'ancien jeton, les deux restent valables (à usage unique chacun)
  jusqu'à expiration
- **Lien expiré / déjà utilisé / invalide** : redirige vers `/connexion`
  avec `?error=Verification`, déjà géré par `SignInForm.tsx`
  (`"Ce lien a expiré ou a déjà été utilisé. Redemandez-en un ci-dessous."`)
  — le même écran sert donc aux deux parcours, connexion et inscription
- **Email déjà enregistré** : refusé par `registerAccount()`
  (`src/app/inscription/actions.ts`), avant même l'envoi d'un lien

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
  change le statut en base. `/admin/annonces` (éditeur libre, toutes les
  annonces quel que soit leur statut) peut **aussi** valider ou refuser une
  annonce encore `en_attente`, via `setListingStatusAction()` — les deux
  pages partagent la même logique de décision (`sendListingDecisionEmail()`),
  pour qu'un email parte au propriétaire **quelle que soit la page utilisée
  par l'admin** pour valider ou refuser. `setPendingListingStatus()`
  (`src/lib/data.ts`) ne l'applique que si l'annonce est encore
  `en_attente` (vérification atomique) : un double clic — depuis l'une ou
  l'autre page, ou entre les deux — ne la retraite jamais deux fois. Un
  échec d'envoi est journalisé sans faire échouer la décision. Rien n'est
  envoyé pour "Demander une correction", ni pour un changement de statut
  qui ne part pas de `en_attente` (ex. republier une annonce expirée
  depuis `/admin/annonces`)
- `getAllListings()`, `getFeaturedListings()` et `getListing()` ne renvoient
  que les annonces `en_ligne` : c'est ce qui rend une annonce invisible du
  public tant qu'elle n'est pas validée
- `/espace-proprietaire` affiche les vraies annonces du compte connecté
  (`getListingsByOwner()`), avec leur statut

Depuis peu, `/publier` suppose l'identité du propriétaire déjà vérifiée (voir
§ 11) : le formulaire ne s'occupe plus que du bien lui-même, en 2 étapes.

La commission (§ 14) doit être payée à l'étape 2 avant que l'annonce ne soit
enregistrée — `publishListing()` vérifie le paiement côté serveur avant
d'écrire quoi que ce soit en base.

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
  `moderateVerification()` (`src/app/admin/actions.ts`), qui envoie ensuite
  un email de décision (`sendVerificationApprovedEmail()` /
  `sendVerificationRejectedEmail()`, `src/lib/mail.ts` — même
  infrastructure que le lien magique, voir § 8). `setVerificationStatus()`
  (`src/lib/verification.ts`) ne change le statut que si le compte est
  encore `en_attente` (vérification atomique en base) : un double clic ou
  une page restée ouverte ne retraite jamais la même demande deux fois, et
  ne renvoie donc jamais deux emails. Un échec d'envoi est journalisé côté
  serveur (`console.error`) sans faire échouer la décision elle-même — le
  statut en base reste la source de vérité
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

## 13. Demandes de visite réelles

Chaque créneau appartient à **une annonce** (`VisitSlot.listingRef`), pas au
compte propriétaire — un propriétaire avec plusieurs biens propose des
créneaux différents pour chacun. Chaque demande (`VisitRequest`) est liée au
créneau choisi (libellé figé, lisible même si le créneau est retiré ensuite),
à l'annonce, et au compte visiteur qui l'a déposée.

```
en_attente  →  confirmee   (le propriétaire confirme)
            →  refusee     (le propriétaire refuse)
```

- **Côté visiteur** — `/annonces/[ref]/visite` (connexion requise, redirige
  vers `/connexion?callbackUrl=...` sinon) affiche les vrais créneaux de
  l'annonce (`getSlotsForListing()`, `src/lib/visits.ts`). Le formulaire
  (`VisiteForm.tsx`) déclenche d'abord le paiement des 200 FCFA (§ 14), puis
  appelle l'action serveur `submitVisitRequest()`
  (`src/app/annonces/[ref]/visite/actions.ts`), qui revérifie ce paiement,
  vérifie que l'annonce est bien `en_ligne`, enregistre la demande et alerte
  le propriétaire par email (`sendVisitRequestEmail()`, `src/lib/mail.ts`)
  — sauf sur les annonces de démonstration, qui n'ont pas de compte
  propriétaire réel à notifier
- **Côté propriétaire** — `/espace-proprietaire` liste les demandes reçues
  sur ses annonces (`getVisitRequestsForOwner()`) avec les boutons Confirmer
  / Refuser (`ConfirmButton.tsx` → `confirmVisitRequestAction()` /
  `rejectVisitRequestAction()`, `src/app/espace-proprietaire/actions.ts`),
  et gère les créneaux de chaque annonce (`SlotManager.tsx` →
  `addVisitSlotAction()` / `removeVisitSlotAction()`). Chaque action
  revérifie que l'annonce ou la demande appartient bien au compte connecté
  (`requireOwnListing()`) — modifier l'URL ou l'identifiant ne donne accès
  aux demandes de personne d'autre
- **Confirmation/refus** déclenche un email au visiteur
  (`sendVisitStatusEmail()`) et met à jour l'affichage dans
  `/espace-visiteur` (« Mes demandes de visite », `getVisitRequestsForVisitor()`)

---

## 14. Paiement Mobile Money (KKiaPay)

Deux paiements réels, tous les deux vérifiés **côté serveur** avant
d'écrire quoi que ce soit en base — jamais sur la seule foi de l'événement
client, falsifiable depuis le navigateur :

| Paiement | Montant | Déclenché depuis |
|---|---|---|
| Demande de visite | 200 FCFA (fixe, `VISIT_FEE_FCFA` dans `src/lib/payments.ts`) | `VisiteForm.tsx`, avant `submitVisitRequest()` |
| Publication d'une annonce | `commissionAmount` (réglable, `/admin/parametres`) | `PublierWizard.tsx`, avant `publishListing()` |

- **Widget** (`src/app/layout.tsx` charge `https://cdn.kkiapay.me/k.js`
  site-wide) : `window.openKkiapayWidget({ amount, key, sandbox, ... })`
  ouvre le paiement ; `window.addSuccessListener()` /
  `addFailedListener()` préviennent du résultat. Le script se charge de
  façon asynchrone (`strategy="afterInteractive"`) : le hook
  `useKkiapayListeners()` (`src/lib/useKkiapayListeners.ts`) réessaie
  jusqu'à ce que ces fonctions existent avant de s'enregistrer, sinon
  l'inscription rate silencieusement si le composant se monte avant que
  le script ait fini de charger
- **Vérification serveur** (`verifyKkiapayTransaction()`,
  `src/lib/kkiapay.ts`, via `@kkiapay-org/nodejs-sdk`) : relit la
  transaction chez KKiaPay (`k.verify(transactionId)`), exige
  `status === "SUCCESS"` et un montant exactement égal à celui attendu —
  pour la commission, relu depuis `getSettings()` au moment du paiement,
  jamais depuis une valeur transmise par le client
- **Anti-rejeu** : `VisitRequest.transactionId` et `Listing.transactionId`
  sont uniques en base — une transaction déjà utilisée pour une demande
  ou une annonce ne peut pas servir une seconde fois
- **Clés** : `NEXT_PUBLIC_KKIAPAY_PUBLIC_KEY` et `NEXT_PUBLIC_KKIAPAY_SANDBOX`
  sont lues par le widget dans le navigateur ; `KKIAPAY_PRIVATE_KEY` et
  `KKIAPAY_SECRET_KEY` ne quittent jamais le serveur. Compte et clés sur
  <https://kkiapay.me> (tableau de bord → Développeurs) — les clés `tpk_`/
  `tsk_` sont des clés de **test** : `NEXT_PUBLIC_KKIAPAY_SANDBOX` doit
  rester `"true"` tant que ce sont celles-ci, `"false"` avec de vraies
  clés en production

---

## 15. Ce qui n'est PAS encore branché

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
| Espace propriétaire | ✅ vraies annonces, demandes de visite et créneaux réels | — |
| Admin | ✅ comptes, annonces (toutes), réglages, modération | — |
| Demande de visite | ✅ enregistrée en base, email au propriétaire puis au visiteur, paiement 200 FCFA vérifié | — |
| Paiement de la commission | ✅ Mobile Money (KKiaPay), vérifié côté serveur avant publication | — |
| Alerte SMS | affiche un message, rien n'est envoyé | route API + service de SMS/email |

---

## 16. Commandes utiles

| Commande | Effet |
|---|---|
| `npm run dev` | Lance le site en développement (rechargement auto) |
| `npm run build` | Applique les migrations en attente (`prisma migrate deploy`) puis fabrique la version optimisée |
| `npm start` | Lance la version fabriquée par `build` |
| `npm run lint` | Vérifie le style du code |
| `npm run db:migrate` | Applique les changements de `schema.prisma` à la base |
| `npm run db:seed` | (Re)remplit la base avec les 12 annonces de démo |
| `npm run db:reset` | Vide la base, rejoue les migrations, re-remplit |
| `npm run db:studio` | Ouvre l'explorateur de base dans le navigateur |
| `npm run make-admin -- email@exemple.com` | Donne le rôle admin à ce compte |
