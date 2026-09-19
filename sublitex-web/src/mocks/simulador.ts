import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  consolidarPrenda,
  construirDetallePedido,
  type CatalogosDto,
  type DbSimuladorDto,
  type FichaMinimaDto,
  type PedidoDetalleDto,
  type PedidoListaDto,
  type PrendaDto,
  type ResumenProduccionDto,
} from "@/services/contrato";
import { esFichaMinima } from "@/services/validador";
import { seedPedidoPromo2002 } from "@/mocks/seed/pedido-promo2002";

export type PoliticaNumeracion = "LIBRE" | "UNICA";

const POLITICA_POR_GRUPO: Record<string, PoliticaNumeracion> = {
  grp_PROMO2002: "LIBRE",
};

export class SimuladorConflicto extends Error {
  constructor(
    public readonly codigo: string,
    mensaje: string,
    public readonly status = 409,
  ) {
    super(mensaje);
    this.name = "SimuladorConflicto";
  }
}

export function dorsalBloqueado(numero: string | null): boolean {
  if (numero == null) return false;
  const limpio = numero.trim().toUpperCase();
  return limpio !== "" && limpio !== "S/N";
}

export function esDorsalRepetido(
  db: DbSimuladorDto,
  prendaId: string,
  numero: string | null,
  politicaPorGrupo: Record<string, PoliticaNumeracion> = POLITICA_POR_GRUPO,
): boolean {
  const prenda = db.prendas.find((p) => p.id === prendaId);
  if (!prenda || politicaPorGrupo[prenda.grupoId] !== "UNICA" || !dorsalBloqueado(numero)) {
    return false;
  }
  return db.prendas.some((p) => p.id !== prendaId && p.grupoId === prenda.grupoId && p.numero === numero);
}

export interface PersistenciaSimulador {
  cargar(): DbSimuladorDto;
  guardar(db: DbSimuladorDto): void;
}

export function persistenciaJson(ruta: string): PersistenciaSimulador {
  return {
    cargar() {
      if (existsSync(ruta)) {
        const crudo = readFileSync(ruta, "utf8");
        return JSON.parse(crudo) as DbSimuladorDto;
      }
      return structuredClone(seedPedidoPromo2002);
    },
    guardar(db) {
      mkdirSync(path.dirname(ruta), { recursive: true });
      writeFileSync(ruta, JSON.stringify(db, null, 2), "utf8");
    },
  };
}

export const RUTA_SIMULADOR = (): string => process.env.SIPES_DB_PATH ?? path.join(process.cwd(), ".data", "simulador.json");

export class Simulador {
  private db: DbSimuladorDto;

  constructor(private readonly persistencia: PersistenciaSimulador = persistenciaJson(RUTA_SIMULADOR())) {
    this.db = this.persistencia.cargar();
  }

  listarPedidos(): PedidoListaDto[] {
    return this.db.pedidos.map((pedido) => ({
      id: pedido.id,
      codigo: pedido.codigo,
      clienteGrupo: pedido.identificacion.clienteGrupo,
      tipoPrendaPrincipal: pedido.tipoPrendaPrincipal,
      fecha: pedido.identificacion.fecha,
      estado: pedido.estado,
    }));
  }

  obtenerDetalle(pedidoId: string): PedidoDetalleDto {
    return construirDetallePedido(this.db, pedidoId);
  }

  obtenerCatalogos(): CatalogosDto {
    return structuredClone(this.db.catalogos);
  }

  obtenerResumen(pedidoId: string): ResumenProduccionDto {
    if (!this.db.pedidos.some((p) => p.id === pedidoId)) {
      throw new SimuladorConflicto("R-PEDIDO", `Pedido no encontrado: ${pedidoId}`, 404);
    }
    return structuredClone(this.db.resumenProduccion);
  }

  guardarFichaMinima(prendaId: string, ficha: FichaMinimaDto): PrendaDto {
    if (!esFichaMinima(ficha)) {
      throw new SimuladorConflicto("R-FICHA", "Ficha mínima inválida", 400);
    }
    if (esDorsalRepetido(this.db, prendaId, ficha.numero)) {
      throw new SimuladorConflicto("R-G03", "Dorsal repetido no permitido con política UNICA", 409);
    }
    const dbPrenda = this.db.prendas.find((p) => p.id === prendaId);
    if (!dbPrenda) {
      throw new SimuladorConflicto("R-PRENDA", `Prenda no encontrada: ${prendaId}`, 404);
    }
    Object.assign(dbPrenda, {
      tallaId: ficha.tallaId,
      numero: ficha.numero,
      genero: ficha.genero,
      nombreEnPrenda: ficha.nombreEnPrenda,
    });
    this.persistencia.guardar(this.db);
    return consolidarPrenda(dbPrenda, this.db.excepcionesPrenda, this.db.personalizaciones);
  }
}