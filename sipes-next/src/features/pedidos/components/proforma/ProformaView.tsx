"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { FileCheck, FileDown, AlertTriangle, Image as ImageIcon, Printer, DollarSign, Loader2 } from "lucide-react";
import type { PedidoDetalle } from "../../types/pedido";
import { formatDate } from "@/lib/format/date";
import type { TarifaItem, DatosEnvioItem, ConfirmacionItem } from "../../api/comercial.api";
import { calcularProformaCompleta, type PrendaProformaItem } from "../../utils/proforma.utils";
import { actionEmitirConfirmacion } from "../../actions/comercial.actions";
import { ModalRegistrarAdelanto } from "./ModalRegistrarAdelanto";
import styles from "./proforma.module.css";

interface ProformaViewProps {
  pedido: PedidoDetalle;
  tarifas: TarifaItem[];
  datosEnvio: DatosEnvioItem | null;
  confirmaciones: ConfirmacionItem[];
  prendas: PrendaProformaItem[];
  mockupUrl: string | null;
}

export function ProformaView({
  pedido,
  tarifas,
  datosEnvio,
  confirmaciones,
  prendas,
  mockupUrl,
}: ProformaViewProps) {
  const [isEmitting, startEmitTransition] = useTransition();
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [isAdelantoModalOpen, setIsAdelantoModalOpen] = useState(false);
  const [selectedConfirmacion, setSelectedConfirmacion] = useState<ConfirmacionItem | null>(null);

  // Cálculo matemático dinámico sobre cantidades contratadas oficiales
  const calculo = useMemo(() => {
    return calcularProformaCompleta(pedido, tarifas, prendas);
  }, [pedido, tarifas, prendas]);

  const totalPrendasContratadas = useMemo(() => {
    return pedido.grupos.reduce((acc, g) => acc + g.cantidadContratada, 0);
  }, [pedido.grupos]);

  const ultimaConfirmacion = confirmaciones && confirmaciones.length > 0 ? confirmaciones[0] : null;

  function handlePrint() {
    window.print();
  }

  function handleEmitirProformaDirecta() {
    startEmitTransition(async () => {
      // Se emite directamente con adelanto inicial en 0 sin pedir recargos manuales (calcula el sistema)
      const res = await actionEmitirConfirmacion(pedido.id, {
        adelantoRecibido: 0,
        comprobante: "NINGUNO",
      });

      if (res.ok) {
        setFeedbackMsg("¡Proforma oficial emitida y PDF generado con éxito!");
        setTimeout(() => setFeedbackMsg(null), 4000);
      } else {
        setFeedbackMsg(res.error || "Ocurrió un error al emitir la proforma.");
      }
    });
  }

  function handleOpenRegistrarAdelanto(conf: ConfirmacionItem) {
    setSelectedConfirmacion(conf);
    setIsAdelantoModalOpen(true);
  }

  const fechaEmision = new Date().toLocaleDateString("es-PE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className={styles.container}>
      {/* Barra de herramientas superior compacta */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <span>Proforma <strong>{pedido.codigo}</strong> · {totalPrendasContratadas} prendas contratadas</span>
        </div>
        <div className={styles.toolbarActions}>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={handlePrint}
            title="Imprimir o guardar como PDF"
          >
            <Printer size={14} />
            Imprimir A4
          </button>

          {ultimaConfirmacion && (
            <button
              type="button"
              className={styles.btnSecondary}
              style={{ background: "#ecfdf5", color: "#065f46", borderColor: "#a7f3d0" }}
              onClick={() => handleOpenRegistrarAdelanto(ultimaConfirmacion)}
              title="Registrar el abono del cliente"
            >
              <DollarSign size={14} />
              Registrar Adelanto (v{ultimaConfirmacion.version})
            </button>
          )}

          <button
            type="button"
            className={styles.btnEmitir}
            onClick={handleEmitirProformaDirecta}
            disabled={isEmitting}
            title="Genera y descarga el PDF oficial sin trabas"
          >
            {isEmitting ? <Loader2 size={14} className={styles.spin} /> : <FileCheck size={14} />}
            {isEmitting ? "Generando PDF..." : "Emitir Proforma (PDF Inmediato)"}
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div style={{
          padding: "10px 16px",
          background: "#ecfdf5",
          border: "1px solid #10b981",
          borderRadius: "8px",
          color: "#065f46",
          fontSize: "0.85rem",
          fontWeight: 600,
          marginBottom: "16px",
        }}>
          {feedbackMsg}
        </div>
      )}

      {/* Alerta si faltan tarifas en la base de datos */}
      {calculo.tieneTarifasFaltantes && (
        <div className={styles.warningBanner}>
          <AlertTriangle size={18} style={{ flexShrink: 0 }} />
          <div>
            <strong>Advertencia de catálogo comercial:</strong> Se detectaron prendas cuya tarifa vigente no está configurada en la base de datos (S/ 0.00). Configura las tarifas del catálogo para obtener el cálculo comercial exacto y evitar discrepancias al congelar la orden.
          </div>
        </div>
      )}

      {/* Historial de Confirmaciones Oficiales emitidas */}
      {confirmaciones && confirmaciones.length > 0 && (
        <section className={styles.confirmacionesSection}>
          <div className={styles.confirmacionesHeader}>
            <div>
              <div className={styles.confirmacionesTitle}>
                <FileCheck size={18} color="#059669" />
                Historial de Confirmaciones Comerciales Oficiales
              </div>
              <div className={styles.confirmacionesSubtitle}>
                Contratos comerciales emitidos y congelados con respaldo en PDF oficial.
              </div>
            </div>
          </div>

          <div className={styles.confirmacionesList}>
            {confirmaciones.map((c) => (
              <div key={c.id} className={styles.confirmacionCard}>
                <div className={styles.confirmacionTop}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span className={styles.confirmacionVersionBadge}>
                      v{c.version}
                    </span>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#1e293b" }}>
                      Comprobante: {c.comprobante}
                    </span>
                  </div>

                  <div className={styles.confirmacionMeta}>
                    <span>Emitido: {new Date(c.creadoEn).toLocaleString("es-PE")}</span>
                    {c.emitidaPor?.nombre && <span>Por: {c.emitidaPor.nombre}</span>}
                    {c.pdfUrl && (
                      <a
                        href={c.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.btnPdfDownload}
                      >
                        <FileDown size={14} />
                        Descargar PDF Oficial (v{c.version})
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => handleOpenRegistrarAdelanto(c)}
                      style={{
                        background: "#10b981",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "6px",
                        padding: "4px 8px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <DollarSign size={12} />
                      Registrar Adelanto
                    </button>
                  </div>
                </div>

                <div className={styles.confirmacionGrid}>
                  <div className={styles.confirmacionMetric}>
                    <span className={styles.confirmacionMetricLabel}>Total sin IGV</span>
                    <span className={styles.confirmacionMetricValue}>S/ {Number(c.totalSinIgv).toFixed(2)}</span>
                  </div>
                  {c.igvCalculado !== null && c.igvCalculado !== undefined && (
                    <div className={styles.confirmacionMetric}>
                      <span className={styles.confirmacionMetricLabel}>IGV (18%)</span>
                      <span className={styles.confirmacionMetricValue}>S/ {Number(c.igvCalculado).toFixed(2)}</span>
                    </div>
                  )}
                  <div className={styles.confirmacionMetric}>
                    <span className={styles.confirmacionMetricLabel}>Total Orden</span>
                    <span className={styles.confirmacionMetricValue}>
                      S/ {(Number(c.totalSinIgv) + Number(c.igvCalculado || 0)).toFixed(2)}
                    </span>
                  </div>
                  <div className={styles.confirmacionMetric}>
                    <span className={styles.confirmacionMetricLabel}>Adelanto Recibido</span>
                    <span className={styles.confirmacionMetricValue} style={{ color: "#15803d" }}>
                      S/ {Number(c.adelantoRecibido).toFixed(2)}
                    </span>
                  </div>
                  <div className={styles.confirmacionMetric}>
                    <span className={styles.confirmacionMetricLabel}>Saldo Pendiente</span>
                    <span className={styles.confirmacionMetricValue} style={{ color: "#b91c1c" }}>
                      S/ {Number(c.saldo).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ========================================================= */}
      {/* HOJA PROFORMA FORMAL Y LIMPIA                            */}
      {/* ========================================================= */}
      <div className={styles.sheet}>
        <header className={styles.headerGrid}>
          <div className={styles.brandCol}>
            <div className={styles.logoWrapper}>
              <Image
                src="/logo-sublitex.png"
                alt="Sublitex"
                width={160}
                height={42}
                className={styles.brandLogoImg}
                priority
              />
            </div>
            <div className={styles.brandSub}>
              <strong>GRAN CARTEL S.A.C.</strong> · RUC 20544457846<br />
              Av. Aramburú cuadra 7 — Surquillo, Lima<br />
              WhatsApp 944 941 179 · Sublimación digital deportiva
            </div>
          </div>
          <div className={styles.docCol}>
            <div className={styles.docTitle}>Proforma de Pedido</div>
            <div className={styles.docCode}>{pedido.codigo}</div>
            <div className={styles.docMeta} suppressHydrationWarning>Emisión: {fechaEmision}</div>
            <div className={styles.docMeta}>
              Validez de la oferta: 15 días calendario
            </div>
          </div>
        </header>

        {/* 1 y 2. Cabecera: Datos del Cliente, Condiciones y Mockup Oficial al Costado */}
        <section className={styles.clientAndMockupGrid}>
          {/* Columna Izquierda: Datos del Cliente y Condiciones en columna amplia */}
          <div className={styles.clientDetailsCard}>
            <div>
              <div className={styles.infoBlockTitle}>1 · Identificación del Cliente</div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Cliente / Grupo:</span>
                <span className={styles.infoValue}>{pedido.cliente.nombre}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Destino / Ciudad:</span>
                <span className={styles.infoValue}>
                  {pedido.cliente.ciudad || datosEnvio?.ciudad || "Lima"}
                </span>
              </div>
              {pedido.cliente.telefono && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Teléfono:</span>
                  <span className={styles.infoValue}>{pedido.cliente.telefono}</span>
                </div>
              )}
            </div>

            <div className={styles.clientDetailsDivider} />

            <div>
              <div className={styles.infoBlockTitle}>Condiciones Comerciales</div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Fecha Entrega:</span>
                <span className={styles.infoValue} suppressHydrationWarning>
                  {formatDate(pedido.fechaCompromiso)}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Moneda:</span>
                <span className={styles.infoValue}>Soles (PEN)</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Forma de Pago:</span>
                <span className={styles.infoValue}>50% Adelanto (iniciar corte) / 50% Saldo a entrega</span>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Mockup Oficial al Costado */}
          <div className={styles.mockupSideCard}>
            <div className={styles.mockupCardHeader}>
              <span>2 · Diseño Aprobado</span>
              <span className={styles.mockupBadge}>Mockup Oficial</span>
            </div>
            <div className={styles.mockupImgWrapper}>
              {mockupUrl ? (
                <a
                  href={mockupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.mockupLink}
                  title="Click para ver mockup oficial en alta resolución"
                >
                  <Image
                    src={mockupUrl}
                    alt="Mockup de Diseño Aprobado"
                    className={styles.mockupImg}
                    width={400}
                    height={220}
                    unoptimized
                  />
                </a>
              ) : (
                <div className={styles.mockupPlaceholder}>
                  <ImageIcon size={32} />
                  <span>Mockup oficial de confección en proceso de validación técnica</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 3. Tabla de Cotización Itemizada */}
        <div className={styles.tableContainer}>
          <div className={styles.infoBlockTitle} style={{ padding: "8px 12px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
            3 · Detalle de Cotización
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: "46px" }}>#</th>
                <th>Descripción de Producto</th>
                <th>Detalle Técnico</th>
                <th style={{ width: "90px", textAlign: "center" }}>Cant.</th>
                <th style={{ width: "130px", textAlign: "right" }}>P. Unit.</th>
                <th style={{ width: "140px", textAlign: "right" }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {calculo.itemsCotizados.map((it, idx) => (
                <tr key={it.grupoId}>
                  <td style={{ color: "#64748b" }}>{idx + 1}</td>
                  <td>
                    <strong>{it.nombre}</strong>
                  </td>
                  <td>Sublimado digital ({it.tipoProductoNombre})</td>
                  <td style={{ textAlign: "center", fontWeight: 700 }}>
                    {it.cantidad}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    S/ {it.precioUnitario.toFixed(2)}
                    {!it.tarifaEncontrada && (
                      <div>
                        <span className={styles.noTarifaTag}>Sin tarifa en catálogo</span>
                      </div>
                    )}
                  </td>
                  <td style={{ textAlign: "right", fontWeight: 700 }}>
                    S/ {it.subtotal.toFixed(2)}
                  </td>
                </tr>
              ))}

              {/* Fila de Recargo Automático por Tallas Especiales si existen prendas con recargo */}
              {calculo.recargoTallas.total > 0 && (
                <tr className={styles.surchargeRow}>
                  <td style={{ color: "#64748b" }}>•</td>
                  <td colSpan={2}>
                    <strong>Recargo por tallas especiales</strong>
                    <span className={styles.surchargeBadge}>
                      {calculo.recargoTallas.detalle
                        .map((d) => `${d.cantidad} x ${d.talla} (+S/ ${d.subtotal.toFixed(2)})`)
                        .join(", ")}
                    </span>
                  </td>
                  <td style={{ textAlign: "center", color: "#64748b" }}>—</td>
                  <td style={{ textAlign: "right", color: "#64748b" }}>Catálogo</td>
                  <td style={{ textAlign: "right", fontWeight: 700 }}>
                    S/ {calculo.recargoTallas.total.toFixed(2)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Desglose Financiero y Despacho */}
        <div className={styles.summaryLayout}>
          <div>
            {datosEnvio ? (
              <div className={styles.shippingCard}>
                <div className={styles.shippingTitle}>
                  4 · Datos de Entrega y Envío
                </div>
                <div style={{ fontSize: "0.82rem", display: "grid", gap: "4px" }}>
                  <div>
                    <strong>Consignatario:</strong> {datosEnvio.nombreCompleto || "No especificado"}
                  </div>
                  {datosEnvio.dni && <div><strong>DNI:</strong> {datosEnvio.dni}</div>}
                  {datosEnvio.celular && <div><strong>Celular:</strong> {datosEnvio.celular}</div>}
                  {datosEnvio.agencia && <div><strong>Agencia:</strong> {datosEnvio.agencia}</div>}
                  {datosEnvio.ciudad && <div><strong>Ciudad / Destino:</strong> {datosEnvio.ciudad}</div>}
                </div>
              </div>
            ) : (
              <div className={styles.shippingCard}>
                <div className={styles.shippingTitle}>4 · Despacho y Entrega</div>
                <p style={{ margin: 0, fontSize: "0.82rem", color: "#64748b" }}>
                  Entrega en taller de confección o despacho en agencia coordinado por vendedora.
                </p>
              </div>
            )}
          </div>

          <div className={styles.totalsBox}>
            <div className={styles.totalRow}>
              <span>Base prendas:</span>
              <span>S/ {calculo.baseProductos.toFixed(2)}</span>
            </div>
            {calculo.recargoTallas.total > 0 && (
              <div className={styles.totalRow}>
                <span>Recargos de tallas:</span>
                <span>+ S/ {calculo.recargoTallas.total.toFixed(2)}</span>
              </div>
            )}
            <div className={`${styles.totalRow} ${styles.totalHighlight}`}>
              <span>TOTAL SIN IGV:</span>
              <span>S/ {calculo.totalSinIgv.toFixed(2)}</span>
            </div>
            <div style={{ fontSize: "0.72rem", color: "#64748b", textAlign: "right", marginTop: "-4px" }}>
              * Los precios no incluyen IGV (18%)
            </div>

            {/* Matriz de Pagos */}
            <div className={styles.advanceBox}>
              <div className={styles.advanceTitle}>
                <span>Inicial sugerida (50%):</span>
                <span>S/ {calculo.adelanto50.toFixed(2)}</span>
              </div>
              <div className={styles.advanceDesc}>
                Requerido para bloquear fecha de corte e iniciar confección en taller.
              </div>
              <div style={{ marginTop: "8px", borderTop: "1px solid #bfdbfe", paddingTop: "6px", display: "flex", justifyContent: "space-between", fontWeight: 600, color: "#1e3a8a" }}>
                <span>Saldo a la entrega (50%):</span>
                <span>S/ {calculo.saldo50.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Cuentas de Pago Bancarias y Condiciones */}
        <div className={styles.bankAccountsGrid}>
          <div>
            <div className={styles.bankBoxTitle}>Condiciones Comerciales</div>
            <div style={{ fontSize: "0.78rem", color: "#475569", lineHeight: 1.5 }}>
              • Precios no incluyen IGV. El 18% se aplica solo si se solicita Boleta o Factura.<br />
              • El plazo rige a partir de: diseño aprobado, adelanto 50% confirmado y lista cerrada.<br />
              • No se despacha ningún pedido con saldo pendiente de pago.
            </div>
          </div>
          <div>
            <div className={styles.bankBoxTitle}>5 · Cuentas Oficiales para Transferencia</div>
            <div className={styles.bankItem}>
              <strong>Plin / Transferencia:</strong> Wilber Peralta Flores — 944 941 179
            </div>
            <div className={styles.bankItem}>
              <strong>Scotiabank Cta:</strong> GRAN CARTEL S.A.C. — 0448814517
            </div>
            <div className={styles.bankItem}>
              <strong>Scotiabank CCI:</strong> 00923020044881451748
            </div>
          </div>
        </div>

        {/* 6. Lista de Prendas Registradas (si existen) */}
        {prendas && prendas.length > 0 && (
          <div style={{ marginTop: "24px" }}>
            <div className={styles.infoBlockTitle} style={{ padding: "8px 12px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              6 · Lista de Prendas Registradas ({prendas.length} prendas)
            </div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: "40px" }}>#</th>
                  <th style={{ width: "70px" }}>Talla</th>
                  <th>Nombre en Prenda</th>
                  <th style={{ width: "60px", textAlign: "center" }}>N.°</th>
                  <th>Prenda</th>
                  <th style={{ width: "100px" }}>Género</th>
                </tr>
              </thead>
              <tbody>
                {prendas.map((p, idx) => (
                  <tr key={p.id || idx}>
                    <td style={{ color: "#64748b" }}>{idx + 1}</td>
                    <td style={{ fontWeight: 700 }}>{p.tallaCodigo || "—"}</td>
                    <td>{p.nombreEnPrenda || p.participanteNombre || "—"}</td>
                    <td style={{ textAlign: "center", fontWeight: 700 }}>{p.numero || "—"}</td>
                    <td>{p.productoNombre || "Prenda"}</td>
                    <td>{p.genero === "MUJER" ? "Dama" : p.genero === "HOMBRE" ? "Caballero" : "Estándar"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className={styles.signatureSection}>
          <div className={styles.signatureBox}>
            Conformidad del Cliente<br />
            Firma, DNI y Fecha
          </div>
        </div>
      </div>

      {/* Modal para registrar el adelanto recibido (sin trabas) */}
      {isAdelantoModalOpen && selectedConfirmacion && (
        <ModalRegistrarAdelanto
          isOpen={isAdelantoModalOpen}
          onClose={() => {
            setIsAdelantoModalOpen(false);
            setSelectedConfirmacion(null);
          }}
          pedidoId={pedido.id}
          confirmacionId={selectedConfirmacion.id}
          version={selectedConfirmacion.version}
          totalSinIgv={Number(selectedConfirmacion.totalSinIgv)}
          adelantoActual={Number(selectedConfirmacion.adelantoRecibido)}
        />
      )}
    </div>
  );
}
