"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { usePedidoDetalle } from "@/hooks/usePedidoDetalle";
import { useGrupoPrendas } from "@/hooks/useGrupoPrendas";
import { TablaPrendas } from "@/components/prendas/TablaPrendas";
import { PanelEstadoGrupo } from "@/components/prendas/PanelEstadoGrupo";
import { EstadoBadge } from "@/components/pedidos/EstadoBadge";
import { calcularTotales, TOTALES_VACIOS } from "@/domain/calculoTotales";
import type { GrupoDetalle } from "@/types/pedidos";
import type { GrupoGrilla } from "@/types/prendas";
import styles from "./page.module.css";

interface PageProps {
  params: Promise<{ id: string }>;
}

const NOMBRE_ATRIBUTO: Record<string, string> = {
  CUELLO: "Cuello",
  TELA: "Tela",
  CORTE: "Corte",
  ACABADO: "Acabado",
};

// ---------------------------------------------------------------------------
// Íconos inline
// ---------------------------------------------------------------------------

function IconLayers() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 3 3.5 6 10 9l6.5-3L10 3Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M3.5 10 10 13l6.5-3M3.5 13.6 10 16.6l6.5-3" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function IconShirt() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M7.2 3.2 4 5l1.3 3.1 1.2-.5v8.2h7V7.6l1.2.5L16 5l-3.2-1.8a2.8 2.8 0 0 1-5.6 0Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconShorts() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4.5 4.5h11v4.2c0 4-1.6 6.3-5.5 6.8-3.9-.5-5.5-2.8-5.5-6.8V4.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M10 4.5v11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IconSock() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M7 3.5h6v5.2c0 2.1 1.4 3.6 3.2 4.7 1.1.7 1 2.1-.2 2.6-2.6 1-5.4.6-7.4-1.2-1.3-1.2-1.6-2.6-1.6-4.4V3.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconAlert() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 3 18 17H2L10 3Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M10 8.4v3.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="10" cy="14.3" r="0.9" fill="currentColor" />
    </svg>
  );
}

function IconMoney() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2.8" y="5" width="14.4" height="10" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="10" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5.6 8v4M14.4 8v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IconGroup() {
  return (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="3" y="3.5" width="6" height="6" rx="1.6" stroke="currentColor" strokeWidth="1.4" />
      <rect x="11" y="3.5" width="6" height="6" rx="1.6" stroke="currentColor" strokeWidth="1.4" />
      <rect x="3" y="11" width="6" height="6" rx="1.6" stroke="currentColor" strokeWidth="1.4" />
      <rect x="11" y="11" width="6" height="6" rx="1.6" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function IconAlertBig() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 4 21 19.5H3L12 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M12 10v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="16.6" r="1" fill="currentColor" />
    </svg>
  );
}

