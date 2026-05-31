#!/usr/bin/env node
/**
 * Generador de imágenes con fal.ai · FLUX Pro v1.1 Ultra.
 *
 * Genera todas las imágenes del manifest en paralelo (max 6 a la vez para
 * no saturar la API), las descarga y las guarda en `public/img/<categoria>/`.
 *
 * Uso:
 *   node scripts/generate-images.mjs              # genera todas las pendientes
 *   node scripts/generate-images.mjs --force      # regenera todas
 *   node scripts/generate-images.mjs --only hero  # solo categoria "hero"
 *
 * Requiere FAL_KEY en .env (formato "key_id:secret").
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const PUBLIC_IMG = path.join(ROOT, "public", "img");

const FAL_KEY = process.env.FAL_KEY;
if (!FAL_KEY) {
  console.error("Falta FAL_KEY en .env");
  process.exit(1);
}

/** Convenciones estéticas reutilizables */
const STYLE = {
  // Para hero y secciones grandes
  editorial:
    "editorial magazine photography, cinematic lighting, soft natural light, " +
    "shallow depth of field, hyperrealistic, ultra-detailed, 8K, " +
    "Mamiya RZ67 medium-format film aesthetic, color palette of warm cream, " +
    "ink-dark green, marigold accents",
  // Para productos en fondo limpio
  product:
    "professional product photography on warm cream paper background, " +
    "soft diffused window light from the left, deep shadows, hyperrealistic, " +
    "ultra-sharp, 8K, editorial still life, color palette of cream, ink green, " +
    "raw natural materials",
  // Para platos / catering
  food:
    "overhead food photography on linen tablecloth, warm natural daylight, " +
    "shallow depth of field, hyperrealistic, ultra-detailed, 8K, editorial " +
    "Colombian gastronomy magazine, color palette of cream and earth tones",
};

