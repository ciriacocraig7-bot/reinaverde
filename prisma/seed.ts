import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL || "";
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
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

  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
