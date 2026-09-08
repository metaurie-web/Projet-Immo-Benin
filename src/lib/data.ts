/* =========================================================================
   Données de démonstration.

   Pour l'instant, tout est écrit en dur dans ce fichier. À l'étape suivante,
   ces tableaux seront remplacés par des requêtes vers une vraie base de
   données — mais l'application n'aura presque rien à changer, car elle
   consomme déjà ces fonctions (getListing, etc.).

   Montants en francs CFA (FCFA).
   ========================================================================= */

import type { City, FaqItem, Listing, Testimonial, VisitSlot } from "./types";
import { fcfa } from "./format";

export const BRAND = "Mon Appart";
export const COMMISSION = 5000; // FCFA, 30 jours de publication

export const CITIES: City[] = [
  { name: "Cotonou", count: 86, areas: "Fidjrossè · Cadjèhoun · Akpakpa · Sainte-Rita · Godomey · Gbédjromédé" },
  { name: "Abomey-Calavi", count: 61, areas: "Tankpè · Zogbadjè · Womey · Akassato · Glo-Djigbé" },
  { name: "Porto-Novo", count: 42, areas: "Ouando · Djègan-Daho · Attakè · Louho" },
  { name: "Ouidah", count: 25, areas: "Centre · Pahou · Avlékété · Savi" },
];

