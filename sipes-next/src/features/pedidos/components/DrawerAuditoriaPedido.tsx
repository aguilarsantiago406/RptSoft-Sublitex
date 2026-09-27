"use client";

import { useState, useMemo } from "react";
import type { RegistroCambioItem, TarjetaAuditoriaItem } from "../types/auditoria";
import { formatDate } from "@/lib/format/date";
import styles from "./pedidos.module.css";

interface DrawerAuditoriaPedidoProps {
  isOpen: boolean;
  onClose: () => void;
  codigo: string;
  registros: RegistroCambioItem[];
  isPending?: boolean;
}

const ORIGEN_LABELS: Record<string, { label: string; badgeClass: string }> = {
  USUARIO: { label: "Panel Interno", badgeClass: styles.timelineBadge_USUARIO },
  PARTICIPANTE: { label: "WhatsApp", badgeClass: styles.timelineBadge_PARTICIPANTE },
  SISTEMA: { label: "Sistema", badgeClass: styles.timelineBadge_SISTEMA },
  GHL: { label: "GoHighLevel", badgeClass: styles.timelineBadge_GHL },
};

const CAMPO_LABELS: Record<string, string> = {
  tallaId: "Talla",
  numero: "Número",
  nombreEnPrenda: "Nombre en prenda",
  genero: "Género",
  colorId: "Color",
  creacion: "Prenda agregada",
  eliminacion: "Prenda retirada",
  aprobacion: "Aprobación",
  estado: "Estado",
  observaciones: "Observaciones",
  fechaCompromiso: "Fecha de entrega",
  adelantoRecibido: "Adelanto recibido",
  datosEnvio: "Datos de envío",
};

export function agruparRegistrosEnTarjetas(registros: RegistroCambioItem[]): TarjetaAuditoriaItem[] {
  const tarjetas: TarjetaAuditoriaItem[] = [];

  for (const item of registros) {
    const campoLabel = CAMPO_LABELS[item.campo] || item.campo;
    const valorAnterior = item.valorAnteriorLegible ?? item.valorAnterior;
    const valorNuevo = item.valorNuevoLegible ?? item.valorNuevo;

    const autorNombre = item.autorUsuario?.nombre
      ? `${item.autorUsuario.nombre} (${item.autorUsuario.rol || item.autorRol || "Usuario"})`
      : item.origen === "PARTICIPANTE"
      ? "Participante (WhatsApp)"
      : "Sistema Automático";

    let titulo = item.entidad;
    let subtitulo = item.entidadId ? `ID: ${item.entidadId.slice(0, 8)}...` : "";

    if (item.entidad === "Prenda") {
      if (item.participanteNombre) {
        titulo = item.participanteNombre;
        subtitulo = item.grupoNombre ? `Prenda · ${item.grupoNombre}` : "Prenda";
      } else {
        titulo = "Prenda";
        subtitulo = item.grupoNombre ? `Grupo: ${item.grupoNombre}` : "Sin asignar";
      }
    } else if (item.entidad === "Diseno") {
      titulo = "Diseño del Pedido";
      subtitulo = "Bloque de Diseño";
    } else if (item.entidad === "Pedido") {
      titulo = "Ficha del Pedido";
      subtitulo = "Datos generales";
    }

    const fechaActual = new Date(item.creadoEn).getTime();
    const ultimaTarjeta = tarjetas[tarjetas.length - 1];

    if (
      ultimaTarjeta &&
      ultimaTarjeta.entidad === item.entidad &&
      ultimaTarjeta.entidadId === item.entidadId &&
      ultimaTarjeta.origen === item.origen &&
      ultimaTarjeta.autorNombre === autorNombre &&
      Math.abs(new Date(ultimaTarjeta.creadoEn).getTime() - fechaActual) < 60000
    ) {
      ultimaTarjeta.cambios.push({
        id: item.id,
        campo: item.campo,
        campoLabel,
        valorAnterior,
        valorNuevo,
      });
    } else {
      tarjetas.push({
        id: item.id,
        entidad: item.entidad,
        entidadId: item.entidadId,
        titulo,
        subtitulo,
        origen: item.origen,
        autorNombre,
        creadoEn: item.creadoEn,
        cambios: [
          {
            id: item.id,
            campo: item.campo,
            campoLabel,
            valorAnterior,
            valorNuevo,
          },
        ],
      });
    }
  }

  return tarjetas;
}

