"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ValorConfiguracion } from "@/types/pedidos";
import type {
  CatalogoCompleto,
  ColorPedido,
  Genero,
  GrillaGrupo,
  GrupoGrilla,
  PrendaItem,
  TextoPrenda,
  TipoPrenda,
  UpdatePrenda,
  ValorEfectivo,
} from "@/types/prendas";
import { obtenerGrillaGrupo } from "@/services/prendasApi";
import { mapColoresPorId } from "@/services/pedidosApi";
import { logger } from "@/utils/logger";

interface UseGrupoPrendasResultado {
  grupo: GrillaGrupo | null;
  prendas: PrendaItem[];
  cargando: boolean;
  error: string | null;
  actualizarPrenda: (idPrenda: string, update: UpdatePrenda) => void;
}

/**
 * Carga la grilla COMPLETA del grupo — contrato §5.1.
 * La grilla se arma desde GET /api/grupos/:grupoId/participantes resolviendo
 * ids crudos (talla, atributos, ubicaciones) contra el catálogo real.
 *
 * Editar una celda genera una EXCEPCION (R-C08): al devolver el valor al que
 * el grupo hereda, la celda vuelve a HEREDADO. La edición es estado local.
 *
 * configuracion: valores base del grupo (desde /api/pedidos/:id, §3.3)
 * colores: colores oficiales del pedido (para resolver colorId de la prenda)
 * catalogo: catálogo real cargado por usePedidoDetalle (índices incluidos)
 */
export function useGrupoPrendas(
  grupoId: string | undefined,
  configuracion?: ValorConfiguracion[],
  colores?: ColorPedido[],
  catalogo?: CatalogoCompleto | null,
  grupo?: GrupoGrilla
): UseGrupoPrendasResultado {
  const [grilla, setGrilla] = useState<GrillaGrupo | null>(null);
  const [prendas, setPrendas] = useState<PrendaItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let montado = true;

    async function cargar() {
      if (!grupoId || !catalogo) {
        setCargando(false);
        return;
      }

      setCargando(true);
      setError(null);

      const coloresMap = mapColoresPorId(colores ?? []);
      const grupoGrilla: GrupoGrilla = grupo ?? {
        id: grupoId,
        nombre: "",
        tipoProducto: { codigo: "", nombre: "" },
      };

      try {
        const data = await obtenerGrillaGrupo(
          grupoId,
          configuracion ?? [],
          coloresMap,
          catalogo,
          grupoGrilla
        );
        if (!montado) return;
        setGrilla(data);
        setPrendas(data.prendas);
      } catch (err) {
        if (!montado) return;
        const mensaje =
          err instanceof Error && err.message
            ? err.message
            : "No se pudo cargar la grilla del grupo.";
        logger.warn("useGrupoPrendas", `No se pudo cargar la grilla ${grupoId}`, { mensaje });
        setError(mensaje);
        setPrendas([]);
      } finally {
        if (montado) setCargando(false);
      }
    }

    cargar();

    return () => {
      montado = false;
    };
  }, [grupoId, catalogo, configuracion, colores, grupo]);

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

  return { grupo: grilla, prendas, cargando, error, actualizarPrenda };
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
