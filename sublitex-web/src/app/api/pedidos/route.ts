export const dynamic = "force-dynamic";

export async function GET() {
  const { Simulador } = await import("@/mocks/simulador");
  const { puenteBackend } = await import("@/services/cliente");
  const { responderError } = await import("@/services/api-error");
  try {
    const conBackend = Boolean(process.env.SIPES_BACKEND_URL);
    const lista = conBackend ? await puenteBackend().obtenerListaPedidos() : new Simulador().listarPedidos();
    return Response.json(lista);
  } catch (error) {
    return responderError(error);
  }
}