/* Vérification serveur des paiements KKiaPay (Mobile Money).

   Le widget côté client (voir src/app/layout.tsx et src/types/kkiapay.d.ts)
   ne fait qu'INITIER le paiement : ne jamais faire confiance à son seul
   événement de succès, falsifiable depuis le navigateur. Chaque action
   serveur qui exploite un paiement (demande de visite, publication d'une
   annonce) doit revérifier ici la transaction — montant exact et statut
   "SUCCESS" — avant d'écrire quoi que ce soit en base. */

import { kkiapay } from "@kkiapay-org/nodejs-sdk";

const SANDBOX = process.env.NEXT_PUBLIC_KKIAPAY_SANDBOX !== "false";

function client() {
  const publickey = process.env.NEXT_PUBLIC_KKIAPAY_PUBLIC_KEY;
  const privatekey = process.env.KKIAPAY_PRIVATE_KEY;
  const secretkey = process.env.KKIAPAY_SECRET_KEY;
  if (!publickey || !privatekey || !secretkey) {
    throw new Error("Paiement indisponible : KKiaPay n'est pas configuré.");
  }
  return kkiapay({ publickey, privatekey, secretkey, sandbox: SANDBOX });
}

/** Vérifie qu'une transaction KKiaPay a bien réussi et correspond au
 *  montant attendu. Lève une erreur (message affichable tel quel) sinon —
 *  à appeler avant toute écriture en base liée à ce paiement. */
export async function verifyKkiapayTransaction(
  transactionId: string,
  expectedAmountFcfa: number,
): Promise<void> {
  let result: { status?: string; amount?: number | string };
  try {
    result = await client().verify(transactionId);
  } catch {
    throw new Error("Paiement introuvable. Réessaie, ou contacte-nous si la somme a été débitée.");
  }

  if (result?.status !== "SUCCESS") {
    throw new Error("Le paiement n'a pas abouti. Réessaie.");
  }
  if (Number(result.amount) !== expectedAmountFcfa) {
    throw new Error("Le montant payé ne correspond pas à celui attendu.");
  }
}
