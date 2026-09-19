import { RespuestaInvalidaError } from "@/services/validador";
import { SimuladorConflicto } from "@/mocks/simulador";
import { ErrorApi } from "@/services/cliente";

export function responderError(error: unknown): Response {
  if (error instanceof SimuladorConflicto) {
    return Response.json({ codigo: error.codigo, mensaje: error.message }, { status: error.status });
  }
  if (error instanceof ErrorApi) {
    return Response.json(error.info, { status: error.info.status });
  }
  if (error instanceof RespuestaInvalidaError) {
    return Response.json({ codigo: "R-CONTRATO", mensaje: error.message }, { status: 502 });
  }
  const mensaje = error instanceof Error ? error.message : "Error interno";
  return Response.json({ codigo: "R-INTERNO", mensaje }, { status: 500 });
}