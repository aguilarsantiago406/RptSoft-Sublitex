"use client";

import { useMemo, useState } from "react";
import { Search, Download } from "lucide-react";
import shared from "@/components/ui/table/tableShared.module.css";
import type { UbicacionPersonalizacionCatalogo } from "@/features/catalogos/types/catalogo";
import type { AtributoCatalogoItem, TallaCatalogoItem } from "../api/pedidos.api";
import type { GrupoPedido, PrendaDetalle } from "../types/pedido";
import { PrendasTable } from "./PrendasTable";
import styles from "./prendas.module.css";

interface PrendasViewProps {
  prendas: PrendaDetalle[];
  grupos: GrupoPedido[];
  pedidoId: string;
  tallas: TallaCatalogoItem[];
  atributos: AtributoCatalogoItem[];
  colores?: Array<{ id: string; nombre: string; codigoHex: string }>;
  ubicaciones?: UbicacionPersonalizacionCatalogo[];
  errorGrupos?: string[];
}

export function PrendasView({
  prendas,
  grupos,
  pedidoId,
  tallas,
  atributos,
  colores,
  ubicaciones,
  errorGrupos = [],
}: PrendasViewProps) {
  const [grupoActivo, setGrupoActivo] = useState<string>("TODOS");
  const [busqueda, setBusqueda] = useState<string>("");

  const conteoPorGrupo = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const p of prendas) {
      const gId = p.grupoId;
      mapa.set(gId, (mapa.get(gId) ?? 0) + 1);
    }
    return mapa;
  }, [prendas]);

  const prendasFiltradas = useMemo(() => {
    return prendas.filter((p) => {
      if (grupoActivo !== "TODOS" && p.grupoId !== grupoActivo) {
        return false;
      }
      if (busqueda.trim() !== "") {
        const query = busqueda.toLowerCase().trim();
        const persona = (p.participante?.nombrePersona ?? "").toLowerCase();
        const apodo = (p.nombreEnPrenda ?? "").toLowerCase();
        const numero = (p.numero ?? "").toLowerCase();
        const talla = (p.talla?.codigo ?? "").toLowerCase();
        const genero = (p.genero ?? "").toLowerCase();
        const grupo = (p.grupo?.nombre ?? "").toLowerCase();
        const estampados = (p.personalizaciones ?? [])
          .map((pers) => (pers.contenido ?? "").toLowerCase())
          .join(" ");

        return (
          persona.includes(query) ||
          apodo.includes(query) ||
          numero.includes(query) ||
          talla.includes(query) ||
          genero.includes(query) ||
          grupo.includes(query) ||
          estampados.includes(query)
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
            return (
              <button
                key={g.id}
                type="button"
                className={`${styles.filterTab} ${grupoActivo === g.id ? styles.filterTabActive : ""}`}
                onClick={() => setGrupoActivo(g.id)}
              >
                <span>{g.nombre}</span>
                <span className={styles.tabBadge}>{count}</span>
              </button>
            );
          })}
        </div>

        <div className={styles.actionBarRight} style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <a
            href={`/api/pedidos/${encodeURIComponent(pedidoId)}/export-diseno`}
            download
            className={styles.btnExportDiseno}
            title="Exportar planilla nominal limpia para CorelDRAW / Sublimación"
          >
            <Download size={15} />
            <span>Exportar para Corel</span>
          </a>

          <div className={styles.searchBox}>
            <Search size={14} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Buscar participante, apodo, N°, estampado..."
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

      <PrendasTable
        prendas={prendasFiltradas}
        pedidoId={pedidoId}
        tallas={tallas}
        atributos={atributos}
        colores={colores}
        ubicaciones={ubicaciones}
      />

      <div className={styles.countSummary}>
        Mostrando <strong>{prendasFiltradas.length}</strong> de <strong>{prendas.length}</strong> prendas en total.
      </div>
    </div>
  );
}
