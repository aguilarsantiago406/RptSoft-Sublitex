"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import type { RegistroCambioItem } from "@/features/pedidos/types/auditoria";
import { actionObtenerAuditoriaPedido } from "@/features/pedidos/actions/auditoria.actions";
import { agruparRegistrosEnTarjetas } from "@/features/pedidos/components/DrawerAuditoriaPedido";
import { formatDate } from "@/lib/format/date";
import styles from "./auditoria.module.css";
import cardStyles from "@/features/pedidos/components/pedidos.module.css";

const ORIGEN_CONFIG: Record<string, { label: string; badgeClass: string }> = {
  USUARIO: { label: "Oficina / Vendedora", badgeClass: cardStyles.timelineBadge_USUARIO },
  PARTICIPANTE: { label: "Cliente / WhatsApp", badgeClass: cardStyles.timelineBadge_PARTICIPANTE },
  SISTEMA: { label: "Sistema Automático", badgeClass: cardStyles.timelineBadge_SISTEMA },
  GHL: { label: "Integración Externa", badgeClass: cardStyles.timelineBadge_GHL },
};

function formatFechaRelativa(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  const ahora = new Date();
  const diffMs = ahora.getTime() - d.getTime();
  const diffSeg = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSeg / 60);
  const diffHoras = Math.floor(diffMin / 60);
  const horaStr = d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });

  if (diffSeg < 60) return "Hace un momento";
  if (diffMin < 60) return `Hace ${diffMin} min`;
  if (diffHoras < 24 && ahora.getDate() === d.getDate()) return `Hoy a las ${horaStr}`;
  if (diffHoras < 48) return `Ayer a las ${horaStr}`;
  return `${formatDate(dateStr)} ${horaStr}`;
}

