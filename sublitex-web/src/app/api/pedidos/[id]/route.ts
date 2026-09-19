export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { Simulador } = await import("@/mocks/simulador");
  const { puenteBackend } = await import("@/services/cliente");
  const { responderError } = await import("@/services/api-error");
  try {
    const conBackend = Boolean(process.env.SIPES_BACKEND_URL);
    const detalle = conBackend ? await puenteBackend().obtenerDetallePedido(id) : new Simulador().obtenerDetalle(id);
    return Response.json(detalle);
  } catch (error) {
    return responderError(error);
  }
}