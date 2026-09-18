"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { GrillaGrupo } from "@/services/grupoPrendasMock";
import type {
  Genero,
  PrendaItem,
  TextoPrenda,
  TipoPrenda,
  UpdatePrenda,
  ValorEfectivo,
} from "@/types/prendas";
import type { ValorConfiguracion } from "@/types/pedidos";

interface UseGrupoPrendasResultado {
  grupo: GrillaGrupo | null;
  prendas: PrendaItem[];
  cargando: boolean;
  error: string | null;
  actualizarPrenda: (idPrenda: string, update: UpdatePrenda) => void;
}

/**
 * Carga la grilla COMPLETA del grupo — contrato §5.1.
 * Editar una celda genera una EXCEPCION (R-C08): al devolver el valor al que
 * el grupo hereda, la celda vuelve a HEREDADO.
 *
 * configuracion: valores base del grupo (desde /api/pedidos/:id, §3.3)
 * para saber cuándo una excepción deja de ser tal.
 */
export function useGrupoPrendas(
  grupoId: string | undefined,
  configuracion?: ValorConfiguracion[]
): UseGrupoPrendasResultado {
  const [grupo, setGrupo] = useState<GrillaGrupo | null>(null);
  const [prendas, setPrendas] = useState<PrendaItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!grupoId) return;

    let montado = true;

    fetch(`/api/grupos/${grupoId}/prendas`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error ${res.status}: no se pudo cargar la grilla`);
        }
        return res.json() as Promise<GrillaGrupo>;
      })
      .then((data) => {
        if (montado) {
          setGrupo(data);
          setPrendas(data.prendas);
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

  const actualizarPrenda = useCallback(
    (idPrenda: string, update: UpdatePrenda) => {
      setPrendas((actuales) =>
        actuales.map((p) =>
          p.id === idPrenda ? aplicarUpdate(p, update, configBase) : p
        )
      );
    },
    [configBase]
  );

  return { grupo, prendas, cargando, error, actualizarPrenda };
}

function aplicarUpdate(
  p: PrendaItem,
  update: UpdatePrenda,
  configBase: Map<string, string>
): PrendaItem {
  switch (update.tipo) {
    case "valor": {
      const existente = p.valores.find((v) => v.atributo === update.atributo);
      if (!existente) return p;

      return {
        ...p,
        valores: p.valores.map((v) =>
          v.atributo === update.atributo
            ? resolverOrigen(v, update.valor, configBase.get(update.atributo))
            : v
        ),
      };
    }

    case "color":
      return { ...p, color: update.color };

    case "booleano":
      return { ...p, esArquero: update.valor };

    case "texto":
      return aplicarTexto(p, update.campo, update.valor);
  }
}

function resolverOrigen(
  prev: ValorEfectivo,
  nuevo: string,
  base?: string
): ValorEfectivo {
  if (nuevo === prev.valor) return prev;
  if (base !== undefined && nuevo === base) {
    return { atributo: prev.atributo, valor: nuevo, origen: "HEREDADO" };
  }
  return {
    atributo: prev.atributo,
    valor: nuevo,
    origen: "EXCEPCION",
    motivo: "Editado en grilla",
  };
}

function aplicarTexto(
  p: PrendaItem,
  campo: TextoPrenda,
  valor: string
): PrendaItem {
  switch (campo) {
    case "nombreEnPrenda":
      return { ...p, nombreEnPrenda: valor.toUpperCase() };
    case "nombrePersona":
      return { ...p, nombrePersona: valor };
    case "numero":
      return { ...p, numero: valor };
    case "producto":
      return { ...p, producto: valor };
    case "talla":
      return { ...p, talla: valor };
    case "genero":
      return { ...p, genero: valor as Genero };
    case "tipoPrenda":
      return { ...p, tipoPrenda: valor as TipoPrenda };
  }
}