/**
 * POST /api/admin/products/import
 *
 * Multipart/form-data:
 *   - file:    CSV (UTF-8) con header de columnas
 *   - dryRun:  "true" para preview, "false" para commit
 *
 * Columnas esperadas (case-insensitive, extra columnas ignoradas):
 *   businessLine, categorySlug, name, slug?, shortDesc?, description?,
 *   price, comparePrice?, sku?, weight?, unit?, stock?, lowStock?, tags?,
 *   badge?, isFeatured?, isActive?, image?, images?
 *
 * Tags / images como string separados por "|" (pipe).
 *
 * Acceso: ADMIN.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRoles } from "@/lib/auth/require-role";
import { slugify } from "@/lib/utils";
import { BusinessLine } from "@/generated/prisma/enums";

export const maxDuration = 60;
export const runtime = "nodejs";

interface ParsedRow {
  line: number;
  raw: Record<string, string>;
  /** errores de validación que impiden importar esta fila. */
  errors: string[];
  /** datos listos para Prisma. null si hay errores. */
  ready:
    | null
    | {
        businessLine: "CATERING" | "PHARMA" | "LIOFILIZADOS";
        categorySlug: string;
        name: string;
        slug: string;
        shortDesc: string | null;
        description: string | null;
        price: number;
        comparePrice: number | null;
        sku: string | null;
        weight: string | null;
        unit: string | null;
        stock: number;
        lowStock: number;
        tags: string[];
        badge: string | null;
        isFeatured: boolean;
        isActive: boolean;
        image: string | null;
        images: string[];
      };
}

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  // Parser CSV muy simple: respeta comillas dobles "...".
  const rows: string[][] = [];
  let cur: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        cur.push(field);
        field = "";
      } else if (ch === "\n" || ch === "\r") {
        if (field !== "" || cur.length > 0) {
          cur.push(field);
          rows.push(cur);
          cur = [];
          field = "";
        }
        if (ch === "\r" && text[i + 1] === "\n") i++;
      } else {
        field += ch;
      }
    }
  }
  if (field !== "" || cur.length > 0) {
    cur.push(field);
    rows.push(cur);
  }
  if (rows.length === 0) return { headers: [], rows: [] };
  const headers = rows[0].map((h) => h.trim().toLowerCase());
  return { headers, rows: rows.slice(1) };
}

function boolish(v: string | undefined): boolean {
  if (!v) return false;
  const s = v.trim().toLowerCase();
  return s === "true" || s === "1" || s === "yes" || s === "si" || s === "sí";
}

const BUSINESS_LINES = Object.values(BusinessLine) as string[];

