import type { ErrorAPI } from "@/types/errores";

/**
 * Lee el cuerpo de error de la API (contrato §1.3): { error: { codigo, mensaje } }.
 * Devuelve un mensaje listo para mostrar; si el cuerpo no es JSON o no tiene la
 * forma esperada, cae a un mensaje genérico con el status HTTP.
 */
export async function leerMensajeError(res: Response): Promise<string> {
  try {
    const cuerpo = (await res.json()) as Partial<ErrorAPI>;
    const e = cuerpo?.error;
    if (e && typeof e.mensaje === "string") {
      return `[${e.codigo}] ${e.mensaje}`;
    }
  } catch {
    // cuerpo no JSON: se usa el mensaje genérico
  }
  return `Error ${res.status}: la API respondió con error`;
}