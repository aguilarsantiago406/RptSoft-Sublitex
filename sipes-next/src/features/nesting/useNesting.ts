import { useState, useEffect, useCallback } from 'react';
import { nestingApi } from './api';
import { NestingSesion, AtributoTela } from './types';

export function useNesting() {
  const [sesiones, setSesiones] = useState<NestingSesion[]>([]);
  const [telas, setTelas] = useState<AtributoTela[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSesiones = useCallback(async () => {
    try {
      setLoading(true);
      const data = await nestingApi.getSesiones();
      setSesiones(data);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar sesiones');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTelas = useCallback(async () => {
    try {
      const data = await nestingApi.getTelas();
      setTelas(data);
    } catch (err: unknown) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const [dataSesiones, dataTelas] = await Promise.all([
          nestingApi.getSesiones(),
          nestingApi.getTelas(),
        ]);
        if (!cancel) {
          setSesiones(dataSesiones);
          setTelas(dataTelas);
        }
      } catch (err: unknown) {
        if (!cancel) {
          setError(err instanceof Error ? err.message : 'Error al cargar datos');
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  return {
    sesiones,
    telas,
    loading,
    error,
    refreshSesiones: fetchSesiones,
    refreshTelas: fetchTelas,
  };
}

export function useNestingDetalle(nestingId: string) {
  const [sesion, setSesion] = useState<NestingSesion | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetalle = useCallback(async () => {
    if (!nestingId) return;
    try {
      setLoading(true);
      const data = await nestingApi.getSesionById(nestingId);
      setSesion(data);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar detalle');
    } finally {
      setLoading(false);
    }
  }, [nestingId]);

  useEffect(() => {
    if (!nestingId) return;
    let cancel = false;
    (async () => {
      try {
        const data = await nestingApi.getSesionById(nestingId);
        if (!cancel) {
          setSesion(data);
          setError(null);
        }
      } catch (err: unknown) {
        if (!cancel) {
          setError(err instanceof Error ? err.message : 'Error al cargar detalle');
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [nestingId]);

  return { sesion, loading, error, refreshDetalle: fetchDetalle };
}