export async function POST(request: NextRequest) {
  const auth = requireRoles(request, ["ADMIN"]);
  if (auth instanceof NextResponse) return auth;

  try {
    const form = await request.formData();
    const file = form.get("file");
    const dryRun = String(form.get("dryRun") ?? "true") === "true";
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Falta 'file' (multipart/form-data)." },
        { status: 400 },
      );
    }

    const text = await file.text();
    const { headers, rows } = parseCSV(text);
    if (rows.length === 0) {
      return NextResponse.json(
        { error: "CSV vacío o sin filas." },
        { status: 400 },
      );
    }

    // Cargar categorías para validar y resolver slug → id.
    const categories = await prisma.productCategory.findMany({
      select: { id: true, slug: true, businessLine: true },
    });
    const catByLineSlug = new Map<string, string>();
    for (const c of categories) {
      catByLineSlug.set(`${c.businessLine}::${c.slug}`, c.id);
    }

    const idx = (col: string) => headers.indexOf(col.toLowerCase());

    const parsed: ParsedRow[] = rows.map((row, i) => {
      const get = (col: string) => {
        const k = idx(col);
        return k >= 0 ? (row[k] ?? "").trim() : "";
      };
      const businessLine = get("businessline").toUpperCase();
      const categorySlug = get("categoryslug");
      const name = get("name");
      const priceRaw = get("price");
      const price = parseFloat(priceRaw.replace(/[^0-9.,-]/g, "").replace(",", "."));

      const errors: string[] = [];
      if (!BUSINESS_LINES.includes(businessLine)) {
        errors.push(`businessLine "${businessLine}" inválido`);
      }
      if (!categorySlug) errors.push("falta categorySlug");
      if (!name) errors.push("falta name");
      if (!Number.isFinite(price) || price <= 0) errors.push(`price inválido: "${priceRaw}"`);

      const categoryKey = `${businessLine}::${categorySlug}`;
      if (BUSINESS_LINES.includes(businessLine) && categorySlug && !catByLineSlug.has(categoryKey)) {
        errors.push(`categoría "${categorySlug}" no existe para ${businessLine}`);
      }

      const raw: Record<string, string> = {};
      headers.forEach((h, k) => (raw[h] = row[k] ?? ""));

      if (errors.length > 0) {
        return { line: i + 2, raw, errors, ready: null };
      }

      const slug = get("slug") || slugify(name);
      const tags = (get("tags") || "")
        .split("|")
        .map((t) => t.trim())
        .filter(Boolean);
      const images = (get("images") || "")
        .split("|")
        .map((t) => t.trim())
        .filter(Boolean);

      return {
        line: i + 2,
        raw,
        errors,
        ready: {
          businessLine: businessLine as "CATERING" | "PHARMA" | "LIOFILIZADOS",
          categorySlug,
          name,
          slug,
          shortDesc: get("shortdesc") || null,
          description: get("description") || null,
          price,
          comparePrice: parseFloat(get("compareprice").replace(",", ".")) || null,
          sku: get("sku") || null,
          weight: get("weight") || null,
          unit: get("unit") || null,
          stock: parseInt(get("stock") || "0", 10),
          lowStock: parseInt(get("lowstock") || "5", 10),
          tags,
          badge: get("badge") || null,
          isFeatured: boolish(get("isfeatured")),
          isActive: get("isactive") === "" ? true : boolish(get("isactive")),
          image: get("image") || (images[0] ?? null),
          images,
        },
      };
    });

    const valid = parsed.filter((p) => p.ready !== null);
    const invalid = parsed.filter((p) => p.ready === null);
    const summary = {
      totalRows: parsed.length,
      validRows: valid.length,
      invalidRows: invalid.length,
      created: 0,
      updated: 0,
    };

    if (dryRun) {
      return NextResponse.json({ dryRun: true, summary, valid, invalid });
    }

    // Commit — upsert por (businessLine + slug).
    for (const row of valid) {
      const r = row.ready!;
      const catId = catByLineSlug.get(`${r.businessLine}::${r.categorySlug}`)!;
      const result = await prisma.product.upsert({
        where: { businessLine_slug: { businessLine: r.businessLine, slug: r.slug } },
        update: {
          categoryId: catId,
          name: r.name,
          shortDesc: r.shortDesc,
          description: r.description,
          price: r.price,
          comparePrice: r.comparePrice,
          sku: r.sku,
          weight: r.weight,
          unit: r.unit,
          stock: r.stock,
          lowStock: r.lowStock,
          tags: r.tags,
          badge: r.badge,
          isFeatured: r.isFeatured,
          isActive: r.isActive,
          image: r.image,
          images: r.images,
        },
        create: {
          businessLine: r.businessLine,
          categoryId: catId,
          name: r.name,
          slug: r.slug,
          shortDesc: r.shortDesc,
          description: r.description,
          price: r.price,
          comparePrice: r.comparePrice,
          sku: r.sku,
          weight: r.weight,
          unit: r.unit,
          stock: r.stock,
          lowStock: r.lowStock,
          tags: r.tags,
          badge: r.badge,
          isFeatured: r.isFeatured,
          isActive: r.isActive,
          image: r.image,
          images: r.images,
        },
      });
      // No tenemos manera barata de saber "created vs updated" desde upsert.
      // Hacemos un upsert con select de createdAt y comparamos contra updatedAt:
      if (result.createdAt.getTime() === result.updatedAt.getTime()) {
        summary.created++;
      } else {
        summary.updated++;
      }
    }

    return NextResponse.json({ dryRun: false, summary, invalid });
  } catch (err) {
    console.error("import error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error" },
      { status: 500 },
    );
  }
}
