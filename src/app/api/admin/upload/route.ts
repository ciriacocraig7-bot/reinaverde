/**
 * POST /api/admin/upload
 *
 * Sube una imagen a Vercel Blob. Multipart/form-data con:
 *   - file: File (image/*, máx 8 MB)
 *   - prefix?: "product" | "menu" | "ingredient" | "event" | "user"  (default: "menu")
 *
 * Devuelve { url, pathname, size, contentType }.
 *
 * Acceso: ADMIN | CHEF.
 */
import { NextRequest, NextResponse } from "next/server";
import { requireRoles } from "@/lib/auth/require-role";
import { uploadImage, UploadError } from "@/lib/storage/blob";

export const maxDuration = 30;
export const runtime = "nodejs";

const VALID_PREFIXES = ["product", "menu", "ingredient", "event", "user"] as const;
type Prefix = (typeof VALID_PREFIXES)[number];

export async function POST(request: NextRequest) {
  const auth = requireRoles(request, ["ADMIN", "CHEF"]);
  if (auth instanceof NextResponse) return auth;

  try {
    const form = await request.formData();
    const file = form.get("file");
    const rawPrefix = String(form.get("prefix") ?? "menu");
    const prefix: Prefix = (VALID_PREFIXES as readonly string[]).includes(rawPrefix)
      ? (rawPrefix as Prefix)
      : "menu";

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Falta el campo 'file' (multipart/form-data)." },
        { status: 400 },
      );
    }

    const result = await uploadImage(file, prefix);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof UploadError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    console.error("upload error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error subiendo imagen" },
      { status: 500 },
    );
  }
}
