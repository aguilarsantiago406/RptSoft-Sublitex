"use server";

import { revalidatePath } from "next/cache";
import { apiPatch, apiPost, SipesApiError } from "@/lib/api/http";
import { subirArchivoApi } from "../api/disenos.api";

export async function actionSubirYCrearDiseno(
  pedidoId: string,
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  try {
    const fileMockup = formData.get("mockup") as File | null;
    const fileVector = formData.get("vector") as File | null;

    if (!fileMockup || fileMockup.size === 0) {
      return { ok: false, error: "Debes seleccionar la imagen del mockup para continuar." };
    }

    const fdMockup = new FormData();
    fdMockup.append("archivo", fileMockup);
    const resMockup = await subirArchivoApi(fdMockup, "mockups");

    let archivoUrl: string | undefined = undefined;
    if (fileVector && fileVector.size > 0) {
      const fdVector = new FormData();
      fdVector.append("archivo", fileVector);
      const resVector = await subirArchivoApi(fdVector, "disenos");
      archivoUrl = resVector.url;
    }

    await apiPost("/api/disenos", {
      pedidoId,
      imagenUrl: resMockup.url,
      archivoUrl,
    });

    revalidatePath(`/pedidos/${pedidoId}`);
    return { ok: true };
  } catch (error) {
    if (error instanceof SipesApiError) return { ok: false, error: error.message };
    return { ok: false, error: "No se pudo subir o registrar el diseño." };
  }
}

export async function actionActualizarArtefactos(
  disenoId: string,
  pedidoId: string,
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  try {
    const fileMockup = formData.get("mockup") as File | null;
    const fileVector = formData.get("vector") as File | null;

    const payload: { imagenUrl?: string; archivoUrl?: string } = {};

    if (fileMockup && fileMockup.size > 0) {
      const fdMockup = new FormData();
      fdMockup.append("archivo", fileMockup);
      const resMockup = await subirArchivoApi(fdMockup, "mockups");
      payload.imagenUrl = resMockup.url;
    }

    if (fileVector && fileVector.size > 0) {
      const fdVector = new FormData();
      fdVector.append("archivo", fileVector);
      const resVector = await subirArchivoApi(fdVector, "disenos");
      payload.archivoUrl = resVector.url;
    }

    if (!payload.imagenUrl && !payload.archivoUrl) {
      return { ok: false, error: "Debes seleccionar al menos un archivo para actualizar." };
    }

    await apiPatch(`/api/disenos/${encodeURIComponent(disenoId)}/artefactos`, payload);

    revalidatePath(`/pedidos/${pedidoId}`);
    return { ok: true };
  } catch (error) {
    if (error instanceof SipesApiError) return { ok: false, error: error.message };
    return { ok: false, error: "No se pudieron actualizar los archivos del diseño." };
  }
}

export async function actionProponerDiseno(
  disenoId: string,
  pedidoId: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    await apiPatch(`/api/disenos/${encodeURIComponent(disenoId)}/proponer`, {});
    revalidatePath(`/pedidos/${pedidoId}`);
    return { ok: true };
  } catch (error) {
    if (error instanceof SipesApiError) return { ok: false, error: error.message };
    return { ok: false, error: "No se pudo proponer el diseño." };
  }
}

export async function actionAprobarDiseno(
  disenoId: string,
  pedidoId: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    await apiPatch(`/api/disenos/${encodeURIComponent(disenoId)}/aprobar`, {});
    revalidatePath(`/pedidos/${pedidoId}`);
    return { ok: true };
  } catch (error) {
    if (error instanceof SipesApiError) return { ok: false, error: error.message };
    return { ok: false, error: "No se pudo aprobar el diseño." };
  }
}

export async function actionRechazarDiseno(
  disenoId: string,
  pedidoId: string,
  motivo?: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    await apiPatch(`/api/disenos/${encodeURIComponent(disenoId)}/rechazar`, {
      motivo: motivo?.trim() || undefined,
    });
    revalidatePath(`/pedidos/${pedidoId}`);
    return { ok: true };
  } catch (error) {
    if (error instanceof SipesApiError) return { ok: false, error: error.message };
    return { ok: false, error: "No se pudo registrar el rechazo del diseño." };
  }
}
