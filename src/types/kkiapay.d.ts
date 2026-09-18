/* Le widget KKiaPay (chargé via <Script src="https://cdn.kkiapay.me/k.js">
   dans src/app/layout.tsx) pose ces fonctions sur `window` — aucun paquet
   npm ne les fournit côté client, d'où ces déclarations manuelles. */

export {};

declare global {
  interface Window {
    openKkiapayWidget?: (options: {
      amount: number;
      key: string;
      position?: "left" | "right" | "center";
      callback?: string;
      data?: string;
      sandbox?: boolean;
      theme?: string;
    }) => void;
    addSuccessListener?: (callback: (response: { transactionId: string }) => void) => void;
    addFailedListener?: (callback: (error: unknown) => void) => void;
  }
}
