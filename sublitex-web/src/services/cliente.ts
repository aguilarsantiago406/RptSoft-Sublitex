import { origenActual, respaldoBackend } from "@/services/origen";
import type {
  CatalogosDto,
  FichaMinimaDto,
  PedidoDetalleDto,
  PedidoListaDto,
  PrendaDto,
  ResumenProduccionDto,
} from "@/services/contrato";
import {
  esCatalogosDto,
  esPedidoDetalleDto,
  esPedidoListaDto,
  esPrendaDto,
  esResumenProduccionDto,
  validarRespuesta,
  type Guard,
} from "@/services/validador";

export interface ErrorInfo {
  codigo?: string;
  mensaje: string;
  status: number;
}

export class ErrorApi extends Error {
  readonly nombre = "ErrorApi";
  readonly info: ErrorInfo;

  constructor(
    public readonly codigo: string | undefined,
    public readonly mensaje: string,
    public readonly status: number,
  ) {
    super(mensaje);
    this.name = "ErrorApi";
    this.info = { codigo, mensaje, status };
  }
}

export class ErrorServidor extends ErrorApi {
  constructor(info: ErrorInfo) {
    super(info.codigo, info.mensaje, info.status);
    this.name = "ErrorServidor";
  }
}

async function leerCuerpoJson(respuesta: Response): Promise<unknown> {
  const texto = await respuesta.text();
  if (!texto) return {};
  try {
    return JSON.parse(texto);
  } catch {
    return { mensaje: texto };
  }
}

export class ClienteHttp {
  constructor(private readonly base: string = "") {}

  private async enviar<T>(
    metodo: "GET" | "POST" | "PATCH" | "PUT",
    ruta: string,
    cuerpo: unknown,
    guard: Guard<T>,
  ): Promise<T> {
    const url = this.base ? `${this.base}${ruta}` : ruta;
    const respuesta = await fetch(url, {
      method: metodo,
      headers: cuerpo != null ? { "Content-Type": "application/json" } : undefined,
      body: cuerpo != null ? JSON.stringify(cuerpo) : undefined,
      cache: "no-store",
    });

    const payload = await leerCuerpoJson(respuesta);

    if (!respuesta.ok) {
      const v = typeof payload === "object" && payload !== null ? (payload as Record<string, unknown>) : {};
      const codigo = typeof v.codigo === "string" ? v.codigo : undefined;
      const mensaje = typeof v.mensaje === "string" ? v.mensaje : `El servidor respondió ${respuesta.status}`;
      throw new ErrorApi(codigo, mensaje, respuesta.status);
    }

    return validarRespuesta(ruta, guard, payload);
  }

  async obtenerListaPedidos(): Promise<PedidoListaDto[]> {
    return this.enviar("GET", "/api/pedidos", null, esPedidoListaDto);
  }

  async obtenerDetallePedido(pedidoId: string): Promise<PedidoDetalleDto> {
    return this.enviar("GET", `/api/pedidos/${pedidoId}`, null, esPedidoDetalleDto);
  }

  async obtenerCatalogos(): Promise<CatalogosDto> {
    return this.enviar("GET", "/api/catalogos", null, esCatalogosDto);
  }

  async guardarFichaMinima(prendaId: string, ficha: FichaMinimaDto): Promise<PrendaDto> {
    return this.enviar("PATCH", `/api/prendas/${prendaId}`, ficha, esPrendaDto);
  }

  async obtenerResumenProduccion(pedidoId: string): Promise<ResumenProduccionDto> {
    return this.enviar("GET", `/api/pedidos/${pedidoId}/resumen-produccion`, null, esResumenProduccionDto);
  }

  async obtenerResumen(pedidoId: string): Promise<ResumenProduccionDto> {
    return this.obtenerResumenProduccion(pedidoId);
  }
}

export function puenteBackend(): ClienteHttp {
  return new ClienteHttp(respaldoBackend());
}

export function origenParaParcial(): "backend" | "simulador" {
  return origenActual();
}

export function validarPrendaValida(valor: unknown): valor is PrendaDto {
  return esPrendaDto(valor);
}

// Instancia por defecto para componentes del cliente y llamadas directas
export const cliente = new ClienteHttp();

export const obtenerListaPedidos = () => cliente.obtenerListaPedidos();
export const obtenerDetallePedido = (id: string) => cliente.obtenerDetallePedido(id);
export const obtenerCatalogos = () => cliente.obtenerCatalogos();
export const guardarFichaMinima = (id: string, ficha: FichaMinimaDto) => cliente.guardarFichaMinima(id, ficha);
export const obtenerResumenProduccion = (id: string) => cliente.obtenerResumenProduccion(id);
