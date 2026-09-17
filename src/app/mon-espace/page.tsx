import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

/* Aucune interface ici : c'est un simple aiguillage.
   Destination par défaut après connexion (voir SignInForm) — envoie chacun
   vers SON espace selon son rôle, sans jamais avoir à deviner l'URL. */
export default async function MonEspacePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/connexion?callbackUrl=/mon-espace");

  switch (session.user.role) {
    case "admin":
      redirect("/admin");
    case "proprietaire":
      redirect("/espace-proprietaire");
    default:
      redirect("/espace-visiteur");
  }
}
