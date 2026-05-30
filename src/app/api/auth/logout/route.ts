import { NextResponse } from "next/server";
import { buildClearedSessionCookie } from "@/lib/auth/cookies";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.headers.append("Set-Cookie", buildClearedSessionCookie());
  return res;
}
