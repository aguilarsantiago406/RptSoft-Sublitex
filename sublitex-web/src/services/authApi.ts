import { api, setAuthToken } from "./apiClient";

export interface UsuarioSesion {
  id: string;
  email: string;
  nombre: string;
  rol: string;
}

export interface RespuestaLogin {
  accessToken: string;
  user: UsuarioSesion;
}

/** Inicia sesión contra el backend y persiste el JWT vía apiClient. */
export async function iniciarSesion(
  email: string,
  password: string
): Promise<RespuestaLogin> {
  const respuesta = await api<RespuestaLogin>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setAuthToken(respuesta.accessToken);
  return respuesta;
}

/** Cierra la sesión local (descarta el JWT persistido). */
export function cerrarSesion(): void {
  setAuthToken(null);
}