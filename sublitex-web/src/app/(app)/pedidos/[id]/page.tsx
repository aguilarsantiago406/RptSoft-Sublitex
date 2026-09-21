"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { usePedidoDetalle } from "@/hooks/usePedidoDetalle";
import { useGrupoPrendas } from "@/hooks/useGrupoPrendas";
import { TablaPrendas } from "@/components/prendas/TablaPrendas";
import { PanelEstadoGrupo } from "@/components/prendas/PanelEstadoGrupo";
import { calcularTotales, TOTALES_VACIOS } from "@/domain/calculoTotales";
import type { GrupoDetalle } from "@/types/pedidos";
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

  // La grilla SIEMPRE sale del grupo (§5.1); el encabezado nunca trae prendas (§3.3)
  const { prendas, grupo: grupoGrilla, cargando: cargandoGrilla, error: errorGrilla, actualizarPrenda } =
    useGrupoPrendas(grupo?.id, grupo?.configuracion);

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
          <span className={styles.breadcrumb}>← Volver a lista de pedidos</span>
        }
        children={
          <TablaPrendasSkeleton columnas={9} filas={6} />
        }
        pies={
          <p className={styles.avisoOffline}>
            Cargando grilla del grupo desde la API...
          </p>
        }
      />
    );
  }

  if (error || !pedido || !catalogo) {
    return (
      <main className={styles.centered}>
        <div className={styles.errorCard}>
          <div className={styles.errorTitle}>No se pudo cargar el pedido</div>
          <p style={{ margin: 0 }}>{error || "No se pudo cargar la información del pedido."}</p>
          <p className={styles.errorHint}>Verificá que el backend esté corriendo y reintentá.</p>
          <Link href="/pedidos" style={{ fontWeight: 600 }}>
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
          <div className={styles.errorTitle}>No se pudo cargar la grilla del grupo</div>
          <p style={{ margin: 0 }}>{errorGrilla || "No se pudo cargar la grilla del grupo."}</p>
          <p className={styles.errorHint}>El grupo puede no existir o el backend no responde.</p>
          <Link href="/pedidos" style={{ fontWeight: 600 }}>
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
          ← Volver a lista de pedidos
        </Link>
      }
      children={
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
                  className={styles.leyendaSwatch}
                  style={{ background: "#fff" }}
                />{" "}
                Heredado del grupo
              </span>
              <span className={styles.leyendaItem}>
                <span
                  className={styles.leyendaSwatch}
                  style={{ background: "#fff3cd" }}
                />{" "}
                Excepción
              </span>
              <span className={styles.leyendaItem}>
                <span
                  className={styles.leyendaSwatch}
                  style={{ background: "#e3f2fd" }}
                />{" "}
                Obsequio / Muestra
              </span>
            </div>
          </div>
        </>
      }
      pies={
        <ResumenStrip resumen={resumen} totales={totales} />
      }
    />
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
  return (
    <main className={styles.main}>
      {onVolverAtras}

      <header className={styles.header}>
        <div>
          <h1 className={styles.headerTitle}>
            {pedido.codigo} — {pedido.cliente.nombre}
          </h1>
          <p className={styles.headerSubtitle}>
            Pedido {pedido.id} · Compromiso: {pedido.fechaCompromiso ?? "—"}
          </p>
        </div>
        <span className={styles.estadoBadge}>
          <span className={styles.estadoDot} />
          {pedido.estado.replace(/_/g, " ")}
        </span>
      </header>

      {/* Colores oficiales del pedido (R-K05) */}
      <div className={styles.metaRow}>
        <div className={styles.metaGroup}>
          <span className={styles.metaGroupLabel}>Colores</span>
          {pedido.colores.map((c) => (
            <span key={c.id} className={styles.colorChip}>
              <span
                className={styles.colorSwatch}
                style={{ backgroundColor: c.codigoHex }}
              />
              {c.nombre} <span style={{ opacity: 0.6 }}>{c.codigoHex}</span>
            </span>
          ))}
        </div>
        {/* Configuración base del grupo (valores que toda prenda hereda) */}
        {grupo && grupo.configuracion.length > 0 && (
          <div className={styles.metaGroup}>
            <span className={styles.metaGroupLabel}>Config. base</span>
            {grupo.configuracion.map((c) => (
              <span key={c.atributo} className={styles.configChip}>
                <strong>{NOMBRE_ATRIBUTO[c.atributo] ?? c.atributo}</strong>
                <span>{c.valor}</span>
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
    { label: "Prendas", valor: resumen.prendas, sub: "físicas en grilla" },
    { label: "Camisetas", valor: totales.camisetas, sub: "piezas" },
    { label: "Shorts", valor: totales.shorts, sub: "piezas" },
    { label: "Medias", valor: totales.medias, sub: "piezas" },
    {
      label: "Excepciones",
      valor: resumen.excepciones,
      sub: "por atributo (R-C07)",
    },
    {
      label: "Importe total",
      valor: `S/ ${resumen.importe.toFixed(2)}`,
      sub: "solo VENTA (R-K02)",
      highlight: true,
    },
  ];

  return (
    <div className={styles.resumen}>
      {kpis.map((kpi) => (
        <div key={kpi.label} className={styles.kpi}>
          <div className={styles.kpiLabel}>{kpi.label}</div>
          <div
            className={`${styles.kpiValue} ${
              kpi.highlight ? styles.kpiValueHighlight : ""
            }`}
          >
            {kpi.valor}
          </div>
          <div className={styles.kpiSub}>{kpi.sub}</div>
        </div>
      ))}
    </div>
  );
}

// --- Skeleton --------------------------------------------------------------

function SkeletonDetalle() {
  return (
    <div>
      <div className={styles.skeleton}>
        <span
          className={styles.breadcrumb}
          style={{ color: "transparent", background: "#e6ece7" }}
        >
          ← Volver
        </span>
        <div className={styles.header}>
          <div className={styles.skeletonBar} style={{ width: 320, height: 28 }} />
        </div>
        <div className={styles.resumen}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className={styles.kpi}>
              <div className={styles.skeletonBar} style={{ width: 60, height: 10 }} />
              <div className={styles.skeletonBar} style={{ width: 60, height: 24, marginTop: 8 }} />
            </div>
          ))}
        </div>
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
    <div className={styles.skeleton} style={{ background: "#fff" }}>
      <table
        className={styles.skeletonTable}
        style={{ width: "100%", borderCollapse: "collapse" }}
      >
        <thead>
          <tr style={{ background: "#1c5a3e", textAlign: "left" }}>
            {Array.from({ length: columnas }).map((_, i) => (
              <th key={i} style={{ padding: "10px 10px" }}>
                <div className={styles.skeletonBar} style={{ width: 70, background: "#3e7a5c" }} />
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