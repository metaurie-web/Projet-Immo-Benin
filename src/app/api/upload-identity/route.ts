import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/* Comme /api/upload, mais pour la pièce d'identité : un store Blob PRIVÉ
   et distinct (BLOB_PRIVATE_READ_WRITE_TOKEN), jamais celui des photos.
   Un document d'identité n'a aucune raison d'être accessible par une URL
   publique. */
export async function POST(request: Request): Promise<NextResponse> {
  const privateToken = process.env.BLOB_PRIVATE_READ_WRITE_TOKEN;
  if (!privateToken) {
    return NextResponse.json(
      { error: "Le stockage sécurisé des documents n'est pas encore configuré." },
      { status: 503 },
    );
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      token: privateToken,
      onBeforeGenerateToken: async () => {
        const session = await getServerSession(authOptions);
        if (!session) {
          throw new Error("Connexion requise pour envoyer un document.");
        }
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "application/pdf"],
          addRandomSuffix: true,
          maximumSizeInBytes: 10 * 1024 * 1024, // 10 Mo
          tokenPayload: JSON.stringify({ userId: session.user.id }),
        };
      },
      onUploadCompleted: async () => {
        // Rien à faire ici : l'URL est enregistrée par submitVerification().
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Échec de l'envoi." },
      { status: 400 },
    );
  }
}
