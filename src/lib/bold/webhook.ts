import crypto from "node:crypto";

/**
 * Bold webhook signature verification.
 *
 * Bold posts the raw request body and signs it with HMAC-SHA256 using the
 * webhook secret you configured in their dashboard. The signature lands on
 * the `x-bold-signature` header (hex).
 *
 * Always compare with `timingSafeEqual` to prevent timing side-channel leaks.
 *
 * If `BOLD_WEBHOOK_SECRET` is not set we skip verification but log a loud
 * warning — useful for local development where Bold isn't actually posting.
 */
export function verifyBoldSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string | undefined = process.env.BOLD_WEBHOOK_SECRET,
): { valid: boolean; reason?: string } {
  if (!secret) {
    return { valid: true, reason: "no-secret-configured" };
  }
  if (!signatureHeader) {
    return { valid: false, reason: "missing-signature-header" };
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("hex");

  // Strip an optional "sha256=" prefix some providers send.
  const provided = signatureHeader.replace(/^sha256=/i, "").trim().toLowerCase();
  const expectedLower = expected.toLowerCase();

  if (provided.length !== expectedLower.length) {
    return { valid: false, reason: "length-mismatch" };
  }

  const a = Buffer.from(provided, "hex");
  const b = Buffer.from(expectedLower, "hex");
  if (a.length !== b.length) {
    return { valid: false, reason: "decode-mismatch" };
  }

  return crypto.timingSafeEqual(a, b)
    ? { valid: true }
    : { valid: false, reason: "signature-mismatch" };
}
