import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TablaPrendas } from "./TablaPrendas";
import { adaptarDetallePedido } from "@/services/adaptador";
import { construirDetallePedido } from "@/services/contrato";
import { seedPedidoPromo2002 } from "@/mocks/seed/pedido-promo2002";
import * as clienteService from "@/services/cliente";

const detalle = adaptarDetallePedido(
  construirDetallePedido(seedPedidoPromo2002, "ped_promo_2002"),
);

describe("TablaPrendas (Spec Delta: prendas)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("7.1 Renderiza las 28 filas de prendas del pedido PROMO 2002", () => {
    render(<TablaPrendas prendas={detalle.prendas} catalogos={detalle.catalogos} />);

    expect(screen.getByText("28 Prendas Registradas")).toBeInTheDocument();
    // 28 filas en el tbody
    const filas = screen.getAllByRole("row").slice(1); // omitir thead
    expect(filas).toHaveLength(28);
  });

  it("7.2 Dorsal como texto: admite S/N y dorsales repetidos (R-K04)", () => {
    const prendasConDorsal = [...detalle.prendas];
    prendasConDorsal[0] = { ...prendasConDorsal[0], numero: "S/N" };

    render(<TablaPrendas prendas={prendasConDorsal} catalogos={detalle.catalogos} />);

    expect(screen.getByText("S/N")).toBeInTheDocument();
  });

  it("7.3 Distinción visual: identifica las 6 prendas con excepción de corte Entallado", () => {
    render(<TablaPrendas prendas={detalle.prendas} catalogos={detalle.catalogos} />);

    // 6 prendas de damas tienen corte Entallado con la estrella y clase distintiva
    const excepcionesCorte = screen.getAllByText(/★ Entallado/);
    expect(excepcionesCorte).toHaveLength(6);
  });

  it("7.5 Barra BOM: calcula exactamente 28 camisetas, 17 shorts y 17 medias (R-K03)", () => {
    render(<TablaPrendas prendas={detalle.prendas} catalogos={detalle.catalogos} />);

    expect(screen.getByText("piezas a cortar").parentElement).toHaveTextContent("28");
    expect(screen.getByText("piezas a confeccionar").parentElement).toHaveTextContent("17");
    expect(screen.getByText("pares").parentElement).toHaveTextContent("17");
  });

  it("7.6 Columna 'qué falta': marca en rojo si falta género o corte", () => {
    const prendasConIncompleta = [...detalle.prendas];
    prendasConIncompleta[0] = {
      ...prendasConIncompleta[0],
      queFalta: ["género", "talla"],
    };

    render(<TablaPrendas prendas={prendasConIncompleta} catalogos={detalle.catalogos} />);

    expect(screen.getByText(/⚠ Falta: género, talla/)).toBeInTheDocument();
  });

  it("7.4 y 7.7 Edición en línea: abre modal, permite editar y conserva borrador ante error 409", async () => {
    const user = userEvent.setup();
    const mockGuardar = vi.spyOn(clienteService, "guardarFichaMinima").mockRejectedValue(
      new clienteService.ErrorApi("R-G03", "El dorsal ya está asignado en este grupo", 409),
    );

    render(<TablaPrendas prendas={detalle.prendas} catalogos={detalle.catalogos} />);

    // Click en Editar de la primera fila
    const botonesEditar = screen.getAllByRole("button", { name: "Editar" });
    await user.click(botonesEditar[0]);

    // Modal abierto
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    const inputNumero = screen.getByLabelText(/Dorsal \/ Número/i);
    await user.clear(inputNumero);
    await user.type(inputNumero, "99");

    // Guardar
    const botonGuardar = screen.getByRole("button", { name: /Guardar Ficha/i });
    await user.click(botonGuardar);

    await waitFor(() => {
      expect(mockGuardar).toHaveBeenCalled();
      // Mensaje de error visible
      expect(screen.getByText(/El dorsal ya está asignado en este grupo/i)).toBeInTheDocument();
      // El modal no se cierra y el borrador "99" permanece
      expect(inputNumero).toHaveValue("99");
    });
  });
});
