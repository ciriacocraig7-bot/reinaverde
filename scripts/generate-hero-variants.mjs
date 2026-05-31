#!/usr/bin/env node
/**
 * Genera 3 variantes alternativas del hero del hub para elegir la mejor.
 * Las guarda en `public/img/hero/hub-v{1,2,3}.jpg`.
 *
 * Cada variante explora una dirección estética distinta:
 *   v1 — Caravaggio chiaroscuro (drama, sombras profundas)
 *   v2 — Botánica vintage (tipo herbario científico siglo XIX modernizado)
 *   v3 — Editorial wide-angle (composición cinematográfica panorámica)
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "img", "hero");

const FAL_KEY = process.env.FAL_KEY;
if (!FAL_KEY) {
  console.error("Falta FAL_KEY en .env");
  process.exit(1);
}

const VARIANTS = [
  {
    out: "hub-v1.jpg",
    label: "Caravaggio chiaroscuro",
    prompt:
      `Dramatic Caravaggio-style still life photography for a luxury magazine cover. ` +
      `Overhead view on a deep walnut wooden table, single shaft of golden window light from the ` +
      `left cutting through near-darkness, casting deep velvet shadows. Three precisely arranged ` +
      `objects in tight asymmetric composition: an amber pharmaceutical dropper bottle with vintage ` +
      `serif label, a single fresh perfect cannabis sativa leaf laid across an aged ivory paper, ` +
      `and a small linen pouch spilling vibrant orange Colombian freeze-dried mango pieces. ` +
      `A single marigold yellow brass tasting spoon catches the light. Crumpled cream linen ` +
      `tablecloth, brass pestle out of focus in the deep shadow. Hyperrealistic, ultra-detailed, ` +
      `8K, Vogue magazine cover aesthetic, Phase One IQ4 medium format aesthetic, dramatic moody ` +
      `chiaroscuro lighting, palette of warm umber, deep ink-green, single marigold accent against ` +
      `near-black background. Razor-sharp focus on the cannabis leaf, rest in painterly bokeh`,
  },
  {
    out: "hub-v2.jpg",
    label: "Botánica vintage modernizada",
    prompt:
      `Magazine editorial spread, top-down flat lay on aged cream paper background with subtle ` +
      `coffee-stain texture. Composition resembles a modern interpretation of a 19th-century ` +
      `botanical plate: a perfect fresh cannabis sativa leaf at the center with handwritten Latin ` +
      `annotations beside it, sprigs of fresh culinary herbs (rosemary, thyme, basil) arranged like ` +
      `pressed specimens with cream string ties, a halved Colombian mango showing its golden flesh ` +
      `next to dried freeze-dried mango chips, and a small amber apothecary bottle with vintage ` +
      `label. Small brass dividers, a calligraphy pen, and minimal serif typography labels reading ` +
      `"Cannabis Sativa", "Mangifera Indica", "Rosmarinus" in ink. Single marigold ribbon detail. ` +
      `Hyperrealistic, ultra-detailed, 8K, Apartamento magazine aesthetic, soft diffuse natural ` +
      `daylight from above, palette of aged cream paper, deep ink-green plants, single marigold ` +
      `accent. Razor-sharp focus throughout, scientific yet artistic`,
  },
  {
    out: "hub-v3.jpg",
    label: "Editorial wide-angle cinematográfico",
    prompt:
      `Cinematic wide-angle establishing shot for a luxury food magazine. A Colombian chef's prep ` +
      `marble counter under golden hour window light, three editorial vignettes spread across the ` +
      `frame in panoramic composition: on the left, a vintage apothecary scale weighing dried hemp ` +
      `flowers with an amber dropper bottle beside it; in the center, a hand-thrown ceramic plate ` +
      `with a small elegant tasting portion of bandeja paisa and a small bouquet of fresh herbs ` +
      `in a brass cup; on the right, an open kraft paper bag with Colombian freeze-dried mango ` +
      `chips spilling onto crumpled cream linen with a single perfect cannabis sativa leaf ` +
      `decorative on top. A blurred figure of a chef working in the deep background. Warm marigold ` +
      `yellow accent in a brass utensil. Hyperrealistic, ultra-detailed, 8K, Kinfolk magazine ` +
      `aesthetic, cinematic Arri Alexa LF look, golden hour rim lighting, palette of cream marble, ` +
      `ink-dark green, brass, single marigold accent. Shallow depth of field with focus on the ` +
      `center vignette, narrative storytelling composition`,
  },
];

async function postQueue(prompt, aspect_ratio) {
  const res = await fetch("https://queue.fal.run/fal-ai/flux-pro/v1.1-ultra", {
    method: "POST",
    headers: {
      Authorization: `Key ${FAL_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      aspect_ratio,
      num_images: 1,
      enable_safety_checker: true,
      output_format: "jpeg",
      raw: false,
    }),
  });
  if (!res.ok) throw new Error(`fal ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

async function pollResult(statusUrl, responseUrl) {
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const sres = await fetch(statusUrl, { headers: { Authorization: `Key ${FAL_KEY}` } });
    const status = await sres.json();
    if (status.status === "COMPLETED") {
      const rres = await fetch(responseUrl, { headers: { Authorization: `Key ${FAL_KEY}` } });
      return rres.json();
    }
    if (status.status === "FAILED") throw new Error("fal failed");
  }
  throw new Error("fal timeout");
}

async function downloadTo(url, outPath) {
  const res = await fetch(url);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, buf);
  return buf.length;
}

await fs.mkdir(OUT_DIR, { recursive: true });
console.log(`Generando ${VARIANTS.length} variantes del hero…\n`);

const results = await Promise.all(
  VARIANTS.map(async (v) => {
    const t0 = Date.now();
    const queue = await postQueue(v.prompt, "16:9");
    const result = await pollResult(queue.status_url, queue.response_url);
    const url = result.images?.[0]?.url;
    if (!url) throw new Error("no image");
    const outPath = path.join(OUT_DIR, v.out);
    const bytes = await downloadTo(url, outPath);
    const elapsed = Math.round((Date.now() - t0) / 1000);
    return { ...v, bytes, elapsed };
  }),
);

console.log("");
for (const r of results) {
  console.log(`[${r.elapsed}s · ${(r.bytes / 1024).toFixed(0)}KB]  ${r.out}  → ${r.label}`);
}
console.log("\nElige la mejor y promuévela copiando sobre hub.jpg.");
