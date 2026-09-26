"use client";

import { useMemo } from "react";
import { useTableState } from "@/lib/useTableState";
import { Pagination } from "@/components/ui/table/Pagination";
import { SortableTh } from "@/components/ui/table/SortableTh";
import shared from "@/components/ui/table/tableShared.module.css";
import type {
  TipoProductoCatalogo,
  TallaCatalogo,
  AtributoCatalogo,
  UbicacionPersonalizacionCatalogo,
  TarifaCatalogo,
} from "../types/catalogo";
import { TarifasView } from "./TarifasView";
import styles from "./catalogos.module.css";

interface CatalogosViewProps {
  tiposProducto: TipoProductoCatalogo[];
  tallas: TallaCatalogo[];
  atributos: AtributoCatalogo[];
  ubicaciones: UbicacionPersonalizacionCatalogo[];
  tarifas: TarifaCatalogo[];
  error?: string | null;
}

function getReferenciaPrecio(codigo: string, tarifas: TarifaCatalogo[]): number | null {
  const codeLower = codigo.toLowerCase();
  const ahora = new Date();
  const encontrada = tarifas.find((t) => {
    if (!t.activo) return false;
    const desde = new Date(t.vigenteDesde);
    const hasta = t.vigenteHasta ? new Date(t.vigenteHasta) : null;
    if (Number.isNaN(desde.getTime()) || desde > ahora) return false;
    if (hasta && (Number.isNaN(hasta.getTime()) || hasta < ahora)) return false;

    const c = t.concepto.toLowerCase();
    return c === codeLower || codeLower.includes(c) || c.includes(codeLower);
  });

  if (encontrada && encontrada.valor != null) {
    return Number(encontrada.valor);
  }

  return null;
}

export function CatalogosView({
  tiposProducto,
  tallas,
  atributos,
  ubicaciones,
  tarifas,
  error,
}: CatalogosViewProps) {
  const productos = useTableState<TipoProductoCatalogo>(tiposProducto);
  const offset = (productos.page - 1) * productos.pageSize;

  // Indexar tallas por tipoProductoId para renderizado eficiente
  const tallasPorProducto = useMemo(() => {
    const map = new Map<string, TallaCatalogo[]>();
    for (const talla of tallas) {
      const arr = map.get(talla.tipoProductoId) ?? [];
      arr.push(talla);
      map.set(talla.tipoProductoId, arr);
    }
    return map;
  }, [tallas]);

  return (
    <div className={styles.container}>
      {error && (
        <div className={shared.inlineWarning} role="alert">
          {error}
        </div>
      )}

      {/* Tabla Unificada de Prendas */}
      <section className={styles.tableCard}>
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.colIndex}>#</th>
                <SortableTh<TipoProductoCatalogo>
                  label="Prenda / Producto"
                  sortKey="nombre"
                  activeKey={productos.sortKey}
                  dir={productos.sortDir}
                  onSort={productos.toggleSort}
                />
                <th>Piezas Físicas</th>
                <th>Tallas Disponibles</th>
                <th style={{ textAlign: "right" }}>Precio Base</th>
              </tr>
            </thead>
            <tbody>
              {productos.sortedRows.map((prod, index) => {
                const prodTallas = tallasPorProducto.get(prod.id) ?? [];
                const precio = getReferenciaPrecio(
                  prod.codigo || prod.nombre,
                  tarifas
                );

                const { camisetas, shorts, medias } = prod.componentes;
                const tienePiezas = camisetas > 0 || shorts > 0 || medias > 0;

                return (
                  <tr key={prod.id}>
                    <td className={styles.colIndex}>{offset + index + 1}</td>
                    <td>
                      <div className={styles.productCell}>
                        <span className={styles.productName}>{prod.nombre}</span>
                        <span className={styles.productCode}>{prod.codigo}</span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.piecesCell}>
                        {camisetas > 0 && (
                          <span className={styles.pieceBadge}>
                            {camisetas} {camisetas === 1 ? "camiseta" : "camisetas"}
                          </span>
                        )}
                        {shorts > 0 && (
                          <span className={styles.pieceBadge}>
                            {shorts} {shorts === 1 ? "short" : "shorts"}
                          </span>
                        )}
                        {medias > 0 && (
                          <span className={styles.pieceBadge}>
                            {medias} par {medias === 1 ? "medias" : "medias"}
                          </span>
                        )}
                        {!tienePiezas && (
                          <span className={styles.pieceZero}>Sin piezas físicas</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className={styles.sizesCell}>
                        {prodTallas.length > 0 ? (
                          prodTallas.map((t) => (
                            <span key={t.id} className={styles.sizeChip}>
                              {t.etiqueta}
                            </span>
                          ))
                        ) : (
                          <span className={styles.pieceZero}>—</span>
                        )}
                      </div>
                    </td>
                    <td className={styles.priceCell}>
                      {precio !== null ? `S/ ${precio.toFixed(2)}` : ""}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <Pagination
          page={productos.page}
          totalPages={productos.totalPages}
          totalRows={productos.totalRows}
          firstRow={productos.firstRow}
          lastRow={productos.lastRow}
          onPage={productos.setPage}
        />
      </section>

      {/* Seccion Inferior: Estandares de Taller */}
      <section className={styles.standardsSection}>
        <div className={styles.standardsHeader}>
          <h3 className={styles.standardsTitle}>
            Estándares Técnicos de Confección y Personalización
          </h3>
          <p className={styles.standardsDesc}>
            Parámetros oficiales configurados en taller para telas, cortes y zonas autorizadas de estampado.
          </p>
        </div>

        <div className={styles.standardsGrid}>
          {/* Tarjeta 1: Telas y Acabados */}
          <div className={styles.standardsCard}>
            <h4 className={styles.standardsCardTitle}>
              Telas y Acabados de Confección ({atributos.length})
            </h4>
            <div className={styles.attributeRows}>
              {atributos.map((atr) => (
                <div key={atr.id} className={styles.attributeRow}>
                  <span className={styles.attributeLabel}>{atr.nombre}</span>
                  <div className={styles.chipsList}>
                    {atr.valores.map((v) => (
                      <span key={v.id} className={styles.chip}>
                        {v.etiqueta}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tarjeta 2: Zonas de Estampado */}
          <div className={styles.standardsCard}>
            <h4 className={styles.standardsCardTitle}>
              Zonas de Estampado y Sublimado ({ubicaciones.length})
            </h4>
            <div className={styles.chipsList}>
              {ubicaciones.map((ubi) => (
                <div key={ubi.id} className={styles.placementChip}>
                  <span className={styles.placementOrder}>{ubi.orden}</span>
                  <span>{ubi.etiqueta}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Gestion del Catalogo de Tarifas (R-K10) */}
      <TarifasView tarifas={tarifas} />
    </div>
  );
}
