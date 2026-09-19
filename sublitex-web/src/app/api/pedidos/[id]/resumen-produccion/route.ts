export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { Simulador } = await import("@/mocks/simulador");
  const { puenteBackend } = await import("@/services/cliente");
  const { responderError } = await import("@/services/api-error");
  try {
    const conBackend = Boolean(process.env.SIPES_BACKEND_URL);
    const resumen = conBackend ? await puenteBackend().obtenerResumen(id) : new Simulador().obtenerResumen(id);
    return Response.json(resumen);
  } catch (error) {
    return responderError(error);
  }
}