import { notFound } from "next/navigation";
import { getPedido, getParticipantesGrupo, getTallasCatalogo } from "@/features/pedidos/api/pedidos.api";
import { getTarifasVigentes, getDatosEnvio, getConfirmaciones, getPagos, type ResumenPagos } from "@/features/pedidos/api/comercial.api";
import { getDisenosPedido } from "@/features/pedidos/api/disenos.api";
import { ProformaView } from "@/features/pedidos/components/proforma/ProformaView";
import type { PrendaProformaItem } from "@/features/pedidos/utils/proforma.utils";
import styles from "@/features/pedidos/components/pedidos.module.css";

export const dynamic = "force-dynamic";

interface ProformaPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProformaPage({ params }: ProformaPageProps) {
  const { id } = await params;

  let pedido: Awaited<ReturnType<typeof getPedido>>;
  let tarifas = [];
  let datosEnvio = null;
  let confirmaciones = [];
  let resumenPagos: ResumenPagos = { pagos: [], totalPedido: 0, totalPagado: 0, saldoPendiente: 0 };
  let mockupUrl: string | null = null;
  const prendasConsolidadas: PrendaProformaItem[] = [];

  try {
    pedido = await getPedido(id);

    const [
      tarifasRes,
      envioRes,
      confirmacionesRes,
      pagosRes,
      disenosRes,
      tallasCatalogoRes,
      participantesRes,
    ] = await Promise.all([
      getTarifasVigentes(),
      getDatosEnvio(pedido.id),
      getConfirmaciones(pedido.id),
      getPagos(pedido.id),
      getDisenosPedido(pedido.id).catch(() => []),
      getTallasCatalogo().catch(() => []),
      Promise.allSettled(pedido.grupos.map((g) => getParticipantesGrupo(g.id))),
    ]);

    tarifas = tarifasRes;
    datosEnvio = envioRes;
    confirmaciones = confirmacionesRes;
    resumenPagos = pagosRes;

    const disenoAprobado = (disenosRes ?? []).find((d) => d.estado === "APROBADO");
    mockupUrl = disenoAprobado?.imagenUrl ?? disenoAprobado?.archivoUrl ?? null;

    // Mapa de tallas por id
    const mapaTallas = new Map<string, string>();
    for (const t of tallasCatalogoRes ?? []) {
      mapaTallas.set(t.id, t.codigo);
    }

    // Mapa de colores del pedido
    const mapaColores = new Map<string, string>();
    for (const c of pedido.colores ?? []) {
      mapaColores.set(c.id, c.nombre);
    }

    // Consolidar prendas de cada grupo
    pedido.grupos.forEach((grupo, idx) => {
      const pRes = participantesRes[idx];
      if (pRes.status === "fulfilled") {
        for (const part of pRes.value) {
          for (const pr of part.prendas) {
            const tallaCodigo = pr.tallaId ? (mapaTallas.get(pr.tallaId) ?? pr.tallaId) : "S/T";
            const colorNombre = pr.colorId ? (mapaColores.get(pr.colorId) ?? "") : "";
            const personalizacionesTexto = (pr.personalizaciones ?? [])
              .map((p) => p.contenido)
              .filter(Boolean)
              .join("; ");

            prendasConsolidadas.push({
              id: pr.id,
              participanteNombre: part.nombrePersona,
              nombreEnPrenda: pr.nombreEnPrenda,
              numero: pr.numero,
              productoNombre: grupo.tipoProducto?.nombre || grupo.nombre,
              tallaCodigo,
              colorNombre,
              genero: pr.genero === "HOMBRE" ? "Hombre" : pr.genero === "MUJER" ? "Mujer" : "Niño",
              corte: "Recto",
              cuello: "Redondo",
              personalizacionesTexto,
              tipoPrenda: pr.tipoPrenda ?? "VENTA",
            });
          }
        }
      }
    });
  } catch {
    notFound();
  }

  if (!pedido) {
    notFound();
  }

  return (
    <main>
      <header className={styles.detailHeader}>
        <div className={styles.detailHeaderMain}>
          <h1 className={styles.detailHeaderTitle}>PROFORMA</h1>
          <p className={styles.detailHeaderSubtitle}>
            <span>Cotización Comercial Oficial</span>
          </p>
        </div>
      </header>

      <ProformaView
        pedido={pedido}
        tarifas={tarifas}
        datosEnvio={datosEnvio}
        confirmaciones={confirmaciones}
        resumenPagos={resumenPagos}
        prendas={prendasConsolidadas}
        mockupUrl={mockupUrl}
      />
    </main>
  );
}
