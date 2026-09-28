"use server";

import { revalidatePath } from "next/cache";
import { apiGet, apiPost, SipesApiError } from "@/lib/api/http";
import { revocarEnlaceParticipante } from "../api/participantes.api";

export interface CrearParticipanteResult {
  ok: boolean;
  error?: string;
  participante?: {
    id: string;
    nombrePersona: string;
    enlaceToken: string;
    estado: string;
  };
}

export interface PrendaInicialConfig {
  tipoProductoId?: string;
  tipoPrenda?: "VENTA" | "OBSEQUIO" | "MUESTRA";
  esArquero?: boolean;
  colorId?: string;
}

export async function actionCrearParticipante(
  grupoId: string,
  nombrePersona: string,
  pedidoId: string,
  prendaConfig?: PrendaInicialConfig
): Promise<CrearParticipanteResult> {
  const nombreTrimmed = nombrePersona.trim();
  if (!grupoId || !nombreTrimmed) {
    return { ok: false, error: "El nombre y el grupo son obligatorios." };
  }

  try {
    const res = await apiPost<{
      id: string;
      nombrePersona: string;
      enlaceToken: string;
      estado: string;
    }>(`/api/grupos/${encodeURIComponent(grupoId)}/participantes`, {
      nombrePersona: nombreTrimmed,
    });

    if (prendaConfig?.tipoProductoId) {
      try {
        await apiPost("/api/prendas", {
          participanteId: res.id,
          grupoId,
          tipoProductoId: prendaConfig.tipoProductoId,
          tipoPrenda: prendaConfig.tipoPrenda || "VENTA",
          esArquero: Boolean(prendaConfig.esArquero),
          colorId: prendaConfig.colorId || undefined,
          nombreEnPrenda: nombreTrimmed,
        });
      } catch (errPrenda) {
        console.warn("No se pudo crear la prenda inicial:", errPrenda);
      }
    }

    revalidatePath(`/pedidos/${pedidoId}/participantes`);
    revalidatePath(`/pedidos/${pedidoId}/prendas`);
    return { ok: true, participante: res };
  } catch (error) {
    if (error instanceof SipesApiError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "No se pudo registrar el participante en el backend." };
  }
}

export async function actionRegenerarEnlace(
  participanteId: string,
  pedidoId: string
): Promise<{ ok: boolean; error?: string; enlaceToken?: string }> {
  try {
    const res = await apiPost<{ id: string; enlaceToken: string }>(
      `/api/participantes/${encodeURIComponent(participanteId)}/regenerar-enlace`
    );

    revalidatePath(`/pedidos/${pedidoId}/participantes`);
    return { ok: true, enlaceToken: res.enlaceToken };
  } catch (error) {
    if (error instanceof SipesApiError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "No se pudo regenerar el enlace." };
  }
}

export async function actionConfirmarManual(
  participanteId: string,
  pedidoId: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    await apiPost<{ id: string; estado: string }>(
      `/api/participantes/${encodeURIComponent(participanteId)}/confirmar`
    );

    revalidatePath(`/pedidos/${pedidoId}/participantes`);
    return { ok: true };
  } catch (error) {
    if (error instanceof SipesApiError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "No se pudo confirmar el participante." };
  }
}

export async function actionRevocarEnlace(
  participanteId: string,
  pedidoId: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    await revocarEnlaceParticipante(participanteId);

    revalidatePath(`/pedidos/${pedidoId}/participantes`);
    return { ok: true };
  } catch (error) {
    if (error instanceof SipesApiError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "No se pudo revocar el enlace del participante." };
  }
}

export interface EnlacesGrupoResult {
  ok: boolean;
  error?: string;
  mensajeGrupal?: string;
  total?: number;
}

export async function actionObtenerEnlacesGrupo(
  grupoId: string,
  soloPendientes = false
): Promise<EnlacesGrupoResult> {
  try {
    const q = soloPendientes ? "?soloPendientes=true" : "";
    const res = await apiGet<{ mensajeGrupal: string; total: number }>(
      `/api/grupos/${encodeURIComponent(grupoId)}/enlaces-whatsapp${q}`
    );
    return { ok: true, mensajeGrupal: res.mensajeGrupal, total: res.total };
  } catch (error) {
    if (error instanceof SipesApiError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "No se pudieron obtener los enlaces del grupo." };
  }
}
