"use client";

import { useState, useEffect, useTransition } from "react";
import type { RegistroCambioItem } from "../types/auditoria";
import { actionObtenerAuditoriaPedido } from "../actions/auditoria.actions";
import { DrawerAuditoriaPedido, agruparRegistrosEnTarjetas } from "./DrawerAuditoriaPedido";
import { formatDate } from "@/lib/format/date";
import styles from "./pedidos.module.css";

interface BarraAuditoriaPedidoProps {
  pedidoId: string;
  codigo: string;
}

export function BarraAuditoriaPedido({
  pedidoId,
  codigo,
}: BarraAuditoriaPedidoProps) {
  const [registros, setRegistros] = useState<RegistroCambioItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const res = await actionObtenerAuditoriaPedido(pedidoId);
      if (res.ok && res.data) {
        setRegistros(res.data);
      }
    });
  }, [pedidoId]);

  const tarjetas = agruparRegistrosEnTarjetas(registros);
  const primeraTarjeta = tarjetas[0] ?? null;

  return (
    <>
      <div className={styles.barraAuditoria}>
        <div className={styles.barraAuditoriaInfo}>
          <span
            className={
              primeraTarjeta
                ? styles.barraAuditoriaDotActive
                : styles.barraAuditoriaDotNeutral
            }
          />
          {primeraTarjeta ? (
            <span className={styles.barraAuditoriaTexto}>
              <strong>Última actualización:</strong>{" "}
              <span className={styles.barraAuditoriaPersona}>{primeraTarjeta.titulo}</span>{" "}
              ({primeraTarjeta.cambios.map((c) => `${c.campoLabel}: ${c.valorAnterior || "vacío"} ➔ ${c.valorNuevo || "vacío"}`).join(", ")}){" "}
              por {primeraTarjeta.autorNombre}{" "}
              <span className={styles.barraAuditoriaFecha} suppressHydrationWarning>
                · {formatDate(primeraTarjeta.creadoEn)} {new Date(primeraTarjeta.creadoEn).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </span>
          ) : (
            <span className={styles.barraAuditoriaTexto}>
              Registro de auditoría inmutable activo · Sin cambios posteriores a la apertura
            </span>
          )}
        </div>

        <button
          type="button"
          className={styles.barraAuditoriaBoton}
          onClick={() => setIsDrawerOpen(true)}
        >
          {tarjetas.length > 0
            ? `Ver historial (${tarjetas.length}) →`
            : "Ver historial →"}
        </button>
      </div>

      <DrawerAuditoriaPedido
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        codigo={codigo}
        registros={registros}
        isPending={isPending}
      />
    </>
  );
}
