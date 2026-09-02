/**
 * Customer messaging adapters: email via Resend or SMTP, SMS via Twilio.
 * When nothing is connected the message is recorded as "simulated".
 */
export interface EmailCredentials {
  provider: "resend" | "smtp";
  from: string;
  apiKey?: string; // Resend
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
}

export interface SmsCredentials {
  provider: "twilio";
  accountSid: string;
  authToken: string;
  from: string;
}

export interface SendResult {
  status: "sent" | "simulated" | "failed";
  provider: string;
  providerMessageId?: string;
  error?: string;
}

export async function sendEmail(
  creds: EmailCredentials | null,
  message: { to: string; subject: string; text: string; html?: string }
): Promise<SendResult> {
  if (!creds) return { status: "simulated", provider: "none" };
  try {
    if (creds.provider === "resend") {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${creds.apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: creds.from, to: [message.to], subject: message.subject, text: message.text, html: message.html ?? textToHtml(message.text) }),
      });
      if (!res.ok) throw new Error(`Resend error ${res.status}: ${await res.text()}`);
      const json = (await res.json()) as { id: string };
      return { status: "sent", provider: "resend", providerMessageId: json.id };
    }
    // SMTP through nodemailer (Node runtime action).
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.createTransport({
      host: creds.smtpHost,
      port: creds.smtpPort ?? 587,
      secure: (creds.smtpPort ?? 587) === 465,
      auth: creds.smtpUser ? { user: creds.smtpUser, pass: creds.smtpPass } : undefined,
    });
    const info = await transporter.sendMail({ from: creds.from, to: message.to, subject: message.subject, text: message.text, html: message.html ?? textToHtml(message.text) });
    return { status: "sent", provider: "smtp", providerMessageId: info.messageId };
  } catch (error) {
    return { status: "failed", provider: creds.provider, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function sendSms(creds: SmsCredentials | null, message: { to: string; body: string }): Promise<SendResult> {
  if (!creds) return { status: "simulated", provider: "none" };
  try {
    const body = new URLSearchParams({ To: message.to, From: creds.from, Body: message.body });
    const auth = Buffer.from(`${creds.accountSid}:${creds.authToken}`).toString("base64");
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${creds.accountSid}/Messages.json`, {
      method: "POST",
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    if (!res.ok) throw new Error(`Twilio error ${res.status}: ${await res.text()}`);
    const json = (await res.json()) as { sid: string };
    return { status: "sent", provider: "twilio", providerMessageId: json.sid };
  } catch (error) {
    return { status: "failed", provider: "twilio", error: error instanceof Error ? error.message : String(error) };
  }
}

export function renderTemplate(template: string, vars: Record<string, string | number | undefined>): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => {
    const value = vars[key];
    return value === undefined || value === null ? "" : String(value);
  });
}

function textToHtml(text: string): string {
  const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const linked = escaped.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1">$1</a>');
  return `<div style="font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#222">${linked.replace(/\n/g, "<br/>")}</div>`;
}
