"use client";

import { useState } from "react";
import type { CatalogosDto, FichaMinimaDto, PrendaDto } from "@/services/contrato";
import type { PrendaPresentacion } from "@/types/presentacion";
import { guardarFichaMinima, ErrorApi } from "@/services/cliente";

interface EditorPrendaProps {
  prenda: PrendaPresentacion;
  catalogos: CatalogosDto;
  onCerrar: () => void;
  onGuardado: (prendaActualizada: PrendaDto) => void;
}

export function EditorPrenda({ prenda, catalogos, onCerrar, onGuardado }: EditorPrendaProps) {
  // Estado local para conservar el borrador si falla la petición (R-E03)
  const [tallaId, setTallaId] = useState<string>(prenda.tallaId ?? "");
  const [numero, setNumero] = useState<string>(prenda.numero ?? "");
  const [genero, setGenero] = useState<string>(prenda.genero ?? "");
  const [nombreEnPrenda, setNombreEnPrenda] = useState<string>(prenda.nombreEnPrenda ?? "");

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);

    const ficha: FichaMinimaDto = {
      tallaId: tallaId.trim().length > 0 ? tallaId : null,
      numero: numero.trim().length > 0 ? numero.trim() : null,
      genero: genero.trim().length > 0 ? genero : null,
      nombreEnPrenda: nombreEnPrenda.trim(),
    };

    try {
      const prendaActualizada = await guardarFichaMinima(prenda.id, ficha);
      onGuardado(prendaActualizada);
    } catch (falla: unknown) {
      if (falla instanceof ErrorApi) {
        setError(
          falla.codigo ? `[${falla.codigo}] ${falla.mensaje}` : falla.mensaje,
        );
      } else if (falla instanceof Error) {
        setError(falla.message);
      } else {
        setError("Error al guardar la prenda");
      }
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="editor-prenda-titulo"
    >
      <div className="flex w-full max-w-lg flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div>
            <h3 id="editor-prenda-titulo" className="text-base font-bold text-zinc-900">
              Editar Ficha Mínima
            </h3>
            <p className="text-xs text-zinc-500">
              {prenda.productoNombre} · Prenda ID: <span className="font-mono">{prenda.id}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-800" role="alert">
            <p className="font-semibold">Error al guardar:</p>
            <p>{error}</p>
            <p className="mt-1 text-[11px] text-red-600">
              Tus cambios permanecen en pantalla para que los corrijas.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Nombre en Prenda */}
          <div className="flex flex-col gap-1">
            <label htmlFor="input-nombre" className="text-xs font-semibold text-zinc-700 uppercase">
              Nombre en Prenda (Estampado)
            </label>
            <input
              id="input-nombre"
              type="text"
              value={nombreEnPrenda}
              onChange={(e) => setNombreEnPrenda(e.target.value)}
              placeholder="Ej. BANCES o MENDOZA"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
          </div>

          {/* Dorsal / Número (Texto según R-K04) */}
          <div className="flex flex-col gap-1">
            <label htmlFor="input-numero" className="text-xs font-semibold text-zinc-700 uppercase">
              Dorsal / Número (R-K04 · Admite S/N y repetidos)
            </label>
            <input
              id="input-numero"
              type="text"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              placeholder="Ej. 10, 7 o S/N"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Talla */}
            <div className="flex flex-col gap-1">
              <label htmlFor="select-talla" className="text-xs font-semibold text-zinc-700 uppercase">
                Talla
              </label>
              <select
                id="select-talla"
                value={tallaId}
                onChange={(e) => setTallaId(e.target.value)}
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              >
                <option value="">-- Sin talla --</option>
                {catalogos.tallas.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.etiqueta} {t.recargo > 0 ? `(+S/${t.recargo})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Género */}
            <div className="flex flex-col gap-1">
              <label htmlFor="select-genero" className="text-xs font-semibold text-zinc-700 uppercase">
                Género
              </label>
              <select
                id="select-genero"
                value={genero}
                onChange={(e) => setGenero(e.target.value)}
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              >
                <option value="">-- Sin género --</option>
                <option value="HOMBRE">Hombre</option>
                <option value="MUJER">Mujer</option>
                <option value="NIÑO">Niño</option>
                <option value="NIÑA">Niña</option>
                <option value="SIN_ESPECIFICAR">Sin especificar</option>
              </select>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-end gap-3 border-t border-zinc-100 pt-3">
            <button
              type="button"
              onClick={onCerrar}
              disabled={guardando}
              className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="rounded-md bg-zinc-900 px-4 py-2 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {guardando ? "Guardando…" : "Guardar Ficha (PATCH)"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
