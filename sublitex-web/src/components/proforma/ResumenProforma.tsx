"use client";

import { useMemo, useState } from "react";
import type { PrendaPresentacion } from "@/types/presentacion";
import type { ParametrosComercialesDto } from "@/services/contrato";
import { calcularProforma, calcularSaldo, type PrendaParaProforma } from "@/domain/proforma";
import { LineaConcepto } from "@/components/proforma/LineaConcepto";

interface ResumenProformaProps {
  prendas: PrendaPresentacion[];
  parametros: ParametrosComercialesDto;
}

export function ResumenProforma({ prendas, parametros }: ResumenProformaProps) {
  // Único campo financiero editable según spec (R-K07 / Tarea 8.4)
  const [adelantoRecibido, setAdelantoRecibido] = useState<number>(0);

  const prendasParaProforma: PrendaParaProforma[] = useMemo(
    () =>
      prendas.map((p) => ({
        tipoProductoId: p.tipoProductoId,
        nombreProducto: p.productoNombre,
        precioBase: p.precioBase,
        recargos: {
          talla: p.recargoTalla,
          tela: p.recargoTela,
          cuello: p.recargoCuello,
          acabado: p.recargoAcabado,
        },
        tipoPrecio: p.tipo,
      })),
    [prendas],
  );

  const proforma = useMemo(
    () => calcularProforma(prendasParaProforma, parametros.adelantoEstandar ?? 0.5),
    [prendasParaProforma, parametros],
  );

  const saldoPendiente = useMemo(
    () => calcularSaldo(proforma.totalSinIgv, adelantoRecibido),
    [proforma.totalSinIgv, adelantoRecibido],
  );

  return (
    <div className="flex flex-col gap-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-xs">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-900">
            Proforma Comercial (Cotizador)
          </h2>
          <p className="text-xs text-zinc-500">
            Montos derivados de tarifas y especificaciones aprobadas (Regla R-K10)
          </p>
        </div>

        <div className="rounded-md bg-amber-50 px-3 py-1.5 border border-amber-200 text-xs font-semibold text-amber-800">
          Nota: Precios no incluyen IGV (18%)
        </div>
      </div>

      {/* Tabla de Conceptos por Producto */}
      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          1. Desglose por Producto
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 text-[11px] font-bold uppercase text-zinc-500">
                <th className="py-2 pr-4">Descripción</th>
                <th className="py-2 px-3 text-center">Cant.</th>
                <th className="py-2 px-3 text-right">P. Unitario</th>
                <th className="py-2 pl-4 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {proforma.lineas.map((linea) => (
                <LineaConcepto
                  key={linea.descripcion}
                  concepto={linea.descripcion}
                  detalle={linea.detalle}
                  cantidad={linea.cantidad}
                  precioUnitario={linea.precioUnitario}
                  subtotal={linea.subtotal}
                />
              ))}

              {proforma.cantidadSinCosto > 0 && (
                <LineaConcepto
                  concepto="Prendas de Obsequio / Muestra (R-K02)"
                  detalle="Excluidas de cobro comercial"
                  cantidad={proforma.cantidadSinCosto}
                  precioUnitario={0}
                  subtotal="Sin costo"
                />
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabla de Recargos */}
      {proforma.recargos.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            2. Recargos por Concepto
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 text-[11px] font-bold uppercase text-zinc-500">
                  <th className="py-2 pr-4">Concepto de Recargo</th>
                  <th className="py-2 px-3 text-center">—</th>
                  <th className="py-2 px-3 text-right">—</th>
                  <th className="py-2 pl-4 text-right">Importe</th>
                </tr>
              </thead>
              <tbody>
                {proforma.recargos.map((recargo) => (
                  <LineaConcepto
                    key={recargo.concepto}
                    concepto={recargo.concepto}
                    subtotal={recargo.importe}
                    esRecargo
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bloque Financiero y Liquidación (Totales, Adelanto y Saldo) */}
      <div className="flex flex-col gap-4 rounded-xl bg-zinc-50 p-5 border border-zinc-200 sm:ml-auto sm:w-full sm:max-w-md">
        <div className="flex items-center justify-between border-b border-zinc-200/80 pb-3 text-sm">
          <span className="font-bold text-zinc-800">TOTAL SIN IGV</span>
          <span className="font-mono text-xl font-black text-zinc-900">
            S/ {proforma.totalSinIgv.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-zinc-600">
          <span>Adelanto sugerido ({proforma.percentAdelanto * 100}% · R-K07)</span>
          <span className="font-mono font-bold text-zinc-800">
            S/ {proforma.adelantoSugerido.toFixed(2)}
          </span>
        </div>

        {/* Único campo editable: Adelanto Recibido */}
        <div className="flex items-center justify-between gap-4 border-t border-zinc-200/60 pt-3">
          <label htmlFor="input-adelanto-recibido" className="text-xs font-bold text-zinc-900">
            Adelanto recibido (S/)
          </label>
          <input
            id="input-adelanto-recibido"
            type="number"
            min="0"
            step="0.5"
            value={adelantoRecibido === 0 ? "0" : adelantoRecibido}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setAdelantoRecibido(isNaN(val) ? 0 : Math.max(0, val));
            }}
            aria-label="Adelanto recibido"
            className="w-32 rounded-md border border-zinc-300 bg-white px-3 py-1.5 font-mono text-right text-sm font-bold text-zinc-900 shadow-2xs focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
          />
        </div>

        <div className="flex items-center justify-between border-t border-zinc-300 pt-3">
          <div>
            <span className="block text-xs font-bold text-zinc-900 uppercase">
              Saldo Pendiente
            </span>
            <span className="block text-[11px] text-zinc-500">
              Contra entrega en taller o despacho
            </span>
          </div>
          <span
            className={`font-mono text-xl font-black ${
              saldoPendiente > 0 ? "text-amber-700" : "text-emerald-700"
            }`}
          >
            S/ {saldoPendiente.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
