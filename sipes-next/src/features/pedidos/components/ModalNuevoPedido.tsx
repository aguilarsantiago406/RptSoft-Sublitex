"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ClienteListItem } from "../api/pedidos.api";
import { actionCrearPedido, actionCrearCliente } from "../actions/pedidos.actions";
import styles from "./pedidos.module.css";

interface ModalNuevoPedidoProps {
  isOpen: boolean;
  onClose: () => void;
  clientesIniciales: ClienteListItem[];
}

export function ModalNuevoPedido({
  isOpen,
  onClose,
  clientesIniciales,
}: ModalNuevoPedidoProps) {
  const router = useRouter();
  const [clientes, setClientes] = useState<ClienteListItem[]>(clientesIniciales);
  const [clienteId, setClienteId] = useState(clientesIniciales[0]?.id ?? "");

  // Fecha mínima: mañana
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateStr = tomorrow.toISOString().split("T")[0];

  const defaultCompromiso = new Date();
  defaultCompromiso.setDate(defaultCompromiso.getDate() + 14); // 2 semanas por defecto
  const defaultDateStr = defaultCompromiso.toISOString().split("T")[0];

  const [fechaCompromiso, setFechaCompromiso] = useState(defaultDateStr);
  const [observaciones, setObservaciones] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Modo creación rápida de cliente
  const [modoNuevoCliente, setModoNuevoCliente] = useState(false);
  const [nuevoClienteNombre, setNuevoClienteNombre] = useState("");
  const [nuevoClienteTipo, setNuevoClienteTipo] = useState<
    "COLEGIO" | "PROMOCION" | "CLUB" | "EMPRESA" | "PARTICULAR"
  >("PROMOCION");
  const [nuevoClienteCiudad, setNuevoClienteCiudad] = useState("");
  const [nuevoClienteTelefono, setNuevoClienteTelefono] = useState("");
  const [isCreatingCliente, setIsCreatingCliente] = useState(false);

  if (!isOpen) return null;

  function handleReset() {
    setClienteId(clientes[0]?.id ?? "");
    setFechaCompromiso(defaultDateStr);
    setObservaciones("");
    setError(null);
    setModoNuevoCliente(false);
    setNuevoClienteNombre("");
    onClose();
  }

  async function handleCrearClienteRapido(e: React.FormEvent) {
    e.preventDefault();
    if (!nuevoClienteNombre.trim()) {
      setError("El nombre del cliente es obligatorio.");
      return;
    }

    setIsCreatingCliente(true);
    setError(null);

    const res = await actionCrearCliente({
      nombre: nuevoClienteNombre,
      tipo: nuevoClienteTipo,
      ciudad: nuevoClienteCiudad || undefined,
      telefono: nuevoClienteTelefono || undefined,
    });

    setIsCreatingCliente(false);

    if (!res.ok || !res.cliente) {
      setError(res.error || "No se pudo registrar el cliente.");
      return;
    }

    const nuevo = {
      id: res.cliente.id,
      nombre: res.cliente.nombre,
      tipo: nuevoClienteTipo,
      ciudad: nuevoClienteCiudad || null,
      telefono: nuevoClienteTelefono || null,
    };

    setClientes((prev) => [nuevo, ...prev]);
    setClienteId(nuevo.id);
    setModoNuevoCliente(false);
    setNuevoClienteNombre("");
  }

  function handleSubmitPedido(e: React.FormEvent) {
    e.preventDefault();
    if (!clienteId) {
      setError("Debes seleccionar un cliente para el pedido.");
      return;
    }
    if (!fechaCompromiso) {
      setError("La fecha de compromiso de entrega es obligatoria (Regla R-A09).");
      return;
    }

    setError(null);
    startTransition(async () => {
      const res = await actionCrearPedido({
        clienteId,
        fechaCompromiso,
        observaciones: observaciones.trim() || undefined,
      });

      if (!res.ok || !res.pedido) {
        setError(res.error || "No se pudo crear el pedido.");
        return;
      }

      handleReset();
      router.push(`/pedidos/${res.pedido.id}`);
    });
  }

  return (
    <div className={styles.modalBackdrop} onClick={handleReset}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h3 className={styles.modalTitle}>Nuevo Pedido</h3>
            <p className={styles.modalSubtitle}>
              Alta de orden técnica con código correlativo (Regla R-A03)
            </p>
          </div>
          <button
            type="button"
            className={styles.modalCloseButton}
            onClick={handleReset}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className={styles.modalErrorBanner} role="alert">
            {error}
          </div>
        )}

        {modoNuevoCliente ? (
          /* Formulario rápido para nuevo cliente */
          <form onSubmit={handleCrearClienteRapido} className={styles.modalForm}>
            <div className={styles.formField}>
              <label htmlFor="cliente-nombre">Nombre de la organización / cliente *</label>
              <input
                id="cliente-nombre"
                type="text"
                required
                placeholder="Ej: Colegio San Agustín - Promo 2026"
                value={nuevoClienteNombre}
                onChange={(e) => setNuevoClienteNombre(e.target.value)}
                className={styles.formInput}
                autoFocus
              />
            </div>

            <div className={styles.twoColsLayout} style={{ gap: "12px" }}>
              <div className={styles.formField}>
                <label htmlFor="cliente-tipo">Tipo de cliente</label>
                <select
                  id="cliente-tipo"
                  value={nuevoClienteTipo}
                  onChange={(e) =>
                    setNuevoClienteTipo(
                      e.target.value as "COLEGIO" | "PROMOCION" | "CLUB" | "EMPRESA" | "PARTICULAR"
                    )
                  }
                  className={styles.formInput}
                >
                  <option value="PROMOCION">Promoción escolar</option>
                  <option value="COLEGIO">Colegio / Institución</option>
                  <option value="CLUB">Club deportivo</option>
                  <option value="EMPRESA">Empresa</option>
                  <option value="PARTICULAR">Particular</option>
                </select>
              </div>

              <div className={styles.formField}>
                <label htmlFor="cliente-ciudad">Ciudad / Destino</label>
                <input
                  id="cliente-ciudad"
                  type="text"
                  placeholder="Ej: Lima, Arequipa..."
                  value={nuevoClienteCiudad}
                  onChange={(e) => setNuevoClienteCiudad(e.target.value)}
                  className={styles.formInput}
                />
              </div>
            </div>

            <div className={styles.formField}>
              <label htmlFor="cliente-telefono">Teléfono de contacto (Opcional)</label>
              <input
                id="cliente-telefono"
                type="text"
                placeholder="Ej: 999888777"
                value={nuevoClienteTelefono}
                onChange={(e) => setNuevoClienteTelefono(e.target.value)}
                className={styles.formInput}
              />
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.modalCancelButton}
                onClick={() => setModoNuevoCliente(false)}
                disabled={isCreatingCliente}
              >
                Volver a la selección
              </button>
              <button
                type="submit"
                className={styles.modalSubmitButton}
                disabled={isCreatingCliente}
              >
                {isCreatingCliente ? "Guardando..." : "Guardar Cliente"}
              </button>
            </div>
          </form>
        ) : (
          /* Formulario principal de creación de pedido */
          <form onSubmit={handleSubmitPedido} className={styles.modalForm}>
            <div className={styles.formField}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label htmlFor="pedido-cliente">Cliente / Organización *</label>
                <button
                  type="button"
                  onClick={() => setModoNuevoCliente(true)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--sky-dark)",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  + Nuevo Cliente
                </button>
              </div>
              <select
                id="pedido-cliente"
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                className={styles.formInput}
                required
              >
                {clientes.length === 0 && (
                  <option value="">No hay clientes registrados</option>
                )}
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} {c.ciudad ? `(${c.ciudad})` : ""} — {c.tipo}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formField}>
              <label htmlFor="pedido-fecha">Fecha de compromiso de entrega *</label>
              <input
                id="pedido-fecha"
                type="date"
                required
                min={minDateStr}
                value={fechaCompromiso}
                onChange={(e) => setFechaCompromiso(e.target.value)}
                className={styles.formInput}
              />
              <small className={styles.formHint}>
                Debe ser posterior a la fecha actual para salir de BORRADOR (Regla R-A09)
              </small>
            </div>

            <div className={styles.formField}>
              <label htmlFor="pedido-obs">Observaciones comerciales (Opcional)</label>
              <textarea
                id="pedido-obs"
                rows={3}
                placeholder="Ej: Entrega prioritaria para desfile escolar, entrega en paquete único..."
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className={styles.formInput}
                style={{ resize: "vertical" }}
              />
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.modalCancelButton}
                onClick={handleReset}
                disabled={isPending}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={styles.modalSubmitButton}
                disabled={isPending || !clienteId}
              >
                {isPending ? "Generando pedido..." : "Crear Pedido →"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
