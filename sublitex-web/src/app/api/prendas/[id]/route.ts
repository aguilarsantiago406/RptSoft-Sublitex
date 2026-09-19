export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { esFichaMinima } = await import("@/services/validador");
  const { SimuladorConflicto } = await import("@/mocks/simulador");
  const { responderError } = await import("@/services/api-error");

  let ficha: unknown;
  try {
    ficha = await request.json();
  } catch {
    ficha = null;
  }
  if (!esFichaMinima(ficha)) {
    return Response.json({ codigo: "R-FICHA", mensaje: "Ficha mínima inválida" }, { status: 400 });
  }
  const fichaValida = ficha;

  try {
    if (process.env.SIPES_BACKEND_URL) {
      const { puenteBackend } = await import("@/services/cliente");
      const prenda = await puenteBackend().guardarFichaMinima(id, fichaValida);
      return Response.json(prenda);
    }
    const { Simulador } = await import("@/mocks/simulador");
    const prenda = new Simulador().guardarFichaMinima(id, fichaValida);
    return Response.json(prenda);
  } catch (error) {
    if (error instanceof SimuladorConflicto) {
      return Response.json({ codigo: error.codigo, mensaje: error.message }, { status: error.status });
    }
    return responderError(error);
  }
}