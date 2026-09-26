"use client";

import { useMemo, useState } from "react";
import shared from "@/components/ui/table/tableShared.module.css";
import type { GrupoPedido } from "@/features/pedidos/types/pedido";
import type { ParticipanteConPrendas } from "@/features/pedidos/api/pedidos.api";
import { ParticipantesTable } from "./ParticipantesTable";
import { NuevoParticipanteModal } from "./NuevoParticipanteModal";
import styles from "./participantes.module.css";

export interface ItemParticipante {
  participante: ParticipanteConPrendas;
  nombreGrupo: string;
}

interface ParticipantesViewProps {
  participantes: ItemParticipante[];
  grupos: GrupoPedido[];
  pedidoId: string;
  errorGrupos?: string[];
}

export function ParticipantesView({
  participantes,
  grupos,
  pedidoId,
  errorGrupos = [],
}: ParticipantesViewProps) {
  const [grupoActivo, setGrupoActivo] = useState<string>("TODOS");
  const [busqueda, setBusqueda] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Conteo por grupo
  const conteoPorGrupo = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const item of participantes) {
      const gId = item.participante.grupoId;
      mapa.set(gId, (mapa.get(gId) ?? 0) + 1);
    }
    return mapa;
  }, [participantes]);

  // Filtrado reactivo en memoria
  const participantesFiltrados = useMemo(() => {
    return participantes.filter((item) => {
      const p = item.participante;

      // Filtro por grupo
      if (grupoActivo !== "TODOS" && p.grupoId !== grupoActivo) {
        return false;
      }

      // Filtro por búsqueda de texto
      if (busqueda.trim() !== "") {
        const query = busqueda.toLowerCase().trim();
        const persona = p.nombrePersona.toLowerCase();
        const estado = p.estado.toLowerCase();
        const grupo = item.nombreGrupo.toLowerCase();
        const tieneEnPrenda = (p.prendas ?? []).some(
          (prenda) =>
            (prenda.numero ?? "").toLowerCase().includes(query) ||
            (prenda.nombreEnPrenda ?? "").toLowerCase().includes(query)
        );

        return (
          persona.includes(query) ||
          estado.includes(query) ||
          grupo.includes(query) ||
          tieneEnPrenda
        );
      }

      return true;
    });
  }, [participantes, grupoActivo, busqueda]);

  return (
    <div className={styles.container}>
      <div className={styles.actionBar}>
        <div className={styles.filtersAndSearch}>
          <div className={styles.filtersGroup}>
            <button
              type="button"
              className={`${styles.filterTab} ${grupoActivo === "TODOS" ? styles.filterTabActive : ""}`}
              onClick={() => setGrupoActivo("TODOS")}
            >
              <span>Todos</span>
              <span className={styles.tabBadge}>{participantes.length}</span>
            </button>

            {grupos.map((g) => {
              const count = conteoPorGrupo.get(g.id) ?? 0;
              const activo = grupoActivo === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  className={`${styles.filterTab} ${activo ? styles.filterTabActive : ""}`}
                  onClick={() => setGrupoActivo(g.id)}
                >
                  <span>{g.nombre}</span>
                  <span className={styles.tabBadge}>{count}</span>
                </button>
              );
            })}
          </div>

          <div className={styles.searchBox}>
            <span className={styles.searchIcon}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </span>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Buscar por nombre, estado, número..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        <button
          type="button"
          className={styles.primaryButton}
          onClick={() => setIsModalOpen(true)}
        >
          <span>+ Nuevo Participante</span>
        </button>
      </div>

      {errorGrupos.length > 0 && (
        <div className={shared.inlineWarning} role="alert">
          {`No se pudieron cargar ${errorGrupos.length} ${
            errorGrupos.length === 1 ? "grupo" : "grupos"
          }: ${errorGrupos.join(", ")}. Revisá la conexión o intentá recargar.`}
        </div>
      )}

      <ParticipantesTable
        participantes={participantesFiltrados}
        pedidoId={pedidoId}
      />

      <div className={styles.countSummary}>
        Mostrando <strong>{participantesFiltrados.length}</strong> de{" "}
        <strong>{participantes.length}</strong> participantes en total.
      </div>

      <NuevoParticipanteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        grupos={grupos}
        pedidoId={pedidoId}
      />
    </div>
  );
}
