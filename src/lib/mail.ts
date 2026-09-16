/* Envoi de l'email de connexion (lien magique).

   - Si RESEND_API_KEY est renseigné dans .env : l'email part vraiment,
     via Resend.
   - Sinon (cas normal en développement, tant qu'on n'a pas créé de compte
     Resend) : le lien est simplement affiché dans le terminal où tourne
     `npm run dev`. On peut le copier-coller dans le navigateur pour se
     connecter, sans avoir besoin d'un vrai service d'emails. */

import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendMagicLinkEmail({ to, url }: { to: string; url: string }) {
  if (!resend) {
    const line = "─".repeat(64);
    console.log(
      `\n${line}\nLien de connexion pour ${to} (Resend non configuré — voir .env) :\n${url}\n${line}\n`,
    );
    return;
  }

  const from = process.env.EMAIL_FROM || "Mon Appart <onboarding@resend.dev>";

  const { error } = await resend.emails.send({
    from,
    to,
    subject: "Votre lien de connexion — Mon Appart",
    html: renderEmailHtml(url),
  });

  if (error) {
    throw new Error(`Échec de l'envoi de l'email par Resend : ${error.message}`);
  }
}

function renderEmailHtml(url: string) {
  return `
    <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #17181a;">
      <p style="font-size: 24px; margin: 0 0 24px; letter-spacing: -0.01em;">Mon Appart</p>
      <p style="font-size: 15px; line-height: 1.65; color: #3c4046; margin: 0 0 8px;">
        Cliquez sur le bouton ci-dessous pour vous connecter à Mon Appart.
      </p>
      <p style="font-size: 13px; line-height: 1.6; color: #6b7076; margin: 0 0 28px;">
        Ce lien est valable 24 heures et ne peut servir qu'une seule fois.
      </p>
      <p style="margin: 0 0 28px;">
        <a href="${url}"
           style="display:inline-block;background:transparent;border:1px solid #4291bd;
                  border-radius:4px;color:#1f5c80;padding:13px 26px;text-decoration:none;
                  font-size:15px;font-family:Georgia,serif;">
          Me connecter
        </a>
      </p>
      <p style="font-size: 13px; color: #6b7076; line-height: 1.6; margin: 0;">
        Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email.
      </p>
    </div>
  `;
}
