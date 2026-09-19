import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { VistaCatalogos } from "./VistaCatalogos";
import * as clienteService from "@/services/cliente";
import { seedPedidoPromo2002 } from "@/mocks/seed/pedido-promo2002";

describe("VistaCatalogos (Spec Delta: catalogos)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renderiza productos con sus componentes físicos para corte (R-K03)", async () => {
    vi.spyOn(clienteService, "obtenerCatalogos").mockResolvedValue(seedPedidoPromo2002.catalogos);

    render(<VistaCatalogos />);

    await waitFor(() => {
      expect(screen.getByText("Productos y Componentes Físicos (Regla R-K03)")).toBeInTheDocument();
      expect(screen.getByText("Kit completo")).toBeInTheDocument();
      expect(screen.getByText("Camiseta sola")).toBeInTheDocument();
    });
  });

  it("muestra parámetros comerciales clave (IGV 18%, adelanto 50%, pedido mínimo 12)", async () => {
    vi.spyOn(clienteService, "obtenerCatalogos").mockResolvedValue(seedPedidoPromo2002.catalogos);

    render(<VistaCatalogos />);

    await waitFor(() => {
      expect(screen.getByText("Parámetros Comerciales Oficiales")).toBeInTheDocument();
      expect(screen.getByText("18%")).toBeInTheDocument();
      expect(screen.getByText("50%")).toBeInTheDocument();
      expect(screen.getByText("12 unid.")).toBeInTheDocument();
    });
  });

  it("muestra recargo de talla XL y listas cerradas", async () => {
    vi.spyOn(clienteService, "obtenerCatalogos").mockResolvedValue(seedPedidoPromo2002.catalogos);

    render(<VistaCatalogos />);

    await waitFor(() => {
      expect(screen.getByText("Talla XL")).toBeInTheDocument();
      expect(screen.getByText("+S/ 3.00")).toBeInTheDocument();
      expect(screen.getByText("Listas Cerradas del Sistema")).toBeInTheDocument();
    });
  });
});
