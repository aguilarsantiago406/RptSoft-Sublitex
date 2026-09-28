// src/features/nesting/api.ts
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
  // Obtener catálogo de telas (atributos de tipo TELA)
  getTelas: async (): Promise<AtributoTela[]> => {
    const res = await fetch(`${API_BASE}/catalogos/atributos?tipo=TELA`);
    if (!res.ok) throw new Error('Error al obtener la lista de telas');
    return res.json();
  },

  // Obtener todas las sesiones de nesting
  getSesiones: async (): Promise<NestingSesion[]> => {
    const res = await fetch(`${API_BASE}/nestings`);
    if (!res.ok) throw new Error('Error al obtener sesiones de nesting');
    return res.json();
  },

  // Obtener detalle de una sesión por ID
  getSesionById: async (id: string): Promise<NestingSesion> => {
    const res = await fetch(`${API_BASE}/nestings/${id}`);
    if (!res.ok) throw new Error('Error al obtener el detalle de la sesión');
    return res.json();
  },

  // Crear una nueva sesión de nesting
  crearSesion: async (data: CrearNestingPayload): Promise<NestingSesion> => {
    const res = await fetch(`${API_BASE}/nestings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Error al crear la sesión de nesting');
    }
    return res.json();
  },

  // Asignar una parte a la sesión
  asignarParte: async (nestingId: string, data: AsignarPartePayload) => {
    const res = await fetch(`${API_BASE}/nestings/${nestingId}/partes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      // Captura de validación R-H04 (Diseño / Lista cerrados)
      throw new Error(err.message || 'El pedido debe tener los bloques de Diseño y Lista de Jugadores cerrados.');
    }
    return res.json();
  },

  // Registrar archivo TIF
  registrarArchivo: async (nestingId: string, data: RegistrarArchivoPayload) => {
    const res = await fetch(`${API_BASE}/nestings/${nestingId}/archivos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Error al registrar el archivo TIF');
    }
    return res.json();
  },

  // Reporte de consumo de tela por pedido
  getConsumoTelaByPedido: async (pedidoId: string): Promise<ConsumoTelaPedido> => {
    const res = await fetch(`${API_BASE}/consumo-tela/pedido/${pedidoId}`);
    if (!res.ok) throw new Error('Error al obtener el reporte de consumo de tela');
    return res.json();
  }
};