import { getUsuarios } from "@/features/usuarios/api/usuarios.api";
import { UsuariosView } from "@/features/usuarios/components/UsuariosView";
import { loadData } from "@/lib/api/loadData";

export const dynamic = "force-dynamic";

export default async function UsuariosPage() {
  const { data, error } = await loadData(() => getUsuarios());

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

      <UsuariosView usuarios={data ?? []} error={error} />
    </main>
  );
}
