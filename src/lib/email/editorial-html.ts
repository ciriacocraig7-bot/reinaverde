/**
 * Helper para emails editoriales premium.
 *
 * Devuelve HTML con estilos inline (los clientes de email son hostiles a CSS
 * externo). Mantiene la voz visual del sitio: Fraunces serif para
 * headlines (fallback Georgia), Geist mono fallback (Courier New), paleta
 * ink/cream/marigold/iris/persimmon.
 *
 * El resultado es safe para Gmail, Outlook, Apple Mail, Yahoo.
 */

export type EmailAccent = "marigold" | "iris" | "persimmon" | "ink";

const ACCENT_HEX: Record<EmailAccent, { primary: string; deep: string; tinted: string }> = {
  marigold:  { primary: "#e8b85d", deep: "#7a3a18", tinted: "#fdf5e3" },
  iris:      { primary: "#8c9eff", deep: "#4250a3", tinted: "#eef0ff" },
  persimmon: { primary: "#e07852", deep: "#8e3b1f", tinted: "#fcebe1" },
  ink:       { primary: "#1f1d1a", deep: "#1f1d1a", tinted: "#f0ede4" },
};

export interface EmailSection {
  eyebrow?: string;
  title?: string;
  body?: string | string[];
  cta?: { label: string; href: string };
}

export interface EditorialEmailArgs {
  /** Color de la línea ("marigold" catering / "iris" pharma / "persimmon" liofilizados / "ink" genérico). */
  accent?: EmailAccent;
  /** Pequeño eyebrow mono encima del headline principal. */
  preheader?: string;
  /** Texto que se ve en la lista de inbox (oculto en el cuerpo). */
  hiddenPreview?: string;
  /** Headline principal. */
  headline: string;
  /** Italic kicker debajo del headline. */
  kicker?: string;
  /** Secciones intermedias del email. */
  sections?: EmailSection[];
  /** Footer firmado. */
  footerSignature?: string;
  /** Nota final pequeña (legal / contacto / footer). */
  footerNote?: string;
}

/**
 * Genera el HTML completo del email. Devuelve un string listo para mandar.
 */
