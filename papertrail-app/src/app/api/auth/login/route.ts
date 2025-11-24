import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SignJWT } from "jose";

function getJwtSecretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return new TextEncoder().encode(secret);
}

export async function POST(request: NextRequest) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON format." }, { status: 400 });
  }

  const { username, email, password } = payload ?? {};
  const identifier =
    (typeof username === "string" && username.trim()) ||
    (typeof email === "string" && email.trim());

  if (!identifier || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 },
    );
  }

  try {
    const orConditions: Array<Record<string, unknown>> = [];
    if (identifier) {
      const variants = Array.from(
        new Set([identifier, identifier.toLowerCase(), identifier.toUpperCase()]),
      );
      variants.forEach((value) => {
        if (value) {
          orConditions.push({ email: { equals: value } });
          orConditions.push({ userName: { equals: value } });
        }
      });
    }

    const user = await prisma.user.findFirst({
      where: { OR: orConditions },
      include: { role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const isPasswordValid = user.password === password;
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid password." }, { status: 401 });
    }

    const rawRole = user.role.roleName?.toLowerCase().replace(/\s+/g, "_");
    const userRole =
      rawRole === "research_admin"
        ? "admin"
        : rawRole === "pi"
          ? "principal_investigator"
          : rawRole || "viewer";
    const numericId =
      typeof user.id === "bigint" ? Number(user.id) : Number(user.id ?? 0);

    const token = await new SignJWT({ userId: numericId, role: userRole, userName: user.userName })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(getJwtSecretKey());

    const responsePayload = {
      id: numericId,
      userName: user.userName,
      email: user.email,
      role: userRole,
    };

    const response = NextResponse.json({ token, user: responsePayload }, { status: 200 });

    response.cookies.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
