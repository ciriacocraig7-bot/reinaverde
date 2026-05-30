import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * Health check para uptime monitors externos (UptimeRobot, BetterStack, etc.).
 *
 * - 200 OK si la app está viva y puede tocar la BD.
 * - 503 si la BD está caída (Neon hibernando o sin permiso).
 *
 * El header `X-RV-Version` permite a los monitores notar redeploys: cuando
 * cambia el commit SHA, los rolling restarts dejan trazabilidad.
 */
export async function GET() {
  const started = Date.now();
  let db: "ok" | "error" = "ok";
  let dbLatencyMs: number | null = null;

  try {
    const t0 = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - t0;
  } catch {
    db = "error";
  }

  const status = db === "ok" ? 200 : 503;
  const payload = {
    ok: db === "ok",
    service: "reina-verde",
    db,
    dbLatencyMs,
    region: process.env.VERCEL_REGION ?? "local",
    commit: (process.env.VERCEL_GIT_COMMIT_SHA ?? "dev").slice(0, 7),
    uptime: Math.round(process.uptime()),
    elapsedMs: Date.now() - started,
    ts: new Date().toISOString(),
  };

  return NextResponse.json(payload, {
    status,
    headers: {
      "X-RV-Version": payload.commit,
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
