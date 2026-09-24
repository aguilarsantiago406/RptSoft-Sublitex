"use client";

import { useState, useTransition } from "react";
import type { DatosEnvioItem } from "../api/comercial.api";
import { actionEliminarDatosEnvio } from "../actions/envio.actions";
import { ModalEnvioForm } from "./ModalEnvioForm";
import styles from "./pedidos.module.css";

interface PedidoEnvioProps {
  pedidoId: string;
  datosEnvio: DatosEnvioItem | null;
}

export function PedidoEnvio({ pedidoId, datosEnvio }: PedidoEnvioProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleEliminar = () => {
    const confirmar = window.confirm("¿Eliminar los datos de envío de este pedido?");
    if (!confirmar) return;

    setErrorMsg(null);
    setIsDeleting(true);
    startTransition(async () => {
      const res = await actionEliminarDatosEnvio(pedidoId);
      setIsDeleting(false);
      if (!res.ok) {
        setErrorMsg(res.error || "No se pudo eliminar los datos de envío.");
      }
    });
  };

  return (
    <section className={styles.sectionBlock}>
      <div className={styles.sectionHeaderRow}>
        <div>
          <h2 className={styles.sectionTitle}>ENVÍO A PROVINCIA (R-K08)</h2>
          <p className={styles.sectionSubtitle}>
            Los siete datos de rotulado de la matriz comercial · se usan para el despacho a
            provincia
          </p>
        </div>
        <div className={styles.groupsHeaderActions}>
          {datosEnvio ? (
            <button
              type="button"
              className={styles.envioEditButton}
              onClick={() => setIsModalOpen(true)}
            >
              Editar datos de envío
            </button>
          ) : (
            <button
              type="button"
              className={styles.addGrupoButton}
              onClick={() => setIsModalOpen(true)}
            >
              + Registrar envío
            </button>
          )}
        </div>
      </div>

      {datosEnvio === null ? (
        <p className="notice">Este pedido todavía no tiene datos de envío registrados.</p>
      ) : (
        <>
          <dl className={styles.dataGrid4}>
            <div>
              <dt>Nombre completo</dt>
              <dd>{datosEnvio.nombreCompleto || "—"}</dd>
            </div>
            <div>
              <dt>DNI</dt>
              <dd>{datosEnvio.dni || "—"}</dd>
            </div>
            <div>
              <dt>Celular</dt>
              <dd>{datosEnvio.celular || "—"}</dd>
            </div>
            <div>
              <dt>Ciudad</dt>
              <dd>{datosEnvio.ciudad || "—"}</dd>
            </div>
            <div>
              <dt>Agencia</dt>
              <dd>{datosEnvio.agencia || "—"}</dd>
            </div>
            <div>
              <dt>Referencia</dt>
              <dd>{datosEnvio.referencia || "—"}</dd>
            </div>
            <div>
              <dt>Correo</dt>
              <dd>{datosEnvio.correo || "—"}</dd>
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

      <ModalEnvioForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        pedidoId={pedidoId}
        initial={datosEnvio}
      />
    </section>
  );
}