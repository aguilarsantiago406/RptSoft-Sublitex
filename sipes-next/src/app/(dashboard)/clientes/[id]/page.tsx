import { notFound } from "next/navigation";
import { getCliente } from "@/features/clientes/api/clientes.api";
import { ClienteDetalleView } from "@/features/clientes/components/ClienteDetalleView";

export const dynamic = "force-dynamic";

interface ClientePageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientePage({ params }: ClientePageProps) {
  const { id } = await params;

  let cliente;
  try {
    cliente = await getCliente(id);
  } catch {
    return notFound();
  }

  if (!cliente) return notFound();

  return (
    <main>
      <ClienteDetalleView cliente={cliente} />
    </main>
  );
}
