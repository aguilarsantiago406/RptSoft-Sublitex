const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

import { logger } from "@/utils/logger";

const TOKEN_KEY = "sipes_token";

let tokenCache: string | null = null;

function leerToken(): string | null {
  if (tokenCache !== null) return tokenCache;
  if (typeof window === "undefined") return null;
  tokenCache = window.localStorage.getItem(TOKEN_KEY);
  return tokenCache;
}

/** Persiste el token JWT en localStorage (y en memoria) para las próximas llamadas. */
export function setAuthToken(token: string | null): void {
  tokenCache = token;
  if (typeof window === "undefined") return;
  if (token) {
    window.localStorage.setItem(TOKEN_KEY, token);
  } else {
    window.localStorage.removeItem(TOKEN_KEY);
  }
}

/** Devuelve el token JWT guardado, o null si no hay sesión. */
export function getAuthToken(): string | null {
  return leerToken();
}

/**
 * Cliente HTTP mínimo contra el backend real (NestJS).
 * - No cachea respuestas (cache: "no-store").
 * - Agrega Authorization: Bearer <token> si hay sesión.
 * - Ante !res.ok parsea { message, statusCode } y lanza Error con el mensaje del backend.
 * - 204 devuelve undefined.
 */
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);

  if (init?.body != null && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const token = leerToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    // 401 con token = sesión vencida o inválida: limpiamos y volvemos al login.
    // El 401 del propio endpoint de login lo maneja la página de login, no esto.
    if (res.status === 401 && token && path !== "/api/auth/login") {
      setAuthToken(null);
      logger.warn("Api", "Sesión vencida, redirigiendo al login", { path });
      if (typeof window !== "undefined") {
        window.location.assign("/login");
      }
      throw new Error("Sesión vencida. Vuelve a iniciar sesión.");
    }

    let mensaje = `Error ${res.status}`;
    try {
      const cuerpo = (await res.json()) as {
        message?: string | string[];
        statusCode?: number;
      };
      if (cuerpo?.message) {
        mensaje = Array.isArray(cuerpo.message)
          ? cuerpo.message.join(", ")
          : cuerpo.message;
      }
    } catch {
      // El backend respondió sin cuerpo JSON: conservamos el mensaje por defecto.
    }
    logger.error("Api", `${init?.method ?? "GET"} ${path} → ${res.status}`, {
      mensaje,
    });
    throw new Error(mensaje);
  }

  if (res.status === 204) return undefined as T;
  const datos = (await res.json()) as T;
  logger.debug("Api", `${init?.method ?? "GET"} ${path} → ${res.status}`, {
    items: Array.isArray(datos) ? datos.length : undefined,
  });
  return datos;
}
