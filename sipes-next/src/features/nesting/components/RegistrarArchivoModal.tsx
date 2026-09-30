import React, { useState } from 'react';
import { nestingApi } from '../api';

interface Props {
  nestingId: string;
  isOpen: boolean;
  onClose: () => void;
  onRegistered: () => void;
}

const TIF_REGEX = /^SUBLITEX_.+_.+_\d+x_\d+_\d+de\d+\.tif$/;

export const RegistrarArchivoModal: React.FC<Props> = ({ nestingId, isOpen, onClose, onRegistered }) => {
  const [nombre, setNombre] = useState('');
  const [largoM, setLargoM] = useState<number>(0);
  const [ordenEnSerie, setOrdenEnSerie] = useState<number>(1);
  const [totalSerie, setTotalSerie] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!TIF_REGEX.test(nombre)) {
      setError('El nombre debe tener el formato: SUBLITEX_[CLIENTE]_[TELA]_[ANCHO]x_[LARGO]_[ORDEN]de[TOTAL].tif');
      return;
    }
    if (largoM <= 0 || largoM > 5) {
      setError('El largo debe ser mayor a 0 y máximo 5 metros.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await nestingApi.registrarArchivo(nestingId, {
        nombre,
        largoM: Number(largoM),
        ordenEnSerie: Number(ordenEnSerie),
        totalSerie: Number(totalSerie),
      });
      setNombre('');
      setLargoM(0);
      onRegistered();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al registrar el archivo');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Registrar Archivo TIF</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block font-medium text-gray-700 mb-1">Nombre del Archivo TIF</label>
            <input
              type="text"
              placeholder="SUBLITEX_CLI_DRY_180x_250_1de2.tif"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Largo (m)</label>
              <input
                type="number"
                step="0.01"
                max="5"
                value={largoM}
                onChange={(e) => setLargoM(parseFloat(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Orden Serie</label>
              <input
                type="number"
                min="1"
                value={ordenEnSerie}
                onChange={(e) => setOrdenEnSerie(parseInt(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Total Serie</label>
              <input
                type="number"
                min="1"
                value={totalSerie}
                onChange={(e) => setTotalSerie(parseInt(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50"
            >
              {submitting ? 'Registrando...' : 'Registrar TIF'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};