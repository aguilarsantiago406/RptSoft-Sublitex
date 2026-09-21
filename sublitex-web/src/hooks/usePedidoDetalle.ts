"use client";

import { useEffect, useState } from "react";
import type { PedidoDetalle } from "@/types/pedidos";
import type { CatalogoCompleto, Tarifa } from "@/types/prendas";
import { obtenerPedidoDetalle } from "@/services/pedidosApi";
import { obtenerCatalogoCompleto } from "@/services/catalogosApi";
import { obtenerTarifasVigentes } from "@/services/tarifasApi";
import { logger } from "@/utils/logger";

/**
 * Carga el paquete base de la pantalla de detalle — contrato §2.2, §3.3:
 * - /api/pedidos/:id                    → encabezado comercial (sin prendas)
 * - /api/comercial/tarifas/vigentes     → tarifario oficial (si hay sesión)
 * - /api/catalogos/*                    → productos, tallas y atributos
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
      setCargando(true);
      setError(null);

      try {
        const [dataPedido, dataTarifas, dataCatalogo] = await Promise.all([
          obtenerPedidoDetalle(pedidoId),
          obtenerTarifasVigentes(),
          obtenerCatalogoCompleto(),
        ]);

        if (!montado) return;

        // Promise.all lanza ante cualquier fallo; los datos no llegan null.
        // La guarda queda solo como red de seguridad por si un service
        // devolviera un valor inesperado.
        if (!dataPedido || !dataCatalogo || !dataTarifas) {
          setError("No se pudo cargar la información del pedido.");
        } else {
          setPedido(dataPedido);
          setTarifas(dataTarifas);
          setCatalogo(dataCatalogo);
        }
      } catch (err) {
        if (!montado) return;
        const mensaje = err instanceof Error ? err.message : "Error inesperado";
        logger.warn("usePedidoDetalle", `No se pudo cargar el pedido ${pedidoId}`, { mensaje });
        setError(mensaje);
      } finally {
        if (montado) setCargando(false);
      }
    }

    cargar();

    return () => {
      montado = false;
    };
  }, [pedidoId]);

  return { pedido, tarifas, catalogo, cargando, error };
}
