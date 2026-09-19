import type { PrendaPresentacion } from "@/types/presentacion";

interface FilaPrendaProps {
  prenda: PrendaPresentacion;
  indice: number;
  onEditar: () => void;
}

export function FilaPrenda({ prenda, indice, onEditar }: FilaPrendaProps) {
  const tieneFaltantes = prenda.queFalta.length > 0;
  const esExcepcionCorte = prenda.corte?.esExcepcion;

  return (
    <tr
      className={`border-b border-zinc-100 text-xs transition-colors hover:bg-zinc-50/80 ${
        tieneFaltantes ? "bg-red-50/20" : ""
      }`}
    >
      {/* 1. N° */}
      <td className="px-3 py-2.5 font-mono text-zinc-400 text-center">{indice + 1}</td>

      {/* 2. Nombre en Prenda */}
      <td className="px-3 py-2.5 font-mono font-bold text-zinc-900 whitespace-nowrap">
        {prenda.nombreEnPrenda || <span className="text-zinc-400 italic">Sin nombre</span>}
      </td>

      {/* 3. Persona / Participante */}
      <td className="px-3 py-2.5 text-zinc-700 whitespace-nowrap">
        {prenda.nombrePersona || <span className="text-zinc-400 italic">—</span>}
      </td>

      {/* 4. Producto */}
      <td className="px-3 py-2.5 font-medium text-zinc-800 whitespace-nowrap">
        {prenda.productoNombre}
      </td>

      {/* 5. Talla */}
      <td className="px-3 py-2.5 font-mono font-semibold text-zinc-900 text-center">
        {prenda.talla || <span className="text-red-500 font-bold">?</span>}
      </td>

      {/* 6. Dorsal / Número (R-K04: texto legítimo, S/N válido) */}
      <td className="px-3 py-2.5 font-mono font-bold text-center">
        {prenda.numero === "S/N" ? (
          <span className="rounded bg-zinc-200 px-1.5 py-0.5 text-zinc-700">S/N</span>
        ) : prenda.numero ? (
          <span className="text-zinc-900">{prenda.numero}</span>
        ) : (
          <span className="text-red-500 font-bold">?</span>
        )}
      </td>

      {/* 7. Color */}
      <td className="px-3 py-2.5 whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          {prenda.colorHex && (
            <span
              className="h-3.5 w-3.5 rounded-full border border-zinc-300 shrink-0"
              style={{ backgroundColor: prenda.colorHex }}
              title={prenda.colorHex}
            />
          )}
          <span className="text-zinc-700">{prenda.color || "—"}</span>
        </div>
      </td>

      {/* 8. Género */}
      <td className="px-3 py-2.5 text-zinc-700 text-center">
        {prenda.genero || <span className="text-red-500 font-bold">?</span>}
      </td>

      {/* 9. Corte (Distinción visual de excepción por R-C06 / R-E07) */}
      <td className="px-3 py-2.5 text-center whitespace-nowrap">
        {esExcepcionCorte ? (
          <span
            className="inline-flex items-center rounded-md bg-purple-100 px-2 py-0.5 font-semibold text-purple-800 border border-purple-200"
            title="Excepción individual frente a la regla general del grupo (R-C06)"
          >
            ★ {prenda.corte?.nombre}
          </span>
        ) : (
          <span className="text-zinc-600">{prenda.corte?.nombre || "—"}</span>
        )}
      </td>

      {/* 10. Cuello */}
      <td className="px-3 py-2.5 text-zinc-600 text-center whitespace-nowrap">
        {prenda.cuello?.nombre || "—"}
      </td>

      {/* 11. Tela */}
      <td className="px-3 py-2.5 text-zinc-600 text-center whitespace-nowrap">
        {prenda.tela?.nombre || "—"}
      </td>

      {/* 12. Escudo */}
      <td className="px-3 py-2.5 text-zinc-600 text-center">
        {prenda.escudo?.nombre || "—"}
      </td>

      {/* 13. Acabado Escudo */}
      <td className="px-3 py-2.5 text-zinc-600 text-center whitespace-nowrap">
        {prenda.acabadoEscudo?.nombre || "—"}
      </td>

      {/* 14. Arquero */}
      <td className="px-3 py-2.5 text-center">
        {prenda.esArquero ? (
          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
            SÍ
          </span>
        ) : (
          <span className="text-zinc-400">No</span>
        )}
      </td>

      {/* 15. Tipo */}
      <td className="px-3 py-2.5 text-center">
        <span
          className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
            prenda.tipo === "VENTA"
              ? "bg-zinc-100 text-zinc-700"
              : prenda.tipo === "OBSEQUIO"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-blue-100 text-blue-800"
          }`}
        >
          {prenda.tipo}
        </span>
      </td>

      {/* 16. Personalización Especial */}
      <td
        className="max-w-xs truncate px-3 py-2.5 text-zinc-500 font-mono text-[11px]"
        title={prenda.personalizacionEspecial || "Sin personalización especial"}
      >
        {prenda.personalizacionEspecial || "—"}
      </td>

      {/* 17. Precio Base */}
      <td className="px-3 py-2.5 font-mono text-right text-zinc-500">
        S/ {prenda.precioBase.toFixed(2)}
      </td>

      {/* 18. Recargo Talla */}
      <td className="px-3 py-2.5 font-mono text-right text-zinc-500">
        {prenda.recargoTalla > 0 ? `+S/ ${prenda.recargoTalla.toFixed(2)}` : "—"}
      </td>

      {/* 19. Recargo Tela */}
      <td className="px-3 py-2.5 font-mono text-right text-zinc-500">
        {prenda.recargoTela > 0 ? `+S/ ${prenda.recargoTela.toFixed(2)}` : "—"}
      </td>

      {/* 20. Recargo Cuello */}
      <td className="px-3 py-2.5 font-mono text-right text-zinc-500">
        {prenda.recargoCuello > 0 ? `+S/ ${prenda.recargoCuello.toFixed(2)}` : "—"}
      </td>

      {/* 21. Recargo Acabado */}
      <td className="px-3 py-2.5 font-mono text-right text-zinc-500">
        {prenda.recargoAcabado > 0 ? `+S/ ${prenda.recargoAcabado.toFixed(2)}` : "—"}
      </td>

      {/* 22. Precio Unitario (R-K10) */}
      <td className="px-3 py-2.5 font-mono font-bold text-right text-zinc-900 bg-zinc-50/50">
        S/ {prenda.precioUnitario.toFixed(2)}
      </td>

      {/* 23. Camisetas */}
      <td className="px-2 py-2.5 font-mono text-center text-zinc-700">{prenda.camisetas}</td>

      {/* 24. Shorts */}
      <td className="px-2 py-2.5 font-mono text-center text-zinc-700">{prenda.shorts}</td>

      {/* 25. Medias */}
      <td className="px-2 py-2.5 font-mono text-center text-zinc-700">{prenda.medias}</td>

      {/* 26. Qué Falta (Rojo para incompletas) */}
      <td className="px-3 py-2.5 whitespace-nowrap">
        {tieneFaltantes ? (
          <span className="inline-flex items-center gap-1 rounded bg-red-100 px-2 py-0.5 font-bold text-red-800">
            ⚠ Falta: {prenda.queFalta.join(", ")}
          </span>
        ) : (
          <span className="text-emerald-600 font-semibold text-[11px]">✓ Completa</span>
        )}
      </td>

      {/* Acción: Editar Ficha */}
      <td className="px-3 py-2.5 text-center">
        <button
          type="button"
          onClick={onEditar}
          className="rounded border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
        >
          Editar
        </button>
      </td>
    </tr>
  );
}
