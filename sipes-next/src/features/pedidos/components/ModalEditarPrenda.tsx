"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { AtributoCatalogoItem } from "../api/pedidos.api";
import type { PrendaDetalle } from "../types/pedido";
import { actionActualizarPrenda } from "../actions/pedidos.actions";
import { SeccionExcepcionesPrenda } from "./SeccionExcepcionesPrenda";
import styles from "./pedidos.module.css";

interface ModalEditarPrendaProps {
  isOpen: boolean;
  onClose: () => void;
  prenda: PrendaDetalle;
  pedidoId: string;
  tallasDisponibles: Array<{ id: string; codigo: string; etiqueta: string }>;
  atributosCatalogo: AtributoCatalogoItem[];
}

export function ModalEditarPrenda({
  isOpen,
  onClose,
  prenda,
  pedidoId,
  tallasDisponibles,
  atributosCatalogo,
}: ModalEditarPrendaProps) {
  const router = useRouter();
  const [nombreEnPrenda, setNombreEnPrenda] = useState(prenda.nombreEnPrenda ?? "");
  const [numero, setNumero] = useState(prenda.numero ?? "");
  const [tallaId, setTallaId] = useState(prenda.tallaId ?? "");
  const [genero, setGenero] = useState<
    "HOMBRE" | "MUJER" | "NINO" | "NINA" | "SIN_ESPECIFICAR"
  >(prenda.genero as any ?? "SIN_ESPECIFICAR");

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await actionActualizarPrenda(prenda.id, pedidoId, {
        nombreEnPrenda: nombreEnPrenda.trim() || undefined,
        numero: numero.trim() || undefined,
        tallaId: tallaId || undefined,
        genero,
      });

      if (!res.ok) {
        setError(res.error || "No se pudo actualizar la prenda.");
        return;
      }

      onClose();
      router.refresh();
    });
  }

  const nombrePersona = prenda.participante?.nombrePersona || "Sin asignar";
  const grupoNombre = prenda.grupo?.nombre || "General";

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalCardWide} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h3 className={styles.modalTitle}>Editar Prenda</h3>
            <p className={styles.modalSubtitle}>
              {nombrePersona} · {grupoNombre}
            </p>
          </div>
          <button
            type="button"
            className={styles.modalCloseButton}
            onClick={onClose}
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

        <form onSubmit={handleSubmit} className={styles.modalFormCompact}>
          <div className={styles.formField}>
            <label htmlFor="prenda-apodo">Estampado en Espalda / Nombre</label>
            <input
              id="prenda-apodo"
              type="text"
              placeholder="Ej: GONZALEZ"
              value={nombreEnPrenda}
              onChange={(e) => setNombreEnPrenda(e.target.value)}
              className={styles.formInput}
              autoFocus
            />
          </div>

          <div className={styles.twoColsLayout} style={{ gap: "10px" }}>
            <div className={styles.formField}>
              <label htmlFor="prenda-numero">Número (Dorsal)</label>
              <input
                id="prenda-numero"
                type="text"
                placeholder="Ej: 10 o S/N"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                className={styles.formInput}
              />
            </div>

            <div className={styles.formField}>
              <label htmlFor="prenda-talla">Talla Oficial</label>
              <select
                id="prenda-talla"
                value={tallaId}
                onChange={(e) => setTallaId(e.target.value)}
                className={styles.formInput}
              >
                <option value="">Sin especificar</option>
                {tallasDisponibles.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.etiqueta || t.codigo}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formField}>
            <label htmlFor="prenda-genero">Corte / Género del Portador</label>
            <select
              id="prenda-genero"
              value={genero}
              onChange={(e) =>
                setGenero(
                  e.target.value as "HOMBRE" | "MUJER" | "NINO" | "NINA" | "SIN_ESPECIFICAR"
                )
              }
              className={styles.formInput}
            >
              <option value="HOMBRE">Hombre</option>
              <option value="MUJER">Mujer</option>
              <option value="NINO">Niño</option>
              <option value="NINA">Niña</option>
              <option value="SIN_ESPECIFICAR">Estándar / Sin especificar</option>
            </select>
          </div>

          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.modalCancelButton}
              onClick={onClose}
              disabled={isPending}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.modalSubmitButton}
              disabled={isPending}
            >
              {isPending ? "Guardando..." : "Guardar Ficha"}
            </button>
          </div>
        </form>

        <div style={{ padding: "0 20px 14px" }}>
          <SeccionExcepcionesPrenda
            prendaId={prenda.id}
            pedidoId={pedidoId}
            excepciones={prenda.excepciones}
            atributosCatalogo={atributosCatalogo}
          />
        </div>
      </div>
    </div>
  );
}
