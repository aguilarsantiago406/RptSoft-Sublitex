import type {
  CatalogosDto,
  ExcepcionDto,
  PedidoDetalleDto,
  PedidoListaDto,
  PrendaDto,
  TipoPrendaDto,
} from "@/services/contrato";
import { calcularPrecioUnitario } from "@/domain/precios";
import { queFalta } from "@/domain/validacion";
import type {
  PedidoDetallePresentacion,
  PedidoListaPresentacion,
  PrendaPresentacion,
  ValorEfectivo,
} from "@/types/presentacion";

export const GENEROS: Record<string, string> = {
  HOMBRE: "Hombre",
  MUJER: "Mujer",
  NIÑO: "Niño",
  NIÑA: "Niña",
  SIN_ESPECIFICAR: "Sin especificar",
};

function buscar<T extends { id: string }>(catalogo: T[], id: string | null): T | undefined {
  return id ? catalogo.find((c) => c.id === id) : undefined;
}

function excepcionDeExcepciones(excepciones: ExcepcionDto[], atributoId: string): ExcepcionDto | null {
  return excepciones.find((e) => e.atributoId === atributoId) ?? null;
}

export function adaptarPrenda(
  prenda: PrendaDto,
  contexto: {
    nombrePersona: string;
    valoresGrupo: PedidoDetalleDto["pedido"]["valoresGrupo"];
    catalogos: CatalogosDto;
    personalizacionesTexto: string;
    excepciones: ExcepcionDto[];
  },
): PrendaPresentacion {
  const { catalogos, excepciones } = contexto;

  const producto = buscar(catalogos.productos, prenda.tipoProductoId);
  const talla = buscar(catalogos.tallas, prenda.tallaId);
  const color = buscar(catalogos.colores, prenda.colorId);

  const resolverValor = (atributoId: string, baseId: string | null, baseNombre: string): ValorEfectivo | null => {
    const excepcion = excepcionDeExcepciones(excepciones, atributoId);
    if (excepcion) {
      const valor = buscar(
        [...catalogos.cortes, ...catalogos.cuellos, ...catalogos.telas, ...catalogos.acabados],
        excepcion.valorAtributoId,
      );
      return { id: excepcion.valorAtributoId, nombre: valor?.nombre ?? excepcion.valorAtributoId, esExcepcion: true };
    }
    if (baseId) {
      return { id: baseId, nombre: baseNombre, esExcepcion: false };
    }
    return null;
  };

  const corteValido = buscar(catalogos.cortes, contexto.valoresGrupo.corteId);
  const cuelloValido = buscar(catalogos.cuellos, contexto.valoresGrupo.cuelloId);
  const telaValida = buscar(catalogos.telas, contexto.valoresGrupo.telaId);
  const acabadoValido = buscar(catalogos.acabados, contexto.valoresGrupo.acabadoEscudoId);
  const escudoValido = contexto.valoresGrupo.escudo ? { id: "escudo_si", nombre: "Sí" } : { id: "escudo_no", nombre: "No" };

  const corte = resolverValor("attr_corte", contexto.valoresGrupo.corteId, corteValido?.nombre ?? corteValido?.id ?? "");
  const cuello = resolverValor("attr_cuello", contexto.valoresGrupo.cuelloId, cuelloValido?.nombre ?? cuelloValido?.id ?? "");
  const tela = resolverValor("attr_tela", contexto.valoresGrupo.telaId, telaValida?.nombre ?? telaValida?.id ?? "");
  const acabadoEscudo = resolverValor(
    "attr_acabado_escudo",
    contexto.valoresGrupo.acabadoEscudoId,
    acabadoValido?.nombre ?? acabadoValido?.id ?? "",
  );

  const escudoExcepcion = excepcionDeExcepciones(excepciones, "attr_escudo");
  const escudo: ValorEfectivo = escudoExcepcion
    ? { id: escudoExcepcion.valorAtributoId, nombre: escudoExcepcion.valorAtributoId === "val_escudo_si" ? "Sí" : "No", esExcepcion: true }
    : { id: escudoValido.id, nombre: escudoValido.nombre, esExcepcion: false };

  const recargoTalla = talla?.recargo ?? 0;
  const recargoTela = tela ? buscar(catalogos.telas, tela.esExcepcion ? tela.id : contexto.valoresGrupo.telaId)?.recargo ?? 0 : 0;
  const recargoCuello = cuello ? buscar(catalogos.cuellos, cuello.esExcepcion ? cuello.id : contexto.valoresGrupo.cuelloId)?.recargo ?? 0 : 0;
  const recargoAcabado = acabadoEscudo
    ? (buscar(catalogos.acabados, acabadoEscudo.esExcepcion ? acabadoEscudo.id : contexto.valoresGrupo.acabadoEscudoId)?.recargo ?? 0)
    : 0;

  const precioBase = producto?.precioBase ?? 0;
  const precioUnitario = calcularPrecioUnitario({
    precioBase,
    recargos: { talla: recargoTalla, tela: recargoTela, cuello: recargoCuello, acabado: recargoAcabado },
    tipoPrecio: prenda.tipoPrenda,
  });

  const faltantes = queFalta({
    genero: prenda.genero ? GENEROS[prenda.genero] ?? prenda.genero : null,
    corte: corte?.nombre ?? null,
    talla: talla?.codigo ?? null,
    numero: prenda.numero,
    color: color?.nombre ?? null,
  });

  return {
    id: prenda.id,
    participanteId: prenda.participanteId,
    nombreEnPrenda: prenda.nombreEnPrenda,
    nombrePersona: contexto.nombrePersona,
    tipoProductoId: prenda.tipoProductoId,
    productoNombre: producto?.nombre ?? prenda.tipoProductoId,
    tallaId: prenda.tallaId,
    talla: talla?.codigo ?? null,
    numero: prenda.numero,
    colorId: prenda.colorId,
    color: color?.nombre ?? null,
    colorHex: color?.codigoHex ?? null,
    genero: prenda.genero ? GENEROS[prenda.genero] ?? prenda.genero : null,
    corte,
    cuello,
    tela,
    escudo,
    acabadoEscudo,
    esArquero: prenda.esArquero,
    tipo: prenda.tipoPrenda as TipoPrendaDto,
    personalizacionEspecial: contexto.personalizacionesTexto,
    precioBase,
    recargoTalla,
    recargoTela,
    recargoCuello,
    recargoAcabado,
    precioUnitario,
    camisetas: producto?.componentes.camisetas ?? 0,
    shorts: producto?.componentes.shorts ?? 0,
    medias: producto?.componentes.medias ?? 0,
    queFalta: faltantes,
  };
}

