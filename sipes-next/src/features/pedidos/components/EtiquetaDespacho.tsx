"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Printer, X, PackageCheck, AlertCircle } from "lucide-react";
import { useIsClient } from "@/lib/useIsClient";
import type { DatosEnvioItem } from "../api/comercial.api";
import styles from "./etiqueta.module.css";

interface EtiquetaDespachoProps {
  isOpen: boolean;
  onClose: () => void;
  pedidoCodigo: string;
  datosEnvio: DatosEnvioItem | null;
  totalPrendas: number;
}

export function EtiquetaDespacho({
  isOpen,
  onClose,
  pedidoCodigo,
  datosEnvio,
  totalPrendas,
}: EtiquetaDespachoProps) {
  const isClient = useIsClient();
  const [bultosEstimados, setBultosEstimados] = useState("1 Bulto");
  const [pesoEstimado, setPesoEstimado] = useState(
    totalPrendas > 0 ? `${(totalPrendas * 0.28).toFixed(1)} kg aprox.` : "Aprox. 5.0 kg"
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !isClient) return null;

  const handleImprimir = () => {
    window.print();
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    `SUBLITEX-PEDIDO:${pedidoCodigo}-DEST:${datosEnvio?.nombreCompleto || ""}-CIUDAD:${datosEnvio?.ciudad || ""}`
  )}`;

  return createPortal(
    <div
      className={styles.modalOverlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`${styles.modalHeader} ${styles.noPrint}`}>
          <div className={styles.modalTitle}>
            <Printer size={16} />
            <span>Generador de Etiqueta A5 para Despacho</span>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            <X size={16} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {!datosEnvio || !datosEnvio.nombreCompleto ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#991b1b",
                padding: "8px 12px",
                borderRadius: "6px",
                marginBottom: "10px",
                fontSize: "0.8rem",
              }}
            >
              <AlertCircle size={16} />
              <span>
                Faltan datos de envío registrados. Por favor completa los datos de rotulado antes de imprimir la etiqueta.
              </span>
            </div>
          ) : null}

          <div
            className={styles.noPrint}
            style={{
              display: "flex",
              gap: "12px",
              marginBottom: "8px",
              background: "#ffffff",
              padding: "6px 10px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              fontSize: "0.78rem",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <PackageCheck size={15} color="#0284c7" />
              <strong>Embalaje:</strong>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span>Bultos:</span>
              <input
                type="text"
                value={bultosEstimados}
                onChange={(e) => setBultosEstimados(e.target.value)}
                style={{
                  border: "1px solid #cbd5e1",
                  borderRadius: "4px",
                  padding: "2px 6px",
                  fontSize: "0.78rem",
                  width: "85px",
                }}
              />
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span>Peso:</span>
              <input
                type="text"
                value={pesoEstimado}
                onChange={(e) => setPesoEstimado(e.target.value)}
                style={{
                  border: "1px solid #cbd5e1",
                  borderRadius: "4px",
                  padding: "2px 6px",
                  fontSize: "0.78rem",
                  width: "110px",
                }}
              />
            </label>
          </div>

          {/* Area Imprimible A5 */}
          <div className={styles.printOnlyArea}>
            <div className={styles.etiquetaCard}>
              {/* Header Remitente Sublitex */}
              <div className={styles.etiquetaHeader}>
                <div className={styles.remitenteCol}>
                  <h1 className={styles.brandTitle}>SUBLITEX PERÚ</h1>
                  <p className={styles.brandSub}>Confección y Sublimación Deportiva Textil</p>
                  <div className={styles.remitenteDetails}>
                    <div><strong>REMITENTE:</strong> SUBLITEX PERÚ S.A.C. · RUC: 20608912345</div>
                    <div>Jr. San Cristóbal 1565 Int. 302, Gamarra, La Victoria · Lima - Perú</div>
                    <div>Teléfono / Central: (01) 474-0000 · WhatsApp: (+51) 987 654 321</div>
                  </div>
                </div>
                <div className={styles.etiquetaBadgeArea}>
                  <span className={styles.badgeDespacho}>ROTULADO DE ENVÍO</span>
                  <div className={styles.pedidoCodigoText}>{pedidoCodigo}</div>
                  <div style={{ fontSize: "0.65rem", color: "#444444", marginTop: "1px" }}>
                    FECHA: {new Date().toLocaleDateString("es-PE")}
                  </div>
                </div>
              </div>

              {/* Grid Central: Destinatario vs Destino */}
              <div className={styles.etiquetaGrid}>
                {/* Caja Destinatario */}
                <div className={styles.destinatarioBox}>
                  <span className={styles.sectionLabel}>DESTINATARIO</span>
                  <div className={styles.destinatarioNombre}>
                    {datosEnvio?.nombreCompleto || "NOMBRE DEL CLIENTE"}
                  </div>
                  <div className={styles.destinatarioDatos}>
                    <div>
                      <strong>DNI / RUC:</strong> {datosEnvio?.dni || "---"}
                    </div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 800, marginTop: "2px" }}>
                      <strong>TELÉFONO:</strong> {datosEnvio?.celular || "---"}
                    </div>
                    {datosEnvio?.referencia && (
                      <div style={{ marginTop: "2px", fontSize: "0.72rem" }}>
                        <strong>Ref / Dir:</strong> {datosEnvio.referencia}
                      </div>
                    )}
                  </div>
                </div>

                {/* Caja Destino / Agencia */}
                <div className={styles.agenciaCiudadBox}>
                  <div>
                    <span className={styles.sectionLabel}>CIUDAD DE DESTINO</span>
                    <div className={styles.ciudadText}>
                      {datosEnvio?.ciudad ? datosEnvio.ciudad.toUpperCase() : "---"}
                    </div>
                  </div>
                  <div>
                    <span className={styles.sectionLabel} style={{ background: "#0284c7" }}>
                      AGENCIA DE ENVÍO
                    </span>
                    <div className={styles.agenciaText}>
                      {datosEnvio?.agencia ? datosEnvio.agencia.toUpperCase() : "---"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer de la etiqueta: Carga + QR */}
              <div className={styles.etiquetaFooterGrid}>
                <div className={styles.footerInfoBlock}>
                  <div><strong>CONTENIDO:</strong> Confección textil deportiva</div>
                  <div><strong>CANTIDAD:</strong> {totalPrendas > 0 ? `${totalPrendas} prendas` : "Prendas según pedido"}</div>
                </div>

                <div className={styles.footerInfoBlock}>
                  <div><strong>BULTOS:</strong> {bultosEstimados}</div>
                  <div><strong>PESO EST.:</strong> {pesoEstimado}</div>
                </div>

                <div className={styles.qrContainer}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrUrl}
                    alt={`QR Pedido ${pedidoCodigo}`}
                    className={styles.qrImage}
                  />
                  <span className={styles.qrCaption}>{pedidoCodigo}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`${styles.modalFooter} ${styles.noPrint}`}>
          <button type="button" className={styles.btnCancel} onClick={onClose}>
            Cerrar
          </button>
          <button type="button" className={styles.btnPrint} onClick={handleImprimir}>
            <Printer size={15} />
            <span>Imprimir Etiqueta A5</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
