import { EstadoPedido } from './estado-pedido.enum';
import { transicionValida, esTerminal } from './estado-pedido.transitions';

describe('R-A06 · Solo se admiten las transiciones declaradas y hacia adelante', () => {
  it('avanza un paso desde BORRADOR a EN_CONFIGURACION', () => {
    expect(transicionValida(EstadoPedido.BORRADOR, EstadoPedido.EN_CONFIGURACION)).toBe(true);
  });

  it('rechaza saltar etapas (BORRADOR a EN_RECOLECCION)', () => {
    expect(transicionValida(EstadoPedido.BORRADOR, EstadoPedido.EN_RECOLECCION)).toBe(false);
  });

  it('rechaza retroceder (EN_PRODUCCION a EN_REVISION)', () => {
    expect(transicionValida(EstadoPedido.EN_PRODUCCION, EstadoPedido.EN_REVISION)).toBe(false);
  });

  it('acepta cancelar desde cualquier estado en curso', () => {
    expect(transicionValida(EstadoPedido.EN_RECOLECCION, EstadoPedido.CANCELADO)).toBe(true);
    expect(transicionValida(EstadoPedido.EN_REVISION, EstadoPedido.CANCELADO)).toBe(true);
  });

  it('trata CERRADO y CANCELADO como terminales', () => {
    expect(esTerminal(EstadoPedido.CERRADO)).toBe(true);
    expect(esTerminal(EstadoPedido.CANCELADO)).toBe(true);
    expect(esTerminal(EstadoPedido.EN_CONFIGURACION)).toBe(false);
    expect(transicionValida(EstadoPedido.CANCELADO, EstadoPedido.BORRADOR)).toBe(false);
    expect(transicionValida(EstadoPedido.CERRADO, EstadoPedido.CANCELADO)).toBe(false);
  });
});