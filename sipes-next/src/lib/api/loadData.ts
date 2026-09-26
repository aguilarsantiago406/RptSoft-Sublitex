import { SipesApiError } from "./http";

export interface LoadDataResult<T> {
  data: T | null;
  error: string | null;
}

const GENERIC_ERROR = "No se pudieron cargar los datos.";

/**
 * Ejecuta una consulta de la API y devuelve los datos junto con un mensaje
 * legible en lugar de propagar la excepción, para que la vista pueda mostrar
 * un aviso en línea y seguir renderizando con datos vacíos.
 */
export async function loadData<T>(fn: () => Promise<T>): Promise<LoadDataResult<T>> {
  try {
    return { data: await fn(), error: null };
  } catch (e) {
    if (e instanceof SipesApiError) return { data: null, error: e.message };
    return { data: null, error: GENERIC_ERROR };
  }
}
