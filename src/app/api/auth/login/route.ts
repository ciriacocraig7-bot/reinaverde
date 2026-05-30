import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/validators/auth";
import { verifyPassword } from "@/lib/auth/passwords";
import { signToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db/prisma";
import { buildSessionCookie } from "@/lib/auth/cookies";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: validation.error.flatten() },
        { status: 400 },
      );
    }

    const { email, password } = validation.data;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { ownedCompany: true },
    });
    if (!user || !user.isActive) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    const res = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
      },
      token, // back-compat — clients reading localStorage still work
    });
    res.headers.append("Set-Cookie", buildSessionCookie(token));
    return res;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
