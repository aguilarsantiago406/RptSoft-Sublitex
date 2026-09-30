import { notFound } from "next/navigation";
import { getPedido, getParticipantesGrupo } from "@/features/pedidos/api/pedidos.api";
import { getTiposProducto } from "@/features/catalogos/api/catalogos.api";
import { ParticipantesView, type ItemParticipante } from "@/features/participantes/components/ParticipantesView";
import styles from "@/features/pedidos/components/pedidos.module.css";

export const dynamic = "force-dynamic";

interface ParticipantesPageProps {
  params: Promise<{ id: string }>;
}

export default async function ParticipantesPage({ params }: ParticipantesPageProps) {
  const { id } = await params;

  let pedido;
  let tiposProducto: Array<{ id: string; nombre: string; codigo: string }> = [];

  try {
    const [p, tp] = await Promise.all([
      getPedido(id),
      getTiposProducto().catch(() => []),
    ]);
    pedido = p;
    tiposProducto = tp;
  } catch {
    notFound();
  }

  if (!pedido) {
    notFound();
  }

  const mapaGrupos = new Map<string, string>();
  for (const g of pedido.grupos) {
    mapaGrupos.set(g.id, g.nombre);
  }

  const resultadosPorGrupo = await Promise.allSettled(
    pedido.grupos.map((g) => getParticipantesGrupo(g.id))
  );

  const items: ItemParticipante[] = [];
  const errorGrupos: string[] = [];

  pedido.grupos.forEach((grupo, index) => {
    const resultado = resultadosPorGrupo[index];
    if (resultado.status === "rejected") {
      errorGrupos.push(grupo.nombre);
      return;
    }
    for (const p of resultado.value) {
      items.push({
        participante: p,
        nombreGrupo: mapaGrupos.get(p.grupoId) ?? "Sin grupo",
      });
    }
  });

  return (
    <main>
      <header className={styles.detailHeader}>
        <div className={styles.detailHeaderMain}>
          <h1 className={styles.detailHeaderTitle}>PARTICIPANTES</h1>
          <p className={styles.detailHeaderSubtitle}>
            <span>Gestión de Participantes</span>
          </p>
        </div>
      </header>

      <ParticipantesView
        participantes={items}
        grupos={pedido.grupos}
        pedidoId={id}
        errorGrupos={errorGrupos}
        tiposProducto={tiposProducto}
        colores={pedido.colores}
      />
    </main>
  );
}
