import React, { useState } from 'react';
import { nestingApi } from '../api';
import { AtributoTela } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  telas: AtributoTela[];
  onCreated: () => void;
}

export const CrearNestingModal: React.FC<Props> = ({ isOpen, onClose, telas, onCreated }) => {
  const [codigo, setCodigo] = useState('');
  const [telaId, setTelaId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigo.trim() || !telaId) {
      setError('Por favor completa el código y selecciona una tela.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await nestingApi.crearSesion({ codigo, telaId });
      setCodigo('');
      setTelaId('');
      onCreated();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear la sesión');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Nueva Sesión de Nesting</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Código de Sesión</label>
            <input
              type="text"
              placeholder="Ej. NES-2026-001"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tela (Atributo)</label>
            <select
              value={telaId}
              onChange={(e) => setTelaId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
              required
            >
              <option value="">-- Seleccionar Tela --</option>
              {telas.map((tela) => (
                <option key={tela.id} value={tela.id}>
                  {tela.nombre || tela.etiqueta} {tela.codigo ? `(${tela.codigo})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 bg-blue-50 text-blue-800 text-xs rounded-lg">
            <strong>Ancho estándar:</strong> 1.80 m (configuración base del sistema).
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50"
            >
              {submitting ? 'Guardando...' : 'Crear Sesión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};