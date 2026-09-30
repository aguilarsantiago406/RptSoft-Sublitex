"use client";

import { useState, useTransition } from "react";
import { LayoutGrid } from "lucide-react";
import type { GrupoPedido } from "../types/pedido";
import type { TipoProductoCatalogoItem, AtributoCatalogoItem } from "../api/pedidos.api";
import { actionEliminarGrupo } from "../actions/grupos.actions";
import { ModalGrupoForm } from "./ModalGrupoForm";
import { ModalEditarGrupo } from "./ModalEditarGrupo";
import { ModalConfirmacion } from "@/components/ui/ModalConfirmacion";
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
  const [grupoAEliminar, setGrupoAEliminar] = useState<{ id: string; nombre: string } | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleConfirmEliminar = () => {
    if (!grupoAEliminar) return;
    const { id: grupoId } = grupoAEliminar;

    setErrorMsg(null);
    setIsDeletingId(grupoId);
    startTransition(async () => {
      const res = await actionEliminarGrupo(grupoId, pedidoId);
      setIsDeletingId(null);
      setGrupoAEliminar(null);
      if (!res.ok) {
        setErrorMsg(res.error || "No se pudo eliminar el grupo.");
      }
    });
  };

  return (
    <section className={styles.sectionBlock}>
      <div className={styles.sectionHeaderRow}>
        <div className={styles.sectionTitleRow}>
          <span className={styles.cardIcon}>
            <LayoutGrid size={16} />
          </span>
          <h2 className={styles.sectionTitle}>Grupos y configuración</h2>
        </div>
        <div className={styles.groupsHeaderActions}>
          <span className={styles.countTag}>{totalPrendas} prendas contratadas</span>
          <button
            type="button"
            className={styles.cardAction}
            onClick={() => setIsModalOpen(true)}
          >
            + Agregar grupo
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
            atributosCatalogo={atributosCatalogo}
            onEdit={(g) => setEditingGrupo(g)}
            onDelete={(id, nombre) => setGrupoAEliminar({ id, nombre })}
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

      <ModalConfirmacion
        isOpen={Boolean(grupoAEliminar)}
        onClose={() => setGrupoAEliminar(null)}
        onConfirm={handleConfirmEliminar}
        title="Eliminar Grupo"
        description={
          grupoAEliminar ? (
            <>
              ¿Deseas eliminar el grupo <strong>{grupoAEliminar.nombre}</strong>?
              <br />
              <br />
              Solo se podrá eliminar si no tiene participantes ni prendas asociadas.
            </>
          ) : ""
        }
        confirmText="Eliminar Grupo"
        variant="danger"
        isPending={Boolean(isDeletingId)}
      />
    </section>
  );
}
