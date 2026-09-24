import { Suspense } from "react";
import { getClientes } from "@/features/clientes/api/clientes.api";
import { ClientesTable } from "@/features/clientes/components/ClientesTable";
import { ClientesFiltros } from "@/features/clientes/components/ClientesFiltros";
import { NuevoClienteHeaderAction } from "@/features/clientes/components/NuevoClienteHeaderAction";
import { TableSkeleton } from "@/components/ui/TableSkeleton";

export const dynamic = "force-dynamic";

interface ClientesPageProps {
  searchParams: Promise<{ q?: string; tipo?: string }>;
}

async function ClientesTableAsync({
  query,
  tipo,
}: {
  query?: string;
  tipo?: string;
}) {
  const rawClientes = await getClientes(query).catch(() => []);
  const clientes = tipo
    ? rawClientes.filter((c) => c.tipo === tipo)
    : rawClientes;

  return <ClientesTable clientes={clientes} />;
}

export default async function ClientesPage({ searchParams }: ClientesPageProps) {
  const params = await searchParams;

  return (
    <main>
      <header className="pageHeader">
        <div>
          <h1>Clientes y Organizaciones</h1>
          <p>Directorio comercial de instituciones, colegios y empresas en SIPES.</p>
        </div>
        <NuevoClienteHeaderAction />
      </header>

      <div style={{ display: "grid", gap: "20px" }}>
        <ClientesFiltros
          busquedaActual={params.q}
          tipoActual={params.tipo}
        />
        <Suspense
          key={`${params.q ?? ""}-${params.tipo ?? ""}`}
          fallback={<TableSkeleton rows={5} />}
        >
          <ClientesTableAsync query={params.q} tipo={params.tipo} />
        </Suspense>
      </div>
    </main>
  );
}
