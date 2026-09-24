import { getUsuarios } from "@/features/usuarios/api/usuarios.api";
import { UsuariosView } from "@/features/usuarios/components/UsuariosView";

export const dynamic = "force-dynamic";

export default async function UsuariosPage() {
  const usuarios = await getUsuarios().catch(() => []);

  return (
    <main>
      <header className="pageHeader">
        <div>
          <h1>Gestión de Usuarios</h1>
          <p>
            Administración de cuentas de acceso, roles operativos y personal de taller en SIPES.
          </p>
        </div>
      </header>

      <UsuariosView usuarios={usuarios} />
    </main>
  );
}
