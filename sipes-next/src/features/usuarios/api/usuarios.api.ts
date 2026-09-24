import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api/http";
import type {
  UsuarioItem,
  CreateUsuarioInput,
  UpdateUsuarioInput,
} from "../types/usuario";

export async function getUsuarios(rol?: string): Promise<UsuarioItem[]> {
  const query = rol ? `?rol=${encodeURIComponent(rol)}` : "";
  return apiGet<UsuarioItem[]>(`/api/auth${query}`);
}

export async function createUsuario(data: CreateUsuarioInput): Promise<UsuarioItem> {
  return apiPost<UsuarioItem>("/api/auth/register", data);
}

export async function updateUsuario(
  id: string,
  data: UpdateUsuarioInput
): Promise<UsuarioItem> {
  return apiPatch<UsuarioItem>(`/api/auth/${encodeURIComponent(id)}`, data);
}

export async function deleteUsuario(id: string): Promise<void> {
  return apiDelete<void>(`/api/auth/${encodeURIComponent(id)}`);
}