export default function PaginaDetallePedido({ params }: PageProps) {
  const resolvedParams = use(params);
  const pedidoId = resolvedParams.id;

  const { pedido, tarifas, catalogo, cargando, error } =
    usePedidoDetalle(pedidoId);

  // Grupo activo: tabs en vez de tomar siempre grupos[0]
  const [grupoActivoIndex, setGrupoActivoIndex] = useState(0);
  const gruposDisponibles = pedido?.grupos ?? [];
  const grupoActivoIndexValido =
    grupoActivoIndex < gruposDisponibles.length ? grupoActivoIndex : 0;

  const grupo: GrupoDetalle | undefined = gruposDisponibles[grupoActivoIndexValido];

  // Encabezado mínimo del grupo para la grilla (§5.1)
  const grupoGrillaInput = useMemo<GrupoGrilla | undefined>(
    () =>
      grupo
        ? {
            id: grupo.id,
            nombre: grupo.nombre,
            tipoProducto: {
              codigo: grupo.tipoProducto.codigo,
              nombre: grupo.tipoProducto.nombre,
            },
            politicaNumeracion: grupo.politicaNumeracion,
          }
        : undefined,
    [grupo]
  );

  // La grilla SIEMPRE sale del grupo (§5.1); el encabezado nunca trae prendas (§3.3)
  const { prendas, grupo: grupoGrilla, cargando: cargandoGrilla, error: errorGrilla, actualizarPrenda } =
    useGrupoPrendas(
      grupo?.id,
      grupo?.configuracion,
      pedido?.colores,
      catalogo,
      grupoGrillaInput
    );

  const totales = useMemo(
    () => (catalogo ? calcularTotales(prendas, tarifas, catalogo) : TOTALES_VACIOS),
    [prendas, tarifas, catalogo]
  );

  // --- Estados de carga -------------------------------------------------
  if (cargando || cargandoGrilla) {
    if (!pedido) {
      return (
        <main className={styles.main}>
          <SkeletonDetalle />
        </main>
      );
    }
    // El pedido ya cargó pero la grilla aún no: mostramos la página con skeleton de tabla
    return (
      <PaginaConGrupo
        pedido={pedido}
        grupo={grupo}
        gruposDisponibles={gruposDisponibles}
        grupoActivoIndex={grupoActivoIndexValido}
        onCambiarGrupo={setGrupoActivoIndex}
        onVolverAtras={
          <span className={styles.breadcrumb}>← Pedidos</span>
        }
        pies={
          <p className={styles.avisoOffline}>
            Cargando grilla del grupo desde la API...
          </p>
        }
      >
        <TablaPrendasSkeleton columnas={9} filas={6} />
      </PaginaConGrupo>
    );
  }

  if (error || !pedido || !catalogo) {
    return (
      <main className={styles.centered}>
        <div className={styles.errorCard}>
          <span className={styles.errorIcono}>
            <IconAlertBig />
          </span>
          <div className={styles.errorTitle}>No se pudo cargar el pedido</div>
          <p className={styles.errorTexto}>
            {error || "No se pudo cargar la información del pedido."}
          </p>
          <p className={styles.errorHint}>Verificá que el backend esté corriendo y reintentá.</p>
          <Link href="/pedidos" className={styles.errorLink}>
            ← Volver a la lista
          </Link>
        </div>
      </main>
    );
  }

  if (errorGrilla || !grupoGrilla || !grupo) {
    return (
      <main className={styles.centered}>
        <div className={styles.errorCard}>
          <span className={styles.errorIcono}>
            <IconAlertBig />
          </span>
          <div className={styles.errorTitle}>No se pudo cargar la grilla del grupo</div>
          <p className={styles.errorTexto}>
            {errorGrilla || "No se pudo cargar la grilla del grupo."}
          </p>
          <p className={styles.errorHint}>El grupo puede no existir o el backend no responde.</p>
          <Link href="/pedidos" className={styles.errorLink}>
            ← Volver a la lista
          </Link>
        </div>
      </main>
    );
  }

  // --- Estado listo ------------------------------------------------------
  const resumen = {
    prendas: prendas.length,
    camisetas: totales.camisetas,
    shorts: totales.shorts,
    medias: totales.medias,
    importe: totales.importeTotal,
    excepciones: prendas.reduce(
      (acc, p) => acc + p.valores.filter((v) => v.origen === "EXCEPCION").length,
      0
    ),
  };

  return (
    <PaginaConGrupo
      pedido={pedido}
      grupo={grupo}
      gruposDisponibles={gruposDisponibles}
      grupoActivoIndex={grupoActivoIndexValido}
      onCambiarGrupo={setGrupoActivoIndex}
      onVolverAtras={
        <Link href="/pedidos" className={styles.breadcrumb}>
          ← Pedidos
        </Link>
      }
      pies={
        <ResumenStrip resumen={resumen} totales={totales} />
      }
    >
      <>
        <PanelEstadoGrupo
            prendas={prendas}
            catalogo={catalogo}
            cantidadContratada={grupo.cantidadContratada}
            politicaNumeracion={grupoGrilla.grupo.politicaNumeracion}
          />
          <TablaPrendas
            prendas={prendas}
            colores={pedido.colores}
            tarifas={tarifas}
            catalogo={catalogo}
            totales={totales}
            onActualizarPrenda={actualizarPrenda}
          />
          <div className={styles.grillaFooter}>
            <div className={styles.leyenda}>
              <span className={styles.leyendaItem}>
                <span
                  className={`${styles.leyendaSwatch} ${styles.leyendaSwatchBase}`}
                />{" "}
                Heredado del grupo
              </span>
              <span className={styles.leyendaItem}>
                <span
                  className={`${styles.leyendaSwatch} ${styles.leyendaSwatchExcepcion}`}
                />{" "}
                Excepción
              </span>
              <span className={styles.leyendaItem}>
                <span
                  className={`${styles.leyendaSwatch} ${styles.leyendaSwatchObsequio}`}
                />{" "}
                Obsequio / Muestra
              </span>
            </div>
          </div>
      </>
    </PaginaConGrupo>
  );
}

