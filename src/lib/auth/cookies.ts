/**
 * Session-cookie helpers.
 *
 * The JWT lives in `rv-session` (httpOnly, secure in prod, SameSite=Lax).
 * Routes that previously accepted only Bearer headers now accept either,
 * so the migration is backwards-compatible: existing front-end fetches
 * with `Authorization: Bearer …` keep working until they're updated.
 */
import type { NextRequest } from "next/server";
import { verifyToken, type JWTPayload } from "@/lib/auth/jwt";

const SESSION_COOKIE = "rv-session";
const ONE_WEEK_SECONDS = 60 * 60 * 24 * 7;

export const SESSION_COOKIE_NAME = SESSION_COOKIE;

export function sessionCookieValue(token: string) {
  // Encode for use in a Set-Cookie string (manual / Set-Cookie header path).
  return token;
}

/**
 * Returns a Set-Cookie header string for the session JWT.
 * Use in NextResponse.headers.append("Set-Cookie", buildSessionCookie(token)).
 */
export function buildSessionCookie(token: string): string {
  const parts = [
    `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
    "Path=/",
    `Max-Age=${ONE_WEEK_SECONDS}`,
    "HttpOnly",
    "SameSite=Lax",
  ];
  if (process.env.NODE_ENV === "production") parts.push("Secure");
  return parts.join("; ");
}

export function buildClearedSessionCookie(): string {
  const parts = [
    `${SESSION_COOKIE}=`,
    "Path=/",
    "Max-Age=0",
    "HttpOnly",
    "SameSite=Lax",
  ];
  if (process.env.NODE_ENV === "production") parts.push("Secure");
  return parts.join("; ");
}

/**
 * Resolve the calling user from either a Bearer header (legacy) or the
 * `rv-session` cookie (new). Returns the JWT payload or null.
 */
export function readSession(request: NextRequest | Request): JWTPayload | null {
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    const token = auth.slice("Bearer ".length).trim();
    const payload = verifyToken(token);
    if (payload) return payload;
  }
  // NextRequest has typed cookies; plain Request does not.
  const maybeNextReq = request as NextRequest;
  const cookieValue =
    typeof maybeNextReq.cookies?.get === "function"
      ? maybeNextReq.cookies.get(SESSION_COOKIE)?.value
      : readCookieFromHeader(request.headers.get("cookie"), SESSION_COOKIE);
  if (cookieValue) {
    return verifyToken(decodeURIComponent(cookieValue));
  }
  return null;
}

function readCookieFromHeader(cookieHeader: string | null, name: string): string | undefined {
  if (!cookieHeader) return undefined;
  const parts = cookieHeader.split(";").map((s) => s.trim());
  for (const p of parts) {
    const [k, ...rest] = p.split("=");
    if (k === name) return rest.join("=");
  }
  return undefined;
}
