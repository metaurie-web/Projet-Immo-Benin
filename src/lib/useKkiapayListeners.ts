"use client";

import { useEffect } from "react";

/** Enregistre les listeners globaux du widget KKiaPay (voir
 *  src/types/kkiapay.d.ts et src/app/layout.tsx pour le chargement du
 *  script). Le script est chargé en `afterInteractive` : il peut ne pas
 *  encore être prêt au montage du composant qui appelle ce hook, d'où la
 *  nouvelle tentative jusqu'à ce que `window.addSuccessListener` existe —
 *  sans ça, un enregistrement raté silencieusement (juste un `?.`) laisse
 *  le paiement réussir côté KKiaPay sans jamais prévenir l'application. */
export function useKkiapayListeners(
  onSuccess: (response: { transactionId: string }) => void,
  onFailed: () => void,
) {
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    function register() {
      if (cancelled) return;
      if (!window.addSuccessListener || !window.addFailedListener) {
        timer = setTimeout(register, 150);
        return;
      }
      window.addSuccessListener(onSuccess);
      window.addFailedListener(onFailed);
    }
    register();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
