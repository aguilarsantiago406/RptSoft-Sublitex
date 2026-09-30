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

export async function getUsuario(id: string): Promise<UsuarioItem> {
  return apiGet<UsuarioItem>(`/api/auth/${encodeURIComponent(id)}`);
}

export interface CambiarPasswordInput {
  currentPassword?: string;
  newPassword: string;
}

export async function cambiarPasswordUsuario(
  id: string,
  data: CambiarPasswordInput
): Promise<{ message: string }> {
  return apiPatch<{ message: string }>(
    `/api/auth/${encodeURIComponent(id)}/password`,
    {
      newPassword: data.newPassword,
      currentPassword: data.currentPassword?.trim() || undefined,
    }
  );
}

export async function changePasswordUsuario(
  id: string,
  newPassword: string,
  currentPassword?: string
): Promise<{ message: string }> {
  return cambiarPasswordUsuario(id, { currentPassword, newPassword });
}

