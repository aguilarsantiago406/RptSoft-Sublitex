"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { FileCheck, FileDown, AlertTriangle, Image as ImageIcon, Printer, Share2 } from "lucide-react";
import type { PedidoDetalle } from "../../types/pedido";
import { formatDate } from "@/lib/format/date";
import type { TarifaItem, DatosEnvioItem, ConfirmacionItem } from "../../api/comercial.api";
import { calcularProformaCompleta, type PrendaProformaItem } from "../../utils/proforma.utils";
import { ModalEmitirConfirmacion } from "./ModalEmitirConfirmacion";
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
  const [copied, setCopied] = useState(false);
  const [isModalEmitirOpen, setIsModalEmitirOpen] = useState(false);

  // Cálculo matemático dinámico sobre cantidades contratadas oficiales
  const calculo = useMemo(() => {
    return calcularProformaCompleta(pedido, tarifas, prendas);
  }, [pedido, tarifas, prendas]);

  const totalPrendasContratadas = useMemo(() => {
    return pedido.grupos.reduce((acc, g) => acc + g.cantidadContratada, 0);
  }, [pedido.grupos]);

  function handlePrint() {
    window.print();
  }

  function handleCopyWhatsApp() {
    const lines = [
      `📄 *PROFORMA COMERCIAL — SUBLITEX*`,
      `*Folio:* ${pedido.codigo}`,
      `*Cliente:* ${pedido.cliente.nombre}`,
      `*Fecha de entrega compromiso:* ${pedido.fechaCompromiso ? new Date(pedido.fechaCompromiso).toLocaleDateString("es-PE") : "Por definir"}`,
      `-----------------------------------`,
      `*Detalle de prendas:*`,
      ...calculo.itemsCotizados.map(
        (it) => `• ${it.nombre} (${it.tipoProductoNombre}) x ${it.cantidad} = S/ ${it.subtotal.toFixed(2)}`
      ),
    ];

    if (calculo.recargoTallas.total > 0) {
      lines.push(`• Recargo tallas especiales: S/ ${calculo.recargoTallas.total.toFixed(2)}`);
      for (const d of calculo.recargoTallas.detalle) {
        lines.push(`   └ Talla ${d.talla} x ${d.cantidad} (+S/ ${d.subtotal.toFixed(2)})`);
      }
    }

    lines.push(`-----------------------------------`);
    lines.push(`*TOTAL SIN IGV:* S/ ${calculo.totalSinIgv.toFixed(2)}`);
    lines.push(`*Adelanto 50% (para iniciar corte):* S/ ${calculo.adelanto50.toFixed(2)}`);
    lines.push(`*Saldo a la entrega:* S/ ${calculo.saldo50.toFixed(2)}`);

    if (datosEnvio?.ciudad || datosEnvio?.agencia) {
      lines.push(`-----------------------------------`);
      lines.push(`*Despacho:* ${datosEnvio.agencia ?? "Agencia"} — ${datosEnvio.ciudad ?? ""}`);
    }

    lines.push(`-----------------------------------`);
    lines.push(`*Cuentas de pago:*`);
    lines.push(`• Plin / Transferencia: Wilber Peralta Flores — 944 941 179`);
    lines.push(`• Scotiabank Cta: GRAN CARTEL S.A.C. — 0448814517`);
    lines.push(`• Scotiabank CCI: 00923020044881451748`);

    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            className={styles.btnSecondary}
            onClick={handleCopyWhatsApp}
            title="Copiar resumen para WhatsApp"
          >
            <Share2 size={14} />
            {copied ? "¡Copiado!" : "Copiar WhatsApp"}
          </button>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={handlePrint}
            title="Imprimir o guardar como PDF"
          >
            <Printer size={14} />
            Imprimir A4
          </button>
          <button
            type="button"
            className={styles.btnEmitir}
            onClick={() => setIsModalEmitirOpen(true)}
            title="Congelar orden y generar PDF oficial en backend"
          >
            <FileCheck size={14} />
            Emitir Confirmación
          </button>
        </div>
      </div>

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
                        Ver PDF Oficial (v{c.version})
                      </a>
                    )}
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
            <div className={styles.brandLogo}>SUBLITEX</div>
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

        {/* Datos del Cliente y Condiciones */}
        <section className={styles.infoGrid}>
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
              <span className={styles.infoValue}>50% Adelanto / 50% Saldo a entrega</span>
            </div>
          </div>
        </section>

        {/* Recuadro de Diseño Aprobado */}
        <div className={styles.mockupCard}>
          <div className={styles.mockupCardHeader}>
            <span>Diseño Aprobado por el Cliente</span>
            <span>Mockup oficial de confección</span>
          </div>
          <div className={styles.mockupImgWrapper}>
            {mockupUrl ? (
              <Image
                src={mockupUrl}
                alt="Mockup de Diseño Aprobado"
                className={styles.mockupImg}
                width={380}
                height={200}
                unoptimized
              />
            ) : (
              <div className={styles.mockupPlaceholder}>
                <ImageIcon size={28} />
                <span>Mockup aprobado en proceso de carga o validación por WhatsApp</span>
              </div>
            )}
          </div>
        </div>

        {/* Tabla de Cotización Itemizada */}
        <div className={styles.tableContainer}>
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

        {/* Desglose Financiero y Despacho */}
        <div className={styles.summaryLayout}>
          <div>
            {datosEnvio ? (
              <div className={styles.shippingCard}>
                <div className={styles.shippingTitle}>
                  Datos de Rotulado y Envío a Provincia (R-K08)
                </div>
                <div style={{ fontSize: "0.82rem", display: "grid", gap: "4px" }}>
                  <div>
                    <strong>Consignatario:</strong> {datosEnvio.nombreCompleto || "No especificado"}
                  </div>
                  {datosEnvio.dni && <div><strong>DNI:</strong> {datosEnvio.dni}</div>}
                  {datosEnvio.celular && <div><strong>Celular:</strong> {datosEnvio.celular}</div>}
                  {datosEnvio.agencia && <div><strong>Agencia:</strong> {datosEnvio.agencia}</div>}
                  {datosEnvio.ciudad && <div><strong>Ciudad:</strong> {datosEnvio.ciudad}</div>}
                </div>
              </div>
            ) : (
              <div className={styles.shippingCard}>
                <div className={styles.shippingTitle}>Despacho y Entrega</div>
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

            {/* Matriz de Pagos R-K07 */}
            <div className={styles.advanceBox}>
              <div className={styles.advanceTitle}>
                <span>Adelanto sugerido (50%):</span>
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

        {/* Cuentas de Pago Bancarias y Condiciones */}
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
            <div className={styles.bankBoxTitle}>Cuentas Oficiales para Transferencia</div>
            <div className={styles.bankItem}>
              <strong>Plin:</strong> Wilber Peralta Flores — 944 941 179
            </div>
            <div className={styles.bankItem}>
              <strong>Scotiabank Cta:</strong> GRAN CARTEL S.A.C. — 0448814517
            </div>
            <div className={styles.bankItem}>
              <strong>Scotiabank CCI:</strong> 00923020044881451748
            </div>
          </div>
        </div>

        <div className={styles.signatureSection}>
          <div className={styles.signatureBox}>
            Conformidad del Cliente<br />
            Firma, DNI y Fecha
          </div>
        </div>
      </div>

      {/* Modal para emitir confirmación oficial */}
      {isModalEmitirOpen && (
        <ModalEmitirConfirmacion
          key={String(isModalEmitirOpen)}
          isOpen={isModalEmitirOpen}
          onClose={() => setIsModalEmitirOpen(false)}
          pedidoId={pedido.id}
          pedidoCodigo={pedido.codigo}
          basePrendas={calculo.baseProductos}
          recargoTallasInicial={calculo.recargoTallas.total}
        />
      )}
    </div>
  );
}
