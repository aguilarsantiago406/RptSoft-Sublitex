interface LineaConceptoProps {
  concepto: string;
  detalle?: string;
  cantidad?: number | string;
  precioUnitario?: number;
  subtotal: number | string;
  esRecargo?: boolean;
}

export function LineaConcepto({
  concepto,
  detalle,
  cantidad,
  precioUnitario,
  subtotal,
  esRecargo = false,
}: LineaConceptoProps) {
  return (
    <tr className="border-b border-zinc-100 text-sm hover:bg-zinc-50/50">
      <td className="py-3 pr-4">
        <span className={`font-semibold ${esRecargo ? "text-zinc-700" : "text-zinc-900"}`}>
          {concepto}
        </span>
        {detalle && <span className="block text-xs text-zinc-500">{detalle}</span>}
      </td>

      <td className="py-3 px-3 text-center text-zinc-700">
        {cantidad !== undefined ? cantidad : "—"}
      </td>

      <td className="py-3 px-3 text-right font-mono text-zinc-700">
        {precioUnitario !== undefined ? `S/ ${precioUnitario.toFixed(2)}` : "—"}
      </td>

      <td className="py-3 pl-4 text-right font-mono font-bold text-zinc-900">
        {typeof subtotal === "number" ? `S/ ${subtotal.toFixed(2)}` : subtotal}
      </td>
    </tr>
  );
}
