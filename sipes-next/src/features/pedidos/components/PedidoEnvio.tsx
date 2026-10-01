"use client";

import { useState, useTransition } from "react";
import { Truck, CircleAlert } from "lucide-react";
import type { DatosEnvioItem } from "../api/comercial.api";
import { actionEliminarDatosEnvio } from "../actions/envio.actions";
import { ModalEnvioForm } from "./ModalEnvioForm";
import { ModalConfirmacion } from "@/components/ui/ModalConfirmacion";
import styles from "./pedidos.module.css";

interface PedidoEnvioProps {
  pedidoId: string;
  datosEnvio: DatosEnvioItem | null;
}

export function PedidoEnvio({ pedidoId, datosEnvio }: PedidoEnvioProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleEliminar = () => {
    setConfirmDeleteOpen(true);
  };

  const ejecutarEliminar = () => {
    setErrorMsg(null);
    setIsDeleting(true);
    startTransition(async () => {
      const res = await actionEliminarDatosEnvio(pedidoId);
      setIsDeleting(false);
      setConfirmDeleteOpen(false);
      if (!res.ok) {
        setErrorMsg(res.error || "No se pudo eliminar los datos de envío.");
      }
    });
  };

  return (
    <section className={styles.sectionBlock}>
      <div className={styles.sectionHeaderRow}>
        <div className={styles.sectionTitleRow}>
          <span className={styles.cardIcon}>
            <Truck size={16} />
          </span>
          <h2 className={styles.sectionTitle}>Datos de envío</h2>
        </div>
        <button
          type="button"
          className={datosEnvio ? styles.cardActionGhost : styles.cardAction}
          onClick={() => setIsModalOpen(true)}
        >
          {datosEnvio ? "Editar" : "+ Registrar"}
        </button>
      </div>

      {datosEnvio === null ? (
        <div className={styles.emptyNote}>
          <CircleAlert size={16} />
          <span>Este pedido todavía no tiene datos de envío registrados.</span>
        </div>
      ) : (
        <>
          <dl className={styles.dataGrid4}>
            <div>
              <dt>Nombre completo</dt>
              <dd className={datosEnvio.nombreCompleto ? undefined : styles.valueMuted}>
                {datosEnvio.nombreCompleto || "Sin completar"}
              </dd>
            </div>
            <div>
              <dt>DNI</dt>
              <dd className={datosEnvio.dni ? undefined : styles.valueMuted}>
                {datosEnvio.dni || "Sin completar"}
              </dd>
            </div>
            <div>
              <dt>Celular</dt>
              <dd className={datosEnvio.celular ? undefined : styles.valueMuted}>
                {datosEnvio.celular || "Sin completar"}
              </dd>
            </div>
            <div>
              <dt>Ciudad</dt>
              <dd className={datosEnvio.ciudad ? undefined : styles.valueMuted}>
                {datosEnvio.ciudad || "Sin completar"}
              </dd>
            </div>
            <div>
              <dt>Agencia</dt>
              <dd className={datosEnvio.agencia ? undefined : styles.valueMuted}>
                {datosEnvio.agencia || "Sin completar"}
              </dd>
            </div>
            <div>
              <dt>Referencia</dt>
              <dd className={datosEnvio.referencia ? undefined : styles.valueMuted}>
                {datosEnvio.referencia || "Sin completar"}
              </dd>
            </div>
            <div>
              <dt>Correo</dt>
              <dd className={datosEnvio.correo ? undefined : styles.valueMuted}>
                {datosEnvio.correo || "Sin completar"}
              </dd>
            </div>
          </dl>

          <div className={styles.envioDeleteRow}>
            {errorMsg && (
              <span className={styles.envioError} role="alert">
                {errorMsg}
              </span>
            )}
            <button
              type="button"
              className={styles.envioDeleteButton}
              onClick={handleEliminar}
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando…" : "Eliminar datos de envío"}
            </button>
          </div>
        </>
      )}

      {isModalOpen && (
        <ModalEnvioForm
          key={datosEnvio ? JSON.stringify(datosEnvio) : "nuevo"}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          pedidoId={pedidoId}
          initial={datosEnvio}
        />
      )}

      <ModalConfirmacion
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={ejecutarEliminar}
        title="Eliminar Datos de Envío"
        description="¿Confirmas que deseas eliminar los datos de rotulado para despacho de este pedido? Tendrás que registrarlos nuevamente antes del despacho."
        confirmText="Eliminar Datos"
        cancelText="Volver"
        variant="danger"
        isPending={isDeleting}
      />
    </section>
  );
}