const MANIFEST = [
  // ────────── HERO · Tier 1 ──────────
  {
    out: "hero/hub.jpg",
    aspect_ratio: "16:9",
    prompt:
      `Botanical still life, three small Colombian plants — a young cannabis sativa leaf cluster, ` +
      `a sprig of fresh culinary herbs, and a slice of dried mango — arranged in three quadrants ` +
      `on aged cream linen, ink-dark green background fading to soft cream. Hand-drawn botanical ` +
      `illustration aesthetic blended with photography. ${STYLE.editorial}`,
  },
  {
    out: "hero/catering.jpg",
    aspect_ratio: "16:9",
    prompt:
      `An elegant Colombian corporate lunch table at a renovated colonial building in Bogotá, ` +
      `dressed with cream linen, copper cutlery, hand-thrown ceramic plates, low fresh greenery, ` +
      `golden hour through tall windows, blurred dinner guests in the background, intimate atmosphere. ${STYLE.editorial}`,
  },
  {
    out: "hero/pharma.jpg",
    aspect_ratio: "16:9",
    prompt:
      `Modern apothecary still life: a small amber glass dropper bottle of CBD oil, fresh cannabis ` +
      `leaves, dried lavender sprigs, and a folded laboratory analysis paper, on a marble surface ` +
      `with soft window light, subtle steam rising from a small ceramic mortar. Calm scientific yet ` +
      `botanical. ${STYLE.editorial}`,
  },
  {
    out: "hero/liofilizados.jpg",
    aspect_ratio: "16:9",
    prompt:
      `Macro photograph of vibrant Colombian freeze-dried fruits spilling out of a folded kraft paper ` +
      `bag: mango chips, golden pineapple, gulupa halves, deep red strawberries, soft yellow uchuva. ` +
      `Crystalline texture visible, on aged cream paper background, warm sidelight. ${STYLE.editorial}`,
  },
  {
    out: "hero/login.jpg",
    aspect_ratio: "3:4",
    prompt:
      `Vertical portrait of an elegant Colombian chef hands plating a small herb garnish on a ` +
      `restaurant pass, soft golden hour light from a window, blurred kitchen background with brass ` +
      `pots, intimate quiet moment. ${STYLE.editorial}`,
  },
  {
    out: "hero/registro.jpg",
    aspect_ratio: "3:4",
    prompt:
      `Vertical portrait, top-down close-up of weathered hands holding a small terracotta pot with ` +
      `a young green sprout, cream linen background, golden morning light, soft shadows. ${STYLE.editorial}`,
  },

  // ────────── CATERING · platos ──────────
  {
    out: "catering/bandeja-paisa.jpg",
    aspect_ratio: "1:1",
    prompt:
      `Executive plating of a deconstructed Colombian bandeja paisa — small portions of slow-braised ` +
      `beef, chorizo, crispy chicharrón, golden plantain, white rice, beans, fried egg — on a ` +
      `hand-thrown ceramic plate, garnished with micro herbs. ${STYLE.food}`,
  },
  {
    out: "catering/salmon-maracuya.jpg",
    aspect_ratio: "1:1",
    prompt:
      `Pan-seared Atlantic salmon fillet glazed with bright orange maracuyá passionfruit reduction, ` +
      `served on a bed of black rice with charred broccolini, on a deep cream ceramic plate. ${STYLE.food}`,
  },
  {
    out: "catering/bowl-vegano.jpg",
    aspect_ratio: "1:1",
    prompt:
      `Tropical vegan grain bowl with quinoa, sliced fresh mango, ripe avocado, black beans, ` +
      `roasted plantain, pickled red onion, and a drizzle of lime-coconut dressing, on a handmade ` +
      `ceramic bowl. ${STYLE.food}`,
  },
  {
    out: "catering/empanadas.jpg",
    aspect_ratio: "1:1",
    prompt:
      `Three golden Colombian empanadas with crisp masa, hand-bitten cross-section showing seasoned ` +
      `beef and potato filling, served with fresh ají picante in a small ceramic dipping bowl on ` +
      `linen napkin. ${STYLE.food}`,
  },
  {
    out: "catering/tres-leches.jpg",
    aspect_ratio: "1:1",
    prompt:
      `Slice of homemade tres leches cake, soaked sponge visible, topped with whipped cream and ` +
      `fresh berries, dusted with cinnamon, on a small ceramic plate with vintage silver fork. ${STYLE.food}`,
  },

  // ────────── PHARMA · productos ──────────
  {
    out: "pharma/aceite-cbd-1000.jpg",
    aspect_ratio: "1:1",
    prompt:
      `Apothecary-style amber glass dropper bottle labeled "1000mg full spectrum CBD oil" in ` +
      `minimal serif typography, on cream paper background next to a single cannabis leaf and a ` +
      `small certificate of analysis paper. ${STYLE.product}`,
  },
  {
    out: "pharma/aceite-cbd-500.jpg",
    aspect_ratio: "1:1",
    prompt:
      `Small amber glass dropper bottle of 500mg broad-spectrum CBD oil with minimal cream label, ` +
      `on warm cream paper background with a single dried hemp seed and soft side light. ${STYLE.product}`,
  },
  {
    out: "pharma/flores-mango.jpg",
    aspect_ratio: "1:1",
    prompt:
      `Premium dried hemp flower buds in a small cream glass jar with cork lid, label reading ` +
      `"Mango Kush 3.5g · less than 0.3% THC" in minimal serif, on cream paper. ${STYLE.product}`,
  },
  {
    out: "pharma/tintura.jpg",
    aspect_ratio: "1:1",
    prompt:
      `Apothecary-style dark amber tincture bottle labeled "2000mg concentrated extract" in serif ` +
      `typography, glass dropper visible, on cream paper next to dried botanicals. ${STYLE.product}`,
  },
  {
    out: "pharma/balsamo.jpg",
    aspect_ratio: "1:1",
    prompt:
      `Small cream-colored ceramic jar of muscle balm with minimal text "CBD · árnica · mentol", ` +
      `lid slightly open showing creamy balm texture, on warm cream paper with a small eucalyptus ` +
      `sprig. ${STYLE.product}`,
  },
  {
    out: "pharma/kit-starter.jpg",
    aspect_ratio: "1:1",
    prompt:
      `Curated wellness kit on cream paper: one amber CBD oil dropper bottle, one ceramic balm jar, ` +
      `and a folded printed guide tied with cream cotton string, arranged neatly. ${STYLE.product}`,
  },
  {
    out: "pharma/pet-oil.jpg",
    aspect_ratio: "1:1",
    prompt:
      `Small amber glass dropper bottle of veterinary CBD oil with minimal cream label showing a ` +
      `tiny paw symbol and "300mg", on cream paper next to a small wooden dog figurine. ${STYLE.product}`,
  },

  // ────────── LIOFILIZADOS · productos ──────────
  {
    out: "liofilizados/mango.jpg",
    aspect_ratio: "1:1",
    prompt:
      `Macro overhead shot of freeze-dried Colombian mango slices arranged on cream paper, ` +
      `crystalline porous texture visible, vivid orange color, kraft paper bag in soft focus ` +
      `behind, warm sidelight. ${STYLE.product}`,
  },
  {
    out: "liofilizados/pina.jpg",
    aspect_ratio: "1:1",
    prompt:
      `Macro shot of freeze-dried golden Colombian pineapple chunks on cream paper, light yellow ` +
      `to honey color, kraft paper bag in the background, soft warm light. ${STYLE.product}`,
  },
  {
    out: "liofilizados/maracuya.jpg",
    aspect_ratio: "1:1",
    prompt:
      `Small kraft paper bag of bright orange freeze-dried passionfruit powder, minimal cream label ` +
      `with serif typography reading "Maracuyá en polvo 100g", a small mound of orange powder ` +
      `spilling out onto the cream paper surface. ${STYLE.product}`,
  },
  {
    out: "liofilizados/uchuva.jpg",
    aspect_ratio: "1:1",
    prompt:
      `Macro shot of whole freeze-dried golden Colombian uchuva (cape gooseberries) on cream paper, ` +
      `vibrant yellow-orange color, crystalline texture, scattered loose on the surface. ${STYLE.product}`,
  },
  {
    out: "liofilizados/mix-berries.jpg",
    aspect_ratio: "1:1",
    prompt:
      `Colorful mix of freeze-dried Colombian berries — deep red mora, purple uchuva, golden ` +
      `arándano — scattered on cream paper, kraft bag in soft background. ${STYLE.product}`,
  },
  {
    out: "liofilizados/snack-mix.jpg",
    aspect_ratio: "1:1",
    prompt:
      `Small kraft paper resealable pouch with minimal cream label "Snack mix tropical 40g", open ` +
      `at the top showing freeze-dried mango chunks, pineapple, and banana spilling onto cream ` +
      `paper. ${STYLE.product}`,
  },
];

