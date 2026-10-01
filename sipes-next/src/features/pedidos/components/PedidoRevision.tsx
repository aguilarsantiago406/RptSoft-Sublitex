"use client";

import { useState, useTransition } from "react";
import { ShieldCheck, Palette, ClipboardList, BadgeDollarSign } from "lucide-react";
import type { PedidoDetalle } from "../types/pedido";
import type { BloquePedidoItem, TipoBloque } from "../types/bloque";
import type { ResumenProduccionItem, ConfirmacionItem } from "../api/comercial.api";
import { actionCerrarBloque, actionReabrirBloque } from "../actions/bloques.actions";
import { evaluarBloquesReales } from "../utils/bloques.utils";
import { ModalReabrirBloque } from "./ModalReabrirBloque";
import { BloqueCard, type BloqueCheckItem } from "./BloqueCard";
import sharedStyles from "./pedidos.module.css";
import styles from "./pedidoRevision.module.css";

interface PedidoRevisionProps {
  pedido: PedidoDetalle;
  bloques?: BloquePedidoItem[];
  totalPrendas?: number;
  disenos?: Array<{ id: string; estado: string }>;
  datosEnvio?: { ciudad?: string | null; direccion?: string | null; agencia?: string | null } | null;
  resumenProduccion?: ResumenProduccionItem | null;
  confirmaciones?: ConfirmacionItem[];
}

