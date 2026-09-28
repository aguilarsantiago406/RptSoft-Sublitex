"use client";

import { useState, useMemo, useTransition } from "react";
import { ROLES_DISPONIBLES } from "../types/usuario";
import type { UsuarioItem, RolUsuario } from "../types/usuario";
import { actionEliminarUsuario } from "../actions/usuarios.actions";
import { UsuariosTable } from "./UsuariosTable";
import { ModalNuevoUsuario } from "./ModalNuevoUsuario";
import { ModalEditarUsuario } from "./ModalEditarUsuario";
import { ModalCambiarPassword } from "./ModalCambiarPassword";
import { ModalDetalleUsuario } from "./ModalDetalleUsuario";
import { ModalConfirmacion } from "@/components/ui/ModalConfirmacion";
import shared from "@/components/ui/table/tableShared.module.css";
import styles from "./usuarios.module.css";

interface UsuariosViewProps {
  usuarios: UsuarioItem[];
  error?: string | null;
}

export function UsuariosView({ usuarios, error }: UsuariosViewProps) {
  const [search, setSearch] = useState("");
  const [rolFiltro, setRolFiltro] = useState<string>("TODOS");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UsuarioItem | null>(null);
  const [passwordUser, setPasswordUser] = useState<UsuarioItem | null>(null);
  const [viewingUser, setViewingUser] = useState<UsuarioItem | null>(null);
  const [deletingUser, setDeletingUser] = useState<UsuarioItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  function handleConfirmDelete() {
    if (!deletingUser) return;
    setDeleteError(null);
    startDeleteTransition(async () => {
      const res = await actionEliminarUsuario(deletingUser.id);
      if (!res.ok) {
        setDeleteError(res.error || "No se pudo eliminar el usuario.");
      } else {
        setDeletingUser(null);
      }
    });
  }

  const filteredUsuarios = useMemo(() => {
    return usuarios.filter((usr) => {
      const matchSearch =
        usr.nombre.toLowerCase().includes(search.toLowerCase()) ||
        usr.email.toLowerCase().includes(search.toLowerCase());

      const matchRol =
        rolFiltro === "TODOS" || usr.rol === (rolFiltro as RolUsuario);

      return matchSearch && matchRol;
    });
  }, [usuarios, search, rolFiltro]);

  return (
    <div className={styles.container}>
      <div className={styles.filtersBar}>
        <div className={styles.searchGroup}>
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Buscar por nombre o correo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className={styles.roleSelect}
            value={rolFiltro}
            onChange={(e) => setRolFiltro(e.target.value)}
          >
            <option value="TODOS">Todos los roles ({usuarios.length})</option>
            {ROLES_DISPONIBLES.map((r) => {
              const count = usuarios.filter((u) => u.rol === r.rol).length;
              return (
                <option key={r.rol} value={r.rol}>
                  {r.label} ({count})
                </option>
              );
            })}
          </select>
        </div>

        <button
          type="button"
          className={styles.primaryButton}
          onClick={() => setIsNewModalOpen(true)}
        >
          <span>+</span>
          <span>Nuevo Usuario</span>
        </button>
      </div>

      {error && (
        <div className={shared.inlineWarning} role="alert">
          {error}
        </div>
      )}

      <UsuariosTable
        usuarios={filteredUsuarios}
        onEdit={(usr) => setEditingUser(usr)}
        onChangePassword={(usr) => setPasswordUser(usr)}
        onViewProfile={(usr) => setViewingUser(usr)}
        onDelete={(usr) => {
          setDeleteError(null);
          setDeletingUser(usr);
        }}
      />

      <ModalNuevoUsuario
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
      />

      {editingUser !== null && (
        <ModalEditarUsuario
          key={editingUser.id}
          isOpen={true}
          usuario={editingUser}
          onClose={() => setEditingUser(null)}
        />
      )}

      <ModalCambiarPassword
        isOpen={passwordUser !== null}
        usuario={passwordUser}
        onClose={() => setPasswordUser(null)}
      />
    </div>
  );
}
