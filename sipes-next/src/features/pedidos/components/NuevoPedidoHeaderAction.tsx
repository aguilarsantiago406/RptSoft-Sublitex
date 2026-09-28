"use client";

import { useState } from "react";
import type { ClienteListItem } from "../api/pedidos.api";
import { ModalNuevoPedido } from "./ModalNuevoPedido";

interface NuevoPedidoHeaderActionProps {
  clientes: ClienteListItem[];
  vendedoras?: Array<{ id: string; nombre: string }>;
}

export function NuevoPedidoHeaderAction({ clientes, vendedoras }: NuevoPedidoHeaderActionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="primaryButton"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        + Nuevo pedido
      </button>

      <ModalNuevoPedido
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        clientesIniciales={clientes}
        vendedoras={vendedoras}
      />
    </>
  );
}
