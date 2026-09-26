import { notFound } from "next/navigation";
import {
  getPedido,
  getParticipantesGrupo,
  getTallasCatalogo,
  getAtributosCatalogo,
  type ParticipanteConPrendas,
} from "@/features/pedidos/api/pedidos.api";
import { EstadoPedidoBadge } from "@/features/pedidos/components/EstadoPedidoBadge";
import { PrendasView } from "@/features/pedidos/components/PrendasView";
import type { PrendaDetalle } from "@/features/pedidos/types/pedido";
import styles from "@/features/pedidos/components/pedidos.module.css";

export const dynamic = "force-dynamic";

interface PrendasPageProps {
  params: Promise<{ id: string }>;
}

export default async function PrendasPage({ params }: PrendasPageProps) {
  const { id } = await params;

  let pedido;
  let tallasCatalogo;
  let atributosCatalogo;

  try {
    [pedido, tallasCatalogo, atributosCatalogo] = await Promise.all([
      getPedido(id),
      getTallasCatalogo(),
      getAtributosCatalogo(),
    ]);
  } catch {
    notFound();
  }

  if (!pedido) {
    notFound();
  }

  // Mapa de tallas del catálogo por id
  const mapaTallas = new Map<string, string>();
  for (const t of tallasCatalogo ?? []) {
    mapaTallas.set(t.id, t.codigo);
  }

  // Mapa de colores del pedido por id
  const mapaColores = new Map<string, { nombre: string; codigoHex: string }>();
  for (const c of pedido.colores) {
    mapaColores.set(c.id, { nombre: c.nombre, codigoHex: c.codigoHex });
  }

  // Mapa de grupos por id
  const mapaGrupos = new Map<string, { id: string; nombre: string; politicaNumeracion: string }>();
  for (const g of pedido.grupos) {
    mapaGrupos.set(g.id, { id: g.id, nombre: g.nombre, politicaNumeracion: g.politicaNumeracion });
  }

  // Mapa de atributos y valores del catálogo para excepciones
  const mapaAtributos = new Map<string, { id: string; nombre: string; codigo: string }>();
  const mapaValores = new Map<string, { id: string; etiqueta: string; codigo: string }>();
  for (const a of atributosCatalogo ?? []) {
    mapaAtributos.set(a.id, { id: a.id, nombre: a.nombre, codigo: a.codigo });
    for (const v of a.valores) {
      mapaValores.set(v.id, { id: v.id, etiqueta: v.etiqueta, codigo: v.codigo });
    }
  }

  // Consultar los participantes de cada grupo usando el endpoint oficial GET /api/grupos/:id/participantes
  // Un grupo que falla se reporta por nombre en lugar de confundirse con un grupo vacío.
  const resultadosPorGrupo = await Promise.allSettled(
    pedido.grupos.map((g) => getParticipantesGrupo(g.id))
  );

  const participantesPorGrupo: ParticipanteConPrendas[][] = [];
  const errorGrupos: string[] = [];

  pedido.grupos.forEach((grupo, index) => {
    const resultado = resultadosPorGrupo[index];
    if (resultado.status === "fulfilled") {
      participantesPorGrupo.push(resultado.value);
    } else {
      participantesPorGrupo.push([]);
      errorGrupos.push(grupo.nombre);
    }
  });

  // Consolidar y aplanar las prendas
  const prendas: PrendaDetalle[] = [];
  for (const listaParticipantes of participantesPorGrupo) {
    for (const part of listaParticipantes) {
      const grupo = mapaGrupos.get(part.grupoId);
      for (const p of part.prendas) {
        const color = p.colorId ? mapaColores.get(p.colorId) : null;
        const codigoTalla = p.tallaId ? mapaTallas.get(p.tallaId) : null;

        prendas.push({
          id: p.id,
          participanteId: part.id,
          grupoId: part.grupoId,
          tipoProductoId: p.tipoProductoId,
          tallaId: p.tallaId,
          numero: p.numero,
          genero: p.genero,
          tipoPrenda: p.tipoPrenda,
          nombreEnPrenda: p.nombreEnPrenda,
          esArquero: p.esArquero,
          colorId: p.colorId,
          participante: {
            id: part.id,
            nombrePersona: part.nombrePersona,
            estado: part.estado,
          },
          grupo: grupo ? { id: grupo.id, nombre: grupo.nombre, politicaNumeracion: grupo.politicaNumeracion } : null,
          talla: codigoTalla ? { id: p.tallaId!, codigo: codigoTalla, etiqueta: codigoTalla } : null,
          color: color ? { id: p.colorId!, nombre: color.nombre, codigoHex: color.codigoHex } : null,
          excepciones: (p.excepciones ?? []).map((e: any) => ({
            id: e.id,
            motivo: e.motivo,
            atributoId: e.atributoId,
            valorAtributoId: e.valorAtributoId,
            atributo: mapaAtributos.get(e.atributoId) ?? { id: e.atributoId, nombre: "Atributo", codigo: "" },
            valor: mapaValores.get(e.valorAtributoId) ?? { id: e.valorAtributoId, etiqueta: "Valor", codigo: "" },
          })),
          personalizaciones: p.personalizaciones as any,
        });
      }
    }
  }

  return (
    <main>
      <header className={styles.detailHeader}>
        <div className={styles.detailHeaderMain}>
          <h1 className={styles.detailHeaderTitle}>
            PRENDAS <span className={styles.detailHeaderCode}>— {pedido.codigo}</span>
          </h1>
          <p className={styles.detailHeaderSubtitle}>
            <span>Detalle de Prendas</span>
          </p>
        </div>
        <EstadoPedidoBadge estado={pedido.estado} size="lg" />
      </header>

      <PrendasView
        prendas={prendas}
        grupos={pedido.grupos}
        pedidoId={id}
        tallas={tallasCatalogo ?? []}
        atributos={atributosCatalogo ?? []}
        colores={pedido.colores}
        errorGrupos={errorGrupos}
      />
    </main>
  );
}
