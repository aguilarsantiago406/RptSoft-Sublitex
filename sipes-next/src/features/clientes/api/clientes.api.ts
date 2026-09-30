import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api/http";
import type { Cliente, ClienteDetalle, CreateClienteInput, UpdateClienteInput } from "../types/cliente";

export async function getClientes(q?: string): Promise<Cliente[]> {
  const query = q ? `?q=${encodeURIComponent(q.trim())}` : "";
  return apiGet<Cliente[]>(`/api/clientes${query}`);
}

export async function getCliente(id: string): Promise<ClienteDetalle> {
  return apiGet<ClienteDetalle>(`/api/clientes/${encodeURIComponent(id)}`);
}

export async function createCliente(input: CreateClienteInput): Promise<Cliente> {
  return apiPost<Cliente>("/api/clientes", input);
}

export async function updateCliente(id: string, input: UpdateClienteInput): Promise<Cliente> {
  return apiPatch<Cliente>(`/api/clientes/${encodeURIComponent(id)}`, input);
}

export async function deleteCliente(id: string): Promise<{ ok: boolean; message: string }> {
  return apiDelete<{ ok: boolean; message: string }>(`/api/clientes/${encodeURIComponent(id)}`);
}