export default function AuditoriaGlobalPage() {
  const [registros, setRegistros] = useState<RegistroCambioItem[]>([]);
  const [filtro, setFiltro] = useState<"TODOS" | "PRENDA" | "DISENO" | "WHATSAPP" | "USUARIO">("TODOS");
  const [busqueda, setBusqueda] = useState("");
  const [visibles, setVisibles] = useState(24);
  const [isPending, startTransition] = useTransition();

  const cargarDatos = () => {
    startTransition(async () => {
      const res = await actionObtenerAuditoriaPedido(undefined, { limit: 200 });
      if (res.ok && res.data) {
        setRegistros(res.data);
      }
    });
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const tarjetas = useMemo(() => agruparRegistrosEnTarjetas(registros), [registros]);

  const tarjetasFiltradas = useMemo(() => {
    return tarjetas.filter((card) => {
      if (filtro === "PRENDA" && card.entidad !== "Prenda") return false;
      if (filtro === "DISENO" && card.entidad !== "Diseno") return false;
      if (filtro === "WHATSAPP" && card.origen !== "PARTICIPANTE") return false;
      if (filtro === "USUARIO" && card.origen !== "USUARIO") return false;

      if (busqueda.trim()) {
        const q = busqueda.toLowerCase().trim();
        const coincideTitulo = card.titulo.toLowerCase().includes(q);
        const coincideSubtitulo = card.subtitulo.toLowerCase().includes(q);
        const coincideAutor = card.autorNombre.toLowerCase().includes(q);
        const coincideCambios = card.cambios.some(
          (c) =>
            c.campoLabel.toLowerCase().includes(q) ||
            (c.valorAnterior && c.valorAnterior.toLowerCase().includes(q)) ||
            (c.valorNuevo && c.valorNuevo.toLowerCase().includes(q))
        );
        return coincideTitulo || coincideSubtitulo || coincideAutor || coincideCambios;
      }

      return true;
    });
  }, [tarjetas, filtro, busqueda]);

  const tarjetasAMostrar = tarjetasFiltradas.slice(0, visibles);

  const handleExportarCSV = () => {
    if (tarjetasFiltradas.length === 0) return;

    const headers = ["Fecha", "Hora", "Origen", "Titulo", "Subtitulo", "Autor", "Cambios"];
    const rows = tarjetasFiltradas.map((card) => {
      const fecha = formatDate(card.creadoEn);
      const hora = new Date(card.creadoEn).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
      const origen = ORIGEN_CONFIG[card.origen]?.label || card.origen;
      const cambiosStr = card.cambios
        .map((c) => {
          if (c.campo === "creacion") return `${c.campoLabel}: Creado (${c.valorNuevo || "VENTA"})`;
          if (c.campo === "eliminacion") return `${c.campoLabel}: Eliminado (${c.valorAnterior || "VENTA"})`;
          return `${c.campoLabel}: ${c.valorAnterior || "(vacio)"} -> ${c.valorNuevo || "(vacio)"}`;
        })
        .join(" | ");

      return [
        fecha,
        hora,
        origen,
        card.titulo,
        card.subtitulo,
        card.autorNombre,
        cambiosStr,
      ];
    });

    const escapeCsv = (val: string) => `"${val.replace(/"/g, '""')}"`;
    const csvContent =
      "\uFEFF" +
      [
        headers.map(escapeCsv).join(","),
        ...rows.map((row) => row.map((cell) => escapeCsv(String(cell))).join(",")),
      ].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `auditoria_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Bitácora Global de Auditoría</h1>
        <p className={styles.subtitle}>
          Historial inmutable de trazabilidad operativa y cambios registrados en pedidos
        </p>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchRow}>
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Buscar por participante, prenda, talla o autor..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setVisibles(24);
            }}
          />
          <button
            type="button"
            className={styles.refreshButton}
            onClick={cargarDatos}
            disabled={isPending}
          >
            {isPending ? "Actualizando..." : "Actualizar"}
          </button>
          <button
            type="button"
            className={styles.exportButton}
            onClick={handleExportarCSV}
            disabled={tarjetasFiltradas.length === 0}
          >
            Exportar CSV
          </button>
        </div>

        <div className={styles.filtersRow}>
          <span className={styles.filterLabel}>Filtrar:</span>
          <button
            type="button"
            className={`${styles.filterChip} ${filtro === "TODOS" ? styles.filterChipActive : ""}`}
            onClick={() => { setFiltro("TODOS"); setVisibles(24); }}
          >
            Todos ({tarjetas.length})
          </button>
          <button
            type="button"
            className={`${styles.filterChip} ${filtro === "PRENDA" ? styles.filterChipActive : ""}`}
            onClick={() => { setFiltro("PRENDA"); setVisibles(24); }}
          >
            Prendas
          </button>
          <button
            type="button"
            className={`${styles.filterChip} ${filtro === "DISENO" ? styles.filterChipActive : ""}`}
            onClick={() => { setFiltro("DISENO"); setVisibles(24); }}
          >
            Diseño
          </button>
          <button
            type="button"
            className={`${styles.filterChip} ${filtro === "WHATSAPP" ? styles.filterChipActive : ""}`}
            onClick={() => { setFiltro("WHATSAPP"); setVisibles(24); }}
          >
            Cliente / WhatsApp
          </button>
          <button
            type="button"
            className={`${styles.filterChip} ${filtro === "USUARIO" ? styles.filterChipActive : ""}`}
            onClick={() => { setFiltro("USUARIO"); setVisibles(24); }}
          >
            Oficina / Vendedora
          </button>
        </div>
      </div>

      {isPending && tarjetas.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>Cargando bitácora de auditoría...</p>
        </div>
      ) : tarjetasFiltradas.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>Sin registros encontrados</p>
          <p className={styles.emptySubtitle}>
            No hay cambios que coincidan con los criterios de búsqueda.
          </p>
        </div>
      ) : (
        <>
          <div className={styles.listGrid}>
            {tarjetasAMostrar.map((card) => {
              const origenConfig = ORIGEN_CONFIG[card.origen] || ORIGEN_CONFIG.USUARIO;

              return (
                <div key={card.id} className={cardStyles.auditCard}>
                  <div className={cardStyles.auditCardHeader}>
                    <div className={cardStyles.auditCardTitleGroup}>
                      <span className={cardStyles.auditCardTitle}>{card.titulo}</span>
                      <span className={cardStyles.auditCardSubtitle}>{card.subtitulo}</span>
                    </div>
                    <span className={`${cardStyles.timelineBadge} ${origenConfig.badgeClass}`}>
                      {origenConfig.label}
                    </span>
                  </div>

                  <div className={cardStyles.auditCardChangesList}>
                    {card.cambios.map((c) => (
                      <div key={c.id} className={cardStyles.auditCardChangeRow}>
                        <span className={cardStyles.auditCardChangeLabel}>{c.campoLabel}:</span>
                        <div className={cardStyles.auditCardChangeValues}>
                          {c.campo === "creacion" ? (
                            <span className={cardStyles.timelineValueNew}>
                              Alta: {c.valorNuevo || "Registrado"}
                            </span>
                          ) : c.campo === "eliminacion" ? (
                            <span className={cardStyles.timelineValueOld}>
                              Baja: {c.valorAnterior || "Eliminado"}
                            </span>
                          ) : (
                            <>
                              <span className={cardStyles.timelineValueOld}>
                                {c.valorAnterior || "(vacío)"}
                              </span>
                              <span className={cardStyles.auditCardChangeArrow}>➔</span>
                              <span className={cardStyles.timelineValueNew}>
                                {c.valorNuevo || "(vacío)"}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={cardStyles.auditCardFooter}>
                    <span>Por: <strong>{card.autorNombre}</strong></span>
                    <span suppressHydrationWarning title={card.creadoEn}>
                      {formatFechaRelativa(card.creadoEn)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {tarjetasFiltradas.length > visibles && (
            <button
              type="button"
              className={styles.loadMoreBtn}
              onClick={() => setVisibles((prev) => prev + 24)}
            >
              Cargar más eventos ({tarjetasFiltradas.length - visibles} restantes)
            </button>
          )}
        </>
      )}
    </div>
  );
}
