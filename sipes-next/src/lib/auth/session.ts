import { cookies } from "next/headers";
import type { UsuarioSesion } from "@/features/auth/types/auth";

export const SESSION_COOKIE = "sipes_token";

export async function getSessionToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

export async function getUserFromToken(): Promise<UsuarioSesion | null> {
  const token = await getSessionToken();
  if (!token) return null;

  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return null;

    const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const json = Buffer.from(base64, "base64").toString("utf-8");
    const payload = JSON.parse(json) as Partial<UsuarioSesion>;

    if (!payload.id || !payload.email || !payload.nombre || !payload.rol) return null;

    return {
      id: payload.id,
      email: payload.email,
      nombre: payload.nombre,
      rol: payload.rol,
    };
  } catch {
    return null;
  }
}