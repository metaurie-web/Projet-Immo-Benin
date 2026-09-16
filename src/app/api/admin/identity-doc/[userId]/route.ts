import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { get } from "@vercel/blob";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

/* Sert le document d'identité d'un propriétaire — réservé aux administrateurs.
   Le document est stocké dans un store Blob PRIVÉ : personne d'autre que ce
   serveur (muni du jeton privé) ne peut le lire. On le relaie ici plutôt que
   d'exposer une URL Blob directe à l'admin. */

type Params = { params: Promise<{ userId: string }> };

export async function GET(_request: Request, { params }: Params): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Accès réservé aux administrateurs." }, { status: 403 });
  }

  const { userId } = await params;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { identityDocUrl: true },
  });
  if (!user?.identityDocUrl) {
    return NextResponse.json({ error: "Aucun document pour ce compte." }, { status: 404 });
  }

  const token = process.env.BLOB_PRIVATE_READ_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "Stockage sécurisé non configuré." }, { status: 503 });
  }

  const result = await get(user.identityDocUrl, { access: "private", token });
  if (!result || result.statusCode !== 200) {
    return NextResponse.json({ error: "Document introuvable." }, { status: 404 });
  }

  return new NextResponse(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType,
      "Cache-Control": "private, no-store",
    },
  });
}
