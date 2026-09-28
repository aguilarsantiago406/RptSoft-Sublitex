import { notFound } from "next/navigation";
import { getCliente } from "@/features/clientes/api/clientes.api";
import { ClienteDetalleView } from "@/features/clientes/components/ClienteDetalleView";

export const dynamic = "force-dynamic";

interface ClientePageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientePage({ params }: ClientePageProps) {
  const { id } = await params;

  try {
    const cliente = await getCliente(id);
    if (!cliente) return notFound();

    return (
      <main>
        <ClienteDetalleView cliente={cliente} />
      </main>
    );
  } catch {
    return notFound();
  }
}
