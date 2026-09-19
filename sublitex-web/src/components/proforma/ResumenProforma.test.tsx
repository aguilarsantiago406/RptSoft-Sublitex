import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResumenProforma } from "./ResumenProforma";
import { adaptarDetallePedido } from "@/services/adaptador";
import { construirDetallePedido } from "@/services/contrato";
import { seedPedidoPromo2002 } from "@/mocks/seed/pedido-promo2002";

const detalle = adaptarDetallePedido(
  construirDetallePedido(seedPedidoPromo2002, "ped_promo_2002"),
);

describe("ResumenProforma (Spec Delta: proforma)", () => {
  it("8.1 Desglose por producto: renderiza 11 camisetas y 17 kits con sus subtotales", () => {
    render(
      <ResumenProforma
        prendas={detalle.prendas}
        parametros={detalle.catalogos.parametros}
      />,
    );

    expect(screen.getByText("Camiseta sola")).toBeInTheDocument();
    expect(screen.getByText("Kit completo")).toBeInTheDocument();
    expect(screen.getByText("S/ 275.00")).toBeInTheDocument(); // 11 * 25
    expect(screen.getByText("S/ 765.00")).toBeInTheDocument(); // 17 * 45
  });

  it("8.2 Recargos por concepto: muestra recargo de tallas especiales S/ 9.00 (3 XL)", () => {
    render(
      <ResumenProforma
        prendas={detalle.prendas}
        parametros={detalle.catalogos.parametros}
      />,
    );

    expect(screen.getByText("Recargo por tallas especiales")).toBeInTheDocument();
    expect(screen.getByText("S/ 9.00")).toBeInTheDocument();
  });

  it("8.3 Totales financieros: muestra total sin IGV (1049), adelanto sugerido (524.50) y nota de IGV", () => {
    render(
      <ResumenProforma
        prendas={detalle.prendas}
        parametros={detalle.catalogos.parametros}
      />,
    );

    expect(screen.getByText("Nota: Precios no incluyen IGV (18%)")).toBeInTheDocument();
    expect(screen.getAllByText("S/ 1049.00")).toHaveLength(2); // total sin IGV y saldo inicial
    expect(screen.getByText("S/ 524.50")).toBeInTheDocument(); // 50%
  });

  it("8.4 Adelanto recibido editable: calcula saldo automáticamente", async () => {
    const user = userEvent.setup();

    render(
      <ResumenProforma
        prendas={detalle.prendas}
        parametros={detalle.catalogos.parametros}
      />,
    );

    const inputAdelanto = screen.getByLabelText(/Adelanto recibido/i);
    expect(inputAdelanto).toHaveValue(0);

    // Saldo inicial con 0 de adelanto = 1049.00 (aparece en total y en saldo)
    expect(screen.getAllByText("S/ 1049.00")).toHaveLength(2);

    // Escribir 500 de adelanto
    await user.clear(inputAdelanto);
    await user.type(inputAdelanto, "500");

    // Saldo pasa a 1049 - 500 = 549.00
    expect(screen.getByText("S/ 549.00")).toBeInTheDocument();
  });
});
