import React, { useState } from 'react';
import { nestingApi } from '../api';
import { ConsumoTelaPedido } from '../types';

export const ReporteConsumoCard: React.FC = () => {
  const [pedidoId, setPedidoId] = useState('');
  const [consumo, setConsumo] = useState<ConsumoTelaPedido | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBuscar = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = pedidoId.trim();
    if (!cleanId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await nestingApi.getConsumoTelaByPedido(cleanId);
      setConsumo(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se encontró información para este pedido.");
      setConsumo(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <h3 className="text-lg font-bold text-gray-800 mb-3">Consulta de Consumo de Tela</h3>
      
      <form onSubmit={handleBuscar} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Ingresa ID o Código de Pedido..."
          value={pedidoId}
          onChange={(e) => setPedidoId(e.target.value)}
          className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
        />
        <button
          type="submit"
          disabled={loading || !pedidoId.trim()}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50"
        >
          {loading ? 'Consultando...' : 'Buscar'}
        </button>
      </form>

      {error && <div className="text-sm text-red-600 p-3 bg-red-50 rounded-lg border border-red-100">{error}</div>}

      {consumo && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2 text-sm">
          <div className="p-3 bg-gray-50 rounded-lg border">
            <span className="block text-xs text-gray-500 font-medium">Metros Tela</span>
            <span className="text-base font-bold text-gray-800">{consumo.metrosTela} m</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg border">
            <span className="block text-xs text-gray-500 font-medium">Metros RIB</span>
            <span className="text-base font-bold text-gray-800">{consumo.metrosRib} m</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg border">
            <span className="block text-xs text-gray-500 font-medium">Metros Lineales</span>
            <span className="text-base font-bold text-gray-800">{consumo.metrosLineales} m</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg border">
            <span className="block text-xs text-gray-500 font-medium">Desperdicio Lateral</span>
            <span className="text-base font-bold text-gray-800">{consumo.desperdicioLateralCm} cm</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg border">
            <span className="block text-xs text-gray-500 font-medium">Aprovechamiento Ancho</span>
            <span className="text-base font-bold text-blue-600">{consumo.porcentajeAprovechamientoAncho}%</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg border">
            <span className="block text-xs text-gray-500 font-medium">Costo Impresión</span>
            <span className="text-base font-bold text-green-700">S/ {consumo.costoImpresion?.toFixed(2) ?? "0.00"}</span>
          </div>
        </div>
      )}
    </div>
  );
};