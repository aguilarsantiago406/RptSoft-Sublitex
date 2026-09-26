import { notFound } from "next/navigation";
import { getPedido, getParticipantesGrupo } from "@/features/pedidos/api/pedidos.api";
import { EstadoPedidoBadge } from "@/features/pedidos/components/EstadoPedidoBadge";
import { ParticipantesView, type ItemParticipante } from "@/features/participantes/components/ParticipantesView";
import styles from "@/features/pedidos/components/pedidos.module.css";

export const dynamic = "force-dynamic";

interface ParticipantesPageProps {
  params: Promise<{ id: string }>;
}

export default async function ParticipantesPage({ params }: ParticipantesPageProps) {
  const { id } = await params;

  let pedido;

  try {
    pedido = await getPedido(id);
  } catch {
    notFound();
  }

  if (!pedido) {
    notFound();
  }

  // Mapa de nombres de grupo
  const mapaGrupos = new Map<string, string>();
  for (const g of pedido.grupos) {
    mapaGrupos.set(g.id, g.nombre);
  }

  // Consultar los participantes de cada grupo
  // Un grupo que falla se reporta por nombre en lugar de confundirse con un grupo vacío.
  const resultadosPorGrupo = await Promise.allSettled(
    pedido.grupos.map((g) => getParticipantesGrupo(g.id))
  );

  // Aplanar la lista de participantes manteniendo el nombre del grupo
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
          <h1 className={styles.detailHeaderTitle}>
            PARTICIPANTES <span className={styles.detailHeaderCode}>— {pedido.codigo}</span>
          </h1>
          <p className={styles.detailHeaderSubtitle}>
            <span>Gestión de Participantes</span>
          </p>
        </div>
        <EstadoPedidoBadge estado={pedido.estado} size="lg" />
      </header>

      <ParticipantesView
        participantes={items}
        grupos={pedido.grupos}
        pedidoId={id}
        errorGrupos={errorGrupos}
      />
    </main>
  );
}
