import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/* Cette route ne transporte jamais le fichier lui-même : le navigateur
   envoie la photo directement à Vercel Blob. Ici, on délivre juste un
   jeton d'upload de courte durée — et on vérifie qu'une personne connectée
   le demande, pour que la route ne serve pas de porte dérobée. */
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const session = await getServerSession(authOptions);
        if (!session) {
          throw new Error("Connexion requise pour envoyer une photo.");
        }
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
          addRandomSuffix: true,
          maximumSizeInBytes: 8 * 1024 * 1024, // 8 Mo
          tokenPayload: JSON.stringify({ userId: session.user.id }),
        };
      },
      onUploadCompleted: async () => {
        // Rien à faire ici pour l'instant : l'URL renvoyée au navigateur
        // suffit, elle est enregistrée avec l'annonce à la publication.
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
