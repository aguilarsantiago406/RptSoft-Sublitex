"use client";

import { useEffect, useState } from "react";
import type { PedidoDetalle } from "@/types/pedidos";
import type { CatalogoCompleto, Tarifa } from "@/types/prendas";

/**
 * Carga el paquete base de la pantalla de detalle — contrato §2.2, §3.3:
 * - /api/pedidos/:id   → encabezado comercial (sin prendas)
 * - /api/tarifas       → tarifario oficial (los precios nunca se escriben a mano)
 * - /api/catalogos     → productos, tallas por producto y atributos
 *
 * La grilla de prendas la trae useGrupoPrendas (contrato §5.1).
 */
export function usePedidoDetalle(pedidoId: string) {
  const [pedido, setPedido] = useState<PedidoDetalle | null>(null);
  const [tarifas, setTarifas] = useState<Tarifa[]>([]);
  const [catalogo, setCatalogo] = useState<CatalogoCompleto | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let montado = true;

    async function cargar() {
      try {
        const [dataPedido, dataTarifas, dataCatalogo] = await Promise.all([
          fetch(`/api/pedidos/${pedidoId}`).then((res) => validar<PedidoDetalle>(res)),
          fetch("/api/tarifas").then((res) => validar<Tarifa[]>(res)),
          fetch("/api/catalogos").then((res) => validar<CatalogoCompleto>(res)),
        ]);

        if (montado) {
          setPedido(dataPedido);
          setTarifas(dataTarifas);
          setCatalogo(dataCatalogo);
          setCargando(false);
        }
      } catch (err) {
        if (montado) {
          setError(err instanceof Error ? err.message : "Error inesperado");
          setCargando(false);
        }
      }
    }

    cargar();

    return () => {
      montado = false;
    };
  }, [pedidoId]);

  return { pedido, tarifas, catalogo, cargando, error };
}

async function validar<T>(res: Response): Promise<T> {
  if (!res.ok) {
    throw new Error(`Error ${res.status}: la API respondió con error`);
  }
  return res.json() as Promise<T>;
}