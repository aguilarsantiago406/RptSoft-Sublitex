"use client";

import type { Cliente, TipoCliente } from "../types/cliente";
import styles from "./clientes.module.css";

interface ClientesTableProps {
  clientes: Cliente[];
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

export function ClientesTable({ clientes }: ClientesTableProps) {
  if (clientes.length === 0) {
    return (
      <div className={styles.tableCard}>
        <div className={styles.emptyState}>
          No se encontraron clientes ni organizaciones registradas con los filtros seleccionados.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tableCard}>
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.colIndex}>#</th>
              <th>Organización / Cliente</th>
              <th style={{ width: "140px" }}>Tipo</th>
              <th style={{ width: "160px" }}>Ciudad / Sede</th>
              <th style={{ width: "160px" }}>Teléfono</th>
              <th style={{ width: "150px" }}>Registrado el</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente, index) => {
              const fecha = cliente.creadoEn
                ? new Date(cliente.creadoEn).toLocaleDateString("es-PE", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "—";

              return (
                <tr key={cliente.id}>
                  <td className={styles.colIndex}>{index + 1}</td>
                  <td>
                    <div className={styles.clientName}>{cliente.nombre}</div>
                  </td>
                  <td>
                    <span className={getBadgeClass(cliente.tipo)}>
                      {getTipoLabel(cliente.tipo)}
                    </span>
                  </td>
                  <td>{cliente.ciudad || "—"}</td>
                  <td>{cliente.telefono || "—"}</td>
                  <td style={{ color: "#64748b", fontSize: "0.82rem" }}>{fecha}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