export function PedidoRevision({
  pedido,
  bloques = [],
  totalPrendas = 0,
  disenos = [],
  datosEnvio = null,
  resumenProduccion = null,
  confirmaciones = [],
}: PedidoRevisionProps) {
  const [isPending, startTransition] = useTransition();
  const [errores, setErrores] = useState<Partial<Record<TipoBloque, string>>>({});
  const [reabrirTipo, setReabrirTipo] = useState<TipoBloque | null>(null);

  const gobernanza = evaluarBloquesReales(bloques);

  function handleCerrar(tipo: TipoBloque) {
    setErrores((prev) => ({ ...prev, [tipo]: undefined }));
    startTransition(async () => {
      const res = await actionCerrarBloque(pedido.id, tipo);
      if (!res.ok) {
        setErrores((prev) => ({ ...prev, [tipo]: res.error || "No se pudo cerrar el bloque." }));
      }
    });
  }

  async function handleConfirmReabrir(motivo: string) {
    if (!reabrirTipo) return;
    const tipo = reabrirTipo;
    setErrores((prev) => ({ ...prev, [tipo]: undefined }));
    startTransition(async () => {
      const res = await actionReabrirBloque(pedido.id, tipo, motivo);
      setReabrirTipo(null);
      if (!res.ok) {
        setErrores((prev) => ({ ...prev, [tipo]: res.error || "No se pudo reabrir el bloque." }));
      }
    });
  }

  // 1. Checklist Bloque Diseño
  const hayDiseno = disenos.length > 0;
  const hayAprobado = disenos.some((d) => d.estado === "APROBADO");
  const checksDiseno: BloqueCheckItem[] = [
    { id: "dis-sub", label: "Propuesta de diseño cargada", ok: hayDiseno, detalle: hayDiseno ? `${disenos.length} arte(s)` : "Falta propuesta" },
    { id: "dis-apr", label: "Mockup aprobado por cliente", ok: hayAprobado, detalle: hayAprobado ? "Aprobado" : "Pendiente" },
    { id: "dis-cierre", label: "Bloque cerrado y protegido", ok: gobernanza.diseno.cerrado, detalle: gobernanza.diseno.cerrado ? "Cerrado" : "Abierto" },
  ];

  // 2. Checklist Bloque Lista de Prendas
  const contratadas = Number(resumenProduccion?.totales?.cantidadContratada ?? totalPrendas ?? 0);
  const registradas = Number(resumenProduccion?.totales?.prendasRegistradas ?? 0);
  const prendasCompletas = contratadas > 0 && registradas >= contratadas;
  const checksLista: BloqueCheckItem[] = [
    { id: "lst-cant", label: "Prendas contratadas completas", ok: prendasCompletas, detalle: `${registradas}/${contratadas}` },
    { id: "lst-tallas", label: "Tallas asignadas a cada prenda", ok: prendasCompletas, detalle: prendasCompletas ? "Completas" : "Pendiente" },
    { id: "lst-dorsales", label: "Dorsales y apodos asignados", ok: prendasCompletas, detalle: prendasCompletas ? "Verificados" : "Pendiente" },
    { id: "lst-cierre", label: "Bloque cerrado para taller", ok: gobernanza.lista.cerrado, detalle: gobernanza.lista.cerrado ? "Cerrado" : "Abierto" },
  ];

  // 3. Checklist Bloque Comercial
  const hayEnvio = Boolean(datosEnvio && (datosEnvio.ciudad || datosEnvio.agencia));
  const listaConfirmaciones = Array.isArray(confirmaciones) ? confirmaciones : [];
  const hayConfirmacion = listaConfirmaciones.length > 0;
  const primeraConfirmacion = listaConfirmaciones[0];
  const adelantoNum = Number(primeraConfirmacion?.adelantoRecibido ?? 0);
  const hayAdelanto = !isNaN(adelantoNum) && adelantoNum > 0;
  const checksComercial: BloqueCheckItem[] = [
    { id: "com-env", label: "Datos de despacho y entrega", ok: hayEnvio, detalle: hayEnvio ? `Envío a ${datosEnvio?.ciudad || "destino"}` : "Sin registrar" },
    { id: "com-prof", label: "Proforma comercial emitida", ok: hayConfirmacion, detalle: hayConfirmacion ? `v${primeraConfirmacion?.version ?? 1}` : "Sin emitir" },
    { id: "com-adel", label: "Adelanto 50% confirmado", ok: hayAdelanto, detalle: hayAdelanto ? `S/ ${adelantoNum.toFixed(2)}` : "Pendiente" },
    { id: "com-cierre", label: "Bloque comercial cerrado", ok: gobernanza.comercial.cerrado, detalle: gobernanza.comercial.cerrado ? "Cerrado" : "Abierto" },
  ];

  const bDiseno = gobernanza.diseno.bloque;
  const bLista = gobernanza.lista.bloque;
  const bComercial = gobernanza.comercial.bloque;

  return (
    <section id="bloques" className={sharedStyles.sectionBlock} style={{ scrollMarginTop: "16px" }}>
      <div className={sharedStyles.sectionHeaderRow}>
        <div>
          <h2 className={sharedStyles.sectionTitle} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ShieldCheck size={20} color="var(--sky-dark)" />
            BLOQUES DEL PEDIDO
          </h2>
          <p className={sharedStyles.sectionSubtitle}>
            Cada bloque tiene sus puntos a cumplir antes de cerrarlo. Los 3 deben quedar cerrados para taller.
          </p>
        </div>
      </div>

      <div className={styles.gridBloques}>
        <BloqueCard
          titulo="Bloque Diseño" icono={Palette} cerrado={gobernanza.diseno.cerrado}
          cerradoPor={bDiseno?.cerradoPor?.nombre} version={bDiseno?.versiones?.[0]?.numero}
          checks={checksDiseno} error={errores.DISENO} isPending={isPending}
          onCerrar={() => handleCerrar("DISENO")} onReabrir={() => setReabrirTipo("DISENO")}
          actionScrollId="seccion-diseno" actionLabel="Ir a Mockups"
        />

        <BloqueCard
          titulo="Bloque Lista de Prendas" icono={ClipboardList} cerrado={gobernanza.lista.cerrado}
          cerradoPor={bLista?.cerradoPor?.nombre} version={bLista?.versiones?.[0]?.numero}
          checks={checksLista} error={errores.LISTA} isPending={isPending}
          onCerrar={() => handleCerrar("LISTA")} onReabrir={() => setReabrirTipo("LISTA")}
          actionHref={`/pedidos/${pedido.codigo}/prendas`} actionLabel="Ir a Prendas"
        />

        <BloqueCard
          titulo="Bloque Comercial" icono={BadgeDollarSign} cerrado={gobernanza.comercial.cerrado}
          cerradoPor={bComercial?.cerradoPor?.nombre} version={bComercial?.versiones?.[0]?.numero}
          checks={checksComercial} error={errores.COMERCIAL} isPending={isPending}
          onCerrar={() => handleCerrar("COMERCIAL")} onReabrir={() => setReabrirTipo("COMERCIAL")}
          actionHref={`/pedidos/${pedido.codigo}/proforma`} actionLabel="Ir a Proforma"
        />
      </div>

      <ModalReabrirBloque
        isOpen={Boolean(reabrirTipo)} tipo={reabrirTipo}
        onClose={() => setReabrirTipo(null)} onConfirm={handleConfirmReabrir} isPending={isPending}
      />
    </section>
  );
}
