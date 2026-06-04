import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import type { UserRole, MomentType } from "../src/generated/prisma/enums";

const connectionString = process.env.DATABASE_URL || "";
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const DEMO_PASSWORD = process.env.SEED_PASSWORD || "reinaverde123";

const DEMO_USERS: Array<{
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}> = [
  { email: "admin@reinaverde.co",     firstName: "Camila",   lastName: "Admin",     role: "ADMIN" },
  { email: "cliente@reinaverde.co",   firstName: "Andrés",   lastName: "Cliente",   role: "CLIENTE" },
  { email: "chef@reinaverde.co",      firstName: "Lucía",    lastName: "Chef",      role: "CHEF" },
  { email: "staff@reinaverde.co",     firstName: "Felipe",   lastName: "Staff",     role: "STAFF" },
  { email: "proveedor@reinaverde.co", firstName: "Marta",    lastName: "Proveedor", role: "PROVEEDOR" },
  { email: "finanzas@reinaverde.co",  firstName: "Sebastián", lastName: "Finanzas",  role: "FINANZAS" },
];

async function seedUsers() {
  console.log("👤 Seeding demo users...");
  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);
  let created = 0, updated = 0;
  for (const u of DEMO_USERS) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (existing) {
      await prisma.user.update({
        where: { email: u.email },
        data: { firstName: u.firstName, lastName: u.lastName, role: u.role, isActive: true },
      });
      updated++;
    } else {
      await prisma.user.create({
        data: {
          email: u.email,
          firstName: u.firstName,
          lastName: u.lastName,
          passwordHash: hash,
          role: u.role,
          isActive: true,
          emailVerified: true,
        },
      });
      created++;
    }
  }
  console.log(`  ✓ ${created} usuarios creados, ${updated} actualizados`);
  console.log(`  ➤ Contraseña común: ${DEMO_PASSWORD}`);
}

