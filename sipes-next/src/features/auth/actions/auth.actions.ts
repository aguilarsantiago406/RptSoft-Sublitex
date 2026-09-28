"use server";

import { cookies } from "next/headers";
import { loginConBackend } from "../api/auth.api";
import { SESSION_COOKIE } from "@/lib/auth/session";

export interface ActionResult<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

export async function actionLogin(formData: FormData): Promise<ActionResult> {
  const email = (formData.get("email") as string)?.trim() ?? "";
  const password = (formData.get("password") as string) ?? "";

  if (!email || !password) {
    return { ok: false, error: "Correo y contraseña son obligatorios." };
  }

  try {
    const { accessToken, user } = await loginConBackend(email, password);
    const store = await cookies();
    store.set(SESSION_COOKIE, accessToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
      secure: process.env.NODE_ENV === "production",
    });

    return { ok: true, data: user };
  } catch (error: any) {
    return {
      ok: false,
      error: error?.message || "Credenciales incorrectas o error en el servidor.",
    };
  }
}

export async function actionLogout(): Promise<ActionResult> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  return { ok: true };
}
