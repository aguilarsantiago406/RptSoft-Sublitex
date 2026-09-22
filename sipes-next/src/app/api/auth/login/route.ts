import { NextResponse, type NextRequest } from "next/server";
import { SipesApiError } from "@/lib/api/http";
import { SESSION_COOKIE } from "@/lib/auth/session";
import { loginConBackend } from "@/features/auth/api/auth.api";

export async function POST(request: NextRequest) {
  let email = "";
  let password = "";

  try {
    const body = (await request.json()) as { email?: unknown; password?: unknown };
    email = typeof body.email === "string" ? body.email.trim() : "";
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ message: "Correo y contraseña son obligatorios." }, { status: 400 });
  }

  if (!email || !password) {
    return NextResponse.json({ message: "Correo y contraseña son obligatorios." }, { status: 400 });
  }

  try {
    const { accessToken, user } = await loginConBackend(email, password);
    const response = NextResponse.json({ user }, { status: 201 });
    response.cookies.set(SESSION_COOKIE, accessToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
      secure: process.env.NODE_ENV === "production",
    });
    return response;
  } catch (error) {
    if (error instanceof SipesApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    return NextResponse.json({ message: "No pudimos conectarnos con el backend SIPES." }, { status: 500 });
  }
}