"use server";

import { revalidatePath } from "next/cache";
import { createCliente, updateCliente, deleteCliente } from "../api/clientes.api";
import type { Cliente, CreateClienteInput, UpdateClienteInput } from "../types/cliente";

export interface ActionResult<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

export async function actionCrearCliente(
  input: CreateClienteInput
): Promise<ActionResult<Cliente>> {
  if (!input.nombre || input.nombre.trim().length === 0) {
    return { ok: false, error: "El nombre de la organización o cliente es obligatorio." };
  }

  if (!input.tipo) {
    return { ok: false, error: "El tipo de cliente es obligatorio." };
  }

  try {
    const cliente = await createCliente({
      nombre: input.nombre.trim(),
      tipo: input.tipo,
      telefono: input.telefono?.trim() || undefined,
      ciudad: input.ciudad?.trim() || undefined,
    });

    revalidatePath("/clientes");
    revalidatePath("/pedidos");

    return { ok: true, data: cliente };
  } catch (error: unknown) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "No se pudo crear el cliente.",
    };
  }
}

export async function actionActualizarCliente(
  id: string,
  input: UpdateClienteInput
): Promise<ActionResult<Cliente>> {
  if (input.nombre !== undefined && input.nombre.trim().length === 0) {
    return { ok: false, error: "El nombre de la organización o cliente no puede quedar vacío." };
  }

  try {
    const cliente = await updateCliente(id, {
      nombre: input.nombre ? input.nombre.trim() : undefined,
      tipo: input.tipo,
      telefono: input.telefono !== undefined ? input.telefono.trim() || undefined : undefined,
      ciudad: input.ciudad !== undefined ? input.ciudad.trim() || undefined : undefined,
    });

    revalidatePath("/clientes");
    revalidatePath(`/clientes/${id}`);
    revalidatePath("/pedidos");

    return { ok: true, data: cliente };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "No se pudo actualizar el cliente.";
    return {
      ok: false,
      error: message,
    };
  }
}

export async function actionEliminarCliente(id: string): Promise<ActionResult> {
  try {
    await deleteCliente(id);

    revalidatePath("/clientes");
    revalidatePath("/pedidos");

    return { ok: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "No se pudo eliminar el cliente.";
    return {
      ok: false,
      error: message,
    };
  }
}