export function adaptarDetallePedido(dto: PedidoDetalleDto): PedidoDetallePresentacion {
  const { pedido, participantes, prendas, catalogos } = dto;

  const participantesPorId = new Map(participantes.map((p) => [p.id, p.nombrePersona]));

  const prendasPresentacion: PrendaPresentacion[] = prendas.map((prenda) =>
    adaptarPrenda(prenda, {
      nombrePersona: participantesPorId.get(prenda.participanteId) ?? "",
      valoresGrupo: pedido.valoresGrupo,
      catalogos,
      personalizacionesTexto: prenda.personalizaciones.map((p) => p.contenido).join(" · "),
      excepciones: prenda.excepciones,
    }),
  );

  const cuelloHombres = buscar(catalogos.cuellos, pedido.disenoAprobado.cuelloHombresId)?.nombre ?? pedido.disenoAprobado.cuelloHombresId;
  const cuelloDamas = buscar(catalogos.cuellos, pedido.disenoAprobado.cuelloDamasId)?.nombre ?? pedido.disenoAprobado.cuelloDamasId;
  const corteHombres = buscar(catalogos.cortes, pedido.disenoAprobado.corteHombresId)?.nombre ?? pedido.disenoAprobado.corteHombresId;
  const corteDamas = buscar(catalogos.cortes, pedido.disenoAprobado.corteDamasId)?.nombre ?? pedido.disenoAprobado.corteDamasId;
  const acabadoEscudos = buscar(catalogos.acabados, pedido.disenoAprobado.acabadoEscudosId)?.nombre ?? pedido.disenoAprobado.acabadoEscudosId;
  const shortTela = buscar(catalogos.telas, pedido.disenoAprobado.shortTelaId)?.nombre ?? pedido.disenoAprobado.shortTelaId;

  return {
    id: pedido.id,
    codigo: pedido.codigo,
    grupoId: pedido.grupoId,
    estado: pedido.estado,
    identificacion: pedido.identificacion,
    disenoAprobado: {
      ...pedido.disenoAprobado,
      cuelloHombres,
      cuelloDamas,
      corteHombres,
      corteDamas,
      acabadoEscudos,
      shortTela,
      ribCuelloLabel: pedido.disenoAprobado.ribCuello ? "Sí" : "No",
      ribMangasLabel: pedido.disenoAprobado.ribMangas ? "Sí" : "No",
    },
    colores: pedido.colores,
    ubicacionesEstampado: pedido.ubicacionesEstampado,
    envioProvincia: pedido.envioProvincia,
    controlCambios: pedido.controlCambios,
    prendas: prendasPresentacion,
    catalogos,
    resumen: dto.resumenProduccion,
  };
}

export function adaptarListaPedidos(pedidos: PedidoListaDto[]): PedidoListaPresentacion[] {
  return pedidos.map((pedido) => ({
    id: pedido.id,
    codigo: pedido.codigo,
    clienteGrupo: pedido.clienteGrupo,
    tipoPrendaPrincipal: pedido.tipoPrendaPrincipal,
    fecha: pedido.fecha,
    estado: pedido.estado,
  }));
}