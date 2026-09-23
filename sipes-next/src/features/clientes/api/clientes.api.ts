import { apiGet, apiPost } from "@/lib/api/http";
import type { Cliente, CreateClienteInput } from "../types/cliente";

export async function getClientes(q?: string): Promise<Cliente[]> {
  const query = q ? `?q=${encodeURIComponent(q.trim())}` : "";
  return apiGet<Cliente[]>(`/api/clientes${query}`);
}

export async function getCliente(id: string): Promise<Cliente> {
  return apiGet<Cliente>(`/api/clientes/${encodeURIComponent(id)}`);
}

export async function createCliente(input: CreateClienteInput): Promise<Cliente> {
  return apiPost<Cliente>("/api/clientes", input);
}