export function DrawerAuditoriaPedido({
  isOpen,
  onClose,
  codigo,
  registros,
  isPending = false,
}: DrawerAuditoriaPedidoProps) {
  const [filtro, setFiltro] = useState<"TODOS" | "PRENDA" | "DISENO" | "WHATSAPP" | "USUARIO">("TODOS");
  const [busqueda, setBusqueda] = useState("");
  const [visibles, setVisibles] = useState(15);

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

  if (!isOpen) return null;

  const tarjetasAMostrar = tarjetasFiltradas.slice(0, visibles);

  return (
    <div className={styles.drawerOverlay} onClick={onClose}>
      <div className={styles.drawerCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.drawerHeader}>
          <div>
            <h3 className={styles.drawerTitle}>Historial de Cambios</h3>
            <p className={styles.drawerSubtitle}>
              Pedido {codigo} · Registro inmutable de auditoría
            </p>
          </div>
          <button
            type="button"
            className={styles.drawerCloseButton}
            onClick={onClose}
            aria-label="Cerrar panel"
          >
            ✕
          </button>
        </div>

        <div className={styles.drawerControls}>
          <input
            type="search"
            className={styles.drawerSearchInput}
            placeholder="Buscar por participante, talla o autor..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setVisibles(15);
            }}
          />
          <div className={styles.drawerFiltersBar}>
            <button
              type="button"
              className={`${styles.drawerFilterChip} ${filtro === "TODOS" ? styles.drawerFilterChipActive : ""}`}
              onClick={() => { setFiltro("TODOS"); setVisibles(15); }}
            >
              Todos ({tarjetas.length})
            </button>
            <button
              type="button"
              className={`${styles.drawerFilterChip} ${filtro === "PRENDA" ? styles.drawerFilterChipActive : ""}`}
              onClick={() => { setFiltro("PRENDA"); setVisibles(15); }}
            >
              Prendas
            </button>
            <button
              type="button"
              className={`${styles.drawerFilterChip} ${filtro === "DISENO" ? styles.drawerFilterChipActive : ""}`}
              onClick={() => { setFiltro("DISENO"); setVisibles(15); }}
            >
              Diseño
            </button>
            <button
              type="button"
              className={`${styles.drawerFilterChip} ${filtro === "WHATSAPP" ? styles.drawerFilterChipActive : ""}`}
              onClick={() => { setFiltro("WHATSAPP"); setVisibles(15); }}
            >
              WhatsApp
            </button>
            <button
              type="button"
              className={`${styles.drawerFilterChip} ${filtro === "USUARIO" ? styles.drawerFilterChipActive : ""}`}
              onClick={() => { setFiltro("USUARIO"); setVisibles(15); }}
            >
              Panel Interno
            </button>
          </div>
        </div>

        <div className={styles.drawerBody}>
          {isPending ? (
            <div className={styles.drawerLoading}>
              Consultando registro de cambios...
            </div>
          ) : tarjetasFiltradas.length === 0 ? (
            <div className={styles.drawerEmpty}>
              <p className={styles.drawerEmptyTitle}>No hay resultados</p>
              <p className={styles.drawerEmptySubtitle}>
                No se encontraron cambios con los filtros seleccionados.
              </p>
            </div>
          ) : (
            <div className={styles.auditCardList}>
              {tarjetasAMostrar.map((card) => {
                const origenConfig = ORIGEN_LABELS[card.origen] || ORIGEN_LABELS.USUARIO;

                return (
                  <div key={card.id} className={styles.auditCard}>
                    <div className={styles.auditCardHeader}>
                      <div className={styles.auditCardTitleGroup}>
                        <span className={styles.auditCardTitle}>{card.titulo}</span>
                        <span className={styles.auditCardSubtitle}>{card.subtitulo}</span>
                      </div>
                      <span className={`${styles.timelineBadge} ${origenConfig.badgeClass}`}>
                        {origenConfig.label}
                      </span>
                    </div>

                    <div className={styles.auditCardChangesList}>
                      {card.cambios.map((c) => (
                        <div key={c.id} className={styles.auditCardChangeRow}>
                          <span className={styles.auditCardChangeLabel}>{c.campoLabel}:</span>
                          <div className={styles.auditCardChangeValues}>
                            {c.campo === "creacion" ? (
                              <span className={styles.timelineValueNew}>
                                Tipo: {c.valorNuevo || "VENTA"}
                              </span>
                            ) : c.campo === "eliminacion" ? (
                              <span className={styles.timelineValueOld}>
                                Tipo: {c.valorAnterior || "VENTA"}
                              </span>
                            ) : (
                              <>
                                <span className={styles.timelineValueOld}>
                                  {c.valorAnterior || "(vacío)"}
                                </span>
                                <span className={styles.auditCardChangeArrow}>➔</span>
                                <span className={styles.timelineValueNew}>
                                  {c.valorNuevo || "(vacío)"}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className={styles.auditCardFooter}>
                      <span>Por: <strong>{card.autorNombre}</strong></span>
                      <span suppressHydrationWarning>
                        {formatDate(card.creadoEn)} {new Date(card.creadoEn).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                );
              })}

              {tarjetasFiltradas.length > visibles && (
                <button
                  type="button"
                  className={styles.drawerLoadMoreBtn}
                  onClick={() => setVisibles((prev) => prev + 15)}
                >
                  Cargar más cambios ({tarjetasFiltradas.length - visibles} restantes) ↓
                </button>
              )}
            </div>
          )}
        </div>

        <div className={styles.drawerFooter}>
          <button type="button" className={styles.drawerCloseFooterButton} onClick={onClose}>
            Cerrar panel
          </button>
        </div>
      </div>
    </div>
  );
}
