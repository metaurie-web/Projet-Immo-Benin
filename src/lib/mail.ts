/* Emails transactionnels du site (connexion, demandes de visite).

   - Si BREVO_API_KEY est renseigné dans .env : l'email part vraiment, via
     l'API Brevo (https://api.brevo.com/v3/smtp/email — pas de SDK, un
     simple fetch suffit).
   - Sinon (cas normal en développement, tant qu'on n'a pas de clé Brevo) :
     un résumé s'affiche dans le terminal où tourne `npm run dev` au lieu
     d'être vraiment envoyé — pratique pour tester sans rien créer.

   EMAIL_FROM doit être une adresse déjà validée comme expéditeur dans le
   compte Brevo (Senders, Domains & Dedicated IPs) — sinon Brevo refuse
   d'envoyer, quel que soit le destinataire. */

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const FROM = process.env.EMAIL_FROM || "Mon Appart <no-reply@example.com>";

/** "Nom <email>" -> { name, email } ; accepte aussi une simple adresse seule. */
function parseFrom(raw: string): { name?: string; email: string } {
  const match = raw.match(/^(.*)<(.+)>$/);
  if (!match) return { email: raw.trim() };
  return { name: match[1].trim() || undefined, email: match[2].trim() };
}

async function sendEmail({
  to,
  subject,
  html,
  fallbackLines,
}: {
  to: string;
  subject: string;
  html: string;
  /** Ce qui s'affiche dans le terminal quand Brevo n'est pas configuré. */
  fallbackLines: string[];
}) {
  if (!BREVO_API_KEY) {
    const line = "─".repeat(64);
    console.log(
      `\n${line}\n[email non envoyé — Brevo non configuré] à ${to}\nSujet : ${subject}\n${fallbackLines.join("\n")}\n${line}\n`,
    );
    return;
  }

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: parseFrom(FROM),
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(`Échec de l'envoi de l'email par Brevo : ${body?.message ?? res.statusText}`);
  }
}

function shell(bodyHtml: string) {
  return `
    <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #17181a;">
      <p style="font-size: 24px; margin: 0 0 24px; letter-spacing: -0.01em;">Mon Appart</p>
      ${bodyHtml}
    </div>
  `;
}

function button(label: string, url: string) {
  return `
    <p style="margin: 0 0 28px;">
      <a href="${url}"
         style="display:inline-block;background:transparent;border:1px solid #4291bd;
                border-radius:4px;color:#1f5c80;padding:13px 26px;text-decoration:none;
                font-size:15px;font-family:Georgia,serif;">
        ${label}
      </a>
    </p>
  `;
}

/* ---------------------------------------------------------------------- */
/*  Connexion par lien magique                                             */
/* ---------------------------------------------------------------------- */

export async function sendMagicLinkEmail({ to, url }: { to: string; url: string }) {
  await sendEmail({
    to,
    subject: "Votre lien de connexion — Mon Appart",
    fallbackLines: [url],
    html: shell(`
      <p style="font-size: 15px; line-height: 1.65; color: #3c4046; margin: 0 0 8px;">
        Cliquez sur le bouton ci-dessous pour vous connecter à Mon Appart.
      </p>
      <p style="font-size: 13px; line-height: 1.6; color: #6b7076; margin: 0 0 28px;">
        Ce lien est valable 24 heures et ne peut servir qu'une seule fois.
      </p>
      ${button("Me connecter", url)}
      <p style="font-size: 13px; color: #6b7076; line-height: 1.6; margin: 0;">
        Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email.
      </p>
    `),
  });
}

/* ---------------------------------------------------------------------- */
/*  Demandes de visite                                                     */
/* ---------------------------------------------------------------------- */

/** Au propriétaire, dès qu'un visiteur dépose une demande. */
export async function sendVisitRequestEmail({
  to,
  listingTitle,
  slotLabel,
  visitorName,
  visitorPhone,
  message,
  dashboardUrl,
}: {
  to: string;
  listingTitle: string;
  slotLabel: string;
  visitorName: string;
  visitorPhone: string;
  message?: string | null;
  dashboardUrl: string;
}) {
  await sendEmail({
    to,
    subject: `Nouvelle demande de visite — ${listingTitle}`,
    fallbackLines: [
      `Bien : ${listingTitle}`,
      `Créneau : ${slotLabel}`,
      `Visiteur : ${visitorName} (${visitorPhone})`,
      message ? `Message : ${message}` : "",
      `Confirmer/refuser : ${dashboardUrl}`,
    ].filter(Boolean),
    html: shell(`
      <p style="font-size: 15px; line-height: 1.65; color: #3c4046; margin: 0 0 20px;">
        <strong>${visitorName}</strong> souhaite visiter <strong>${listingTitle}</strong>,
        le créneau : <strong>${slotLabel}</strong>.
      </p>
      <p style="font-size: 14px; line-height: 1.6; color: #3c4046; margin: 0 0 8px;">
        Téléphone : ${visitorPhone}
      </p>
      ${
        message
          ? `<p style="font-size: 14px; line-height: 1.6; color: #3c4046; margin: 0 0 24px;">
               Message : « ${message} »
             </p>`
          : `<div style="margin-bottom: 16px;"></div>`
      }
      ${button("Confirmer ou refuser", dashboardUrl)}
      <p style="font-size: 13px; color: #6b7076; line-height: 1.6; margin: 0;">
        Le visiteur reçoit un email dès que vous confirmez ou refusez sa demande.
      </p>
    `),
  });
}

/** Au visiteur, quand le propriétaire confirme (ou refuse) sa demande. */
export async function sendVisitStatusEmail({
  to,
  listingTitle,
  slotLabel,
  confirmed,
  listingUrl,
}: {
  to: string;
  listingTitle: string;
  slotLabel: string;
  confirmed: boolean;
  listingUrl: string;
}) {
  const subject = confirmed
    ? `Visite confirmée — ${listingTitle}`
    : `Visite non retenue — ${listingTitle}`;

  await sendEmail({
    to,
    subject,
    fallbackLines: [`Bien : ${listingTitle}`, `Créneau : ${slotLabel}`, `Statut : ${confirmed ? "confirmée" : "refusée"}`],
    html: shell(
      confirmed
        ? `
          <p style="font-size: 15px; line-height: 1.65; color: #3c4046; margin: 0 0 8px;">
            Votre visite de <strong>${listingTitle}</strong> est confirmée pour le
            <strong>${slotLabel}</strong>.
          </p>
          <p style="font-size: 13px; line-height: 1.6; color: #6b7076; margin: 0 0 28px;">
            Le propriétaire vous attend à ce créneau. Aucune somme n'est à verser avant la visite.
          </p>
          ${button("Revoir l'annonce", listingUrl)}
        `
        : `
          <p style="font-size: 15px; line-height: 1.65; color: #3c4046; margin: 0 0 8px;">
            Le propriétaire n'a pas pu retenir votre demande pour <strong>${listingTitle}</strong>
            (créneau du ${slotLabel}).
          </p>
          <p style="font-size: 13px; line-height: 1.6; color: #6b7076; margin: 0 0 28px;">
            Vous pouvez choisir un autre créneau proposé sur l'annonce, s'il y en a.
          </p>
          ${button("Revoir l'annonce", listingUrl)}
        `,
    ),
  });
}
