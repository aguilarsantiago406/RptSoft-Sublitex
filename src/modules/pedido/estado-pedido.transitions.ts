import { EstadoPedido } from './estado-pedido.enum';

const TRANSICIONES: Record<EstadoPedido, EstadoPedido[]> = {
  [EstadoPedido.BORRADOR]: [EstadoPedido.EN_CONFIGURACION, EstadoPedido.CANCELADO],
  [EstadoPedido.EN_CONFIGURACION]: [EstadoPedido.EN_RECOLECCION, EstadoPedido.CANCELADO],
  [EstadoPedido.EN_RECOLECCION]: [EstadoPedido.EN_REVISION, EstadoPedido.CANCELADO],
  [EstadoPedido.EN_REVISION]: [EstadoPedido.EN_PRODUCCION, EstadoPedido.CANCELADO],
  [EstadoPedido.EN_PRODUCCION]: [EstadoPedido.ENTREGADO, EstadoPedido.CERRADO, EstadoPedido.CANCELADO],
  [EstadoPedido.ENTREGADO]: [EstadoPedido.CERRADO],
  [EstadoPedido.CERRADO]: [],
  [EstadoPedido.CANCELADO]: [],
};

const TERMINALES = new Set<EstadoPedido>([EstadoPedido.CERRADO, EstadoPedido.CANCELADO]);

export function transicionValida(actual: EstadoPedido, destino: EstadoPedido): boolean {
  return (TRANSICIONES[actual] ?? []).includes(destino);
}

export function esTerminal(estado: EstadoPedido): boolean {
  return TERMINALES.has(estado);
}