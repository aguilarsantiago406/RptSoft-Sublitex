"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { GrupoPedido } from "../types/pedido";
import type { TipoProductoCatalogoItem } from "../api/pedidos.api";
import { actionEliminarGrupo } from "../actions/grupos.actions";
import { ModalGrupoForm } from "./ModalGrupoForm";
import styles from "./pedidos.module.css";

interface PedidoGruposProps {
  grupos: GrupoPedido[];
  pedidoId: string;
  totalPrendas: number;
  tiposProducto: TipoProductoCatalogoItem[];
}

export function PedidoGrupos({
  grupos,
  pedidoId,
  totalPrendas,
  tiposProducto,
}: PedidoGruposProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleEliminar = (grupoId: string, nombreGrupo: string) => {
    const confirmar = window.confirm(
      `¿Deseas eliminar el grupo "${nombreGrupo}"?\n\nSolo se podrá eliminar si no tiene participantes ni prendas asociadas.`
    );
    if (!confirmar) return;

    setErrorMsg(null);
    setIsDeletingId(grupoId);
    startTransition(async () => {
      const res = await actionEliminarGrupo(grupoId, pedidoId);
      setIsDeletingId(null);
      if (!res.ok) {
        setErrorMsg(res.error || "No se pudo eliminar el grupo.");
      }
    });
  };

  return (
    <section className={styles.sectionBlock}>
      <div className={styles.sectionHeaderRow}>
        <div>
          <h2 className={styles.sectionTitle}>2 · DISEÑO Y CONFIGURACIÓN DE GRUPOS</h2>
          <p className={styles.sectionSubtitle}>
            {grupos.length} grupos contratados · La configuración técnica vive en cada grupo
          </p>
        </div>
        <div className={styles.groupsHeaderActions}>
          <span className={styles.quantity}>{totalPrendas} prendas contratadas</span>
          <button
            type="button"
            className={styles.addGrupoButton}
            onClick={() => setIsModalOpen(true)}
          >
            + Agregar Grupo
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className={styles.groupActionError} role="alert">
          <span>{errorMsg}</span>
          <button
            type="button"
            className={styles.groupActionErrorClose}
            onClick={() => setErrorMsg(null)}
            aria-label="Cerrar error"
          >
            ✕
          </button>
        </div>
      )}

      <div className={styles.groupList}>
        {grupos.length === 0 && (
          <p className={styles.configEmpty}>Este pedido todavía no tiene grupos contratados.</p>
        )}
        {grupos.map((grupo) => (
          <article className={styles.groupCardMinimal} key={grupo.id}>
            <div className={styles.groupCardHeader}>
              <div className={styles.groupCardHeaderMain}>
                <div className={styles.groupTitleRow}>
                  <h3 className={styles.groupName}>{grupo.nombre}</h3>
                  <span className={styles.productBadge}>
                    {grupo.tipoProducto?.nombre ?? "Producto no asignado"}
                  </span>
                </div>
                <div className={styles.groupMetaRow}>
                  <span className={styles.policyBadge}>
                    Numeración {grupo.politicaNumeracion === "UNICA" ? "Única (sin duplicados)" : "Libre"}
                  </span>
                </div>
              </div>

              <div className={styles.groupHeaderRightBlock}>
                <div className={styles.groupCountBlock}>
                  <span className={styles.countNumber}>{grupo.cantidadContratada}</span>
                  <span className={styles.countLabel}>prendas</span>
                </div>
                <button
                  type="button"
                  className={styles.deleteGrupoButton}
                  onClick={() => handleEliminar(grupo.id, grupo.nombre)}
                  disabled={isDeletingId === grupo.id}
                  title={`Eliminar grupo ${grupo.nombre}`}
                  aria-label={`Eliminar grupo ${grupo.nombre}`}
                >
                  {isDeletingId === grupo.id ? "..." : "✕"}
                </button>
              </div>
            </div>

            {grupo.tipoProducto?.componentes && (
              <div className={styles.componentsRow}>
                <span className={styles.componentsLabel}>Componentes por prenda:</span>
                <div className={styles.componentsPills}>
                  {grupo.tipoProducto.componentes.camisetas > 0 && (
                    <span className={styles.pillItem}>
                      {grupo.tipoProducto.componentes.camisetas} camiseta{grupo.tipoProducto.componentes.camisetas > 1 ? "s" : ""}
                    </span>
                  )}
                  {grupo.tipoProducto.componentes.shorts > 0 && (
                    <span className={styles.pillItem}>
                      {grupo.tipoProducto.componentes.shorts} short{grupo.tipoProducto.componentes.shorts > 1 ? "s" : ""}
                    </span>
                  )}
                  {grupo.tipoProducto.componentes.medias > 0 && (
                    <span className={styles.pillItem}>
                      {grupo.tipoProducto.componentes.medias} par(es) medias
                    </span>
                  )}
                </div>
              </div>
            )}

            {grupo.observaciones && (
              <div className={styles.groupObservations}>
                <strong>Nota:</strong> {grupo.observaciones}
              </div>
            )}

            <div className={styles.configSection}>
              <span className={styles.configSectionTitle}>Especificaciones técnicas del grupo</span>
              {grupo.configuracion.length === 0 ? (
                <span className={styles.configEmpty}>Sin atributos específicos definidos</span>
              ) : (
                <div className={styles.configPillsGrid}>
                  {grupo.configuracion.map((item) => (
                    <div className={styles.configPill} key={`${item.atributo}-${item.valor}`}>
                      <span className={styles.configPillKey}>{item.atributo}</span>
                      <span className={styles.configPillVal}>{item.valor}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.groupCardFooter}>
              <Link className={styles.secondaryButton} href={`/pedidos/${pedidoId}/prendas`}>
                Ver prendas de {grupo.nombre} ({grupo.cantidadContratada}) →
              </Link>
            </div>
          </article>
        ))}
      </div>

      <ModalGrupoForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        pedidoId={pedidoId}
        tiposProducto={tiposProducto}
      />
    </section>
  );
}
