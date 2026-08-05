import "server-only";

type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim() && process.env.EMAIL_FROM?.trim());
}

/** Envia e-mail via Resend quando configurado; caso contrário só registra no log. */
export async function sendEmail(
  input: SendEmailInput
): Promise<{ sent: boolean; mode: "resend" | "log" }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();

  if (!apiKey || !from) {
    console.info("[email:log]", {
      to: input.to,
      subject: input.subject,
      text: input.text,
    });
    return { sent: false, mode: "log" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      text: input.text,
      html: input.html ?? `<p>${input.text.replace(/\n/g, "<br/>")}</p>`,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Falha ao enviar e-mail (${response.status}): ${body}`);
  }

  return { sent: true, mode: "resend" };
}
