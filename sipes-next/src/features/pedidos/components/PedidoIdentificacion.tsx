"use client";

import { useState } from "react";
import type { PedidoDetalle } from "../types/pedido";
import type { DisenoItem } from "../types/diseno";
import { formatDate } from "@/lib/format/date";
import { ModalEditarPedido } from "./ModalEditarPedido";
import styles from "./pedidos.module.css";

interface PedidoIdentificacionProps {
  pedido: PedidoDetalle;
  vendedoras?: Array<{ id: string; nombre: string }>;
  disenos?: DisenoItem[];
}

export function PedidoIdentificacion({
  pedido,
  vendedoras = [],
  disenos = [],
}: PedidoIdentificacionProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const disenoOficial = disenos.find((d) => d.estado === "APROBADO") ?? disenos[0] ?? null;

  return (
    <section className={styles.sectionBlock}>
      <div className={styles.sectionHeaderRow}>
        <div>
          <h2 className={styles.sectionTitle}>1 · IDENTIFICACIÓN</h2>
          <p className={styles.sectionSubtitle}>Datos generales de la orden y contacto comercial</p>
        </div>
        <button
          type="button"
          className={styles.envioEditButton}
          onClick={() => setIsEditOpen(true)}
          title="Modificar fecha de entrega, asesor u observaciones"
        >
          Editar identificación
        </button>
      </div>

      <div className={styles.identificacionLayout}>
        <div className={styles.identificacionGrid}>
          <dl className={styles.dataGrid4}>
            <div>
              <dt>N° de pedido</dt>
              <dd className={styles.code}>{pedido.codigo}</dd>
            </div>
            <div>
              <dt>Fecha de registro</dt>
              <dd suppressHydrationWarning>{formatDate(pedido.fechaPedido)}</dd>
            </div>
            <div>
              <dt>Fecha de entrega / compromiso</dt>
              <dd suppressHydrationWarning>{formatDate(pedido.fechaCompromiso)}</dd>
            </div>
            <div>
              <dt>Asesora comercial</dt>
              <dd>{pedido.vendedora?.nombre || "Sin asignar"}</dd>
            </div>
            <div>
              <dt>Cliente</dt>
              <dd>{pedido.cliente.nombre}</dd>
            </div>
            <div>
              <dt>Teléfono</dt>
              <dd>{pedido.cliente.telefono || "No registrado"}</dd>
            </div>
            <div>
              <dt>Ciudad / Destino</dt>
              <dd>{pedido.cliente.ciudad || "No registrada"}</dd>
            </div>
            {pedido.observaciones && (
              <div style={{ gridColumn: "span 2" }}>
                <dt>Observaciones / Detalles técnicos</dt>
                <dd>{pedido.observaciones}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className={styles.disenoThumbnailContainer}>
          {disenoOficial?.imagenUrl ? (
            <>
              <div
                className={styles.disenoThumbnailCard}
                onClick={() => setIsZoomOpen(true)}
                title="Clic para ver diseño en tamaño completo"
              >
                <img
                  src={disenoOficial.imagenUrl}
                  alt={`Diseño ${disenoOficial.estado}`}
                  className={styles.disenoThumbnailImg}
                />
              </div>
              <span
                className={
                  disenoOficial.estado === "APROBADO"
                    ? styles.disenoThumbnailBadge
                    : styles.disenoThumbnailBadgeBorrador
                }
              >
                {disenoOficial.estado === "APROBADO" ? "✓ Aprobado" : `v${disenoOficial.version} ${disenoOficial.estado}`}
              </span>
            </>
          ) : (
            <div className={styles.disenoThumbnailEmpty}>
              <span style={{ fontSize: "1.4rem" }}>👕</span>
              <span>Sin diseño acordado</span>
            </div>
          )}
        </div>
      </div>

      {isEditOpen && (
        <ModalEditarPedido
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          pedido={pedido}
          vendedoras={vendedoras}
        />
      )}

      {isZoomOpen && disenoOficial?.imagenUrl && (
        <div className={styles.lightboxOverlay} onClick={() => setIsZoomOpen(false)}>
          <div className={styles.lightboxCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.lightboxHeader}>
              <h3 className={styles.lightboxTitle}>
                Diseño Acordado — Versión {disenoOficial.version} ({disenoOficial.estado})
              </h3>
              <button
                type="button"
                className={styles.lightboxClose}
                onClick={() => setIsZoomOpen(false)}
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
            <div className={styles.lightboxBody}>
              <img
                src={disenoOficial.imagenUrl}
                alt="Diseño en tamaño completo"
                className={styles.lightboxImg}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