export const LISTINGS: Listing[] = [
  {
    ref: "MA-1042",
    title: "Appartement 2 chambres, cour clôturée",
    city: "Cotonou",
    quartier: "Fidjrossè",
    type: "Appartement",
    price: 90000,
    rooms: 2,
    furnished: false,
    meter: "individuel",
    water: "Forage + SONEB",
    parking: true,
    advance: "3 mois",
    deposit: "1 mois",
    owner: "M. Adjovi Kossi",
    ownerSince: "2025",
    ownerCount: 3,
    rating: "4,7",
    reviews: 12,
    publishedAt: "il y a 3 jours",
    featured: true,
    landmark: "Voie pavée de Fidjrossè",
    description:
      "Appartement au premier étage d'une maison de deux niveaux, à cinq minutes de la voie pavée de Fidjrossè. " +
      "Deux chambres avec placards, séjour, cuisine intérieure, douche et WC séparés. Cour clôturée avec portail, " +
      "place pour une voiture et deux motos. Compteur SBEE individuel et forage SONEB, donc pas de partage de facture " +
      "avec les voisins. Je vis dans la maison d'à côté et je gère moi-même la location.",
    photos: ["Séjour", "Chambre", "Cuisine + douche", "Façade"],
    costRows: [
      { k: "Loyer mensuel", v: fcfa(90000) },
      { k: "Avance à la signature (3 mois)", v: fcfa(270000) },
      { k: "Caution (restituée en fin de bail)", v: fcfa(90000) },
      { k: "Charges (ordures, gardiennage)", v: "Aucune" },
      { k: "Frais de démarcheur", v: fcfa(0) },
    ],
    totalIn: 360000,
    reviewList: [
      {
        who: "Rachida A.",
        when: "août 2026",
        stars: "5",
        text: "J'ai visité avec le propriétaire lui-même. Le loyer annoncé sur le site était exactement celui demandé, et l'avance aussi. Rien à négocier en cachette.",
      },
      {
        who: "Sébastien K.",
        when: "juillet 2026",
        stars: "4",
        text: "Quartier calme et cour vraiment clôturée comme sur les photos. La cuisine est un peu petite, mais c'était visible sur l'annonce.",
      },
    ],
  },
  {
    ref: "MA-1039",
    title: "Chambre-salon meublée, étage",
    city: "Abomey-Calavi",
    quartier: "Tankpè",
    type: "Chambre-salon",
    price: 45000,
    rooms: 1,
    furnished: true,
    meter: "partagé",
    water: "SONEB",
    parking: false,
    advance: "2 mois",
    deposit: "1 mois",
    owner: "Mme Hounkpatin B.",
    ownerSince: "2025",
    ownerCount: 2,
    rating: "4,5",
    reviews: 9,
    publishedAt: "il y a 4 jours",
    featured: true,
    landmark: "300 m du carrefour de Tankpè",
    description:
      "Chambre-salon meublée à l'étage d'un petit immeuble, à 300 mètres du carrefour de Tankpè. Lit, armoire, " +
      "canapé, réfrigérateur et plaque de cuisson fournis. Eau et courant inclus dans le loyer, compteur partagé " +
      "relevé chaque mois. Idéal pour une personne seule ou un jeune couple.",
    photos: ["Séjour", "Coin nuit", "Cuisine", "Entrée"],
    costRows: [
      { k: "Loyer mensuel (eau et courant inclus)", v: fcfa(45000) },
      { k: "Avance à la signature (2 mois)", v: fcfa(90000) },
      { k: "Caution", v: fcfa(45000) },
      { k: "Frais de démarcheur", v: fcfa(0) },
    ],
    totalIn: 135000,
    reviewList: [
      {
        who: "Moïse T.",
        when: "juillet 2026",
        stars: "5",
        text: "Meublé correctement, tout fonctionnait le jour de l'entrée. La propriétaire habite au rez-de-chaussée, c'est rassurant.",
      },
    ],
  },
  {
    ref: "MA-1051",
    title: "Maison basse 3 chambres avec véranda",
    city: "Porto-Novo",
    quartier: "Ouando",
    type: "Maison basse",
    price: 120000,
    rooms: 3,
    furnished: false,
    meter: "individuel",
    water: "Forage + SONEB",
    parking: true,
    advance: "3 mois",
    deposit: "2 mois",
    owner: "M. Dossou Rachad",
    ownerSince: "2024",
    ownerCount: 4,
    rating: "4,8",
    reviews: 15,
    publishedAt: "il y a 6 jours",
    featured: true,
    landmark: "Marché d'Ouando",
    description:
      "Maison basse indépendante avec véranda couverte, trois chambres, double séjour, cuisine intérieure et " +
      "extérieure, deux douches. Grande cour sablée avec garage fermé. Compteur SBEE individuel, forage et " +
      "raccordement SONEB. À dix minutes à pied du marché d'Ouando.",
    photos: ["Véranda", "Séjour", "Chambre principale", "Cour + garage"],
    costRows: [
      { k: "Loyer mensuel", v: fcfa(120000) },
      { k: "Avance à la signature (3 mois)", v: fcfa(360000) },
      { k: "Caution", v: fcfa(240000) },
      { k: "Frais de démarcheur", v: fcfa(0) },
    ],
    totalIn: 600000,
    reviewList: [
      {
        who: "Grâce D.",
        when: "juin 2026",
        stars: "5",
        text: "La cour est vraiment aussi grande que sur les photos. Garage pratique, quartier vivant mais la maison est en retrait de la rue.",
      },
    ],
  },
  {
    ref: "MA-1033",
    title: "Appartement 3 chambres, 1er étage",
    city: "Cotonou",
    quartier: "Cadjèhoun",
    type: "Appartement",
    price: 150000,
    rooms: 3,
    furnished: false,
    meter: "individuel",
    water: "Forage + SONEB",
    parking: true,
    advance: "3 mois",
    deposit: "2 mois",
    owner: "Mme Hounkpatin B.",
    ownerSince: "2025",
    ownerCount: 2,
    rating: "4,9",
    reviews: 8,
    publishedAt: "il y a 8 jours",
    featured: false,
    landmark: "Rond-point de Cadjèhoun",
    description:
      "Grand appartement de standing au premier étage, trois chambres dont une suite parentale, séjour double " +
      "avec balcon, cuisine équipée. Parking pour deux voitures dans une cour clôturée. Compteur individuel, " +
      "forage et SONEB. Proche du rond-point de Cadjèhoun et des écoles.",
    photos: ["Séjour + balcon", "Suite parentale", "Cuisine", "Parking"],
    costRows: [
      { k: "Loyer mensuel", v: fcfa(150000) },
      { k: "Avance à la signature (3 mois)", v: fcfa(450000) },
      { k: "Caution", v: fcfa(300000) },
      { k: "Frais de démarcheur", v: fcfa(0) },
    ],
    totalIn: 750000,
    reviewList: [],
  },
  {
    ref: "MA-1028",
    title: "Chambre-salon, entrée indépendante",
    city: "Cotonou",
    quartier: "Akpakpa",
    type: "Chambre-salon",
    price: 35000,
    rooms: 1,
    furnished: false,
    meter: "partagé",
    water: "SONEB",
    parking: false,
    advance: "2 mois",
    deposit: "1 mois",
    owner: "M. Dossou Rachad",
    ownerSince: "2024",
    ownerCount: 4,
    rating: "4,4",
    reviews: 21,
    publishedAt: "il y a 9 jours",
    featured: false,
    landmark: "Pavé d'Akpakpa Dodomè",
    description:
      "Chambre-salon avec entrée indépendante donnant sur une cour commune calme. Douche interne, coin cuisine. " +
      "Compteur partagé, eau au forage commun. Loyer contenu, bien situé sur le pavé d'Akpakpa Dodomè.",
    photos: ["Séjour", "Chambre", "Douche", "Cour commune"],
    costRows: [
      { k: "Loyer mensuel", v: fcfa(35000) },
      { k: "Avance à la signature (2 mois)", v: fcfa(70000) },
      { k: "Caution", v: fcfa(35000) },
      { k: "Frais de démarcheur", v: fcfa(0) },
    ],
    totalIn: 105000,
    reviewList: [
      {
        who: "Ferdinand H.",
        when: "mai 2026",
        stars: "4",
        text: "Correct pour le prix. Compteur partagé donc la facture varie, mais c'était indiqué. Propriétaire réactif.",
      },
    ],
  },
  {
    ref: "MA-1044",
    title: "Studio meublé, immeuble récent",
    city: "Cotonou",
    quartier: "Sainte-Rita",
    type: "Chambre-salon",
    price: 70000,
    rooms: 1,
    furnished: true,
    meter: "individuel",
    water: "SONEB",
    parking: false,
    advance: "1 mois",
    deposit: "1 mois",
    owner: "Mme Tossou Alice",
    ownerSince: "2025",
    ownerCount: 5,
    rating: "4,8",
    reviews: 6,
    publishedAt: "il y a 10 jours",
    featured: false,
    landmark: "Église Sainte-Rita",
    description:
      "Studio meublé dans un immeuble récent de quatre niveaux. Climatisation, kitchenette équipée, salle d'eau " +
      "carrelée. Eau et courant inclus, compteur individuel. Avance d'un seul mois. À côté de l'église Sainte-Rita.",
    photos: ["Pièce principale", "Kitchenette", "Salle d'eau", "Immeuble"],
    costRows: [
      { k: "Loyer mensuel (eau et courant inclus)", v: fcfa(70000) },
      { k: "Avance à la signature (1 mois)", v: fcfa(70000) },
      { k: "Caution", v: fcfa(70000) },
      { k: "Frais de démarcheur", v: fcfa(0) },
    ],
    totalIn: 140000,
    reviewList: [],
  },
  {
    ref: "MA-1057",
    title: "Villa 4 chambres, quartier calme",
    city: "Cotonou",
    quartier: "Godomey",
    type: "Villa",
    price: 250000,
    rooms: 4,
    furnished: false,
    meter: "individuel",
    water: "Forage + SONEB",
    parking: true,
    advance: "6 mois",
    deposit: "2 mois",
    owner: "M. Zinsou Éric",
    ownerSince: "2023",
    ownerCount: 6,
    rating: "5,0",
    reviews: 4,
    publishedAt: "il y a 12 jours",
    featured: false,
    landmark: "Carrefour Womey",
    description:
      "Villa individuelle sur parcelle entière, quatre chambres, bureau, double séjour, cuisine américaine. " +
      "Jardin arboré, forage, groupe électrogène de secours, guérite. Compteur individuel. Quartier résidentiel " +
      "calme à Godomey, proche du carrefour Womey.",
    photos: ["Façade + jardin", "Séjour", "Chambre parentale", "Cuisine"],
    costRows: [
      { k: "Loyer mensuel", v: fcfa(250000) },
      { k: "Avance à la signature (6 mois)", v: fcfa(1500000) },
      { k: "Caution", v: fcfa(500000) },
      { k: "Frais de démarcheur", v: fcfa(0) },
    ],
    totalIn: 2000000,
    reviewList: [],
  },
  {
    ref: "MA-1061",
    title: "Appartement 2 chambres, Zogbadjè",
    city: "Abomey-Calavi",
    quartier: "Zogbadjè",
    type: "Appartement",
    price: 80000,
    rooms: 2,
    furnished: false,
    meter: "individuel",
    water: "Forage",
    parking: true,
    advance: "3 mois",
    deposit: "1 mois",
    owner: "M. Ahouandjinou Félix",
    ownerSince: "2026",
    ownerCount: 1,
    rating: "4,6",
    reviews: 3,
    publishedAt: "il y a 2 semaines",
    featured: false,
    landmark: "Campus d'Abomey-Calavi",
    description:
      "Appartement neuf de deux chambres à Zogbadjè, à proximité du campus universitaire d'Abomey-Calavi. " +
      "Séjour lumineux, cuisine intérieure, douche moderne. Compteur individuel, eau au forage privé. " +
      "Cour bétonnée avec place de parking.",
    photos: ["Séjour", "Chambre", "Cuisine", "Cour"],
    costRows: [
      { k: "Loyer mensuel", v: fcfa(80000) },
      { k: "Avance à la signature (3 mois)", v: fcfa(240000) },
      { k: "Caution", v: fcfa(80000) },
      { k: "Frais de démarcheur", v: fcfa(0) },
    ],
    totalIn: 320000,
    reviewList: [],
  },
  {
    ref: "MA-1066",
    title: "Maison basse 2 chambres, Womey",
    city: "Abomey-Calavi",
    quartier: "Womey",
    type: "Maison basse",
    price: 65000,
    rooms: 2,
    furnished: false,
    meter: "partagé",
    water: "Forage",
    parking: true,
    advance: "2 mois",
    deposit: "1 mois",
    owner: "Mme Tossou Alice",
    ownerSince: "2025",
    ownerCount: 5,
    rating: "4,3",
    reviews: 7,
    publishedAt: "il y a 2 semaines",
    featured: false,
    landmark: "Voie pavée de Womey",
    description:
      "Petite maison basse de deux chambres dans une concession de trois logements à Womey. Séjour, cuisine " +
      "extérieure abritée, douche interne. Cour partagée avec espace pour se garer. Eau au forage commun, " +
      "compteur partagé relevé mensuellement.",
    photos: ["Façade", "Séjour", "Chambre", "Cuisine extérieure"],
    costRows: [
      { k: "Loyer mensuel", v: fcfa(65000) },
      { k: "Avance à la signature (2 mois)", v: fcfa(130000) },
      { k: "Caution", v: fcfa(65000) },
      { k: "Frais de démarcheur", v: fcfa(0) },
    ],
    totalIn: 195000,
    reviewList: [],
  },
  {
    ref: "MA-1070",
    title: "Villa 3 chambres, Djègan-Daho",
    city: "Porto-Novo",
    quartier: "Djègan-Daho",
    type: "Villa",
    price: 180000,
    rooms: 3,
    furnished: false,
    meter: "individuel",
    water: "Forage + SONEB",
    parking: true,
    advance: "3 mois",
    deposit: "2 mois",
    owner: "Mme Agbodjan Reine",
    ownerSince: "2024",
    ownerCount: 2,
    rating: "4,9",
    reviews: 5,
    publishedAt: "il y a 2 semaines",
    featured: false,
    landmark: "Route de Djègan-Daho",
    description:
      "Villa récente de trois chambres avec suite parentale, grand séjour, cuisine équipée et buanderie. " +
      "Terrasse arrière, jardin clos, forage et SONEB, compteur individuel. Garage double. Secteur résidentiel " +
      "en développement sur la route de Djègan-Daho.",
    photos: ["Façade", "Séjour", "Suite parentale", "Terrasse"],
    costRows: [
      { k: "Loyer mensuel", v: fcfa(180000) },
      { k: "Avance à la signature (3 mois)", v: fcfa(540000) },
      { k: "Caution", v: fcfa(360000) },
      { k: "Frais de démarcheur", v: fcfa(0) },
    ],
    totalIn: 900000,
    reviewList: [],
  },
  {
    ref: "MA-1074",
    title: "Chambre-salon, Ouidah centre",
    city: "Ouidah",
    quartier: "Centre",
    type: "Chambre-salon",
    price: 30000,
    rooms: 1,
    furnished: false,
    meter: "partagé",
    water: "SONEB",
    parking: false,
    advance: "2 mois",
    deposit: "1 mois",
    owner: "M. Gbaguidi Marius",
    ownerSince: "2026",
    ownerCount: 1,
    rating: "4,2",
    reviews: 2,
    publishedAt: "il y a 3 semaines",
    featured: false,
    landmark: "Basilique de Ouidah",
    description:
      "Chambre-salon simple au centre de Ouidah, à courte distance de la basilique et du marché. Douche et WC " +
      "internes, coin cuisine. Cour commune tranquille. Compteur partagé, eau SONEB. Loyer très accessible.",
    photos: ["Séjour", "Chambre", "Douche", "Rue"],
    costRows: [
      { k: "Loyer mensuel", v: fcfa(30000) },
      { k: "Avance à la signature (2 mois)", v: fcfa(60000) },
      { k: "Caution", v: fcfa(30000) },
      { k: "Frais de démarcheur", v: fcfa(0) },
    ],
    totalIn: 90000,
    reviewList: [],
  },
  {
    ref: "MA-1079",
    title: "Appartement meublé bord de mer, Avlékété",
    city: "Ouidah",
    quartier: "Avlékété",
    type: "Appartement",
    price: 160000,
    rooms: 2,
    furnished: true,
    meter: "individuel",
    water: "Forage",
    parking: true,
    advance: "2 mois",
    deposit: "1 mois",
    owner: "M. Zinsou Éric",
    ownerSince: "2023",
    ownerCount: 6,
    rating: "4,8",
    reviews: 6,
    publishedAt: "il y a 3 semaines",
    featured: false,
    landmark: "Route des Pêches, Avlékété",
    description:
      "Appartement entièrement meublé à quelques centaines de mètres de la plage d'Avlékété. Deux chambres " +
      "climatisées, séjour ouvert sur terrasse, cuisine équipée. Forage privé, compteur individuel, groupe " +
      "électrogène. Parking clos. Convient aussi pour une location de moyenne durée.",
    photos: ["Terrasse", "Séjour", "Chambre", "Cuisine"],
    costRows: [
      { k: "Loyer mensuel", v: fcfa(160000) },
      { k: "Avance à la signature (2 mois)", v: fcfa(320000) },
      { k: "Caution", v: fcfa(160000) },
      { k: "Frais de démarcheur", v: fcfa(0) },
    ],
    totalIn: 480000,
    reviewList: [],
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    text: "« Ce qui m'a décidé, c'est la ligne “compteur SBEE individuel” écrite sur l'annonce. Avant, je découvrais ça après avoir versé l'avance. »",
    who: "Moïse T.",
    role: "Locataire à Tankpè, Abomey-Calavi",
  },
  {
    text: "« J'ai loué mon appartement en onze jours sans qu'un démarcheur y passe. Les visiteurs arrivaient en connaissant déjà le loyer et l'avance. »",
    who: "M. Adjovi Kossi",
    role: "Propriétaire à Fidjrossè, Cotonou",
  },
  {
    text: "« Cinq mille francs pour trente jours, c'est moins que le mois de commission que je perdais à chaque nouveau locataire. »",
    who: "Mme Tossou Alice",
    role: "Propriétaire à Sainte-Rita, Cotonou",
  },
];

