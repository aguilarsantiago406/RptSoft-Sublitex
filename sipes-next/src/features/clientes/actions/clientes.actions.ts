"use server";

import { revalidatePath } from "next/cache";
import { createCliente } from "../api/clientes.api";
import type { Cliente, CreateClienteInput } from "../types/cliente";

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
  } catch (error: any) {
    return {
      ok: false,
      error: error?.message || "No se pudo crear el cliente.",
    };
  }
}
