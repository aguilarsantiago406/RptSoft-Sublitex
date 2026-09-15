"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GrillaGrupo } from "@/services/grupoPrendasMock";
import type { PrendaItem, UpdatePrenda } from "@/types/prendas";
import type { ValorConfiguracion } from "@/types/pedidos";
import { aplicarUpdate } from "@/domain/actualizarPrenda";
import { leerMensajeError } from "@/lib/api";

interface UseGrupoPrendasOpciones {
  /** Se invoca si la sincronización mock (PATCH /api/prendas/:id) falla */
  onSyncError?: (mensaje: string) => void;
}

interface UseGrupoPrendasResultado {
  grupo: GrillaGrupo | null;
  prendas: PrendaItem[];
  cargando: boolean;
  error: string | null;
  actualizarPrenda: (idPrenda: string, update: UpdatePrenda) => void;
  agregarFila: () => void;
  eliminarFila: (idPrenda: string) => void;
  valorHeredadoDe: (atributo: string) => string | undefined;
}

let contadorNuevo = 0;

/**
 * Carga la grilla COMPLETA del grupo — contrato §5.1.
 * Editar una celda genera una EXCEPCION (R-C08): al devolver el valor al que
 * el grupo hereda, la celda vuelve a HEREDADO.
 *
 * La edición es optimista: actualiza el estado local y, además, dispara
 * PATCH /api/prendas/:id (contrato §5.2) como simulación de persistencia.
 * Si la simulación falla se avisa por `onSyncError`; la celda sigue editada.
 *
 * configuracion: valores base del grupo (desde /api/pedidos/:id, §3.3)
 * para saber cuándo una excepción deja de ser tal.
 */
export function useGrupoPrendas(
  grupoId: string | undefined,
  configuracion?: ValorConfiguracion[],
  opciones: UseGrupoPrendasOpciones = {}
): UseGrupoPrendasResultado {
  const [grupo, setGrupo] = useState<GrillaGrupo | null>(null);
  const [prendas, setPrendas] = useState<PrendaItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const onSyncErrorRef = useRef(opciones.onSyncError);
  const idsServer = useRef<Set<string>>(new Set());

  useEffect(() => {
    onSyncErrorRef.current = opciones.onSyncError;
  }, [opciones.onSyncError]);

  useEffect(() => {
    if (!grupoId) return;

    let montado = true;

    fetch(`/api/grupos/${grupoId}/prendas`)
      .then((res) => {
        if (!res.ok) {
          return leerMensajeError(res).then((msg) => {
            throw new Error(msg);
          });
        }
        return res.json() as Promise<GrillaGrupo>;
      })
      .then((data) => {
        if (montado) {
          setGrupo(data);
          setPrendas(data.prendas);
          idsServer.current = new Set(data.prendas.map((p) => p.id));
          setCargando(false);
        }
      })
      .catch((err: Error) => {
        if (montado) {
          setError(err.message);
          setCargando(false);
        }
      });

    return () => {
      montado = false;
    };
  }, [grupoId]);

  const configBase = useMemo(
    () => new Map((configuracion ?? []).map((c) => [c.atributo, c.valor])),
    [configuracion]
  );

  const valorHeredadoDe = useCallback(
    (atributo: string) => configBase.get(atributo),
    [configBase]
  );

  const actualizarPrenda = useCallback(
    (idPrenda: string, update: UpdatePrenda) => {
      setPrendas((actuales) =>
        actuales.map((p) =>
          p.id === idPrenda ? aplicarUpdate(p, update, configBase) : p
        )
      );

      // Simulación de persistencia: PATCH /api/prendas/:id (contrato §5.2).
      // Las filas agregadas en el cliente aún no existen en el mock server,
      // así que no se sincronizan (evita toasts de error ruidosos).
      if (!idsServer.current.has(idPrenda)) return;

      fetch(`/api/prendas/${idPrenda}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(update),
      })
        .then((res) => {
          if (!res.ok) {
            return leerMensajeError(res).then((msg) => {
              throw new Error(msg);
            });
          }
        })
        .catch((err: Error) => {
          onSyncErrorRef.current?.(err.message);
        });
    },
    [configBase]
  );

  const agregarFila = useCallback(() => {
    setPrendas((actuales) => {
      const plantilla = actuales[actuales.length - 1] ?? actuales[0];
      const id = `${plantilla?.id ?? "nueva"}-${++contadorNuevo}`;

      const filaNueva: PrendaItem = plantilla
        ? {
            ...plantilla,
            id,
            participanteId: `${plantilla.participanteId}-nuevo`,
            nombreEnPrenda: "",
            nombrePersona: "",
            numero: "S/N",
            esArquero: false,
            personalizaciones: [],
            valores: plantilla.valores.map((v) => ({
              ...v,
              origen: "HEREDADO",
              motivo: undefined,
            })),
          }
        : {
            id,
            participanteId: "",
            nombreEnPrenda: "",
            nombrePersona: "",
            producto: "",
            talla: "",
            numero: "S/N",
            genero: "SIN_ESPECIFICAR",
            tipoPrenda: "VENTA",
            esArquero: false,
            color: null,
            valores: [],
            personalizaciones: [],
          };

      return [...actuales, filaNueva];
    });
  }, []);

  const eliminarFila = useCallback((idPrenda: string) => {
    setPrendas((actuales) =>
      actuales.filter((p) => p.id !== idPrenda)
    );
  }, []);

  return {
    grupo,
    prendas,
    cargando,
    error,
    actualizarPrenda,
    agregarFila,
    eliminarFila,
    valorHeredadoDe,
  };
}