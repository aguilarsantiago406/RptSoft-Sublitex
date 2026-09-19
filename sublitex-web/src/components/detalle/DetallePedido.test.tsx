import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DetallePedido } from "./DetallePedido";
import * as clienteService from "@/services/cliente";
import { construirDetallePedido } from "@/services/contrato";
import { seedPedidoPromo2002 } from "@/mocks/seed/pedido-promo2002";

const mockDetalle = construirDetallePedido(seedPedidoPromo2002, "ped_promo_2002");

describe("DetallePedido y Cabecera (Spec Delta: detalle-pedido)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("6.1 Identificación del pedido: renderiza código, versión, cliente, coordinador y ciudad", async () => {
    vi.spyOn(clienteService, "obtenerDetallePedido").mockResolvedValue(mockDetalle);

    render(<DetallePedido pedidoId="ped_promo_2002" />);

    expect(screen.getByRole("status")).toHaveTextContent("Cargando");

    await waitFor(() => {
      expect(screen.getAllByText("SUB-000842")[0]).toBeInTheDocument();
      expect(screen.getByText("PROMO 2002")).toBeInTheDocument();
      expect(screen.getByText(/v4.0/)).toBeInTheDocument();
      expect(screen.getByText("Coordinador de la promoción")).toBeInTheDocument();
      expect(screen.getAllByText("Chiclayo")[0]).toBeInTheDocument();
    });
  });

  it("6.2 Diseño aprobado: renderiza versión de mockup, tela principal y acabado de escudos", async () => {
    vi.spyOn(clienteService, "obtenerDetallePedido").mockResolvedValue(mockDetalle);

    render(<DetallePedido pedidoId="ped_promo_2002" />);

    await waitFor(() => {
      expect(screen.getByText(/Mockup vv4/i)).toBeInTheDocument();
      expect(screen.getAllByText("Win Fresh")[0]).toBeInTheDocument();
      expect(screen.getAllByText("Sublimado")[0]).toBeInTheDocument();
      expect(screen.getByText("Aprobado por WhatsApp")).toBeInTheDocument();
    });
  });

  it("6.3 Muestrario de colores: muestra HEX para Blanco hueso (#F7F4F2) y alerta por R-K05 para color sin HEX", async () => {
    const detalleConColorFaltante = JSON.parse(JSON.stringify(mockDetalle));
    detalleConColorFaltante.pedido.colores.push({
      id: "col_sin_hex",
      nombre: "Dorado Especial",
      codigoHex: null,
      referencia: "Falta muestra física",
    });

    vi.spyOn(clienteService, "obtenerDetallePedido").mockResolvedValue(detalleConColorFaltante);

    render(<DetallePedido pedidoId="ped_promo_2002" />);

    await waitFor(() => {
      expect(screen.getAllByText("Blanco hueso")[0]).toBeInTheDocument();
      expect(screen.getByText("#F7F4F2")).toBeInTheDocument();
      expect(screen.getByText("Dorado Especial")).toBeInTheDocument();
      expect(screen.getByText(/SIN CÓDIGO \(R-K05\)/i)).toBeInTheDocument();
    });
  });

  it("6.4 Ubicaciones de estampado: muestra texto literal, botón copiar y alerta SIN DEFINIR", async () => {
    const user = userEvent.setup();
    const writeTextSpy = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: writeTextSpy },
      configurable: true,
      writable: true,
    });

    vi.spyOn(clienteService, "obtenerDetallePedido").mockResolvedValue(mockDetalle);

    render(<DetallePedido pedidoId="ped_promo_2002" />);

    await waitFor(() => {
      expect(
        screen.getByText(/Texto "PROMO 2002", insignia del colegio bordada/i),
      ).toBeInTheDocument();
      // Sponsor 1 en PROMO 2002 tiene lleva: true y contenido: null -> SIN DEFINIR
      expect(screen.getByText("SIN DEFINIR")).toBeInTheDocument();
    });

    const botonCopiar = screen.getAllByRole("button", { name: /copiar/i })[0];
    await user.click(botonCopiar);
    expect(writeTextSpy).toHaveBeenCalled();
  });

  it("6.5 Envío a provincia: muestra datos de rotulado y alerta sobre campos faltantes", async () => {
    vi.spyOn(clienteService, "obtenerDetallePedido").mockResolvedValue(mockDetalle);

    render(<DetallePedido pedidoId="ped_promo_2002" />);

    await waitFor(() => {
      expect(screen.getByText("Rotulado de Envío a Provincia")).toBeInTheDocument();
      expect(screen.getAllByText("Chiclayo")[0]).toBeInTheDocument();
      expect(screen.getByText(/Faltan 6 datos de rotulado/i)).toBeInTheDocument();
      expect(screen.getAllByText("PENDIENTE (Dato faltante)").length).toBe(6);
    });
  });

  it("Navegación por pestañas: permite alternar entre PEDIDO, PRENDAS y PROFORMA sin scroll infinito", async () => {
    const user = userEvent.setup();
    vi.spyOn(clienteService, "obtenerDetallePedido").mockResolvedValue(mockDetalle);

    render(<DetallePedido pedidoId="ped_promo_2002" />);

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /1\. Ficha Comercial/i })).toBeInTheDocument();
    });

    // Pestaña inicial PEDIDO está activa
    expect(screen.getByText("Diseño Aprobado")).toBeInTheDocument();

    // Cambiar a PRENDAS
    const tabPrendas = screen.getByRole("tab", { name: /2\. Prendas y Producción/i });
    await user.click(tabPrendas);

    expect(screen.getByText("28 Prendas Registradas")).toBeInTheDocument();
    expect(screen.queryByText("Diseño Aprobado")).not.toBeInTheDocument();

    // Cambiar a PROFORMA
    const tabProforma = screen.getByRole("tab", { name: /3\. Proforma Comercial/i });
    await user.click(tabProforma);

    expect(screen.getByText("Proforma Comercial (Cotizador)")).toBeInTheDocument();
    expect(screen.getAllByText("S/ 1049.00")[0]).toBeInTheDocument();
  });
});

