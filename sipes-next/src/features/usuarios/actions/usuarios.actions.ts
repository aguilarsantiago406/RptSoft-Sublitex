"use server";

import { revalidatePath } from "next/cache";
import {
  createUsuario,
  updateUsuario,
  deleteUsuario,
} from "../api/usuarios.api";
import type { CreateUsuarioInput, UpdateUsuarioInput } from "../types/usuario";

export async function actionCrearUsuario(data: CreateUsuarioInput) {
  try {
    if (!data.nombre?.trim()) {
      return { ok: false, error: "El nombre es obligatorio." };
    }
    if (!data.email?.trim() || !data.email.includes("@")) {
      return { ok: false, error: "El correo electrónico no es válido." };
    }
    if (!data.password || data.password.length < 6) {
      return { ok: false, error: "La contraseña debe tener al menos 6 caracteres." };
    }
    if (!data.rol) {
      return { ok: false, error: "Debes seleccionar un rol válido." };
    }

    const nuevo = await createUsuario({
      nombre: data.nombre.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password,
      rol: data.rol,
      activo: data.activo ?? true,
    });

    revalidatePath("/usuarios");
    return { ok: true, usuario: nuevo };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al registrar usuario.";
    return { ok: false, error: message };
  }
}

export async function actionActualizarUsuario(
  id: string,
  data: UpdateUsuarioInput
) {
  try {
    if (data.nombre !== undefined && !data.nombre.trim()) {
      return { ok: false, error: "El nombre no puede estar vacío." };
    }

    const actualizado = await updateUsuario(id, {
      ...data,
      nombre: data.nombre ? data.nombre.trim() : undefined,
    });

    revalidatePath("/usuarios");
    return { ok: true, usuario: actualizado };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al actualizar usuario.";
    return { ok: false, error: message };
  }
}

export async function actionToggleEstadoUsuario(id: string, activo: boolean) {
  try {
    await updateUsuario(id, { activo });
    revalidatePath("/usuarios");
    return { ok: true };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error al cambiar estado del usuario.";
    return { ok: false, error: message };
  }
}

export async function actionEliminarUsuario(id: string) {
  try {
    await deleteUsuario(id);
    revalidatePath("/usuarios");
    return { ok: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al eliminar usuario.";
    return { ok: false, error: message };
  }
}
