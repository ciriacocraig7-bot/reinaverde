/**
 * Tests del motor de pricing.
 *
 * Por simplicidad evitamos agregar vitest como dependencia. Este archivo es
 * un script ejecutable con tsx que prueba escenarios concretos contra la BD
 * de desarrollo (requiere seed corrido).
 *
 *   npx tsx src/lib/pricing/calculator.test.ts
 *
 * Cada caso imprime PASS/FAIL y sale con código 1 si algo falló.
 */
import "dotenv/config";
import { calculatePricing } from "./calculator";
import { prisma } from "@/lib/db/prisma";
import { TaxRegime } from "@/generated/prisma/enums";

let failures = 0;

function assert(label: string, cond: boolean, detail?: string) {
  if (cond) {
    console.log(`  ✓ ${label}`);
  } else {
    failures++;
    console.log(`  ✗ ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

function near(a: number, b: number, tolerancePct = 0.02) {
  if (b === 0) return Math.abs(a) < 1;
  return Math.abs(a - b) / Math.abs(b) <= tolerancePct;
}

async function main() {
  // Necesitamos al menos un MenuItem con ingredientes para probar.
  const sample = await prisma.menuItem.findFirst({
    where: { isActive: true, ingredients: { some: {} } },
    include: { ingredients: true },
  });
  if (!sample) {
    console.log(
      "✗ No hay menu items con ingredientes seedados. Corre `npm run seed` primero.",
    );
    process.exit(1);
  }

  console.log(`\nUsando MenuItem de prueba: ${sample.name} (${sample.id})`);

  // ── Caso 1: Régimen Común · Bogotá · 50 pax · fecha regular ───
  console.log("\n┌ Caso 1: Régimen Común · Bogotá · 50 pax");
  const r1 = await calculatePricing({
    items: [{ menuItemId: sample.id, quantity: 50 }],
    city: "Bogotá",
    guestCount: 50,
    eventDate: new Date(Date.UTC(2026, 5, 15)), // junio = temporada regular
    overrideTaxRegime: TaxRegime.COMMON,
  });

  assert("regime es COMMON", r1.regime === TaxRegime.COMMON);
  assert("CMP > 0", r1.cmpTotal > 0);
  assert("CMO > 0", r1.cmoTotal > 0);
  assert(
    "CIF = CMP × cifPercent",
    near(r1.cifTotal, r1.cmpTotal * r1.cifPercent),
    `cif=${r1.cifTotal} expected≈${Math.round(r1.cmpTotal * r1.cifPercent)}`,
  );
  assert(
    "costTotal = cmp+cmo+cif+transport",
    near(r1.costTotal, r1.cmpTotal + r1.cmoTotal + r1.cifTotal + r1.transportTotal),
  );
  assert(
    "subtotal = costTotal + margin",
    near(r1.subtotal, r1.costTotal + r1.marginAmount),
  );
  assert("descuento volumen NO aplica con 50 pax", !r1.volumeDiscount.applies);
  assert(
    "VAT 19% sobre taxableBase",
    near(r1.vat.amount, r1.taxableBase * 0.19),
  );
  assert("ICA aplica", r1.ica.amount > 0);
  assert("simpleAmount = 0 en COMMON", r1.simple.amount === 0);
  assert(
    "total = base + IVA + ICA",
    near(r1.total, r1.taxableBase + r1.vat.amount + r1.ica.amount),
  );
  assert(
    "ReteFuente 4% del taxableBase",
    near(r1.retentions.reteFuente.amount, r1.taxableBase * 0.04),
  );
  assert(
    "ReteIVA 15% del IVA",
    near(r1.retentions.reteIva.amount, r1.vat.amount * 0.15),
  );
  assert(
    "netReceivable = total - retenciones",
    near(r1.netReceivable, r1.total - r1.retentions.total),
  );

  // ── Caso 2: Régimen Simple · Medellín · 200 pax (descuento 8%) ─
  console.log("\n┌ Caso 2: Régimen Simple · Medellín · 200 pax");
  const r2 = await calculatePricing({
    items: [{ menuItemId: sample.id, quantity: 200 }],
    city: "Medellín",
    guestCount: 200,
    eventDate: new Date(Date.UTC(2026, 5, 15)),
    overrideTaxRegime: TaxRegime.SIMPLE,
  });

  assert("regime es SIMPLE", r2.regime === TaxRegime.SIMPLE);
  assert(
    "descuento volumen aplica con 200 pax",
    r2.volumeDiscount.applies && (r2.volumeDiscount.minGuests ?? 0) >= 100,
  );
  assert("VAT amount = 0 en SIMPLE", r2.vat.amount === 0);
  assert("simpleAmount > 0 en SIMPLE", r2.simple.amount > 0);
  assert(
    "RST tarifa configurada (≈5.4%)",
    near(r2.simple.amount, r2.taxableBase * 0.054),
  );
  assert(
    "ReteIVA = 0 en SIMPLE",
    r2.retentions.reteIva.amount === 0,
  );
  assert(
    "ReteFuente con disclaimer en SIMPLE",
    !!r2.retentions.reteFuente.notes,
  );

  // ── Caso 3: Edge — 99 pax no aplica descuento, 100 sí ─────────
  console.log("\n┌ Caso 3: Edge — boundaries de descuento por volumen");
  const r99 = await calculatePricing({
    items: [{ menuItemId: sample.id, quantity: 99 }],
    city: "Bogotá",
    guestCount: 99,
    eventDate: new Date(Date.UTC(2026, 5, 15)),
    overrideTaxRegime: TaxRegime.COMMON,
  });
  const r100 = await calculatePricing({
    items: [{ menuItemId: sample.id, quantity: 100 }],
    city: "Bogotá",
    guestCount: 100,
    eventDate: new Date(Date.UTC(2026, 5, 15)),
    overrideTaxRegime: TaxRegime.COMMON,
  });
  assert("99 pax NO recibe descuento", !r99.volumeDiscount.applies);
  assert("100 pax SÍ recibe descuento", r100.volumeDiscount.applies);

  // ── Caso 4: Temporada alta (diciembre 20) eleva el precio ─────
  console.log("\n┌ Caso 4: Temporada alta — diciembre 20");
  const rDic = await calculatePricing({
    items: [{ menuItemId: sample.id, quantity: 50 }],
    city: "Bogotá",
    guestCount: 50,
    eventDate: new Date(Date.UTC(2026, 11, 20)), // 20 dic
    overrideTaxRegime: TaxRegime.COMMON,
  });
  const rJun = r1; // junio (regular)

  // El ajuste seasonal debe haber elevado el taxableBase de diciembre vs junio.
  assert(
    "diciembre tiene rateModifier > 1.0",
    rDic.seasonal.rateModifier > 1.0,
    `dic modifier=${rDic.seasonal.rateModifier}`,
  );
  assert(
    "diciembre genera total mayor que junio (misma config)",
    rDic.total > rJun.total,
  );

  // ── Resumen ─────────────────────────────────────────────────────
  console.log(
    failures === 0
      ? "\n✓ Todos los casos pasaron"
      : `\n✗ ${failures} aserciones fallaron`,
  );
  await prisma.$disconnect();
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error("Error fatal:", e);
  process.exit(1);
});
