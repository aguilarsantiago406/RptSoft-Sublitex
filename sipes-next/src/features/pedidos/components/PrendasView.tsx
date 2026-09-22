"use client";

import { useMemo, useState } from "react";
import type { GrupoPedido, PrendaDetalle } from "../types/pedido";
import { PrendasTable } from "./PrendasTable";
import styles from "./prendas.module.css";

interface PrendasViewProps {
  prendas: PrendaDetalle[];
  grupos: GrupoPedido[];
}

export function PrendasView({ prendas, grupos }: PrendasViewProps) {
  const [grupoActivo, setGrupoActivo] = useState<string>("TODOS");
  const [busqueda, setBusqueda] = useState<string>("");

  // Conteos por grupo
  const conteoPorGrupo = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const p of prendas) {
      const gId = p.grupoId;
      mapa.set(gId, (mapa.get(gId) ?? 0) + 1);
    }
    return mapa;
  }, [prendas]);

  // Filtrado reactivo en memoria
  const prendasFiltradas = useMemo(() => {
    return prendas.filter((p) => {
      // Filtro por grupo
      if (grupoActivo !== "TODOS" && p.grupoId !== grupoActivo) {
        return false;
      }

      // Filtro por búsqueda de texto
      if (busqueda.trim() !== "") {
        const query = busqueda.toLowerCase().trim();
        const persona = (p.participante?.nombrePersona ?? "").toLowerCase();
        const apodo = (p.nombreEnPrenda ?? "").toLowerCase();
        const numero = (p.numero ?? "").toLowerCase();
        const talla = (p.talla?.codigo ?? "").toLowerCase();
        const genero = (p.genero ?? "").toLowerCase();
        const grupo = (p.grupo?.nombre ?? "").toLowerCase();

        return (
          persona.includes(query) ||
          apodo.includes(query) ||
          numero.includes(query) ||
          talla.includes(query) ||
          genero.includes(query) ||
          grupo.includes(query)
        );
      }

      return true;
    });
  }, [prendas, grupoActivo, busqueda]);

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
            <span className={styles.tabBadge}>{prendas.length}</span>
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
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Buscar por nombre, número, talla..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      <PrendasTable prendas={prendasFiltradas} />

      <div className={styles.countSummary}>
        Mostrando <strong>{prendasFiltradas.length}</strong> de <strong>{prendas.length}</strong> prendas en total.
      </div>
    </div>
  );
}
