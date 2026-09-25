"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { GrupoPedido } from "../types/pedido";
import type { AtributoCatalogoItem } from "../api/pedidos.api";
import { actionActualizarGrupo } from "../actions/grupos.actions";
import styles from "./pedidos.module.css";

interface ModalEditarGrupoProps {
  isOpen: boolean;
  onClose: () => void;
  grupo: GrupoPedido;
  pedidoId: string;
  atributosCatalogo: AtributoCatalogoItem[];
}

function getInitialConfig(cfg: GrupoPedido["configuracion"], catalogo: AtributoCatalogoItem[]) {
  const map: Record<string, string> = {};
  for (const item of cfg ?? []) {
    const at = catalogo.find(
      (a) => a.codigo.toLowerCase() === item.atributo.toLowerCase() || a.nombre.toLowerCase() === item.atributo.toLowerCase()
    );
    const val = at?.valores.find(
      (v) => v.codigo.toLowerCase() === item.valor.toLowerCase() || v.etiqueta.toLowerCase() === item.valor.toLowerCase()
    );
    if (at && val) map[at.id] = val.id;
  }
  return map;
}

export function ModalEditarGrupo({
  isOpen,
  onClose,
  grupo,
  pedidoId,
  atributosCatalogo,
}: ModalEditarGrupoProps) {
  const router = useRouter();
  const [nombre, setNombre] = useState(grupo.nombre);
  const [cantidadContratada, setCantidadContratada] = useState<number>(grupo.cantidadContratada);
  const [observaciones, setObservaciones] = useState(grupo.observaciones ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [configMap, setConfigMap] = useState<Record<string, string>>(() =>
    getInitialConfig(grupo.configuracion, atributosCatalogo)
  );

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) return setError("El nombre del grupo es obligatorio.");
    if (cantidadContratada < 1) return setError("La cantidad contratada debe ser al menos 1.");

    setError(null);
    startTransition(async () => {
      const configuracion = Object.entries(configMap)
        .filter(([_, valId]) => Boolean(valId))
        .map(([atributoId, valorAtributoId]) => ({ atributoId, valorAtributoId }));

      const res = await actionActualizarGrupo(grupo.id, pedidoId, {
        nombre: nombre.trim(),
        cantidadContratada: Number(cantidadContratada),
        observaciones: observaciones.trim() || undefined,
        configuracion,
      });

      if (!res.ok) {
        setError(res.error || "No se pudo actualizar el grupo.");
        return;
      }
      onClose();
      router.refresh();
    });
  }

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalCardWide} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h3 className={styles.modalTitle}>Editar Grupo · {grupo.nombre}</h3>
            <p className={styles.modalSubtitle}>Actualización de especificaciones técnicas y cantidad contratada</p>
          </div>
          <button type="button" className={styles.modalCloseButton} onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        {error && <div className={styles.modalErrorBanner} role="alert">{error}</div>}

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.twoColsLayout} style={{ gap: "12px" }}>
            <div className={styles.formField}>
              <label htmlFor="edit-grupo-nombre">Nombre del grupo *</label>
              <input
                id="edit-grupo-nombre"
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className={styles.formInput}
              />
            </div>
            <div className={styles.formField}>
              <label htmlFor="edit-grupo-cantidad">Cantidad contratada *</label>
              <input
                id="edit-grupo-cantidad"
                type="number"
                min={1}
                required
                value={cantidadContratada}
                onChange={(e) => setCantidadContratada(parseInt(e.target.value, 10) || 1)}
                className={styles.formInput}
              />
            </div>
          </div>

          {atributosCatalogo.length > 0 && (
            <div style={{ marginTop: "8px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "0.88rem", color: "var(--navy)" }}>
                Especificaciones base del grupo (telas, cuellos, acabados):
              </label>
              <div className={styles.twoColsLayout} style={{ gap: "10px" }}>
                {atributosCatalogo.map((atr) => (
                  <div key={atr.id} className={styles.formField}>
                    <label htmlFor={`edit-grupo-atr-${atr.id}`}>{atr.nombre}</label>
                    <select
                      id={`edit-grupo-atr-${atr.id}`}
                      value={configMap[atr.id] ?? ""}
                      onChange={(e) => setConfigMap((prev) => ({ ...prev, [atr.id]: e.target.value }))}
                      className={styles.formInput}
                    >
                      <option value="">Sin especificar</option>
                      {atr.valores.map((v) => (
                        <option key={v.id} value={v.id}>{v.etiqueta}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={styles.formField}>
            <label htmlFor="edit-grupo-obs">Observaciones o notas técnicas</label>
            <textarea
              id="edit-grupo-obs"
              rows={2}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className={styles.formInput}
              style={{ resize: "vertical" }}
            />
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.modalCancelButton} onClick={onClose} disabled={isPending}>
              Cancelar
            </button>
            <button type="submit" className={styles.modalSubmitButton} disabled={isPending}>
              {isPending ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
