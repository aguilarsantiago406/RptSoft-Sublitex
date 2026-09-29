import { useState, useEffect, useCallback } from 'react';
import { nestingApi } from './api';
import { NestingSesion, AtributoTela } from './types';

export function useNesting() {
  const [sesiones, setSesiones] = useState<NestingSesion[]>([]);
  const [telas, setTelas] = useState<AtributoTela[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSesiones = useCallback(async () => {
    try {
      setLoading(true);
      const data = await nestingApi.getSesiones();
      setSesiones(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTelas = useCallback(async () => {
    try {
      const data = await nestingApi.getTelas();
      setTelas(data);
    } catch (err: any) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchSesiones();
    fetchTelas();
  }, [fetchSesiones, fetchTelas]);

  return {
    sesiones,
    telas,
    loading,
    error,
    refreshSesiones: fetchSesiones,
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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [nestingId]);

  useEffect(() => {
    fetchDetalle();
  }, [fetchDetalle]);

  return { sesion, loading, error, refreshDetalle: fetchDetalle };
}