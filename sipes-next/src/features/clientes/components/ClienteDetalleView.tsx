"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/format/date";
import type { ClienteDetalle, TipoCliente } from "../types/cliente";
import type { EstadoPedido } from "@/features/pedidos/types/pedido";
import { EstadoPedidoBadge } from "@/features/pedidos/components/EstadoPedidoBadge";
import { ModalEditarCliente } from "./ModalEditarCliente";
import { ModalNuevoPedido } from "@/features/pedidos/components/ModalNuevoPedido";
import styles from "./clientes.module.css";

interface ClienteDetalleViewProps {
  cliente: ClienteDetalle;
}

function getBadgeClass(tipo: TipoCliente): string {
  switch (tipo) {
    case "COLEGIO":
      return `${styles.badge} ${styles.badgeColegio}`;
    case "PROMOCION":
      return `${styles.badge} ${styles.badgePromocion}`;
    case "CLUB":
      return `${styles.badge} ${styles.badgeClub}`;
    case "EMPRESA":
      return `${styles.badge} ${styles.badgeEmpresa}`;
    case "PARTICULAR":
    default:
      return `${styles.badge} ${styles.badgeParticular}`;
  }
}

function getTipoLabel(tipo: TipoCliente): string {
  switch (tipo) {
    case "COLEGIO":
      return "Colegio";
    case "PROMOCION":
      return "Promoción";
    case "CLUB":
      return "Club";
    case "EMPRESA":
      return "Empresa";
    case "PARTICULAR":
      return "Particular";
    default:
      return tipo;
  }
}

export function ClienteDetalleView({ cliente }: ClienteDetalleViewProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNuevoPedidoModalOpen, setIsNuevoPedidoModalOpen] = useState(false);

  const totalPedidos = cliente.pedidos.length;
  const pedidosEnCurso = cliente.pedidos.filter(
    (p) => p.estado !== "CERRADO" && p.estado !== "CANCELADO"
  ).length;
  const pedidosCompletados = cliente.pedidos.filter((p) => p.estado === "CERRADO").length;

  return (
    <div>
      <Link href="/clientes" className={styles.detailBackLink}>
        ← Volver al directorio de clientes
      </Link>

      <div className={styles.detailHeaderRow}>
        <div>
          <h1 className={styles.detailTitle}>
            {cliente.nombre}
            <span className={getBadgeClass(cliente.tipo)} style={{ fontSize: "0.80rem" }}>
              {getTipoLabel(cliente.tipo)}
            </span>
          </h1>
          <p className={styles.detailSubtitle}>
            Ficha técnica e historial consolidado de pedidos
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            type="button"
            className={styles.btnCancel}
            onClick={() => setIsEditModalOpen(true)}
          >
            Editar Datos
          </button>
          <button
            type="button"
            className={styles.btnSubmit}
            onClick={() => setIsNuevoPedidoModalOpen(true)}
          >
            + Crear Pedido para este Cliente
          </button>
        </div>
      </div>

      <div className={styles.detailKpiGrid}>
        <div className={styles.detailKpiCard}>
          <span className={styles.detailKpiLabel}>Total de Pedidos</span>
          <span className={styles.detailKpiValue}>{totalPedidos}</span>
        </div>
        <div className={styles.detailKpiCard}>
          <span className={styles.detailKpiLabel}>En Proceso</span>
          <span className={styles.detailKpiValue} style={{ color: "var(--sky-dark)" }}>
            {pedidosEnCurso}
          </span>
        </div>
        <div className={styles.detailKpiCard}>
          <span className={styles.detailKpiLabel}>Entregados / Cerrados</span>
          <span className={styles.detailKpiValue} style={{ color: "#16a34a" }}>
            {pedidosCompletados}
          </span>
        </div>
      </div>

      <div className={styles.detailInfoCard}>
        <h2 className={styles.detailInfoTitle}>Información de Contacto y Sede</h2>
        <div className={styles.detailInfoGrid}>
          <div className={styles.detailInfoItem}>
            <span className={styles.detailInfoLabel}>Ciudad / Sede</span>
            <span className={styles.detailInfoVal}>{cliente.ciudad || "No especificada"}</span>
          </div>
          <div className={styles.detailInfoItem}>
            <span className={styles.detailInfoLabel}>Teléfono Principal</span>
            <span className={styles.detailInfoVal}>{cliente.telefono || "No especificado"}</span>
          </div>
          <div className={styles.detailInfoItem}>
            <span className={styles.detailInfoLabel}>Fecha de Alta en Sistema</span>
            <span className={styles.detailInfoVal} suppressHydrationWarning>
              {formatDate(cliente.creadoEn)}
            </span>
          </div>
          <div className={styles.detailInfoItem}>
            <span className={styles.detailInfoLabel}>Última Actualización</span>
            <span className={styles.detailInfoVal} suppressHydrationWarning>
              {formatDate(cliente.actualizadoEn)}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--border-soft)" }}>
          <h2 className={styles.detailInfoTitle} style={{ margin: 0, border: "none", padding: 0 }}>
            Historial de Pedidos de la Organización ({totalPedidos})
          </h2>
        </div>

        {totalPedidos === 0 ? (
          <div className={styles.emptyState}>
            Esta organización aún no tiene órdenes de pedido registradas en SIPES.
          </div>
        ) : (
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.colIndex}>#</th>
                  <th style={{ minWidth: "160px" }}>Código de Pedido</th>
                  <th style={{ width: "160px" }}>Estado Actual</th>
                  <th style={{ width: "150px" }}>Fecha de Registro</th>
                  <th style={{ width: "170px" }}>Fecha de Entrega</th>
                  <th style={{ width: "130px", textAlign: "right" }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {cliente.pedidos.map((pedido, index) => (
                  <tr key={pedido.id}>
                    <td className={styles.colIndex}>{index + 1}</td>
                    <td>
                      <Link
                        href={`/pedidos/${pedido.codigo || pedido.id}`}
                        className={styles.pedidoCodeLink}
                      >
                        {pedido.codigo || pedido.id.slice(0, 10)}
                      </Link>
                    </td>
                    <td>
                      <EstadoPedidoBadge estado={pedido.estado as EstadoPedido} size="md" />
                    </td>
                    <td suppressHydrationWarning>{formatDate(pedido.fechaPedido)}</td>
                    <td suppressHydrationWarning>{formatDate(pedido.fechaCompromiso)}</td>
                    <td style={{ textAlign: "right" }}>
                      <Link
                        href={`/pedidos/${pedido.codigo || pedido.id}`}
                        className={styles.actionBtnView}
                      >
                        Ver Ficha →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isEditModalOpen && (
        <ModalEditarCliente
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          cliente={cliente}
        />
      )}

      {isNuevoPedidoModalOpen && (
        <ModalNuevoPedido
          isOpen={isNuevoPedidoModalOpen}
          onClose={() => setIsNuevoPedidoModalOpen(false)}
          clientesIniciales={[
            {
              id: cliente.id,
              nombre: cliente.nombre,
              tipo: cliente.tipo,
              ciudad: cliente.ciudad ?? null,
              telefono: cliente.telefono ?? null,
            },
          ]}
          clientePreseleccionadoId={cliente.id}
        />
      )}
    </div>
  );
}
