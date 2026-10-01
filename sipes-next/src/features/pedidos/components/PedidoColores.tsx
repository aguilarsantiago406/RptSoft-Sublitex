"use client";

import { useState, useTransition } from "react";
import { Palette, Pencil, Trash2 } from "lucide-react";
import type { PedidoDetalle } from "../types/pedido";
import { actionEliminarColorPedido } from "../actions/pedidos.actions";
import { ModalColorForm } from "./ModalColorForm";
import { ModalConfirmacion } from "@/components/ui/ModalConfirmacion";
import styles from "./pedidos.module.css";

type ColorItem = PedidoDetalle["colores"][number];

interface PedidoColoresProps {
  pedidoId: string;
  colores: PedidoDetalle["colores"];
}

export function PedidoColores({ pedidoId, colores }: PedidoColoresProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [colorAEditar, setColorAEditar] = useState<ColorItem | null>(null);
  const [colorAEliminar, setColorAEliminar] = useState<{ id: string; nombre: string } | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleConfirmEliminar = () => {
    if (!colorAEliminar) return;
    const { id: colorId } = colorAEliminar;

    setIsDeletingId(colorId);
    startTransition(async () => {
      await actionEliminarColorPedido(pedidoId, colorId);
      setIsDeletingId(null);
      setColorAEliminar(null);
    });
  };

  const handleOpenNuevoColor = () => {
    setColorAEditar(null);
    setIsModalOpen(true);
  };

  const handleOpenEditarColor = (color: ColorItem) => {
    setColorAEditar(color);
    setIsModalOpen(true);
  };

  return (
    <section className={`${styles.sectionBlock} ${styles.sectionBlockCompacta}`}>
      <div className={styles.sectionHeaderRow}>
        <div className={styles.sectionTitleRow}>
          <span className={styles.cardIcon}>
            <Palette size={16} />
          </span>
          <h2 className={styles.sectionTitle}>Colores oficiales y CMYK</h2>
        </div>
        <div className={styles.colorsHeaderActions}>
          <span className={styles.countTag}>{colores.length} colores</span>
          <button
            type="button"
            className={styles.cardAction}
            onClick={handleOpenNuevoColor}
          >
            + Agregar color
          </button>
        </div>
      </div>

      <div className={styles.colors}>
        {colores.length === 0 && <p className={styles.configEmpty}>Sin colores registrados.</p>}
        {colores.map((color) => {
          const hasCmyk =
            color.cmykC != null ||
            color.cmykM != null ||
            color.cmykY != null ||
            color.cmykK != null;

          return (
            <div className={styles.colorItem} key={color.id} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span className={styles.colorSample} style={{ backgroundColor: color.codigoHex }} />
              <div className={styles.colorDetails} style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <strong>{color.nombre}</strong>
                  {hasCmyk ? (
                    <span
                      style={{
                        background: "#f1f5f9",
                        border: "1px solid #cbd5e1",
                        borderRadius: "4px",
                        padding: "1px 6px",
                        fontSize: "11px",
                        fontWeight: "700",
                        color: "#0f172a",
                      }}
                      title="Valores CMYK para taller de sublimación"
                    >
                      C:{color.cmykC ?? 0}% M:{color.cmykM ?? 0}% Y:{color.cmykY ?? 0}% K:{color.cmykK ?? 0}%
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenEditarColor(color)}
                      style={{
                        background: "#fef3c7",
                        border: "1px solid #fde68a",
                        color: "#92400e",
                        borderRadius: "4px",
                        padding: "1px 6px",
                        fontSize: "10.5px",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                      title="Haz clic para que diseño complete la calibración CMYK"
                    >
                      + Calibrar CMYK
                    </button>
                  )}
                </div>
                <small>
                  HEX: {color.codigoHex}
                  {color.referenciaFisica ? ` · ${color.referenciaFisica}` : ""}
                </small>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <button
                  type="button"
                  onClick={() => handleOpenEditarColor(color)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#64748b",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                  }}
                  title={`Editar o calibrar CMYK de ${color.nombre}`}
                  aria-label={`Editar ${color.nombre}`}
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  className={styles.deleteColorButton}
                  onClick={() => setColorAEliminar({ id: color.id, nombre: color.nombre })}
                  disabled={isDeletingId === color.id}
                  title={`Eliminar ${color.nombre}`}
                  aria-label={`Eliminar color ${color.nombre}`}
                >
                  {isDeletingId === color.id ? "..." : <Trash2 size={14} />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <ModalColorForm
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setColorAEditar(null);
          }}
          pedidoId={pedidoId}
          initialColor={colorAEditar}
        />
      )}

      <ModalConfirmacion
        isOpen={Boolean(colorAEliminar)}
        onClose={() => setColorAEliminar(null)}
        onConfirm={handleConfirmEliminar}
        title="Eliminar Color"
        description={
          colorAEliminar ? (
            <>
              ¿Seguro que deseas eliminar el color <strong>{colorAEliminar.nombre}</strong> del pedido?
            </>
          ) : ""
        }
        confirmText="Eliminar Color"
        variant="danger"
        isPending={Boolean(isDeletingId)}
      />
    </section>
  );
}
