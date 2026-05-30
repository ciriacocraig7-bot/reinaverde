import { NextRequest, NextResponse } from "next/server";
import { readSession } from "@/lib/auth/cookies";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  const session = readSession(request);
  if (!session) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      phone: true,
      avatar: true,
      emailVerified: true,
    },
  });

  if (!user) return NextResponse.json({ user: null }, { status: 200 });
  return NextResponse.json({ user });
}
