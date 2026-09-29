"use client";

import { useMemo, useState } from "react";
import { Scissors, Layers, Sparkles, MapPin, Plus, Shirt, Tag, DollarSign } from "lucide-react";
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
import { ModalNuevoTipoProducto } from "./ModalNuevoTipoProducto";
import { ModalNuevaTela } from "./ModalNuevaTela";
import styles from "./catalogos.module.css";

interface CatalogosViewProps {
  tiposProducto: TipoProductoCatalogo[];
  tallas: TallaCatalogo[];
  atributos: AtributoCatalogo[];
  ubicaciones: UbicacionPersonalizacionCatalogo[];
  tarifas: TarifaCatalogo[];
  error?: string | null;
}

type TabCatalogo = "PRENDAS" | "TELAS_ATRIBUTOS" | "ESTAMPADO" | "TARIFAS";

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
  const [tabActiva, setTabActiva] = useState<TabCatalogo>("PRENDAS");
  const [isModalProductoOpen, setIsModalProductoOpen] = useState(false);
  const [isModalTelaOpen, setIsModalTelaOpen] = useState(false);

  const productos = useTableState<TipoProductoCatalogo>(tiposProducto);
  const offset = (productos.page - 1) * productos.pageSize;

  const tallasPorProducto = useMemo(() => {
    const map = new Map<string, TallaCatalogo[]>();
    for (const talla of tallas) {
      const arr = map.get(talla.tipoProductoId) ?? [];
      arr.push(talla);
      map.set(talla.tipoProductoId, arr);
    }
    return map;
  }, [tallas]);

  const { patronaje, telas, acabados, otros } = useMemo(() => {
    const patronajeCodes = new Set(["CORTE", "CUELLO", "MANGA"]);
    const telaCodes = new Set(["TELA"]);
    const acabadoCodes = new Set(["ESCUDO", "ACABADO"]);

    const p: AtributoCatalogo[] = [];
    const t: AtributoCatalogo[] = [];
    const a: AtributoCatalogo[] = [];
    const o: AtributoCatalogo[] = [];

    const ordenPatronaje = ["CORTE", "CUELLO", "MANGA"];

    for (const atr of atributos) {
      if (patronajeCodes.has(atr.codigo)) {
        p.push(atr);
      } else if (telaCodes.has(atr.codigo)) {
        t.push(atr);
      } else if (acabadoCodes.has(atr.codigo)) {
        a.push(atr);
      } else {
        o.push(atr);
      }
    }

    p.sort((x, y) => ordenPatronaje.indexOf(x.codigo) - ordenPatronaje.indexOf(y.codigo));

    return { patronaje: p, telas: t, acabados: a, otros: o };
  }, [atributos]);

  const telaAtributoId = telas[0]?.id ?? atributos.find((a) => a.codigo === "TELA")?.id ?? "";

  return (
    <div className={styles.container}>
      {error && (
        <div className={shared.inlineWarning} role="alert">
          {error}
        </div>
      )}

      <nav className={styles.tabsNav} aria-label="Secciones del catálogo">
        <button
          type="button"
          className={`${styles.tabButton} ${tabActiva === "PRENDAS" ? styles.tabButtonActive : ""}`}
          onClick={() => setTabActiva("PRENDAS")}
        >
          <Shirt size={16} />
          <span>Prendas Base ({tiposProducto.length})</span>
        </button>

        <button
          type="button"
          className={`${styles.tabButton} ${tabActiva === "TELAS_ATRIBUTOS" ? styles.tabButtonActive : ""}`}
          onClick={() => setTabActiva("TELAS_ATRIBUTOS")}
        >
          <Layers size={16} />
          <span>Telas y Atributos ({telas.reduce((acc, t) => acc + t.valores.length, 0)} telas)</span>
        </button>

        <button
          type="button"
          className={`${styles.tabButton} ${tabActiva === "ESTAMPADO" ? styles.tabButtonActive : ""}`}
          onClick={() => setTabActiva("ESTAMPADO")}
        >
          <MapPin size={16} />
          <span>Zonas de Estampado ({ubicaciones.length})</span>
        </button>

        <button
          type="button"
          className={`${styles.tabButton} ${tabActiva === "TARIFAS" ? styles.tabButtonActive : ""}`}
          onClick={() => setTabActiva("TARIFAS")}
        >
          <DollarSign size={16} />
          <span>Tarifario Comercial ({tarifas.length})</span>
        </button>
      </nav>

      {tabActiva === "PRENDAS" && (
        <>
          <div className={styles.tarifasHeader}>
            <div>
              <h3 className={styles.standardsTitle}>Catálogo de Prendas y Tipos de Producto</h3>
              <p className={styles.standardsDesc}>
                Piezas físicas oficiales de confección, tallas autorizadas y precio base de referencia
              </p>
            </div>
            <div className={styles.tarifasHeaderActions}>
              <button
                type="button"
                className={styles.tarifaNuevaButton}
                onClick={() => setIsModalProductoOpen(true)}
              >
                <Plus size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
                Nuevo tipo de prenda
              </button>
            </div>
          </div>

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
        </>
      )}

      {tabActiva === "TELAS_ATRIBUTOS" && (
        <section className={styles.standardsSection}>
          <div className={styles.standardsHeader}>
            <h3 className={styles.standardsTitle}>
              Estándares Técnicos de Confección y Materiales
            </h3>
            <p className={styles.standardsDesc}>
              Parámetros oficiales configurados en taller para telas textiles, cortes de patrón y acabados.
            </p>
          </div>

          <div className={styles.standardsGrid}>
            <div className={styles.standardsCard}>
              <div className={styles.standardsCardHeader}>
                <div className={styles.standardsCardTitleGroup}>
                  <span className={styles.standardsCardIcon}>
                    <Layers size={18} />
                  </span>
                  <h4 className={styles.standardsCardTitle}>Telas y Materiales Textiles</h4>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span className={styles.standardsCardBadge}>
                    {telas.reduce((acc, t) => acc + t.valores.length, 0)} telas
                  </span>
                  {telaAtributoId && (
                    <button
                      type="button"
                      className={styles.tarifaNuevaButton}
                      style={{ padding: "4px 8px", fontSize: "0.74rem" }}
                      onClick={() => setIsModalTelaOpen(true)}
                    >
                      <Plus size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: "2px" }} />
                      Nueva tela
                    </button>
                  )}
                </div>
              </div>
              <div className={styles.attributeRows}>
                {telas.map((atr) => (
                  <div key={atr.id} className={styles.attributeRow}>
                    <span className={styles.attributeLabel}>{atr.nombre} Oficiales</span>
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

            <div className={styles.standardsCard}>
              <div className={styles.standardsCardHeader}>
                <div className={styles.standardsCardTitleGroup}>
                  <span className={styles.standardsCardIcon}>
                    <Scissors size={18} />
                  </span>
                  <h4 className={styles.standardsCardTitle}>Patronaje y Confección</h4>
                </div>
                <span className={styles.standardsCardBadge}>
                  {patronaje.length} parámetros
                </span>
              </div>
              <div className={styles.attributeRows}>
                {patronaje.map((atr) => (
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

            <div className={styles.standardsCard}>
              <div className={styles.standardsCardHeader}>
                <div className={styles.standardsCardTitleGroup}>
                  <span className={styles.standardsCardIcon}>
                    <Sparkles size={18} />
                  </span>
                  <h4 className={styles.standardsCardTitle}>Técnicas y Acabados</h4>
                </div>
                <span className={styles.standardsCardBadge}>
                  {acabados.length} categorías
                </span>
              </div>
              <div className={styles.attributeRows}>
                {acabados.map((atr) => (
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

            {otros.length > 0 && (
              <div className={styles.standardsCard}>
                <div className={styles.standardsCardHeader}>
                  <div className={styles.standardsCardTitleGroup}>
                    <h4 className={styles.standardsCardTitle}>Otros Parámetros</h4>
                  </div>
                </div>
                <div className={styles.attributeRows}>
                  {otros.map((atr) => (
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
            )}
          </div>
        </section>
      )}

      {tabActiva === "ESTAMPADO" && (
        <section className={styles.standardsSection}>
          <div className={styles.standardsHeader}>
            <h3 className={styles.standardsTitle}>
              Zonas de Estampado y Sublimación
            </h3>
            <p className={styles.standardsDesc}>
              Ubicaciones autorizadas para estampados, números y nombres en la prenda textil.
            </p>
          </div>

          <div className={styles.standardsCard}>
            <div className={styles.standardsCardHeader}>
              <div className={styles.standardsCardTitleGroup}>
                <span className={styles.standardsCardIcon}>
                  <MapPin size={18} />
                </span>
                <h4 className={styles.standardsCardTitle}>Ubicaciones en Prenda</h4>
              </div>
              <span className={styles.standardsCardBadge}>
                {ubicaciones.length} zonas configuradas
              </span>
            </div>
            <div className={styles.chipsList} style={{ padding: "16px" }}>
              {ubicaciones.map((ubi) => (
                <div key={ubi.id} className={styles.placementChip}>
                  <span className={styles.placementOrder}>{ubi.orden}</span>
                  <span>{ubi.etiqueta}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {tabActiva === "TARIFAS" && (
        <TarifasView tarifas={tarifas} />
      )}

      <ModalNuevoTipoProducto
        isOpen={isModalProductoOpen}
        onClose={() => setIsModalProductoOpen(false)}
      />

      {telaAtributoId && (
        <ModalNuevaTela
          isOpen={isModalTelaOpen}
          onClose={() => setIsModalTelaOpen(false)}
          atributoId={telaAtributoId}
        />
      )}
    </div>
  );
}