async function main() {
  await seedUsers();
  console.log("🌱 Seeding e-commerce data...");

  // ─── Pharma Categories ──────────────────────────────────
  const pharmaCategories = await Promise.all([
    prisma.productCategory.upsert({ where: { businessLine_slug: { businessLine: "PHARMA", slug: "aceites" } }, update: {}, create: { businessLine: "PHARMA", name: "Aceites", slug: "aceites", icon: "spa", sortOrder: 1 } }),
    prisma.productCategory.upsert({ where: { businessLine_slug: { businessLine: "PHARMA", slug: "flores" } }, update: {}, create: { businessLine: "PHARMA", name: "Flores", slug: "flores", icon: "local_florist", sortOrder: 2 } }),
    prisma.productCategory.upsert({ where: { businessLine_slug: { businessLine: "PHARMA", slug: "tinturas" } }, update: {}, create: { businessLine: "PHARMA", name: "Tinturas", slug: "tinturas", icon: "science", sortOrder: 3 } }),
    prisma.productCategory.upsert({ where: { businessLine_slug: { businessLine: "PHARMA", slug: "topicos" } }, update: {}, create: { businessLine: "PHARMA", name: "Tópicos", slug: "topicos", icon: "self_improvement", sortOrder: 4 } }),
    prisma.productCategory.upsert({ where: { businessLine_slug: { businessLine: "PHARMA", slug: "kits" } }, update: {}, create: { businessLine: "PHARMA", name: "Kits", slug: "kits", icon: "inventory_2", sortOrder: 5 } }),
    prisma.productCategory.upsert({ where: { businessLine_slug: { businessLine: "PHARMA", slug: "pet" } }, update: {}, create: { businessLine: "PHARMA", name: "Pet", slug: "pet", icon: "pets", sortOrder: 6 } }),
  ]);
  console.log(`  ✓ ${pharmaCategories.length} pharma categories`);

  // ─── Pharma Products ────────────────────────────────────
  const pharmaProducts = [
    { name: "Aceite CBD Full Spectrum 1000mg", slug: "aceite-cbd-full-spectrum-1000mg", shortDesc: "Aceite sublingual de espectro completo. 30ml con gotero dosificador.", price: 189000, icon: "spa", badge: "Bestseller", stock: 50, isFeatured: true, categorySlug: "aceites" },
    { name: "Aceite CBD Broad Spectrum 500mg", slug: "aceite-cbd-broad-spectrum-500mg", shortDesc: "Sin THC. Ideal para quienes inician su experiencia con CBD.", price: 129000, icon: "spa", badge: "Suave", stock: 40, isFeatured: false, categorySlug: "aceites" },
    { name: "Flores de Cáñamo – Mango Kush", slug: "flores-canamo-mango-kush", shortDesc: "3.5g de flores secas con perfil aromático tropical. < 0.3% THC.", price: 85000, icon: "local_florist", badge: "Premium", stock: 30, weight: "3.5g", isFeatured: true, categorySlug: "flores" },
    { name: "Tintura CBD 2000mg", slug: "tintura-cbd-2000mg", shortDesc: "Extracto concentrado para uso terapéutico. Gotero de precisión.", price: 249000, icon: "science", badge: "Potente", stock: 20, isFeatured: false, categorySlug: "tinturas" },
    { name: "Bálsamo CBD Muscular", slug: "balsamo-cbd-muscular", shortDesc: "Crema con CBD, árnica y mentol para alivio localizado.", price: 95000, icon: "self_improvement", badge: "Alivio", stock: 35, isFeatured: false, categorySlug: "topicos" },
    { name: "Kit Bienestar Starter", slug: "kit-bienestar-starter", shortDesc: "Aceite 500mg + Bálsamo + Guía de inicio. Perfecto para comenzar.", price: 159000, icon: "inventory_2", badge: "Nuevo", stock: 25, isFeatured: true, categorySlug: "kits" },
    { name: "CBD Pet Oil 300mg", slug: "cbd-pet-oil-300mg", shortDesc: "Formulado para mascotas. Sabor salmón. Aprobado por veterinarios.", price: 79000, icon: "pets", badge: "Mascotas", stock: 45, isFeatured: false, categorySlug: "pet" },
    { name: "Flores de Cáñamo – OG Kush", slug: "flores-canamo-og-kush", shortDesc: "3.5g. Perfil terroso y relajante. Cultivo indoor.", price: 95000, icon: "local_florist", badge: "Clásico", stock: 30, weight: "3.5g", isFeatured: false, categorySlug: "flores" },
  ];

  let pharmaCount = 0;
  for (const p of pharmaProducts) {
    const cat = pharmaCategories.find((c) => c.slug === p.categorySlug)!;
    await prisma.product.upsert({
      where: { businessLine_slug: { businessLine: "PHARMA", slug: p.slug } },
      update: { price: p.price, stock: p.stock },
      create: {
        businessLine: "PHARMA",
        categoryId: cat.id,
        name: p.name,
        slug: p.slug,
        shortDesc: p.shortDesc,
        price: p.price,
        icon: p.icon,
        badge: p.badge,
        stock: p.stock,
        weight: p.weight,
        isFeatured: p.isFeatured,
      },
    });
    pharmaCount++;
  }
  console.log(`  ✓ ${pharmaCount} pharma products`);

  // ─── Liofilizados Categories ──────────────────────────────
  const lioCategories = await Promise.all([
    prisma.productCategory.upsert({ where: { businessLine_slug: { businessLine: "LIOFILIZADOS", slug: "tropicales" } }, update: {}, create: { businessLine: "LIOFILIZADOS", name: "Tropicales", slug: "tropicales", icon: "nutrition", sortOrder: 1 } }),
    prisma.productCategory.upsert({ where: { businessLine_slug: { businessLine: "LIOFILIZADOS", slug: "berries" } }, update: {}, create: { businessLine: "LIOFILIZADOS", name: "Berries", slug: "berries", icon: "energy_savings_leaf", sortOrder: 2 } }),
    prisma.productCategory.upsert({ where: { businessLine_slug: { businessLine: "LIOFILIZADOS", slug: "snacks" } }, update: {}, create: { businessLine: "LIOFILIZADOS", name: "Snacks", slug: "snacks", icon: "lunch_dining", sortOrder: 3 } }),
    prisma.productCategory.upsert({ where: { businessLine_slug: { businessLine: "LIOFILIZADOS", slug: "reposteria" } }, update: {}, create: { businessLine: "LIOFILIZADOS", name: "Repostería", slug: "reposteria", icon: "bakery_dining", sortOrder: 4 } }),
    prisma.productCategory.upsert({ where: { businessLine_slug: { businessLine: "LIOFILIZADOS", slug: "mayorista" } }, update: {}, create: { businessLine: "LIOFILIZADOS", name: "Mayorista", slug: "mayorista", icon: "local_shipping", sortOrder: 5 } }),
  ]);
  console.log(`  ✓ ${lioCategories.length} liofilizados categories`);

  // ─── Liofilizados Products ────────────────────────────────
  const lioProducts = [
    { name: "Mango Liofilizado Premium", slug: "mango-liofilizado-premium", shortDesc: "Rodajas de mango colombiano. Crujientes y dulces. 50g.", price: 28000, icon: "nutrition", badge: "Popular", stock: 100, weight: "50g", isFeatured: true, categorySlug: "tropicales" },
    { name: "Piña Golden Liofilizada", slug: "pina-golden-liofilizada", shortDesc: "Trozos de piña Gold seleccionada. Sabor intenso. 50g.", price: 25000, icon: "nutrition", badge: "Tropical", stock: 80, weight: "50g", isFeatured: false, categorySlug: "tropicales" },
    { name: "Maracuyá en Polvo", slug: "maracuya-en-polvo", shortDesc: "Polvo puro de maracuyá para batidos, postres y coctelería. 100g.", price: 32000, icon: "blender", badge: "Versátil", stock: 60, weight: "100g", isFeatured: false, categorySlug: "tropicales" },
    { name: "Mix Berries Colombianas", slug: "mix-berries-colombianas", shortDesc: "Uchuva, mora, arándano y fresa. Mezcla energizante. 60g.", price: 35000, icon: "energy_savings_leaf", badge: "Antioxidante", stock: 70, weight: "60g", isFeatured: true, categorySlug: "berries" },
    { name: "Uchuvas Liofilizadas", slug: "uchuvas-liofilizadas", shortDesc: "Uchuvas enteras crujientes. Alto contenido de vitamina C. 40g.", price: 30000, icon: "energy_savings_leaf", badge: "Superfood", stock: 55, weight: "40g", isFeatured: false, categorySlug: "berries" },
    { name: "Snack Mix Tropical", slug: "snack-mix-tropical", shortDesc: "Mango, piña y banano. Snack perfecto para cualquier momento. 40g.", price: 22000, icon: "lunch_dining", badge: "Ready-to-eat", stock: 120, weight: "40g", isFeatured: false, categorySlug: "snacks" },
    { name: "Kit Repostería Premium", slug: "kit-reposteria-premium", shortDesc: "4 variedades en polvo + trozos para decoración. 200g total.", price: 65000, icon: "bakery_dining", badge: "Chef Grade", stock: 30, weight: "200g", isFeatured: true, categorySlug: "reposteria" },
    { name: "Bulk Mango 1kg", slug: "bulk-mango-1kg", shortDesc: "Presentación mayorista. Ideal para restaurantes y exportación.", price: 320000, icon: "local_shipping", badge: "B2B", stock: 15, weight: "1kg", isFeatured: false, categorySlug: "mayorista" },
    { name: "Guanábana Liofilizada", slug: "guanabana-liofilizada", shortDesc: "Trozos de guanábana con sabor cremoso intenso. Edición limitada. 50g.", price: 38000, icon: "nutrition", badge: "Exótico", stock: 40, weight: "50g", isFeatured: false, categorySlug: "tropicales" },
  ];

  let lfCount = 0;
  for (const p of lioProducts) {
    const cat = lioCategories.find((c) => c.slug === p.categorySlug)!;
    await prisma.product.upsert({
      where: { businessLine_slug: { businessLine: "LIOFILIZADOS", slug: p.slug } },
      update: { price: p.price, stock: p.stock },
      create: {
        businessLine: "LIOFILIZADOS",
        categoryId: cat.id,
        name: p.name,
        slug: p.slug,
        shortDesc: p.shortDesc,
        price: p.price,
        icon: p.icon,
        badge: p.badge,
        stock: p.stock,
        weight: p.weight,
        isFeatured: p.isFeatured,
      },
    });
    lfCount++;
  }
  console.log(`  ✓ ${lfCount} liofilizados products`);

  // ─── Catering / Diseñador de Producto ────────────────────────
  await seedCateringReference();

  console.log("✅ Seeding complete!");
}

