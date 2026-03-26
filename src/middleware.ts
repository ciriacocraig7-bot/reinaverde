import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/menu", "/eventos", "/nosotros", "/login", "/registro", "/api/auth"];
const DASHBOARD_PREFIXES = ["/admin", "/cliente", "/chef", "/staff", "/proveedor", "/finanzas"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  const isApi = pathname.startsWith("/api/");
  const isStatic = pathname.startsWith("/_next") || pathname.startsWith("/favicon") || pathname.includes(".");

  if (isPublic || isStatic) {
    return NextResponse.next();
  }

  if (isApi && !pathname.startsWith("/api/auth")) {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    return NextResponse.next();
  }

  const isDashboard = DASHBOARD_PREFIXES.some((p) => pathname.startsWith(p));
  if (isDashboard) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
