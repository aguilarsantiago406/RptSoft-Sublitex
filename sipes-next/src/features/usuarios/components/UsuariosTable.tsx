"use client";

import type { UsuarioItem, RolUsuario } from "../types/usuario";
import styles from "./usuarios.module.css";

interface UsuariosTableProps {
  usuarios: UsuarioItem[];
  onEdit: (usuario: UsuarioItem) => void;
}

function getRoleBadgeClass(rol: RolUsuario): string {
  switch (rol) {
    case "ADMINISTRADOR":
      return styles.roleAdmin;
    case "COORDINADOR_OPERATIVO":
      return styles.roleCoordinador;
    case "VENDEDOR":
    case "VENDEDORA":
      return styles.roleVendedora;
    case "DISENO":
      return styles.roleDiseno;
    case "PRODUCCION":
      return styles.roleProduccion;
    case "COORDINADOR_CLIENTE":
      return styles.roleCliente;
    default:
      return "";
  }
}

function formatRoleLabel(rol: RolUsuario): string {
  switch (rol) {
    case "ADMINISTRADOR":
      return "Administrador";
    case "COORDINADOR_OPERATIVO":
      return "Coord. Operativo";
    case "VENDEDOR":
      return "Vendedor";
    case "VENDEDORA":
      return "Vendedora";
    case "DISENO":
      return "Diseño";
    case "PRODUCCION":
      return "Producción";
    case "COORDINADOR_CLIENTE":
      return "Coord. Cliente";
    default:
      return rol;
  }
}

function formatDate(dateString: string): string {
  if (!dateString) return "—";
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString("es-PE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

export function UsuariosTable({ usuarios, onEdit }: UsuariosTableProps) {
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
              <th>Usuario</th>
              <th>Rol en el Sistema</th>
              <th>Estado</th>
              <th>Fecha de Alta</th>
              <th style={{ textAlign: "right" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usr, index) => (
              <tr key={usr.id}>
                <td style={{ textAlign: "center", color: "#94a3b8", fontSize: "0.8rem", fontWeight: 600 }}>
                  {index + 1}
                </td>
                <td>
                  <div className={styles.userCell}>
                    <span className={styles.userName}>{usr.nombre}</span>
                    <span className={styles.userEmail}>{usr.email}</span>
                  </div>
                </td>
                <td>
                  <span className={`${styles.roleBadge} ${getRoleBadgeClass(usr.rol)}`}>
                    {formatRoleLabel(usr.rol)}
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
                <td style={{ fontSize: "0.82rem", color: "#64748b" }}>
                  {formatDate(usr.creadoEn)}
                </td>
                <td>
                  <div className={styles.actionsCell}>
                    <button
                      type="button"
                      className={styles.actionButton}
                      onClick={() => onEdit(usr)}
                    >
                      Editar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