export const FAQ: FaqItem[] = [
  {
    q: "Faut-il payer pour chercher un logement ?",
    a: "Non. La recherche, les demandes de visite et le contact avec le propriétaire sont gratuits pour les locataires. Seuls les propriétaires paient la publication de leur annonce.",
  },
  {
    q: "Comment savez-vous que le propriétaire est bien le propriétaire ?",
    a: "Avant toute mise en ligne, nous contrôlons une pièce d'identité et un titre de propriété : attestation de recasement, convention de vente ou titre foncier. Une annonce dont les documents ne concordent pas n'est pas publiée.",
  },
  {
    q: "Et si l'on me demande de l'argent pour visiter ?",
    a: "Aucune somme n'est due avant la visite, ni pour l'obtenir. Signalez-nous la demande : le compte concerné est suspendu le temps du contrôle.",
  },
  {
    q: "Le bail se signe-t-il sur le site ?",
    a: "Non. Le site vous met en relation et fixe le rendez-vous. Le bail se conclut entre vous et le propriétaire, comme d'habitude.",
  },
  {
    q: "Combien de temps une annonce reste-t-elle en ligne ?",
    a: "Trente jours par publication. Le propriétaire la renouvelle tant que le bien est libre, et elle disparaît d'elle-même dès qu'il ne fait rien.",
  },
  {
    q: "Quelles villes sont couvertes ?",
    a: "Cotonou, Abomey-Calavi, Porto-Novo et Ouidah pour le lancement. Les villes suivantes seront ouvertes selon les demandes que nous recevons.",
  },
];

export const VISIT_SLOTS: VisitSlot[] = [
  { day: "Samedi", date: "12 sept.", time: "09h00 – 09h30" },
  { day: "Samedi", date: "12 sept.", time: "11h00 – 11h30" },
  { day: "Dimanche", date: "13 sept.", time: "16h00 – 16h30" },
  { day: "Mardi", date: "15 sept.", time: "17h30 – 18h00" },
  { day: "Mercredi", date: "16 sept.", time: "08h00 – 08h30" },
  { day: "Samedi", date: "19 sept.", time: "10h00 – 10h30" },
];

/* --- Fonctions d'accès (remplacées plus tard par des requêtes base de données) --- */

export function getAllListings(): Listing[] {
  return LISTINGS;
}

export function getFeaturedListings(): Listing[] {
  return LISTINGS.filter((l) => l.featured);
}

export function getListing(ref: string): Listing | undefined {
  return LISTINGS.find((l) => l.ref === ref);
}
