import { 
  NestingSesion, 
  CrearNestingPayload, 
  AsignarPartePayload, 
  RegistrarArchivoPayload, 
  AtributoTela, 
  ConsumoTelaPedido 
} from './types';

const API_BASE = '/api';

export const nestingApi = {
  getTelas: async (): Promise<AtributoTela[]> => {
    const res = await fetch(`${API_BASE}/catalogos/atributos`);
    if (!res.ok) throw new Error('Error al obtener la lista de telas');
    const atributos: unknown = await res.json();
    interface AtributoRaw {
      codigo?: string;
      valores?: Array<{ id: string; etiqueta?: string; valor?: string; codigo?: string }>;
    }
    const telaAttr = (atributos as AtributoRaw[]).find((a) => a.codigo === 'TELA');
    return (telaAttr?.valores ?? []).map((v) => ({
      id: v.id,
      nombre: v.etiqueta || v.valor || v.codigo || '',
      codigo: v.codigo || '',
      etiqueta: v.etiqueta || '',
    }));
  },

  getSesiones: async (): Promise<NestingSesion[]> => {
    const res = await fetch(`${API_BASE}/nestings`);
    if (!res.ok) throw new Error('Error al obtener sesiones de nesting');
    return res.json();
  },

  getSesionById: async (id: string): Promise<NestingSesion> => {
    const res = await fetch(`${API_BASE}/nestings/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error('Error al obtener el detalle de la sesión');
    return res.json();
  },

  crearSesion: async (data: CrearNestingPayload): Promise<NestingSesion> => {
    const res = await fetch(`${API_BASE}/nestings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al crear la sesión de nesting');
    }
    return res.json();
  },

  asignarParte: async (nestingId: string, data: AsignarPartePayload) => {
    const res = await fetch(`${API_BASE}/nestings/${encodeURIComponent(nestingId)}/partes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'El pedido debe tener los bloques de Diseño y Lista de Jugadores cerrados.');
    }
    return res.json();
  },

  registrarArchivo: async (nestingId: string, data: RegistrarArchivoPayload) => {
    const res = await fetch(`${API_BASE}/nestings/${encodeURIComponent(nestingId)}/archivos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al registrar el archivo TIF');
    }
    return res.json();
  },

  getConsumoTelaByPedido: async (pedidoId: string): Promise<ConsumoTelaPedido> => {
    const res = await fetch(`${API_BASE}/consumo-tela/pedido/${encodeURIComponent(pedidoId)}`);
    if (!res.ok) throw new Error('Error al obtener el reporte de consumo de tela');
    return res.json();
  }
};