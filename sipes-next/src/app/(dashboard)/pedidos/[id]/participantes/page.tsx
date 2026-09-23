import { notFound } from "next/navigation";
import { getPedido, getParticipantesGrupo, getTallasCatalogo } from "@/features/pedidos/api/pedidos.api";
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
  let tallasCatalogo;

  try {
    [pedido, tallasCatalogo] = await Promise.all([getPedido(id), getTallasCatalogo()]);
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

  // Mapa serializable de tallas para el cliente
  const mapaTallasObj: Record<string, string> = {};
  for (const t of tallasCatalogo ?? []) {
    mapaTallasObj[t.id] = t.codigo;
  }

  // Consultar los participantes de cada grupo
  const participantesPorGrupo = await Promise.all(
    pedido.grupos.map((g) => getParticipantesGrupo(g.id).catch(() => []))
  );

  // Aplanar la lista de participantes manteniendo el nombre del grupo
  const items: ItemParticipante[] = [];
  for (const lista of participantesPorGrupo) {
    for (const p of lista) {
      items.push({
        participante: p,
        nombreGrupo: mapaGrupos.get(p.grupoId) ?? "Sin grupo",
      });
    }
  }

  return (
    <main>
      <header className={styles.detailHeader}>
        <div className={styles.detailHeaderMain}>
          <h1 className={styles.detailHeaderTitle}>
            PARTICIPANTES <span className={styles.detailHeaderCode}>— {pedido.codigo}</span>
          </h1>
          <p className={styles.detailHeaderSubtitle}>
            <span>Gestión de alumnos, enlaces de WhatsApp y confirmación</span>
            <span>·</span>
            <span>Cliente:</span>
            <span className={styles.detailClientTag}>{pedido.cliente.nombre}</span>
          </p>
        </div>
        <EstadoPedidoBadge estado={pedido.estado} size="lg" />
      </header>

      <ParticipantesView
        participantes={items}
        grupos={pedido.grupos}
        pedidoId={id}
        mapaTallasObj={mapaTallasObj}
      />
    </main>
  );
}
