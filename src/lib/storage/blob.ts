/**
 * Vercel Blob storage helper.
 *
 * Reina Verde sube todas las imágenes nuevas (productos, recetas, eventos)
 * aquí. Las imágenes históricas en `/public/img/...` siguen funcionando como
 * fallback en src/lib/product-images.ts.
 *
 * Configuración:
 *   - Var de entorno: BLOB_READ_WRITE_TOKEN (auto-set en Vercel cuando se
 *     conecta el blob store al proyecto).
 *   - El admin sube vía POST /api/admin/upload; este módulo es la capa fina
 *     sobre @vercel/blob para que el handler quede en una sola línea.
 */

import { put, del } from "@vercel/blob";

type UploadPrefix = "product" | "menu" | "ingredient" | "event" | "user";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);

export interface UploadResult {
  url: string;
  pathname: string;
  size: number;
  contentType: string;
}

export class UploadError extends Error {
  constructor(message: string, public statusCode = 400) {
    super(message);
    this.name = "UploadError";
  }
}

/**
 * Sube un archivo a Vercel Blob.
 *
 * El pathname usa formato:
 *   {prefix}/{yyyy}/{mm}/{randomId}-{originalName}
 *
 * Esto agrupa por categoría y fecha — facilita auditoría y limpieza.
 */
export async function uploadImage(
  file: File,
  prefix: UploadPrefix,
): Promise<UploadResult> {
  if (!file) {
    throw new UploadError("No se recibió ningún archivo.", 400);
  }
  if (file.size > MAX_BYTES) {
    throw new UploadError(
      `El archivo pesa ${(file.size / 1024 / 1024).toFixed(1)} MB. Máximo permitido: 8 MB.`,
      413,
    );
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new UploadError(
      `Tipo no permitido: ${file.type || "(desconocido)"}. Solo JPG, PNG, WebP, AVIF o GIF.`,
      415,
    );
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new UploadError(
      "Vercel Blob no está configurado. Define BLOB_READ_WRITE_TOKEN.",
      500,
    );
  }

  const now = new Date();
  const yyyy = String(now.getUTCFullYear());
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const randomId = Math.random().toString(36).slice(2, 8);
  const cleanName = file.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  const pathname = `${prefix}/${yyyy}/${mm}/${randomId}-${cleanName}`;

  const blob = await put(pathname, file, {
    access: "public",
    contentType: file.type,
    addRandomSuffix: false, // ya agregamos randomId arriba
  });

  return {
    url: blob.url,
    pathname: blob.pathname,
    size: file.size,
    contentType: file.type,
  };
}

/**
 * Elimina una imagen previamente subida.
 *
 * Recibe el pathname (no la URL completa) para que sea idempotente y permita
 * borrar varios a la vez si en el futuro se hace bulk-delete.
 */
export async function deleteImage(pathname: string): Promise<void> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return; // no-op en dev sin token
  try {
    await del(pathname);
  } catch (err) {
    // Bloob.delete no devuelve error si el archivo ya no existe.
    // Solo loggeamos para inspección.
    console.warn("blob.delete failed:", pathname, err);
  }
}
