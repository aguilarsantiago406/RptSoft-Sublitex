"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ErrorApi } from "@/services/cliente";
import { RespuestaInvalidaError } from "@/services/validador";

export interface EstadoAsync<T> {
  datos: T | null;
  error: ErrorApi | RespuestaInvalidaError | null;
  cargando: boolean;
  recargar: () => void;
}

export function useAsync<T>(tarea: () => Promise<T>): EstadoAsync<T> {
  const [datos, setDatos] = useState<T | null>(null);
  const [error, setError] = useState<ErrorApi | RespuestaInvalidaError | null>(null);
  const [cargando, setCargando] = useState(true);
  const [version, setVersion] = useState(0);
  const tareaRef = useRef(tarea);

  useEffect(() => {
    tareaRef.current = tarea;
  }, [tarea]);

  useEffect(() => {
    let activo = true;

    tareaRef
      .current()
      .then((resultado) => {
        if (activo) {
          setDatos(resultado);
          setError(null);
        }
      })
      .catch((falla: unknown) => {
        if (activo) {
          setError(
            falla instanceof ErrorApi || falla instanceof RespuestaInvalidaError
              ? falla
              : new ErrorApi(undefined, falla instanceof Error ? falla.message : "Error inesperado", 0),
          );
        }
      })
      .finally(() => {
        if (activo) {
          setCargando(false);
        }
      });

    return () => {
      activo = false;
    };
  }, [version]);

  const recargar = useCallback(() => {
    setCargando(true);
    setError(null);
    setVersion((v) => v + 1);
  }, []);

  return { datos, error, cargando, recargar };
}