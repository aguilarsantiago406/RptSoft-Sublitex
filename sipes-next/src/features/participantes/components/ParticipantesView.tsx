"use client";

import { useMemo, useState } from "react";
import { Copy, Check } from "lucide-react";
import shared from "@/components/ui/table/tableShared.module.css";
import type { GrupoPedido } from "@/features/pedidos/types/pedido";
import type { ParticipanteConPrendas } from "@/features/pedidos/api/pedidos.api";
import { actionObtenerEnlacesGrupo } from "../actions/participantes.actions";
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
  tiposProducto?: Array<{ id: string; nombre: string; codigo: string }>;
  colores?: Array<{ id: string; nombre: string; codigoHex: string }>;
}

export function ParticipantesView({
  participantes,
  grupos,
  pedidoId,
  errorGrupos = [],
  tiposProducto = [],
  colores = [],
}: ParticipantesViewProps) {
  const [grupoActivo, setGrupoActivo] = useState<string>("TODOS");
  const [busqueda, setBusqueda] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiando, setCopiando] = useState(false);
  const [copiado, setCopiado] = useState(false);

  async function handleCopiarEnlaces() {
    if (copiando) return;
    setCopiando(true);
    try {
      const gruposTarget = grupoActivo === "TODOS" ? grupos.map((g) => g.id) : [grupoActivo];
      const res = await Promise.all(gruposTarget.map((id) => actionObtenerEnlacesGrupo(id)));
      const texto = res.filter((r) => r.ok && r.mensajeGrupal).map((r) => r.mensajeGrupal).join("\n\n---\n\n");
      if (texto) {
        await navigator.clipboard.writeText(texto);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2500);
      }
    } finally {
      setCopiando(false);
    }
  }

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
    const q = busqueda.toLowerCase().trim();
    return participantes.filter((item) => {
      const p = item.participante;
      if (grupoActivo !== "TODOS" && p.grupoId !== grupoActivo) return false;
      if (!q) return true;
      const enPrenda = (p.prendas ?? []).some(
        (pr) => (pr.numero ?? "").toLowerCase().includes(q) || (pr.nombreEnPrenda ?? "").toLowerCase().includes(q)
      );
      return p.nombrePersona.toLowerCase().includes(q) || p.estado.toLowerCase().includes(q) || item.nombreGrupo.toLowerCase().includes(q) || enPrenda;
    });
  }, [participantes, grupoActivo, busqueda]);

  return (
    <div className={styles.container}>
      <div className={styles.actionBar}>
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

        <div className={styles.actionBarRight}>
          <div className={styles.actionBarActions}>
            <button
              type="button"
              className={styles.secondaryAction}
              onClick={handleCopiarEnlaces}
              disabled={copiando || participantes.length === 0}
              title="Copiar lista compilada de enlaces personales para compartir por WhatsApp"
            >
              {copiado ? <Check size={15} color="#16a34a" /> : <Copy size={15} />}
              <span>{copiado ? "¡Enlaces copiados!" : copiando ? "Obteniendo…" : "Copiar todos los enlaces"}</span>
            </button>

            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => setIsModalOpen(true)}
            >
              <span>+ Nuevo Participante</span>
            </button>
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
        grupos={grupos}
        tiposProducto={tiposProducto}
        colores={colores}
      />

      <div className={styles.countSummary}>
        Mostrando <strong>{participantesFiltrados.length}</strong> de <strong>{participantes.length}</strong> participantes en total.
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