export function buildEditorialEmail(args: EditorialEmailArgs): string {
  const accent = ACCENT_HEX[args.accent ?? "marigold"];
  const sections = args.sections ?? [];

  const sectionsHtml = sections
    .map((s) => renderSection(s, accent))
    .join("\n");

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${escapeHtml(args.headline)}</title>
</head>
<body style="margin:0;padding:0;background:#faf7f1;font-family:Georgia,'Times New Roman',serif;color:#1f1d1a;-webkit-font-smoothing:antialiased;">
  ${
    args.hiddenPreview
      ? `<div style="display:none!important;visibility:hidden;opacity:0;height:0;overflow:hidden;mso-hide:all;">${escapeHtml(args.hiddenPreview)}</div>`
      : ""
  }
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#faf7f1;">
    <tr>
      <td align="center" style="padding:32px 16px 24px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;">

          <!-- Brand header -->
          <tr>
            <td style="padding:0 24px 24px 24px;border-bottom:1px solid rgba(31,29,26,0.18);">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="font-family:Georgia,serif;font-style:italic;font-size:30px;color:#1f1d1a;letter-spacing:-1px;line-height:1;">
                    Reina<span style="color:rgba(31,29,26,0.55);">·</span>Verde
                  </td>
                  <td align="right" style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:2px;color:rgba(31,29,26,0.55);text-transform:uppercase;vertical-align:bottom;">
                    Bogotá · Catering
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${
            args.preheader
              ? `<tr><td style="padding:32px 24px 4px 24px;">
                  <span style="font-family:'Courier New',monospace;font-size:10.5px;letter-spacing:3px;color:${accent.deep};text-transform:uppercase;">
                    § ${escapeHtml(args.preheader)}
                  </span>
                </td></tr>`
              : ""
          }

          <!-- Hero headline -->
          <tr>
            <td style="padding:${args.preheader ? "4px" : "32px"} 24px 16px 24px;">
              <h1 style="margin:0;font-family:Georgia,serif;font-weight:300;font-size:44px;line-height:1.02;letter-spacing:-1.5px;color:#1f1d1a;">
                ${escapeHtml(args.headline)}<span style="color:${accent.primary};">.</span>
              </h1>
            </td>
          </tr>

          ${
            args.kicker
              ? `<tr><td style="padding:8px 24px 28px 24px;">
                  <p style="margin:0;font-family:Georgia,serif;font-style:italic;font-size:18px;line-height:1.4;color:rgba(31,29,26,0.78);">
                    ${escapeHtml(args.kicker)}
                  </p>
                </td></tr>`
              : ""
          }

          ${sectionsHtml}

          <!-- Signature -->
          ${
            args.footerSignature
              ? `<tr><td style="padding:32px 24px 8px 24px;">
                  <p style="margin:0;font-family:Georgia,serif;font-style:italic;font-size:20px;color:#1f1d1a;">
                    ${escapeHtml(args.footerSignature)}
                  </p>
                </td></tr>`
              : ""
          }

          <!-- Footer note -->
          ${
            args.footerNote
              ? `<tr><td style="padding:24px 24px 32px 24px;border-top:1px solid rgba(31,29,26,0.15);">
                  <p style="margin:0;font-family:'Courier New',monospace;font-size:10.5px;line-height:1.6;letter-spacing:1.5px;color:rgba(31,29,26,0.55);text-transform:uppercase;">
                    ${escapeHtml(args.footerNote)}
                  </p>
                </td></tr>`
              : ""
          }

          <!-- Brand mark -->
          <tr>
            <td style="padding:0 24px 16px 24px;text-align:center;">
              <p style="margin:24px 0 0 0;font-family:'Courier New',monospace;font-size:9.5px;letter-spacing:2.5px;color:rgba(31,29,26,0.45);text-transform:uppercase;">
                Reina Verde · reinaverdecatering@gmail.com · (+57) 314 790 5135
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function renderSection(section: EmailSection, accent: { primary: string; deep: string; tinted: string }): string {
  const bodyParas = Array.isArray(section.body) ? section.body : section.body ? [section.body] : [];

  const eyebrowHtml = section.eyebrow
    ? `<p style="margin:0 0 8px 0;font-family:'Courier New',monospace;font-size:10.5px;letter-spacing:3px;color:${accent.deep};text-transform:uppercase;">
        § ${escapeHtml(section.eyebrow)}
      </p>`
    : "";

  const titleHtml = section.title
    ? `<h2 style="margin:0 0 12px 0;font-family:Georgia,serif;font-weight:400;font-size:24px;line-height:1.15;letter-spacing:-0.5px;color:#1f1d1a;">
        ${escapeHtml(section.title)}
      </h2>`
    : "";

  const bodyHtml = bodyParas
    .map(
      (p) =>
        `<p style="margin:0 0 12px 0;font-family:Georgia,serif;font-size:16px;line-height:1.55;color:rgba(31,29,26,0.82);">
          ${escapeHtml(p)}
        </p>`,
    )
    .join("");

  const ctaHtml = section.cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:18px;">
        <tr>
          <td style="background:#1f1d1a;border-radius:0;">
            <a href="${escapeAttr(section.cta.href)}" style="display:inline-block;padding:14px 28px;font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#faf7f1;text-decoration:none;letter-spacing:-0.2px;">
              ${escapeHtml(section.cta.label)} →
            </a>
          </td>
        </tr>
      </table>`
    : "";

  return `<tr><td style="padding:24px 24px 16px 24px;">
    ${eyebrowHtml}
    ${titleHtml}
    ${bodyHtml}
    ${ctaHtml}
  </td></tr>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(s: string): string {
  return escapeHtml(s).replace(/`/g, "&#96;");
}
