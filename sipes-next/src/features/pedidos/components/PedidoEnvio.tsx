"use client";

import { useState, useTransition } from "react";
import { Truck, CircleAlert, Lock, Key, ShieldAlert, CheckCircle2, Eye, EyeOff, Printer } from "lucide-react";
import type { DatosEnvioItem } from "../api/comercial.api";
import { actionEliminarDatosEnvio } from "../actions/envio.actions";
import { ModalEnvioForm } from "./ModalEnvioForm";
import { ModalConfirmacion } from "@/components/ui/ModalConfirmacion";
import { EtiquetaDespacho } from "./EtiquetaDespacho";
import styles from "./pedidos.module.css";

interface PedidoEnvioProps {
  pedidoId: string;
  datosEnvio: DatosEnvioItem | null;
  saldoPendiente?: number;
  userRole?: string;
  pedidoCodigo?: string;
  totalPrendas?: number;
}

export function PedidoEnvio({
  pedidoId,
  datosEnvio,
  saldoPendiente = 0,
  userRole,
  pedidoCodigo = "SUB-XXXX",
  totalPrendas = 0,
}: PedidoEnvioProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEtiquetaOpen, setIsEtiquetaOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [mostrarClaveAdmin, setMostrarClaveAdmin] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const esAdminOCoordinador =
    !userRole ||
    userRole === "ADMINISTRADOR" ||
    userRole === "COORDINADOR_OPERATIVO" ||
    userRole === "COORDINADOR_CLIENTE";

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
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {datosEnvio && (
            <button
              type="button"
              className={styles.cardActionGhost}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
              onClick={() => setIsEtiquetaOpen(true)}
              title="Generar e imprimir etiqueta de despacho A5"
            >
              <Printer size={14} />
              <span>Imprimir Etiqueta A5</span>
            </button>
          )}
          <button
            type="button"
            className={datosEnvio ? styles.cardActionGhost : styles.cardAction}
            onClick={() => setIsModalOpen(true)}
          >
            {datosEnvio ? "Editar" : "+ Registrar"}
          </button>
        </div>
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

          {/* SEMÁFORO DE RETENCIÓN DE CLAVE DE RECOJO (R-ENVIOS) */}
          <div
            style={{
              marginTop: "14px",
              padding: "12px 14px",
              borderRadius: "8px",
              border: `1px solid ${saldoPendiente > 0 ? "#fecaca" : "#bbf7d0"}`,
              background: saldoPendiente > 0 ? "#fef2f2" : "#f0fdf4",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {saldoPendiente > 0 ? (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "#ef4444",
                      color: "#ffffff",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "700",
                      letterSpacing: "0.5px",
                    }}
                  >
                    🔴 RETENER CLAVE
                  </span>
                ) : (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "#16a34a",
                      color: "#ffffff",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "700",
                      letterSpacing: "0.5px",
                    }}
                  >
                    🟢 ENTREGAR CLAVE
                  </span>
                )}
                <span style={{ fontSize: "12px", fontWeight: 600, color: saldoPendiente > 0 ? "#991b1b" : "#166534" }}>
                  {saldoPendiente > 0
                    ? `Debe S/ ${saldoPendiente.toFixed(2)} · Retención activa`
                    : "Pedido 100% cancelado · Autorizado para entrega"}
                </span>
              </div>

              {/* Clave de recojo */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "12px", color: "#64748b" }}>Clave de recojo:</span>
                {datosEnvio.codigoRecojo ? (
                  saldoPendiente > 0 ? (
                    esAdminOCoordinador ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <code style={{ background: "#ffffff", border: "1px solid #cbd5e1", padding: "2px 8px", borderRadius: "4px", fontWeight: "bold", fontSize: "13px", color: "#0f172a" }}>
                          {mostrarClaveAdmin ? datosEnvio.codigoRecojo : "••••••••"}
                        </code>
                        <button
                          type="button"
                          onClick={() => setMostrarClaveAdmin((v) => !v)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", padding: "2px" }}
                          title={mostrarClaveAdmin ? "Ocultar clave" : "Ver clave (solo Admin/Coordinador)"}
                        >
                          {mostrarClaveAdmin ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </span>
                    ) : (
                      <span style={{ fontSize: "11px", color: "#dc2626", fontWeight: "bold", background: "#fee2e2", padding: "2px 8px", borderRadius: "4px" }}>
                        🔒 BLOQUEADO POR DEUDA
                      </span>
                    )
                  ) : (
                    <code style={{ background: "#ffffff", border: "1px solid #86efac", color: "#166534", padding: "2px 8px", borderRadius: "4px", fontWeight: "bold", fontSize: "13px" }}>
                      {datosEnvio.codigoRecojo}
                    </code>
                  )
                ) : (
                  <span style={{ fontSize: "12px", color: "#94a3b8", fontStyle: "italic" }}>
                    Sin registrar
                  </span>
                )}
              </div>
            </div>

            {saldoPendiente > 0 ? (
              <p style={{ margin: "8px 0 0 0", fontSize: "11px", color: "#b91c1c", lineHeight: 1.4 }}>
                ⚠️ <strong>Regla de Despacho:</strong> Retener la clave de retiro de agencia hasta que el cliente liquide el 100% del saldo pendiente.
              </p>
            ) : (
              <p style={{ margin: "8px 0 0 0", fontSize: "11px", color: "#15803d", lineHeight: 1.4 }}>
                ✅ <strong>Despacho Habilitado:</strong> Pedido cancelado al 100%. Puedes entregar la clave de recojo al cliente.
              </p>
            )}
          </div>

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

      <EtiquetaDespacho
        isOpen={isEtiquetaOpen}
        onClose={() => setIsEtiquetaOpen(false)}
        pedidoCodigo={pedidoCodigo}
        datosEnvio={datosEnvio}
        totalPrendas={totalPrendas}
      />
    </section>
  );
}