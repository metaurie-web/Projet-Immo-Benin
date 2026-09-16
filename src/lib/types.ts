/* Types partagés de l'application.
   Un « type » décrit la forme d'une donnée : quels champs elle contient et de
   quelle nature. TypeScript s'en sert pour signaler les erreurs pendant qu'on
   écrit le code. */

export type PropertyType = "Chambre-salon" | "Appartement" | "Maison basse" | "Villa";
export type MeterKind = "individuel" | "partagé";

/** Cycle de vie d'une annonce, de son dépôt à sa mise en ligne. */
export type ListingStatus =
  | "en_attente"
  | "en_ligne"
  | "correction_demandee"
  | "refusee"
  | "expiree";

/** Vérification d'identité d'un compte propriétaire — faite une seule fois. */
export type VerificationStatus = "non_verifie" | "en_attente" | "verifie" | "refuse";

export interface CostRow {
  k: string;
  v: string;
}

export interface Review {
  who: string;
  when: string;
  stars: string;
  text: string;
}

export interface Listing {
  ref: string;
  title: string;
  city: string;
  quartier: string;
  type: PropertyType;
  price: number;
  rooms: number;
  furnished: boolean;
  meter: MeterKind;
  water: string;
  parking: boolean;
  advance: string;
  deposit: string;
  owner: string;
  ownerSince: string;
  ownerCount: number;
  /** Identifiant du compte propriétaire connecté ; null pour les annonces de démonstration. */
  ownerId: string | null;
  rating: string;
  reviews: number;
  publishedAt: string;
  featured: boolean;
  status: ListingStatus;
  landmark: string;
  description: string;
  photos: string[];
  costRows: CostRow[];
  totalIn: number;
  reviewList: Review[];
  createdAt: Date;
}

export interface City {
  name: string;
  count: number;
  areas: string;
}

export interface Testimonial {
  text: string;
  who: string;
  role: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface VisitSlot {
  day: string;
  date: string;
  time: string;
}
