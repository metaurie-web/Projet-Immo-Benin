"use server";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { put } from "@vercel/blob";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const MAX_SIZE = 10 * 1024 * 1024; // 10 Mo

export type UploadIdentityDocResult = { ok: true; url: string } | { ok: false; error: string };

/** Envoie la pièce d'identité vers le store Blob PRIVÉ, côté serveur.
 *
 *  Contrairement aux photos (store public, upload direct navigateur → Blob),
 *  un store PRIVÉ n'accepte pas cette voie directe : le fichier transite
 *  donc par cette action serveur, qui seule détient le jeton privé. */
export async function uploadIdentityDoc(formData: FormData): Promise<UploadIdentityDocResult> {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/connexion?callbackUrl=/verification-identite");

  const token = process.env.BLOB_PRIVATE_READ_WRITE_TOKEN;
  if (!token) {
    return { ok: false, error: "Le stockage sécurisé des documents n'est pas encore configuré." };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, error: "Aucun fichier reçu." };
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { ok: false, error: "Format non accepté : utilise une image JPEG/PNG ou un PDF." };
  }
  if (file.size > MAX_SIZE) {
    return { ok: false, error: "Fichier trop volumineux (10 Mo maximum)." };
  }

  const blob = await put(`identite/${session.user.id}/${Date.now()}-${file.name}`, file, {
    access: "private",
    addRandomSuffix: true,
    contentType: file.type,
    token,
  });

  return { ok: true, url: blob.url };
}

export type SubmitVerificationResult = { ok: true } | { ok: false; error: string };

/** Envoie le compte connecté en file de vérification d'identité. */
export async function submitVerification(identityDocUrl: string): Promise<SubmitVerificationResult> {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/connexion?callbackUrl=/verification-identite");

  if (!identityDocUrl) {
    return { ok: false, error: "Joins d'abord ta pièce d'identité." };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      identityDocUrl,
      verificationStatus: "en_attente",
      verificationNote: null,
      verifiedAt: null,
    },
  });

  return { ok: true };
}