// ─── Helpers ────────────────────────────────────────────────────

const args = process.argv.slice(2);
const FORCE = args.includes("--force");
const ONLY = args.includes("--only") ? args[args.indexOf("--only") + 1] : null;

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

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
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`fal queue error ${res.status}: ${t.slice(0, 200)}`);
  }
  return res.json();
}

async function pollResult(statusUrl, responseUrl) {
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const sres = await fetch(statusUrl, {
      headers: { Authorization: `Key ${FAL_KEY}` },
    });
    const status = await sres.json();
    if (status.status === "COMPLETED") {
      const rres = await fetch(responseUrl, {
        headers: { Authorization: `Key ${FAL_KEY}` },
      });
      return rres.json();
    }
    if (status.status === "FAILED") {
      throw new Error(`fal failed: ${JSON.stringify(status)}`);
    }
  }
  throw new Error("fal timeout");
}

async function downloadTo(url, outPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, buf);
  return buf.length;
}

async function generateOne(item, idx, total) {
  const outPath = path.join(PUBLIC_IMG, item.out);
  if (!FORCE && (await exists(outPath))) {
    return { ...item, skipped: true, outPath };
  }
  const t0 = Date.now();
  const queue = await postQueue(item.prompt, item.aspect_ratio);
  const result = await pollResult(queue.status_url, queue.response_url);
  const imgUrl = result.images?.[0]?.url;
  if (!imgUrl) throw new Error("no image url returned");
  const bytes = await downloadTo(imgUrl, outPath);
  const elapsed = Math.round((Date.now() - t0) / 1000);
  return { ...item, bytes, elapsed, outPath };
}

async function runPool(items, concurrency = 6) {
  const queue = [...items];
  const results = [];
  let active = 0;
  let done = 0;
  return new Promise((resolve, reject) => {
    const tick = () => {
      while (active < concurrency && queue.length) {
        const item = queue.shift();
        active++;
        const idx = items.indexOf(item) + 1;
        generateOne(item, idx, items.length)
          .then((r) => {
            results.push(r);
            done++;
            const tag = r.skipped ? "SKIP" : `OK  ${r.elapsed}s · ${(r.bytes/1024).toFixed(0)}KB`;
            console.log(`[${done}/${items.length}] ${tag.padEnd(20)} ${r.out}`);
          })
          .catch((err) => {
            results.push({ ...item, error: err.message });
            done++;
            console.log(`[${done}/${items.length}] ERR  ${item.out} → ${err.message}`);
          })
          .finally(() => {
            active--;
            if (done === items.length) resolve(results);
            else tick();
          });
      }
    };
    tick();
  });
}

// ─── Main ───────────────────────────────────────────────────────

const items = ONLY ? MANIFEST.filter((m) => m.out.startsWith(`${ONLY}/`)) : MANIFEST;
console.log(`fal.ai · FLUX Pro v1.1 Ultra`);
console.log(`Pendientes: ${items.length} de ${MANIFEST.length} en el manifest`);
console.log(`Force regen: ${FORCE}`);
console.log("");

const t0 = Date.now();
const results = await runPool(items, 6);
const elapsed = Math.round((Date.now() - t0) / 1000);

const ok = results.filter((r) => !r.error && !r.skipped).length;
const skipped = results.filter((r) => r.skipped).length;
const errors = results.filter((r) => r.error).length;

console.log("");
console.log(`Total: ${elapsed}s · OK ${ok} · SKIP ${skipped} · ERR ${errors}`);
if (errors > 0) {
  console.log("Errores:");
  results.filter((r) => r.error).forEach((r) => console.log(`  ${r.out}: ${r.error}`));
  process.exit(1);
}
