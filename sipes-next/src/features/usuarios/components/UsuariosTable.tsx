"use client";

import { formatDate } from "@/lib/format/date";
import { useTableState } from "@/lib/useTableState";
import { Pagination } from "@/components/ui/table/Pagination";
import { SortableTh } from "@/components/ui/table/SortableTh";
import { Pencil, Trash2 } from "lucide-react";
import type { UsuarioItem, RolUsuario } from "../types/usuario";
import styles from "./usuarios.module.css";

interface UsuariosTableProps {
  usuarios: UsuarioItem[];
  onEdit: (usuario: UsuarioItem) => void;
  onChangePassword: (usuario: UsuarioItem) => void;
  onViewProfile?: (usuario: UsuarioItem) => void;
  onDelete?: (usuario: UsuarioItem) => void;
}

const ROLE_BADGE_MAP: Record<string, string> = {
  ADMINISTRADOR: styles.roleAdmin,
  COORDINADOR_OPERATIVO: styles.roleCoordinador,
  VENDEDOR: styles.roleVendedora,
  VENDEDORA: styles.roleVendedora,
  DISENO: styles.roleDiseno,
  PRODUCCION: styles.roleProduccion,
  COORDINADOR_CLIENTE: styles.roleCliente,
};

const ROLE_LABELS: Record<string, string> = {
  ADMINISTRADOR: "Administración General",
  COORDINADOR_OPERATIVO: "Coordinación Operativa",
  VENDEDOR: "Ventas y Comercial",
  VENDEDORA: "Ventas y Comercial",
  DISENO: "Diseño Gráfico",
  PRODUCCION: "Taller de Producción",
  COORDINADOR_CLIENTE: "Enlace con Cliente",
};

export function UsuariosTable({
  usuarios,
  onEdit,
  onChangePassword,
  onViewProfile,
  onDelete,
}: UsuariosTableProps) {
  const table = useTableState<UsuarioItem>(usuarios);
  const offset = (table.page - 1) * table.pageSize;

  if (usuarios.length === 0) {
    return (
      <div className={styles.tableCard}>
        <div className={styles.emptyState}>
          No se encontraron usuarios registrados con el criterio de búsqueda.
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
              <th style={{ width: "46px", textAlign: "center" }}>#</th>
              <SortableTh<UsuarioItem>
                label="Usuario"
                sortKey="nombre"
                activeKey={table.sortKey}
                dir={table.sortDir}
                onSort={table.toggleSort}
              />
              <SortableTh<UsuarioItem>
                label="Rol en el Sistema"
                sortKey="rol"
                activeKey={table.sortKey}
                dir={table.sortDir}
                onSort={table.toggleSort}
              />
              <th>Estado</th>
              <th>Fecha de Alta</th>
              <th style={{ textAlign: "right" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {table.sortedRows.map((usr, index) => (
              <tr key={usr.id}>
                <td
                  style={{
                    textAlign: "center",
                    color: "#94a3b8",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                  }}
                >
                  {offset + index + 1}
                </td>
                <td>
                  <div className={styles.userCell}>
                    <span
                      className={styles.userName}
                      onClick={() => onViewProfile?.(usr)}
                      style={{ cursor: onViewProfile ? "pointer" : "default" }}
                      title="Ver ficha técnica de perfil"
                    >
                      {usr.nombre}
                    </span>
                    <span className={styles.userEmail}>{usr.email}</span>
                  </div>
                </td>
                <td>
                  <span className={`${styles.roleBadge} ${ROLE_BADGE_MAP[usr.rol] ?? ""}`}>
                    {ROLE_LABELS[usr.rol] ?? usr.rol}
                  </span>
                </td>
                <td>
                  <span
                    className={`${styles.statusBadge} ${
                      usr.activo ? styles.statusActive : styles.statusInactive
                    }`}
                  >
                    {usr.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td style={{ fontSize: "0.82rem", color: "#64748b" }} suppressHydrationWarning>
                  {formatDate(usr.creadoEn)}
                </td>
                <td>
                  <div className={styles.actionsCell}>
                    <button
                      type="button"
                      className={styles.actionButton}
                      onClick={() => onEdit(usr)}
                      title={`Editar usuario ${usr.nombre}`}
                      aria-label={`Editar usuario ${usr.nombre}`}
                      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "5px 7px" }}
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      className={styles.secondaryActionButton}
                      onClick={() => onChangePassword(usr)}
                      title={`Cambiar contraseña de ${usr.nombre}`}
                    >
                      Clave
                    </button>
                    {onDelete && (
                      <button
                        type="button"
                        className={styles.secondaryActionButton}
                        onClick={() => onDelete(usr)}
                        title={`Eliminar usuario ${usr.nombre}`}
                        aria-label={`Eliminar usuario ${usr.nombre}`}
                        style={{ color: "#e11d48", borderColor: "#fecdd3", display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "5px 7px" }}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        page={table.page}
        totalPages={table.totalPages}
        totalRows={table.totalRows}
        firstRow={table.firstRow}
        lastRow={table.lastRow}
        onPage={table.setPage}
      />
    </div>
  );
}
