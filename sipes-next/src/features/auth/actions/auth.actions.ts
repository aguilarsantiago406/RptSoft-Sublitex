"use server";

import { cookies } from "next/headers";
import { loginConBackend } from "../api/auth.api";
import { SESSION_COOKIE } from "@/lib/auth/session";

export interface ActionResult<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

export async function actionLogin(formData: {
  email: string;
  password: string;
}): Promise<ActionResult> {
  const email = formData.email?.trim() ?? "";
  const password = formData.password ?? "";

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
