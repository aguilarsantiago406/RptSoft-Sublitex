import { getClientes } from "@/features/clientes/api/clientes.api";
import { ClientesTable } from "@/features/clientes/components/ClientesTable";
import { ClientesFiltros } from "@/features/clientes/components/ClientesFiltros";
import { NuevoClienteHeaderAction } from "@/features/clientes/components/NuevoClienteHeaderAction";

export const dynamic = "force-dynamic";

interface ClientesPageProps {
  searchParams: Promise<{ q?: string; tipo?: string }>;
}

export default async function ClientesPage({ searchParams }: ClientesPageProps) {
  const params = await searchParams;
  const rawClientes = await getClientes(params.q).catch(() => []);

  const clientes = params.tipo
    ? rawClientes.filter((c) => c.tipo === params.tipo)
    : rawClientes;

  return (
    <main>
      <header className="pageHeader">
        <div>
          <h1>Clientes y Organizaciones</h1>
          <p>
            {clientes.length}{" "}
            {clientes.length === 1
              ? "organización registrada"
              : "organizaciones registradas"}{" "}
            en el sistema.
          </p>
        </div>
        <NuevoClienteHeaderAction />
      </header>

      <div style={{ display: "grid", gap: "20px" }}>
        <ClientesFiltros
          busquedaActual={params.q}
          tipoActual={params.tipo}
        />
        <ClientesTable clientes={clientes} />
      </div>
    </main>
  );
}
