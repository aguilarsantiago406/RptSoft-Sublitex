"use client";

import { useState } from "react";
import { ModalNuevoCliente } from "./ModalNuevoCliente";

export function NuevoClienteHeaderAction() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="primaryButton"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        + Nuevo cliente
      </button>

      <ModalNuevoCliente
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
