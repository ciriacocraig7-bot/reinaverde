/**
 * Transactional email — provider-agnostic façade.
 *
 * In production set `EMAIL_PROVIDER=resend` and `RESEND_API_KEY`; otherwise
 * the implementation logs the message to stdout (useful for local dev and
 * for CI runs that shouldn't actually send mail).
 *
 * The shape of `send()` matches what Resend, Postmark, and Mailgun expect,
 * so swapping providers later is a single file change.
 */

export interface SendArgs {
  to: string;
  subject: string;
  text: string;
  html?: string;
  from?: string;
}

const FROM_DEFAULT = process.env.EMAIL_FROM || "Reina Verde <no-reply@reinaverde.co>";

export async function sendEmail(args: SendArgs): Promise<{ ok: boolean; provider: string }> {
  const provider = process.env.EMAIL_PROVIDER || "log";

  if (provider === "resend" && process.env.RESEND_API_KEY) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: args.from ?? FROM_DEFAULT,
        to: args.to,
        subject: args.subject,
        text: args.text,
        html: args.html,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      // eslint-disable-next-line no-console
      console.error(
        JSON.stringify({ event: "email.resend-failed", status: res.status, body }),
      );
      return { ok: false, provider: "resend" };
    }
    return { ok: true, provider: "resend" };
  }

  // Default: log only. Keeps local dev frictionless.
  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify({
      event: "email.logged",
      provider: "log",
      ts: new Date().toISOString(),
      to: args.to,
      from: args.from ?? FROM_DEFAULT,
      subject: args.subject,
      text: args.text,
    }),
  );
  return { ok: true, provider: "log" };
}
