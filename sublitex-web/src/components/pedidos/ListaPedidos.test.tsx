import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ListaPedidos } from "./ListaPedidos";
import * as clienteService from "@/services/cliente";
import type { PedidoListaDto } from "@/services/contrato";

const mockPedidos: PedidoListaDto[] = [
  {
    id: "ped_promo_2002",
    codigo: "SUB-000842",
    clienteGrupo: "PROMO 2002",
    tipoPrendaPrincipal: "Kits y Camisetas",
    fecha: "2026-09-10",
    estado: "Confirmado",
  },
  {
    id: "ped_san_juan_01",
    codigo: "SUB-000910",
    clienteGrupo: "Colegio San Juan",
    tipoPrendaPrincipal: "Conjunto Deportivo",
    fecha: "2026-09-12",
    estado: "En Producción",
  },
  {
    id: "ped_borrador_01",
    codigo: "SUB-000999",
    clienteGrupo: "Club Los Álamos",
    tipoPrendaPrincipal: "Camiseta",
    fecha: "2026-09-15",
    estado: "Borrador",
  },
];

describe("ListaPedidos (Spec Delta: pedidos)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renderiza la lista de pedidos al cargar los datos", async () => {
    vi.spyOn(clienteService, "obtenerListaPedidos").mockResolvedValue(mockPedidos);

    render(<ListaPedidos />);

    expect(screen.getByRole("status")).toHaveTextContent("Cargando");

    await waitFor(() => {
      expect(screen.getByText("SUB-000842")).toBeInTheDocument();
      expect(screen.getByText("PROMO 2002")).toBeInTheDocument();
      expect(screen.getByText("SUB-000910")).toBeInTheDocument();
      expect(screen.getByText("SUB-000999")).toBeInTheDocument();
    });
  });

  it("filtra pedidos por texto de búsqueda (código o cliente)", async () => {
    const user = userEvent.setup();
    vi.spyOn(clienteService, "obtenerListaPedidos").mockResolvedValue(mockPedidos);

    render(<ListaPedidos />);

    await waitFor(() => {
      expect(screen.getByText("SUB-000842")).toBeInTheDocument();
    });

    const input = screen.getByRole("searchbox", { name: /buscar pedidos/i });

    // Buscar por código
    await user.type(input, "000910");
    expect(screen.getByText("SUB-000910")).toBeInTheDocument();
    expect(screen.queryByText("SUB-000842")).not.toBeInTheDocument();

    // Limpiar y buscar por cliente
    await user.clear(input);
    await user.type(input, "Los Álamos");
    expect(screen.getByText("Club Los Álamos")).toBeInTheDocument();
    expect(screen.queryByText("Colegio San Juan")).not.toBeInTheDocument();
  });

  it("filtra pedidos por estado", async () => {
    const user = userEvent.setup();
    vi.spyOn(clienteService, "obtenerListaPedidos").mockResolvedValue(mockPedidos);

    render(<ListaPedidos />);

    await waitFor(() => {
      expect(screen.getByText("SUB-000842")).toBeInTheDocument();
    });

    // Filtrar por En Producción
    const botonEnProduccion = screen.getByRole("button", { name: "En Producción" });
    await user.click(botonEnProduccion);

    expect(screen.getByText("SUB-000910")).toBeInTheDocument();
    expect(screen.queryByText("SUB-000842")).not.toBeInTheDocument();
    expect(screen.queryByText("SUB-000999")).not.toBeInTheDocument();

    // Volver a Todos
    const botonTodos = screen.getByRole("button", { name: "Todos" });
    await user.click(botonTodos);

    expect(screen.getByText("SUB-000842")).toBeInTheDocument();
    expect(screen.getByText("SUB-000910")).toBeInTheDocument();
  });

  it("muestra estado vacío cuando ningún pedido coincide", async () => {
    const user = userEvent.setup();
    vi.spyOn(clienteService, "obtenerListaPedidos").mockResolvedValue(mockPedidos);

    render(<ListaPedidos />);

    await waitFor(() => {
      expect(screen.getByText("SUB-000842")).toBeInTheDocument();
    });

    const input = screen.getByRole("searchbox", { name: /buscar pedidos/i });
    await user.type(input, "inexistente");

    expect(
      screen.getByText("No se encontraron pedidos con los criterios especificados."),
    ).toBeInTheDocument();
  });

  it("muestra ErrorBanner ante una falla de red o de servidor sin degradar a demo", async () => {
    vi.spyOn(clienteService, "obtenerListaPedidos").mockRejectedValue(
      new clienteService.ErrorApi("R-NETWORK", "Fallo de conexión", 500),
    );

    render(<ListaPedidos />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Fallo de conexión");
      expect(screen.getByText(/No se muestran datos de demostración cuando el origen falla/i)).toBeInTheDocument();
    });
  });
});
