#!/usr/bin/env node
/**
 * Imágenes alineadas al pitch: 1 hero corporativo + 6 momentos del menú.
 * Estética: alta gastronomía orgánica saludable, percepción gourmet,
 * empaques sostenibles, paleta cream / verde botánico oscuro / dorado mostaza.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "..", "public", "img");

const FAL_KEY = process.env.FAL_KEY;
if (!FAL_KEY) { console.error("Falta FAL_KEY"); process.exit(1); }

const STYLE_HERO =
  "luxury corporate catering editorial photography, cinematic golden hour " +
  "window light, hyperrealistic, ultra-detailed 8K, Phase One IQ4 medium " +
  "format aesthetic, palette of warm cream, deep botanical green, marigold " +
  "gold accents, sophisticated and aspirational";

const STYLE_FOOD =
  "high-end food photography on cream linen tablecloth or hand-thrown " +
  "ceramic plates, soft natural daylight from the side, hyperrealistic, " +
  "ultra-detailed 8K, FT Weekend magazine aesthetic, palette of cream and " +
  "earth tones with deep botanical green garnish, organic and gourmet";

const MANIFEST = [
  // ─── HERO corporativo realineado al pitch ─────────────────
  {
    out: "hero/hub-pitch.jpg",
    aspect_ratio: "16:9",
    prompt:
      `Wide elegant corporate event setup at a luxury Colombian conference venue: ` +
      `a long banquet table dressed in cream linen with overflowing organic gourmet ` +
      `bowls of fresh quinoa salads, roasted vegetables, artisan breads, fresh ` +
      `berries, leafy greens centerpieces with white flowers, hand-thrown ceramic ` +
      `serving platters, copper cutlery, fresh herb garnishes, blurred elegant ` +
      `corporate guests in business attire in the background. ${STYLE_HERO}`,
  },

  // ─── 6 MOMENTOS del menú ──────────────────────────────────
  {
    out: "momentos/desayunos.jpg",
    aspect_ratio: "4:3",
    prompt:
      `Corporate executive breakfast spread on a cream linen tablecloth: ` +
      `fresh-pressed orange and green juices in glass carafes, granola parfait ` +
      `with yogurt and Colombian berries layered in glass cups, artisan ` +
      `sourdough toast with smashed avocado and microgreens, mini fruit tarts, ` +
      `single-origin Colombian coffee in ceramic cups, scattered fresh herbs. ` +
      `Soft morning window light, vitalidad y energía. ${STYLE_FOOD}`,
  },
  {
    out: "momentos/refrigerios.jpg",
    aspect_ratio: "4:3",
    prompt:
      `Premium snack bar arrangement on cream marble surface: small bowls of ` +
      `mixed nuts, dried Colombian fruits, dark chocolate truffles dusted with ` +
      `cocoa, energy bites with seeds, hummus with vegetable crudités, ` +
      `artisan crackers, fresh berries, small jars of Colombian honey. ` +
      `Modern minimalist composition, recharging energy aesthetic. ${STYLE_FOOD}`,
  },
  {
    out: "momentos/almuerzos.jpg",
    aspect_ratio: "4:3",
    prompt:
      `Luxury corporate boxed lunches on cream linen: elegant kraft paper boxes ` +
      `with cream branded labels, opened to reveal sections with grilled salmon ` +
      `over quinoa, roasted seasonal vegetables, fresh herb salad with edible ` +
      `flowers, artisan bread roll, small jar of vinaigrette, wooden cutlery. ` +
      `Three boxes arranged in elegant flat-lay composition. Sophisticated ` +
      `premium packaging. ${STYLE_FOOD}`,
  },
  {
    out: "momentos/cenas.jpg",
    aspect_ratio: "4:3",
    prompt:
      `Plated fine dining course at a corporate gala dinner: a single elegant ` +
      `cream ceramic plate with sous-vide beef tenderloin, parsnip purée, ` +
      `seasonal roasted root vegetables, micro herb garnish, drizzle of reduction ` +
      `sauce in artistic pattern. Dim moody candlelight, blurred crystal glassware ` +
      `and silver cutlery in background. Vogue-level haute cuisine. ${STYLE_FOOD}`,
  },
  {
    out: "momentos/mesas-experiencia.jpg",
    aspect_ratio: "4:3",
    prompt:
      `Artisan dessert station setup: tiered cream ceramic stands with hand-crafted ` +
      `macarons in pastel colors, mini lemon tarts with meringue, chocolate truffles, ` +
      `Colombian artisan cheeses with fig jam and honeycomb, fresh fruit bites, ` +
      `dried flowers and rosemary sprigs as decoration, cream linen runner. ` +
      `Editorial pastry magazine cover composition. ${STYLE_FOOD}`,
  },
  {
    out: "momentos/cocteleria.jpg",
    aspect_ratio: "4:3",
    prompt:
      `Healthy mixology bar setup at a corporate event: three elegant cocktails ` +
      `on a wooden bar — one cucumber-mint refresher in a coupe glass, one ` +
      `Colombian maracuyá spritz in a tumbler with golden rim, one botanical ` +
      `gin tonic with rosemary and Colombian berries — beside them fresh ` +
      `botanicals, sliced citrus, bottles of artisan tonic, and a curated ` +
      `selection of premium spirits in soft warm light. ${STYLE_FOOD}`,
  },

  // ─── COBERTURA · imagen para la sección de las 6 ciudades ──
  {
    out: "cobertura/colombia.jpg",
    aspect_ratio: "16:9",
    prompt:
      `Aerial top-down view of a hand-drawn artistic map of Colombia on cream ` +
      `aged paper, with small pinned location markers in deep botanical green on ` +
      `Medellín, Bogotá, Cali, Barranquilla, Cartagena and Armenia. A small brass ` +
      `compass and a sprig of fresh rosemary rest on the paper. Soft window ` +
      `light from above. ${STYLE_HERO}`,
  },
];

// helpers (idem al script anterior)
async function postQueue(prompt, aspect_ratio) {
  const res = await fetch("https://queue.fal.run/fal-ai/flux-pro/v1.1-ultra", {
    method: "POST",
    headers: { Authorization: `Key ${FAL_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, aspect_ratio, num_images: 1, enable_safety_checker: true, output_format: "jpeg", raw: false }),
  });
  if (!res.ok) throw new Error(`fal ${res.status}: ${(await res.text()).slice(0,200)}`);
  return res.json();
}

async function pollResult(statusUrl, responseUrl) {
  for (let i = 0; i < 60; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const sres = await fetch(statusUrl, { headers: { Authorization: `Key ${FAL_KEY}` } });
    const s = await sres.json();
    if (s.status === "COMPLETED") {
      const rres = await fetch(responseUrl, { headers: { Authorization: `Key ${FAL_KEY}` } });
      return rres.json();
    }
    if (s.status === "FAILED") throw new Error("fal failed");
  }
  throw new Error("fal timeout");
}

async function downloadTo(url, outPath) {
  const r = await fetch(url);
  const buf = Buffer.from(await r.arrayBuffer());
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, buf);
  return buf.length;
}

async function generateOne(item) {
  const outPath = path.join(OUT, item.out);
  try { await fs.access(outPath); return { ...item, skipped: true }; } catch {}
  const t0 = Date.now();
  const queue = await postQueue(item.prompt, item.aspect_ratio);
  const result = await pollResult(queue.status_url, queue.response_url);
  const url = result.images?.[0]?.url;
  if (!url) throw new Error("no url");
  const bytes = await downloadTo(url, outPath);
  return { ...item, bytes, elapsed: Math.round((Date.now()-t0)/1000) };
}

console.log(`Generando ${MANIFEST.length} imágenes alineadas al pitch…\n`);
const results = await Promise.all(MANIFEST.map(generateOne));
console.log("");
for (const r of results) {
  console.log(r.skipped ? `SKIP ${r.out}` : `OK  ${r.elapsed}s · ${(r.bytes/1024).toFixed(0)}KB  ${r.out}`);
}
