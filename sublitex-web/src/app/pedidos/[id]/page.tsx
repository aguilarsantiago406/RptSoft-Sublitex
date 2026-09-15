"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import { usePedidoDetalle } from "@/hooks/usePedidoDetalle";
import { useGrupoPrendas } from "@/hooks/useGrupoPrendas";
import { TablaPrendas } from "@/components/prendas/TablaPrendas";
import { PanelResumenProduccion } from "@/components/prendas/PanelResumenProduccion";
import { VisorDiseno } from "@/components/diseno/VisorDiseno";
import { useToast } from "@/components/ui/Toast";
import { calcularTotales, TOTALES_VACIOS } from "@/domain/calculoTotales";
import { calcularEntregables } from "@/domain/entregables";
import { marcarDorsalesDuplicados } from "@/domain/validacionPrenda";
import { ESTADO_LABEL, ESTADO_BADGE } from "@/lib/estados";

interface PageProps {
  params: Promise<{ id: string }>;
}

const NOMBRE_ATRIBUTO: Record<string, string> = {
  CUELLO: "Cuello",
  TELA: "Tela",
  CORTE: "Corte",
  ACABADO: "Acabado",
};

const card =
  "rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/60 dark:backdrop-blur-md dark:shadow-none";

export default function PaginaDetallePedido({ params }: PageProps) {
  const resolvedParams = use(params);
  const pedidoId = resolvedParams.id;

  const { agregarToast } = useToast();

  const { pedido, tarifas, catalogo, cargando, error } =
    usePedidoDetalle(pedidoId);

  const grupo = pedido?.grupos[0];
  const {
    prendas,
    grupo: grupoGrilla,
    cargando: cargandoGrilla,
    error: errorGrilla,
    actualizarPrenda,
    agregarFila,
    eliminarFila,
    valorHeredadoDe,
  } = useGrupoPrendas(grupo?.id, grupo?.configuracion, {
    onSyncError: (mensaje) => agregarToast("error", mensaje),
  });

  const totales = useMemo(
    () => (catalogo ? calcularTotales(prendas, tarifas, catalogo) : TOTALES_VACIOS),
    [prendas, tarifas, catalogo]
  );

  const dorsalDuplicados = useMemo(
    () => marcarDorsalesDuplicados(prendas),
    [prendas]
  );

  const entregables = useMemo(
    () => (pedido ? calcularEntregables(pedido.grupos) : null),
    [pedido]
  );

  if (cargando || cargandoGrilla) {
    return (
      <main className="flex items-center justify-center py-24">
        <div className={card}>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Cargando pedido {pedidoId}, tarifas y grilla del grupo…
          </p>
        </div>
      </main>
    );
  }

  if (error || !pedido || !catalogo) {
    return (
      <main className="py-12">
        <div className="mx-auto max-w-lg rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center shadow-sm dark:border-red-900/60 dark:bg-red-950/30 dark:backdrop-blur-md">
          <p className="text-sm font-medium text-red-700 dark:text-red-300">
            {error || "No se pudo cargar la información"}
          </p>
          <Link
            href="/pedidos"
            className="mt-4 inline-block text-sm font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            ← Volver a la lista
          </Link>
        </div>
      </main>
    );
  }

  if (errorGrilla || !grupoGrilla) {
    return (
      <main className="py-12">
        <div className="mx-auto max-w-lg rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center shadow-sm dark:border-red-900/60 dark:bg-red-950/30 dark:backdrop-blur-md">
          <p className="text-sm font-medium text-red-700 dark:text-red-300">
            {errorGrilla || "No se pudo cargar la grilla del grupo"}
          </p>
          <Link
            href="/pedidos"
            className="mt-4 inline-block text-sm font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            ← Volver a la lista
          </Link>
        </div>
      </main>
    );
  }

  const { chip: chipEstado, dot: dotEstado } = ESTADO_BADGE[pedido.estado];
  const primerPrenda = prendas[0];

  return (
    <main className="space-y-4">
      <Link
        href="/pedidos"
        className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
      >
        ← Volver a lista de pedidos
      </Link>

      {/* ═══ FICHA RESUMEN ═══ */}
      <div className={card}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              {pedido.codigo} — {pedido.cliente.nombre}
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {pedido.cliente.telefono && (
                <>
                  Tel.: {pedido.cliente.telefono}
                  {pedido.cliente.ciudad && " · "}
                </>
              )}
              {pedido.cliente.ciudad}
            </p>
            {grupo && (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Grupo: <strong className="text-slate-800 dark:text-slate-200">{grupo.nombre}</strong> ·{" "}
                Producto: <strong className="text-slate-800 dark:text-slate-200">{grupo.tipoProducto.nombre}</strong> ·
                Cantidad contratada: <strong className="text-slate-800 dark:text-slate-200">{grupo.cantidadContratada}</strong>
              </p>
            )}
            {grupo && grupo.configuracion.length > 0 && (
              <p className="mt-1 text-[12px] text-slate-400 dark:text-slate-500">
                Configuración base:{" "}
                {grupo.configuracion
                  .map((c) => `${NOMBRE_ATRIBUTO[c.atributo] ?? c.atributo} ${c.valor}`)
                  .join(" · ")}
              </p>
            )}
          </div>

          <div className="flex flex-col items-end gap-2">
            <span
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${chipEstado}`}
            >
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ring-1 ring-black/5 dark:ring-white/10 ${dotEstado}`}
                aria-hidden="true"
              />
              {ESTADO_LABEL[pedido.estado]}
            </span>
          </div>
        </div>
      </div>

      {/* ═══ TARJETAS SECUNDARIAS ═══ */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className={card}>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Fecha de pedido
          </p>
          <p className="mt-1 text-sm font-semibold tabular-nums text-slate-800 dark:text-slate-200">
            {new Date(pedido.fechaPedido).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" })}
          </p>
        </div>
        <div className={card}>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Fecha de compromiso
          </p>
          <p className="mt-1 text-sm font-semibold tabular-nums text-slate-800 dark:text-slate-200">
            {pedido.fechaCompromiso
              ? new Date(pedido.fechaCompromiso).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" })
              : "Sin fecha"}
          </p>
        </div>
        <div className={card}>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Prendas en grilla
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-50">{prendas.length}</p>
        </div>
        <div className={card}>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Importe total
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-50">
            S/ {totales.importeTotal.toFixed(2)}
          </p>
        </div>
      </div>

      {/* ═══ RESUMEN FINANCIERO Y PROFORMA ═══ */}
      <section className={card}>
        <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
          Resumen financiero y proforma
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Total base</p>
            <p className="mt-0.5 text-lg font-bold tabular-nums text-slate-900 dark:text-slate-50">S/ {totales.totalBase.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Rec. talla</p>
            <p className="mt-0.5 text-sm font-semibold tabular-nums text-slate-800 dark:text-slate-200">S/ {totales.totalRecTalla.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Rec. tela</p>
            <p className="mt-0.5 text-sm font-semibold tabular-nums text-slate-800 dark:text-slate-200">S/ {totales.totalRecTela.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Rec. cuello</p>
            <p className="mt-0.5 text-sm font-semibold tabular-nums text-slate-800 dark:text-slate-200">S/ {totales.totalRecCuello.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Rec. acabado</p>
            <p className="mt-0.5 text-sm font-semibold tabular-nums text-slate-800 dark:text-slate-200">S/ {totales.totalRecAcabado.toFixed(2)}</p>
          </div>
          <div className="border-t border-slate-200 pt-3 dark:border-slate-800">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Importe total</p>
            <p className="mt-0.5 text-lg font-bold tabular-nums text-slate-900 dark:text-slate-50">S/ {totales.importeTotal.toFixed(2)}</p>
          </div>
        </div>
      </section>

      {/* ═══ DESGLOSE DE ENTREGABLES ═══ */}
      {entregables && (
        <section className={card}>
          <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
            Desglose de entregables por grupo
          </h2>
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
            <table className="w-full border-collapse text-xs text-slate-800 dark:text-slate-200">
              <thead>
                <tr className="bg-slate-100 text-[10px] uppercase tracking-wide text-slate-600 dark:bg-slate-900/90 dark:text-slate-500">
                  <th className="border border-slate-200 px-2.5 py-1.5 text-left dark:border-slate-800">Grupo</th>
                  <th className="border border-slate-200 px-2.5 py-1.5 text-right dark:border-slate-800">Cant.</th>
                  <th className="border border-slate-200 px-2.5 py-1.5 text-right dark:border-slate-800">Camisetas</th>
                  <th className="border border-slate-200 px-2.5 py-1.5 text-right dark:border-slate-800">Shorts</th>
                  <th className="border border-slate-200 px-2.5 py-1.5 text-right dark:border-slate-800">Medias</th>
                </tr>
              </thead>
              <tbody>
                {entregables.grupos.map((g, i) => (
                  <tr key={g.grupoId} className={i % 2 === 0 ? "bg-white dark:bg-slate-900/80" : "bg-slate-50 dark:bg-slate-900/50"}>
                    <td className="border border-slate-200 px-2.5 py-1.5 font-semibold dark:border-slate-800">{g.grupoNombre}</td>
                    <td className="border border-slate-200 px-2.5 py-1.5 text-right tabular-nums dark:border-slate-800">{g.cantidadContratada}</td>
                    <td className="border border-slate-200 px-2.5 py-1.5 text-right tabular-nums dark:border-slate-800">{g.camisetas}</td>
                    <td className="border border-slate-200 px-2.5 py-1.5 text-right tabular-nums dark:border-slate-800">{g.shorts}</td>
                    <td className="border border-slate-200 px-2.5 py-1.5 text-right tabular-nums dark:border-slate-800">{g.medias}</td>
                  </tr>
                ))}
                <tr className="bg-slate-100 font-bold dark:bg-slate-900/90">
                  <td className="border border-slate-200 px-2.5 py-1.5 dark:border-slate-800">Total</td>
                  <td className="border border-slate-200 px-2.5 py-1.5 text-right tabular-nums dark:border-slate-800">{entregables.totalPrendas}</td>
                  <td className="border border-slate-200 px-2.5 py-1.5 text-right tabular-nums dark:border-slate-800">{entregables.totalCamisetas}</td>
                  <td className="border border-slate-200 px-2.5 py-1.5 text-right tabular-nums dark:border-slate-800">{entregables.totalShorts}</td>
                  <td className="border border-slate-200 px-2.5 py-1.5 text-right tabular-nums dark:border-slate-800">{entregables.totalMedias}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ═══ VISOR DE DISEÑO ═══ */}
      <VisorDiseno
        diseno={pedido.diseno}
        colores={pedido.colores}
        nombreEnPrenda={primerPrenda?.nombreEnPrenda ?? "EN PRENDA"}
        numero={primerPrenda?.numero ?? "?"}
        personalizaciones={primerPrenda?.personalizaciones ?? []}
      />

      {/* ═══ GRILLA DE PRENDAS ═══ */}
      <TablaPrendas
        prendas={prendas}
        colores={pedido.colores}
        tarifas={tarifas}
        catalogo={catalogo}
        totales={totales}
        valorHeredadoDe={valorHeredadoDe}
        dorsalDuplicadoIds={dorsalDuplicados}
        onActualizarPrenda={actualizarPrenda}
        onAgregarFila={agregarFila}
        onEliminarFila={eliminarFila}
      />

      {/* ═══ RESUMEN DE PRODUCCIÓN ═══ */}
      <PanelResumenProduccion pedidoId={pedidoId} />
    </main>
  );
}