// =============================================================================
// Sub-componentes de la página
// =============================================================================

interface PaginaConGrupoProps {
  pedido: NonNullable<ReturnType<typeof usePedidoDetalle>["pedido"]>;
  grupo?: GrupoDetalle;
  gruposDisponibles: GrupoDetalle[];
  grupoActivoIndex: number;
  onCambiarGrupo: (index: number) => void;
  onVolverAtras: React.ReactNode;
  children: React.ReactNode;
  pies?: React.ReactNode;
}

function PaginaConGrupo({
  pedido,
  grupo,
  gruposDisponibles,
  grupoActivoIndex,
  onCambiarGrupo,
  onVolverAtras,
  children,
  pies,
}: PaginaConGrupoProps) {
  const fechaCompromiso = pedido.fechaCompromiso
    ? new Date(pedido.fechaCompromiso).toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <main className={styles.main}>
      <div className={styles.topRow}>{onVolverAtras}</div>

      <header className={styles.header}>
        <div className={styles.headerMain}>
          <span className={styles.eyebrow}>Pedido</span>
          <h1 className={styles.headerTitle}>
            {pedido.codigo} — {pedido.cliente.nombre}
          </h1>
          <p className={styles.headerSubtitle}>Compromiso: {fechaCompromiso}</p>
        </div>
        <div className={styles.headerBadge}>
          <EstadoBadge estado={pedido.estado} />
        </div>
      </header>

      {/* Colores oficiales del pedido (R-K05) + configuración base del grupo */}
      <div className={styles.metaRow}>
        <div className={styles.metaGroup}>
          <span className={styles.metaGroupLabel}>Colores</span>
          {pedido.colores.map((c) => (
            <span key={c.id} className={styles.colorChip}>
              <span
                className={styles.colorSwatch}
                style={{ backgroundColor: c.codigoHex }}
              />
              <span className={styles.colorChipNombre}>{c.nombre}</span>
              <span className={styles.colorChipHex}>{c.codigoHex}</span>
            </span>
          ))}
        </div>
        {/* Configuración base del grupo (valores que toda prenda hereda) */}
        {grupo && grupo.configuracion.length > 0 && (
          <div className={styles.metaGroup}>
            <span className={styles.metaGroupLabel}>Config. base</span>
            {grupo.configuracion.map((c) => (
              <span key={c.atributo} className={styles.configChip}>
                <span className={styles.configChipLabel}>
                  {NOMBRE_ATRIBUTO[c.atributo] ?? c.atributo}
                </span>
                <span className={styles.configChipValor}>{c.valor}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tabs de grupos */}
      {gruposDisponibles.length > 1 && (
        <nav className={styles.tabs}>
          {gruposDisponibles.map((g, i) => (
            <button
              key={g.id}
              onClick={() => onCambiarGrupo(i)}
              className={`${styles.tab} ${
                i === grupoActivoIndex ? styles.tabActivo : ""
              }`}
            >
              <span className={styles.tabIcon} aria-hidden="true">
                <IconGroup />
              </span>
              {g.nombre}
              <span className={styles.tabCount}>{g.cantidadContratada}</span>
            </button>
          ))}
        </nav>
      )}

      {/* Contenido principal */}
      {pies ? (
        <div className={styles.grillaSection}>
          {children}
          {pies}
        </div>
      ) : (
        children
      )}
    </main>
  );
}

function ResumenStrip({
  resumen,
  totales,
}: {
  resumen: {
    prendas: number;
    camisetas: number;
    shorts: number;
    medias: number;
    importe: number;
    excepciones: number;
  };
  totales: ReturnType<typeof calcularTotales>;
}) {
  const kpis = [
    { label: "Prendas", valor: resumen.prendas, sub: "físicas en grilla", icon: <IconLayers /> },
    { label: "Camisetas", valor: totales.camisetas, sub: "piezas", icon: <IconShirt /> },
    { label: "Shorts", valor: totales.shorts, sub: "piezas", icon: <IconShorts /> },
    { label: "Medias", valor: totales.medias, sub: "piezas", icon: <IconSock /> },
    {
      label: "Excepciones",
      valor: resumen.excepciones,
      sub: "por atributo (R-C07)",
      icon: <IconAlert />,
    },
    {
      label: "Importe total",
      valor: `S/ ${resumen.importe.toFixed(2)}`,
      sub: "solo VENTA (R-K02)",
      icon: <IconMoney />,
      highlight: true,
    },
  ];

  return (
    <div className={styles.resumen}>
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          className={`${styles.kpi} ${kpi.highlight ? styles.kpiHighlight : ""}`}
        >
          <span className={styles.kpiIcon} aria-hidden="true">
            {kpi.icon}
          </span>
          <div className={styles.kpiBody}>
            <div className={styles.kpiLabel}>{kpi.label}</div>
            <div className={styles.kpiValue}>{kpi.valor}</div>
            <div className={styles.kpiSub}>{kpi.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Skeleton --------------------------------------------------------------

function SkeletonDetalle() {
  return (
    <div className={styles.skeleton}>
      <div className={styles.skeletonTopRow}>
        <div className={styles.skeletonBar} style={{ width: 90, height: 14 }} />
      </div>
      <div className={styles.skeletonHeader}>
        <div className={styles.skeletonBar} style={{ width: 340, height: 30 }} />
        <div className={styles.skeletonBar} style={{ width: 120, height: 20 }} />
      </div>
      <div className={styles.resumen}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={styles.kpi}>
            <span className={`${styles.skeletonBar} ${styles.skeletonIcono}`} />
            <div className={styles.kpiBody}>
              <div className={styles.skeletonBar} style={{ width: 60, height: 10 }} />
              <div className={styles.skeletonBar} style={{ width: 72, height: 22, marginTop: 8 }} />
            </div>
          </div>
        ))}
      </div>
      <TablaPrendasSkeleton columnas={9} filas={6} />
    </div>
  );
}

interface TablaPrendasSkeletonProps {
  columnas: number;
  filas: number;
}

function TablaPrendasSkeleton({ columnas, filas }: TablaPrendasSkeletonProps) {
  return (
    <div className={styles.skeletonTabla}>
      <table
        className={styles.skeletonTable}
        style={{ width: "100%", borderCollapse: "collapse" }}
      >
        <thead>
          <tr style={{ background: "var(--thead-bg)", textAlign: "left" }}>
            {Array.from({ length: columnas }).map((_, i) => (
              <th key={i} style={{ padding: "10px 10px" }}>
                <div
                  className={styles.skeletonBar}
                  style={{ width: 70, background: "var(--thead-text)", opacity: 0.35 }}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: filas }).map((_, r) => (
            <tr key={r} className={styles.skeletonRow}>
              {Array.from({ length: columnas }).map((_, c) => (
                <td key={c}>
                  <div
                    className={styles.skeletonBar}
                    style={{ width: c === 0 ? 24 : 70 + (c % 3) * 12 }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
