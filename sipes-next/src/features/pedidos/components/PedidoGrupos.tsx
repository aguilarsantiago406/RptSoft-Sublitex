"use client";

import { useState, useTransition } from "react";
import type { GrupoPedido } from "../types/pedido";
import type { TipoProductoCatalogoItem, AtributoCatalogoItem } from "../api/pedidos.api";
import { actionEliminarGrupo } from "../actions/grupos.actions";
import { ModalGrupoForm } from "./ModalGrupoForm";
import { ModalEditarGrupo } from "./ModalEditarGrupo";
import { GrupoCard } from "./GrupoCard";
import styles from "./pedidos.module.css";

interface PedidoGruposProps {
  grupos: GrupoPedido[];
  pedidoId: string;
  totalPrendas: number;
  tiposProducto: TipoProductoCatalogoItem[];
  atributosCatalogo?: AtributoCatalogoItem[];
}

export function PedidoGrupos({
  grupos,
  pedidoId,
  totalPrendas,
  tiposProducto,
  atributosCatalogo = [],
}: PedidoGruposProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGrupo, setEditingGrupo] = useState<GrupoPedido | null>(null);
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
          <GrupoCard
            key={grupo.id}
            grupo={grupo}
            pedidoId={pedidoId}
            onEdit={(g) => setEditingGrupo(g)}
            onDelete={handleEliminar}
            isDeleting={isDeletingId === grupo.id}
          />
        ))}
      </div>

      <ModalGrupoForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        pedidoId={pedidoId}
        tiposProducto={tiposProducto}
      />

      {editingGrupo && (
        <ModalEditarGrupo
          isOpen={Boolean(editingGrupo)}
          onClose={() => setEditingGrupo(null)}
          grupo={editingGrupo}
          pedidoId={pedidoId}
          atributosCatalogo={atributosCatalogo}
        />
      )}
    </section>
  );
}
