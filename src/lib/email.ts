import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMentionEmail(
  to: string,
  mentionedBy: string,
  pulseTitle: string,
  comment: string,
) {
  await resend.emails.send({
    from: "TeamPulse <onboarding@resend.dev>",
    to,
    subject: `${mentionedBy} mentioned you in "${pulseTitle}"`,
    text: `${mentionedBy} mentioned you in a comment on "${pulseTitle}":\n\n"${comment}"`,
  });
}
