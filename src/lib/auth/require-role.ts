/**
 * requireRoles — pequeño helper para handlers /api/admin/* que rechaza
 * sesiones sin uno de los roles requeridos. Devuelve el JWTPayload o un
 * NextResponse con 401/403.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { readSession } from "./cookies";
import type { JWTPayload } from "./jwt";

export type AllowedRole = "ADMIN" | "CHEF" | "STAFF" | "FINANZAS" | "PROVEEDOR" | "CLIENTE";

export function requireRoles(
  request: NextRequest | Request,
  allowed: AllowedRole[],
): JWTPayload | NextResponse {
  const session = readSession(request);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!allowed.includes(session.role as AllowedRole)) {
    return NextResponse.json(
      { error: `Rol "${session.role}" no autorizado para esta acción` },
      { status: 403 },
    );
  }
  return session;
}
