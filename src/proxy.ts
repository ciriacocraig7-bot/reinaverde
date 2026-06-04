import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { consume, ipFromRequest, type RateLimitConfig } from "@/lib/rate-limit";

const PUBLIC_PATHS = ["/", "/menu", "/eventos", "/nosotros", "/login", "/registro", "/recuperar", "/restablecer", "/feedback", "/api/auth"];
const DASHBOARD_PREFIXES = ["/admin", "/cliente", "/chef", "/staff", "/proveedor", "/finanzas"];

// ─── Rate limits ─────────────────────────────────────────────────
// Tuned so a brute-force script gets shut down in seconds while a real
// user never notices the limit during normal operation.
const RL_AUTH: RateLimitConfig    = { capacity: 30,  windowMs: 60_000 };       // 30/min per IP
const RL_WEBHOOK: RateLimitConfig = { capacity: 600, windowMs: 60_000 };       // 600/min per IP
const RL_DEFAULT: RateLimitConfig = { capacity: 240, windowMs: 60_000 };       // 240/min per IP

function rateLimitFor(pathname: string): RateLimitConfig | null {
  if (pathname.startsWith("/api/auth/")) return RL_AUTH;
  if (pathname.startsWith("/api/webhooks/")) return RL_WEBHOOK;
  if (pathname.startsWith("/api/")) return RL_DEFAULT;
  return null;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
  const isApi = pathname.startsWith("/api/");
  const isStatic =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".");

  if (isStatic) return NextResponse.next();

  // ─── Rate limit (all /api/*) ────────────────────────────────────
  const rlCfg = rateLimitFor(pathname);
  if (rlCfg) {
    const key = `${pathname.split("/").slice(0, 4).join("/")}:${ipFromRequest(request)}`;
    const rl = consume(key, rlCfg);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Reintenta más tarde." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rl.retryAfterSeconds),
            "X-RateLimit-Remaining": "0",
          },
        },
      );
    }
  }

  if (isPublic) return NextResponse.next();

  // Public API routes: auth, webhooks, health, catering pay, read-only catalogs.
  // Shop-orders POST también es público porque soporta guest checkout (sin
  // sesión). El handler valida internamente que venga `guest` data si no hay
  // sesión. Para GET y rutas dinámicas con [id] sí pedimos auth aquí.
  const isPublicApi =
    pathname === "/api/health" ||
    pathname === "/api/shop-orders" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/webhooks/") ||
    pathname.startsWith("/api/catering/pay/") ||
    pathname.startsWith("/api/catering/pricing-preview") ||
    pathname.startsWith("/api/catering/quotes") || // GET + POST + pay-bold + pdf
    pathname.startsWith("/api/feedback") || // GET público + POST feedback
    pathname.startsWith("/api/menu") ||
    pathname.startsWith("/api/products") ||
    pathname.startsWith("/api/product-categories");

  // Guest puede pedir config Bold sin sesión (el handler valida).
  const isGuestPayPath = /^\/api\/shop-orders\/[a-f0-9-]+\/pay(\/bold)?$/.test(pathname);

  if (isApi && !isPublicApi && !isGuestPayPath) {
    // Accept Bearer header OR rv-session cookie.
    const authHeader = request.headers.get("authorization");
    const hasBearer = authHeader?.startsWith("Bearer ");
    const hasCookie = Boolean(request.cookies.get("rv-session")?.value);
    if (!hasBearer && !hasCookie) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    return NextResponse.next();
  }

  const isDashboard = DASHBOARD_PREFIXES.some((p) => pathname.startsWith(p));
  if (isDashboard) return NextResponse.next();

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
