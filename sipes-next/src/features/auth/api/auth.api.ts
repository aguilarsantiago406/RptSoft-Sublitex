import { apiGet, SipesApiError } from "@/lib/api/http";
import type { RolUsuario } from "@/features/usuarios/types/usuario";
import type { RespuestaLogin } from "../types/auth";

const AUTH_API_URL = process.env.SIPES_API_URL ?? "http://localhost:3001";

export async function loginConBackend(email: string, password: string): Promise<RespuestaLogin> {
  const response = await fetch(`${AUTH_API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });

  if (!response.ok) {
    let message = `El backend respondió con estado ${response.status}`;

    try {
      const body = (await response.json()) as { message?: string | string[] };
      if (Array.isArray(body.message)) message = body.message.join(". ");
      else if (body.message) message = body.message;
    } catch {
      // El cuerpo puede no ser JSON. Conservamos un mensaje útil con el estado.
    }

    throw new SipesApiError(message, response.status);
  }

  return (await response.json()) as RespuestaLogin;
}

export interface MiPerfil {
  id: string;
  email: string;
  nombre: string;
  rol: RolUsuario;
}

export async function getMiPerfil(): Promise<MiPerfil> {
  return apiGet<MiPerfil>("/api/auth/me");
}