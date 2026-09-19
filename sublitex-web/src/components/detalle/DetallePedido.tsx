"use client";

import { useMemo, useState } from "react";
import { obtenerDetallePedido, ErrorApi } from "@/services/cliente";
import { adaptarDetallePedido } from "@/services/adaptador";
import { useAsync } from "@/components/ui/use-async";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { CabeceraPedido } from "@/components/detalle/CabeceraPedido";
import { DisenoAprobado } from "@/components/detalle/DisenoAprobado";
import { MuestrarioColores } from "@/components/detalle/MuestrarioColores";
import { UbicacionesEstampado } from "@/components/detalle/UbicacionesEstampado";
import { EnvioProvincia } from "@/components/detalle/EnvioProvincia";
import { TablaPrendas } from "@/components/prendas/TablaPrendas";
import { ResumenProforma } from "@/components/proforma/ResumenProforma";

type PestanaDetalle = "PEDIDO" | "PRENDAS" | "PROFORMA";

interface DetallePedidoProps {
  pedidoId: string;
}

export function DetallePedido({ pedidoId }: DetallePedidoProps) {
  const [pestanaActiva, setPestanaActiva] = useState<PestanaDetalle>("PEDIDO");

  const { datos, error, cargando, recargar } = useAsync(() =>
    obtenerDetallePedido(pedidoId),
  );

  const detalle = useMemo(() => {
    if (!datos) return null;
    return adaptarDetallePedido(datos);
  }, [datos]);

  if (cargando) {
    return <Spinner />;
  }

  if (error) {
    return (
      <ErrorBanner
        error={
          error instanceof ErrorApi
            ? error
            : new ErrorApi("R-CONTRATO", error.message, 502)
        }
        alReintentar={recargar}
      />
    );
  }

  if (!detalle) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Cabecera Comercial Fija */}
      <CabeceraPedido
        codigo={detalle.codigo}
        estado={detalle.estado}
        identificacion={detalle.identificacion}
      />

      {/* 2. Barra de Navegación por Pestañas (Evita el scroll infinito) */}
      <div className="flex border-b border-zinc-200" role="tablist" aria-label="Secciones del pedido">
        <button
          type="button"
          role="tab"
          aria-selected={pestanaActiva === "PEDIDO"}
          onClick={() => setPestanaActiva("PEDIDO")}
          className={`border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
            pestanaActiva === "PEDIDO"
              ? "border-zinc-900 text-zinc-900 bg-white"
              : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700"
          }`}
        >
          1. Ficha Comercial (PEDIDO)
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={pestanaActiva === "PRENDAS"}
          onClick={() => setPestanaActiva("PRENDAS")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
            pestanaActiva === "PRENDAS"
              ? "border-zinc-900 text-zinc-900 bg-white"
              : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700"
          }`}
        >
          <span>2. Prendas y Producción (PRENDAS)</span>
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700">
            {detalle.prendas.length}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={pestanaActiva === "PROFORMA"}
          onClick={() => setPestanaActiva("PROFORMA")}
          className={`border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
            pestanaActiva === "PROFORMA"
              ? "border-zinc-900 text-zinc-900 bg-white"
              : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700"
          }`}
        >
          3. Proforma Comercial (COTIZADOR)
        </button>
      </div>

      {/* 3. Contenido de la pestaña activa */}
      {pestanaActiva === "PEDIDO" && (
        <div className="flex flex-col gap-6" role="tabpanel">
          <DisenoAprobado diseno={detalle.disenoAprobado} />
          <MuestrarioColores colores={detalle.colores} />
          <UbicacionesEstampado ubicaciones={detalle.ubicacionesEstampado} />
          <EnvioProvincia
            envio={detalle.envioProvincia}
            modalidadEntrega={detalle.identificacion.modalidadEntrega}
          />
        </div>
      )}

      {pestanaActiva === "PRENDAS" && (
        <div className="flex flex-col gap-6" role="tabpanel">
          <TablaPrendas
            prendas={detalle.prendas}
            catalogos={detalle.catalogos}
            onRecargar={recargar}
          />
        </div>
      )}

      {pestanaActiva === "PROFORMA" && (
        <div className="flex flex-col gap-6" role="tabpanel">
          <ResumenProforma
            prendas={detalle.prendas}
            parametros={detalle.catalogos.parametros}
          />
        </div>
      )}
    </div>
  );
}
