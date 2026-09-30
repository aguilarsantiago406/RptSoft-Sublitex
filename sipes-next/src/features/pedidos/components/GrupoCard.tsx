import { Pencil, TriangleAlert } from "lucide-react";
import type { GrupoPedido } from "../types/pedido";
import type { AtributoCatalogoItem } from "../api/pedidos.api";
import styles from "./pedidos.module.css";

interface GrupoCardProps {
  grupo: GrupoPedido;
  atributosCatalogo?: AtributoCatalogoItem[];
  onEdit: (grupo: GrupoPedido) => void;
  onDelete: (grupoId: string, nombre: string) => void;
  isDeleting: boolean;
}

function normalizar(valor: string) {
  return valor.trim().toLowerCase();
}

export function GrupoCard({
  grupo,
  atributosCatalogo = [],
  onEdit,
  onDelete,
  isDeleting,
}: GrupoCardProps) {
  const configurados = new Set(grupo.configuracion.map((c) => normalizar(c.atributo)));
  const obligatoriosSinValor = atributosCatalogo.filter(
    (a) => a.obligatorio && !configurados.has(normalizar(a.codigo)) && !configurados.has(normalizar(a.nombre))
  );

  const faltantes: string[] = [];
  if (!grupo.tipoProducto) faltantes.push("Falta el tipo de producto");
  if (obligatoriosSinValor.length > 0) {
    faltantes.push(
      `Faltan ${obligatoriosSinValor.length} atributo${obligatoriosSinValor.length === 1 ? "" : "s"} obligatorio${obligatoriosSinValor.length === 1 ? "" : "s"}: ${obligatoriosSinValor.map((a) => a.nombre).join(", ")}`
    );
  }

  return (
    <article className={styles.groupCardMinimal}>
      {faltantes.length > 0 && (
        <div className={styles.groupAlert} role="alert">
          <TriangleAlert size={15} />
          <div>
            <span style={{ fontWeight: 400 }}>{faltantes.length === 1 ? "Bloquea el paso a recolección" : `Bloquea el paso a recolección (${faltantes.length})`}</span>
            <ul className={styles.groupAlertList}>
              {faltantes.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
          <button type="button" className={styles.groupAlertAction} onClick={() => onEdit(grupo)}>
            Corregir
          </button>
        </div>
      )}

      <div className={styles.groupCardHeader}>
        <div className={styles.groupCardHeaderMain}>
          <div className={styles.groupTitleRow}>
            <h3 className={styles.groupName}>{grupo.nombre}</h3>
            <span className={styles.productBadge}>
              {grupo.tipoProducto?.nombre ?? "Producto no asignado"}
            </span>
          </div>
          <div className={styles.groupMetaRow}>
            <span className={styles.policyBadge} title={grupo.politicaNumeracion === "UNICA" ? "No se permiten números repetidos en este grupo" : "Los números pueden repetirse dentro del grupo"}>
              {grupo.politicaNumeracion === "UNICA"
                ? "Numeración correlativa"
                : "Números libres (pueden repetirse)"}
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
            className={styles.editGrupoButton}
            onClick={() => onEdit(grupo)}
            title={`Editar grupo ${grupo.nombre}`}
            aria-label={`Editar grupo ${grupo.nombre}`}
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            className={styles.deleteGrupoButton}
            onClick={() => onDelete(grupo.id, grupo.nombre)}
            disabled={isDeleting}
            title={`Eliminar grupo ${grupo.nombre}`}
            aria-label={`Eliminar grupo ${grupo.nombre}`}
          >
            {isDeleting ? "..." : "✕"}
          </button>
        </div>
      </div>

      {grupo.observaciones && (
        <div className={styles.groupObservations}>
          {grupo.observaciones}
        </div>
      )}

      {grupo.tipoProducto?.componentes && (
        <div className={styles.componentsRow}>
          <span className={styles.componentsLabel}>Por prenda:</span>
          {grupo.tipoProducto.componentes.camisetas > 0 && (
            <span className={styles.componentsPill}>
              {grupo.tipoProducto.componentes.camisetas} camiseta{grupo.tipoProducto.componentes.camisetas > 1 ? "s" : ""}
            </span>
          )}
          {grupo.tipoProducto.componentes.shorts > 0 && (
            <span className={styles.componentsPill}>
              {grupo.tipoProducto.componentes.shorts} short{grupo.tipoProducto.componentes.shorts > 1 ? "s" : ""}
            </span>
          )}
          {grupo.tipoProducto.componentes.medias > 0 && (
            <span className={styles.componentsPill}>
              {grupo.tipoProducto.componentes.medias} par(es) medias
            </span>
          )}
        </div>
      )}

      <div className={styles.configSection}>
        <span className={styles.configSectionTitle}>Configuración general</span>
        {grupo.configuracion.length === 0 ? (
          <span className={styles.configEmpty}>Sin atributos definidos</span>
        ) : (
          <dl className={styles.configTabla}>
            {grupo.configuracion.map((item) => {
              const critico = atributosCatalogo.find(
                (a) => normalizar(a.codigo) === normalizar(item.atributo) || normalizar(a.nombre) === normalizar(item.atributo)
              )?.criticoProduccion;
              return (
                <div
                  className={`${styles.configFila} ${critico ? styles.configFilaDestacada : ""}`}
                  key={`${item.atributo}-${item.valor}`}
                  title={critico ? "Parámetro técnico clave para moldería o taller" : undefined}
                >
                  <dt className={styles.configLabel}>
                    {critico && <span className={styles.criticoDot} aria-hidden="true" />}
                    {item.atributo}
                  </dt>
                  <dd className={`${styles.configValor} ${critico ? styles.configValorDestacado : ""}`}>
                    {item.valor}
                  </dd>
                </div>
              );
            })}
          </dl>
        )}
      </div>
    </article>
  );
}