// ═══════════════════════════════════════════════════════════════
// CATERING — DISEÑADOR DE PRODUCTO
// ═══════════════════════════════════════════════════════════════

async function seedCateringReference() {
  console.log("🍴 Seeding catering reference data...");

  // ── PricingConfig (upsert singleton) ──────────────────────────
  await prisma.pricingConfig.upsert({
    where: { id: "default" },
    create: { id: "default" }, // defaults definidos en schema
    update: {}, // no pisar overrides manuales del admin
  });
  console.log("  ✓ PricingConfig 'default' OK");

  // ── CityTaxRate (6 ciudades del pitch) ────────────────────────
  const cities = [
    { city: "Bogotá",      icaRate: 0.00966, reteIcaRate: 0.00966, transportSurcharge:       0 },
    { city: "Medellín",    icaRate: 0.00700, reteIcaRate: 0.00700, transportSurcharge:   80000 },
    { city: "Cali",        icaRate: 0.00660, reteIcaRate: 0.00660, transportSurcharge:  100000 },
    { city: "Barranquilla",icaRate: 0.00690, reteIcaRate: 0.00690, transportSurcharge:  120000 },
    { city: "Cartagena",   icaRate: 0.00700, reteIcaRate: 0.00700, transportSurcharge:  130000 },
    { city: "Armenia",     icaRate: 0.00500, reteIcaRate: 0.00500, transportSurcharge:   90000 },
  ];
  for (const c of cities) {
    await prisma.cityTaxRate.upsert({
      where: { city: c.city },
      create: c,
      update: { icaRate: c.icaRate, reteIcaRate: c.reteIcaRate, transportSurcharge: c.transportSurcharge, isActive: true },
    });
  }
  console.log(`  ✓ ${cities.length} city tax rates`);

  // ── VolumeDiscount ────────────────────────────────────────────
  const volumeTiers = [
    { minGuests: 100, discountPercent: 0.05 },
    { minGuests: 200, discountPercent: 0.08 },
    { minGuests: 500, discountPercent: 0.12 },
  ];
  for (const v of volumeTiers) {
    await prisma.volumeDiscount.upsert({
      where: { minGuests: v.minGuests },
      create: v,
      update: { discountPercent: v.discountPercent, isActive: true },
    });
  }
  console.log(`  ✓ ${volumeTiers.length} volume discounts`);

  // ── SeasonalRate ──────────────────────────────────────────────
  const existingSeasons = await prisma.seasonalRate.count();
  if (existingSeasons === 0) {
    await prisma.seasonalRate.createMany({
      data: [
        { name: "Alta — Diciembre",   startMonth: 12, startDay: 1,  endMonth: 1,  endDay: 6,  rateModifier: 1.15 },
        { name: "Baja — Enero/Feb",   startMonth: 1,  startDay: 7,  endMonth: 2,  endDay: 28, rateModifier: 0.92 },
        { name: "Regular",            startMonth: 3,  startDay: 1,  endMonth: 11, endDay: 30, rateModifier: 1.00 },
      ],
    });
    console.log("  ✓ 3 seasonal rates");
  } else {
    console.log(`  · ${existingSeasons} seasonal rates ya existen, no sobrescribir`);
  }

  // ── Ingredients (33 representativos, COP) ─────────────────────
  const ingredients: Array<{
    slug: string;
    name: string;
    unit: string;
    category: string;
    costPerUnit: number;
    yieldPercent: number;
    jumboReferencePrice?: number;
    jumboReferenceUrl?: string;
  }> = [
    // Proteínas (COP / g — costo por gramo) · Jumbo referencias estimadas para comparar margen
    { slug: "salmon-fresco",       name: "Salmón fresco",        unit: "g", category: "Proteína", costPerUnit:  85, yieldPercent: 0.85, jumboReferencePrice: 110 },
    { slug: "lomo-fino-res",       name: "Lomo fino de res",     unit: "g", category: "Proteína", costPerUnit:  78, yieldPercent: 0.90, jumboReferencePrice:  95 },
    { slug: "pechuga-pollo",       name: "Pechuga de pollo",     unit: "g", category: "Proteína", costPerUnit:  30, yieldPercent: 0.92, jumboReferencePrice:  38 },
    { slug: "atun-fresco",         name: "Atún fresco",          unit: "g", category: "Proteína", costPerUnit:  72, yieldPercent: 0.88, jumboReferencePrice:  90 },
    { slug: "huevo-organico",      name: "Huevo orgánico",       unit: "u", category: "Proteína", costPerUnit: 900, yieldPercent: 1.00, jumboReferencePrice: 1200 },
    { slug: "queso-cabra",         name: "Queso de cabra",       unit: "g", category: "Lácteo",   costPerUnit:  45, yieldPercent: 1.00 },
    { slug: "queso-manchego",      name: "Queso manchego",       unit: "g", category: "Lácteo",   costPerUnit:  55, yieldPercent: 1.00 },
    { slug: "queso-mozzarella",    name: "Mozzarella di bufala", unit: "g", category: "Lácteo",   costPerUnit:  38, yieldPercent: 1.00 },
    // Granos
    { slug: "quinoa-blanca",       name: "Quinoa blanca",        unit: "g", category: "Grano",    costPerUnit:  18, yieldPercent: 1.00 },
    { slug: "arroz-arborio",       name: "Arroz arborio",        unit: "g", category: "Grano",    costPerUnit:  12, yieldPercent: 1.00 },
    { slug: "arroz-integral",      name: "Arroz integral",       unit: "g", category: "Grano",    costPerUnit:   8, yieldPercent: 1.00 },
    { slug: "lentejas-rojas",      name: "Lentejas rojas",       unit: "g", category: "Grano",    costPerUnit:  10, yieldPercent: 1.00 },
    // Vegetales
    { slug: "aguacate-hass",       name: "Aguacate Hass",        unit: "g", category: "Vegetal",  costPerUnit:  22, yieldPercent: 0.70 },
    { slug: "kale-fresco",         name: "Kale fresco",          unit: "g", category: "Vegetal",  costPerUnit:  20, yieldPercent: 0.85 },
    { slug: "tomate-cherry",       name: "Tomate cherry",        unit: "g", category: "Vegetal",  costPerUnit:  18, yieldPercent: 0.95 },
    { slug: "cebolla-morada",      name: "Cebolla morada",       unit: "g", category: "Vegetal",  costPerUnit:   5, yieldPercent: 0.90 },
    { slug: "espinaca-baby",       name: "Espinaca baby",        unit: "g", category: "Vegetal",  costPerUnit:  25, yieldPercent: 0.95 },
    { slug: "champinones",         name: "Champiñones Portobello",unit: "g",category: "Vegetal",  costPerUnit:  28, yieldPercent: 0.90 },
    // Frutas
    { slug: "mango-tommy",         name: "Mango Tommy",          unit: "g", category: "Fruta",    costPerUnit:  10, yieldPercent: 0.80 },
    { slug: "pina-gold",           name: "Piña Gold",            unit: "g", category: "Fruta",    costPerUnit:   8, yieldPercent: 0.55 },
    { slug: "fresa-fresca",        name: "Fresa fresca",         unit: "g", category: "Fruta",    costPerUnit:  20, yieldPercent: 0.95 },
    { slug: "maracuya",            name: "Maracuyá",             unit: "u", category: "Fruta",    costPerUnit: 1500, yieldPercent: 0.50 },
    { slug: "limon-tahiti",        name: "Limón Tahití",         unit: "u", category: "Fruta",    costPerUnit:  600, yieldPercent: 0.70 },
    // Lácteos / leches vegetales
    { slug: "yogurt-griego",       name: "Yogurt griego natural",unit: "g", category: "Lácteo",   costPerUnit:  15, yieldPercent: 1.00 },
    { slug: "leche-coco",          name: "Leche de coco",        unit: "ml",category: "Lácteo",   costPerUnit:   8, yieldPercent: 1.00 },
    { slug: "crema-leche",         name: "Crema de leche",       unit: "ml",category: "Lácteo",   costPerUnit:  10, yieldPercent: 1.00 },
    // Salsas / especias
    { slug: "aceite-oliva",        name: "Aceite de oliva extra",unit: "ml",category: "Especia",  costPerUnit:  22, yieldPercent: 1.00, jumboReferencePrice:  28 },
    { slug: "salsa-soja",          name: "Salsa de soja premium",unit: "ml",category: "Especia",  costPerUnit:  18, yieldPercent: 1.00, jumboReferencePrice:  22 },
    { slug: "miel-organica",       name: "Miel orgánica",        unit: "g", category: "Especia",  costPerUnit:  35, yieldPercent: 1.00, jumboReferencePrice:  42 },
    { slug: "cacao-puro",          name: "Cacao puro 70%",       unit: "g", category: "Especia",  costPerUnit:  45, yieldPercent: 1.00, jumboReferencePrice:  55 },
    // Empaque (cajas, bandejas, biodegradables) · NO se compra en Jumbo, sí en proveedores B2B
    { slug: "caja-kraft-18",       name: "Caja kraft 18 cm",     unit: "u", category: "Empaque",  costPerUnit: 1800, yieldPercent: 1.00 },
    { slug: "bandeja-biodegradable", name: "Bandeja biodegradable 22 cm", unit: "u", category: "Empaque", costPerUnit: 2200, yieldPercent: 1.00 },
    { slug: "cubiertos-bambu",     name: "Set cubiertos bambú",  unit: "u", category: "Empaque",  costPerUnit:  950, yieldPercent: 1.00 },
  ];

  const ingredientMap = new Map<string, string>();
  for (const ing of ingredients) {
    const existing = await prisma.ingredient.findFirst({
      where: { name: ing.name },
    });
    if (existing) {
      const updated = await prisma.ingredient.update({
        where: { id: existing.id },
        data: {
          unit: ing.unit,
          category: ing.category,
          costPerUnit: ing.costPerUnit,
          yieldPercent: ing.yieldPercent,
          jumboReferencePrice: ing.jumboReferencePrice ?? null,
          jumboReferenceUrl: ing.jumboReferenceUrl ?? null,
          ...(ing.jumboReferencePrice != null ? { lastJumboCheck: new Date() } : {}),
          isActive: true,
        },
      });
      ingredientMap.set(ing.slug, updated.id);
    } else {
      const created = await prisma.ingredient.create({
        data: {
          name: ing.name,
          unit: ing.unit,
          category: ing.category,
          costPerUnit: ing.costPerUnit,
          yieldPercent: ing.yieldPercent,
          jumboReferencePrice: ing.jumboReferencePrice ?? null,
          jumboReferenceUrl: ing.jumboReferenceUrl ?? null,
          lastJumboCheck: ing.jumboReferencePrice != null ? new Date() : null,
          stock: 0,
          minStock: 0,
        },
      });
      ingredientMap.set(ing.slug, created.id);
    }
  }
  console.log(`  ✓ ${ingredients.length} ingredients`);

  // ── MenuCategory por momento ──────────────────────────────────
  const momentoCategories: Array<{ code: MomentType; name: string; sortOrder: number; description: string }> = [
    { code: "DBR", name: "Desayunos y brunchs",    sortOrder: 1, description: "Inicios de jornada llenos de vitalidad." },
    { code: "RFG", name: "Refrigerios y snacks",   sortOrder: 2, description: "Barras diseñadas para recargar energía." },
    { code: "ALM", name: "Almuerzos premium",      sortOrder: 3, description: "Buffet interactivo o empacados de lujo." },
    { code: "GAL", name: "Cenas de gala",          sortOrder: 4, description: "Experiencias de alta cocina a la mesa." },
    { code: "MEX", name: "Mesas de experiencia",   sortOrder: 5, description: "Estaciones dulces y saladas." },
    { code: "COC", name: "Coctelería saludable",   sortOrder: 6, description: "Mixología innovadora." },
  ];
  const catMap = new Map<MomentType, string>();
  for (const mc of momentoCategories) {
    const existing = await prisma.menuCategory.findFirst({
      where: { name: mc.name },
    });
    if (existing) {
      const upd = await prisma.menuCategory.update({
        where: { id: existing.id },
        data: { description: mc.description, sortOrder: mc.sortOrder, isActive: true },
      });
      catMap.set(mc.code, upd.id);
    } else {
      const cr = await prisma.menuCategory.create({
        data: { name: mc.name, description: mc.description, sortOrder: mc.sortOrder },
      });
      catMap.set(mc.code, cr.id);
    }
  }
  console.log(`  ✓ ${momentoCategories.length} menu categories`);

  // ── MenuItem con ingredientes ligados ─────────────────────────
  type RecipeSeed = {
    name: string;
    description: string;
    momentType: MomentType;
    image: string;
    laborMinutes: number;
    difficultyFactor: number;
    targetMarginPercent: number;
    servingSize: string;
    isVegetarian?: boolean;
    isVegan?: boolean;
    isGlutenFree?: boolean;
    /** Ingredientes por porción individual. */
    ingredients: Array<{ slug: string; quantity: number }>;
  };

  const recipes: RecipeSeed[] = [
    {
      name: "Bowl de Quinoa y Aguacate",
      description: "Quinoa blanca, aguacate Hass, kale, tomate cherry y aderezo de limón.",
      momentType: "ALM",
      image: "/img/catering/bowl-vegano.jpg",
      laborMinutes: 12,
      difficultyFactor: 1.0,
      targetMarginPercent: 0.45,
      servingSize: "Bowl de 320g",
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: true,
      ingredients: [
        { slug: "quinoa-blanca", quantity: 70 },
        { slug: "aguacate-hass", quantity: 80 },
        { slug: "kale-fresco",   quantity: 40 },
        { slug: "tomate-cherry", quantity: 50 },
        { slug: "limon-tahiti",  quantity: 0.5 },
        { slug: "aceite-oliva",  quantity: 8 },
      ],
    },
    {
      name: "Salmón al Maracuyá",
      description: "Filete de salmón en costra con reducción de maracuyá, arroz arborio y espinacas salteadas.",
      momentType: "GAL",
      image: "/img/catering/salmon-maracuya.jpg",
      laborMinutes: 22,
      difficultyFactor: 1.4,
      targetMarginPercent: 0.42,
      servingSize: "Plato 380g",
      isGlutenFree: true,
      ingredients: [
        { slug: "salmon-fresco",  quantity: 180 },
        { slug: "arroz-arborio",  quantity: 80 },
        { slug: "espinaca-baby",  quantity: 50 },
        { slug: "maracuya",       quantity: 0.5 },
        { slug: "aceite-oliva",   quantity: 6 },
        { slug: "miel-organica",  quantity: 5 },
      ],
    },
    {
      name: "Pollo Champiñones a la Crema",
      description: "Pechuga sellada con champiñones portobello y crema reducida sobre arroz integral.",
      momentType: "ALM",
      image: "/img/catering/pollo-champinones.jpg",
      laborMinutes: 18,
      difficultyFactor: 1.2,
      targetMarginPercent: 0.43,
      servingSize: "Plato 340g",
      isGlutenFree: true,
      ingredients: [
        { slug: "pechuga-pollo", quantity: 180 },
        { slug: "champinones",   quantity: 80 },
        { slug: "arroz-integral",quantity: 70 },
        { slug: "crema-leche",   quantity: 40 },
        { slug: "cebolla-morada",quantity: 20 },
      ],
    },
    {
      name: "Tabla de Quesos Artesanal",
      description: "Mozzarella di bufala, queso de cabra y manchego con miel y frutas frescas.",
      momentType: "MEX",
      image: "/img/catering/tabla-quesos.jpg",
      laborMinutes: 8,
      difficultyFactor: 1.0,
      targetMarginPercent: 0.48,
      servingSize: "Porción para 1 (90g de queso)",
      isVegetarian: true,
      ingredients: [
        { slug: "queso-mozzarella", quantity: 30 },
        { slug: "queso-cabra",      quantity: 30 },
        { slug: "queso-manchego",   quantity: 30 },
        { slug: "miel-organica",    quantity: 5 },
        { slug: "fresa-fresca",     quantity: 25 },
      ],
    },
    {
      name: "Brunch Premium Tropical",
      description: "Yogurt griego, granola artesanal, mango, piña Gold y miel orgánica.",
      momentType: "DBR",
      image: "/img/catering/frutas-temporada.jpg",
      laborMinutes: 6,
      difficultyFactor: 1.0,
      targetMarginPercent: 0.50,
      servingSize: "Bowl 280g",
      isVegetarian: true,
      isGlutenFree: true,
      ingredients: [
        { slug: "yogurt-griego", quantity: 150 },
        { slug: "mango-tommy",   quantity: 60 },
        { slug: "pina-gold",     quantity: 60 },
        { slug: "miel-organica", quantity: 10 },
      ],
    },
    {
      name: "Snack Box Proteico",
      description: "Huevo cocido, hummus de lenteja, vegetales crudités y aderezo de limón.",
      momentType: "RFG",
      image: "/img/catering/ensalada-caesar.jpg",
      laborMinutes: 10,
      difficultyFactor: 1.0,
      targetMarginPercent: 0.46,
      servingSize: "Caja 220g",
      isVegetarian: true,
      isGlutenFree: true,
      ingredients: [
        { slug: "huevo-organico", quantity: 1 },
        { slug: "lentejas-rojas", quantity: 60 },
        { slug: "tomate-cherry",  quantity: 40 },
        { slug: "limon-tahiti",   quantity: 0.3 },
        { slug: "aceite-oliva",   quantity: 5 },
      ],
    },
    {
      name: "Cóctel Maracuyá Premium",
      description: "Mocktail con pulpa fresca de maracuyá, jengibre y soda artesanal.",
      momentType: "COC",
      image: "/img/catering/limonada-coco.jpg",
      laborMinutes: 4,
      difficultyFactor: 1.0,
      targetMarginPercent: 0.55,
      servingSize: "Copa 250ml",
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: true,
      ingredients: [
        { slug: "maracuya",      quantity: 1 },
        { slug: "limon-tahiti",  quantity: 0.5 },
        { slug: "miel-organica", quantity: 12 },
      ],
    },
    {
      name: "Mousse Cacao 70%",
      description: "Mousse aireado de cacao puro, crema de leche y fresa fresca.",
      momentType: "MEX",
      image: "/img/catering/mousse-chocolate.jpg",
      laborMinutes: 14,
      difficultyFactor: 1.2,
      targetMarginPercent: 0.50,
      servingSize: "Vasito 120g",
      isVegetarian: true,
      ingredients: [
        { slug: "cacao-puro",    quantity: 25 },
        { slug: "crema-leche",   quantity: 60 },
        { slug: "fresa-fresca",  quantity: 30 },
        { slug: "miel-organica", quantity: 8 },
      ],
    },
  ];

  let recipeCount = 0;
  for (const r of recipes) {
    const categoryId = catMap.get(r.momentType);
    if (!categoryId) continue;

    const existing = await prisma.menuItem.findFirst({ where: { name: r.name } });
    let menuItemId: string;
    if (existing) {
      // Actualizar campos de costeo
      const upd = await prisma.menuItem.update({
        where: { id: existing.id },
        data: {
          description: r.description,
          image: r.image,
          momentType: r.momentType,
          laborMinutes: r.laborMinutes,
          difficultyFactor: r.difficultyFactor,
          targetMarginPercent: r.targetMarginPercent,
          servingSize: r.servingSize,
          isVegetarian: r.isVegetarian ?? false,
          isVegan: r.isVegan ?? false,
          isGlutenFree: r.isGlutenFree ?? false,
          isActive: true,
          basePrice: existing.basePrice, // se recalcula abajo
        },
      });
      menuItemId = upd.id;
      // Limpiar ingredientes y recrear
      await prisma.menuItemIngredient.deleteMany({ where: { menuItemId } });
    } else {
      const cr = await prisma.menuItem.create({
        data: {
          categoryId,
          name: r.name,
          description: r.description,
          image: r.image,
          basePrice: 0, // placeholder, se recalcula abajo
          momentType: r.momentType,
          servingSize: r.servingSize,
          laborMinutes: r.laborMinutes,
          difficultyFactor: r.difficultyFactor,
          targetMarginPercent: r.targetMarginPercent,
          isVegetarian: r.isVegetarian ?? false,
          isVegan: r.isVegan ?? false,
          isGlutenFree: r.isGlutenFree ?? false,
        },
      });
      menuItemId = cr.id;
    }

    // Ingredientes
    let cmpPerPortion = 0;
    for (const ing of r.ingredients) {
      const ingredientId = ingredientMap.get(ing.slug);
      if (!ingredientId) continue;
      await prisma.menuItemIngredient.create({
        data: { menuItemId, ingredientId, quantity: ing.quantity },
      });
      const cat = ingredients.find((i) => i.slug === ing.slug)!;
      cmpPerPortion += (ing.quantity / cat.yieldPercent) * cat.costPerUnit;
    }

    // Calcular basePrice sugerido: cost + margin → precio por persona
    const config = await prisma.pricingConfig.findUnique({ where: { id: "default" } });
    const hourly = config ? Number(config.laborCostPerHour) : 18000;
    const factor = config ? Number(config.laborBenefitFactor) : 1.6;
    const cifPct = config ? Number(config.cifPercent) : 0.08;
    const cmo = (r.laborMinutes / 60) * hourly * factor * r.difficultyFactor;
    const cif = cmpPerPortion * cifPct;
    const cost = cmpPerPortion + cmo + cif;
    const basePrice = Math.round(cost / Math.max(0.01, 1 - r.targetMarginPercent));

    await prisma.menuItem.update({
      where: { id: menuItemId },
      data: { basePrice },
    });

    recipeCount++;
  }
  console.log(`  ✓ ${recipeCount} menu items (recipes)`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
