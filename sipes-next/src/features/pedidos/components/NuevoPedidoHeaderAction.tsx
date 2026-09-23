"use client";

import { useState } from "react";
import type { ClienteListItem } from "../api/pedidos.api";
import { ModalNuevoPedido } from "./ModalNuevoPedido";

interface NuevoPedidoHeaderActionProps {
  clientes: ClienteListItem[];
}

export function NuevoPedidoHeaderAction({ clientes }: NuevoPedidoHeaderActionProps) {
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
      />
    </>
  );
}
