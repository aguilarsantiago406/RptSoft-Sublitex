"use client";

import { useMemo, useState } from "react";
import type { PedidoDetalle } from "../../types/pedido";
import { formatDate } from "@/lib/format/date";
import type { TarifaItem, DatosEnvioItem, ResumenProduccionItem } from "../../api/comercial.api";
import styles from "./proforma.module.css";

interface ProformaViewProps {
  pedido: PedidoDetalle;
  tarifas: TarifaItem[];
  datosEnvio: DatosEnvioItem | null;
  resumenProduccion: ResumenProduccionItem | null;
}

function getPrecioBase(codigoOConcepto: string, tarifas: TarifaItem[]): number {
  const codeLower = codigoOConcepto.toLowerCase();
  
  // Buscar en tarifas vigentes de la base de datos
  const encontrada = tarifas.find((t) => {
    const c = t.concepto.toLowerCase();
    return c === codeLower || codeLower.includes(c) || c.includes(codeLower);
  });

  if (encontrada) {
    return Number(encontrada.valor);
  }

  // Fallbacks estándar de catálogo si no se cargó una tarifa en la BD
  if (codeLower.includes("kit")) return 55.0;
  if (codeLower.includes("conjunto")) return 45.0;
  if (codeLower.includes("arquero")) return 50.0;
  if (codeLower.includes("camiseta")) return 30.0;
  if (codeLower.includes("short")) return 18.0;
  if (codeLower.includes("media")) return 12.0;
  return 35.0;
}

export function ProformaView({
  pedido,
  tarifas,
  datosEnvio,
  resumenProduccion,
}: ProformaViewProps) {
  const [copied, setCopied] = useState(false);

  // Calcular items cotizados por grupo
  const itemsCotizados = useMemo(() => {
    return pedido.grupos.map((g) => {
      const precioUnitario = getPrecioBase(
        g.tipoProducto?.nombre || g.tipoProducto?.codigo || g.nombre,
        tarifas
      );
      const subtotal = g.cantidadContratada * precioUnitario;

      return {
        grupoId: g.id,
        nombre: g.nombre,
        tipoProductoNombre: g.tipoProducto?.nombre || "Prenda",
        cantidad: g.cantidadContratada,
        precioUnitario,
        subtotal,
      };
    });
  }, [pedido.grupos, tarifas]);

  const totalGeneral = useMemo(() => {
    return itemsCotizados.reduce((acc, it) => acc + it.subtotal, 0);
  }, [itemsCotizados]);

  const adelanto50 = totalGeneral * 0.5;
  const saldo50 = totalGeneral - adelanto50;

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
      ...itemsCotizados.map(
        (it) => `• ${it.nombre} (${it.tipoProductoNombre}) x ${it.cantidad} = S/ ${it.subtotal.toFixed(2)}`
      ),
      `-----------------------------------`,
      `*TOTAL:* S/ ${totalGeneral.toFixed(2)}`,
      `*Adelanto 50% (para iniciar corte):* S/ ${adelanto50.toFixed(2)}`,
      `*Saldo a la entrega:* S/ ${saldo50.toFixed(2)}`,
    ];

    if (datosEnvio?.ciudad || datosEnvio?.agencia) {
      lines.push(`-----------------------------------`);
      lines.push(`*Despacho:* ${datosEnvio.agencia ?? "Agencia"} — ${datosEnvio.ciudad ?? ""}`);
    }

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
      {/* Barra de herramientas superior (oculta al imprimir) */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <span>Proforma calculada para <strong>{pedido.codigo}</strong></span>
          <span>·</span>
          <span>{itemsCotizados.length} grupos cotizados</span>
        </div>
        <div className={styles.toolbarActions}>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={handleCopyWhatsApp}
          >
            {copied ? "Copiado al portapapeles" : "Copiar para WhatsApp"}
          </button>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={handlePrint}
          >
            Imprimir / Guardar PDF
          </button>
        </div>
      </div>

      {/* Hoja física formal de la Proforma */}
      <div className={styles.sheet}>
        <header className={styles.headerGrid}>
          <div className={styles.brandCol}>
            <div className={styles.brandLogo}>SUBLITEX</div>
            <div className={styles.brandSub}>
              Confección Textil Deportiva e Industrial<br />
              RUC: 20601234567 · Lima, Perú<br />
              ventas@sublitex.com · +51 999 888 777
            </div>
          </div>
          <div className={styles.docCol}>
            <div className={styles.docTitle}>Proforma Comercial</div>
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
            <div className={styles.infoBlockTitle}>Datos del Cliente</div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Cliente:</span>
              <span className={styles.infoValue}>{pedido.cliente.nombre}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Destino / Ciudad:</span>
              <span className={styles.infoValue}>
                {pedido.cliente.ciudad || "Lima"}
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
            <div className={styles.infoBlockTitle}>Condiciones de Entrega</div>
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
              <span className={styles.infoValue}>50% Adelanto / 50% Entrega</span>
            </div>
            {pedido.observaciones && (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Observaciones:</span>
                <span className={styles.infoValue} style={{ fontSize: "0.8rem", fontWeight: 400 }}>
                  {pedido.observaciones}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Tabla de Items */}
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: "46px" }}>#</th>
                <th>Descripción de Grupo</th>
                <th>Tipo de Prenda</th>
                <th style={{ width: "90px", textAlign: "center" }}>Cant.</th>
                <th style={{ width: "130px", textAlign: "right" }}>Precio Unit.</th>
                <th style={{ width: "140px", textAlign: "right" }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {itemsCotizados.map((it, idx) => (
                <tr key={it.grupoId}>
                  <td style={{ color: "#64748b" }}>{idx + 1}</td>
                  <td>
                    <strong>{it.nombre}</strong>
                  </td>
                  <td>{it.tipoProductoNombre}</td>
                  <td style={{ textAlign: "center", fontWeight: 600 }}>
                    {it.cantidad}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    S/ {it.precioUnitario.toFixed(2)}
                  </td>
                  <td style={{ textAlign: "right", fontWeight: 700 }}>
                    S/ {it.subtotal.toFixed(2)}
                  </td>
                </tr>
              ))}
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
                  Entrega en taller de confección o coordinación directa con la vendedora asignada.
                </p>
              </div>
            )}
          </div>

          <div className={styles.totalsBox}>
            <div className={styles.totalRow}>
              <span>Subtotal neto:</span>
              <span>S/ {totalGeneral.toFixed(2)}</span>
            </div>
            <div className={`${styles.totalRow} ${styles.totalHighlight}`}>
              <span>TOTAL:</span>
              <span>S/ {totalGeneral.toFixed(2)}</span>
            </div>

            {/* Regla R-K07: Matriz de Adelanto Comercial */}
            <div className={styles.advanceBox}>
              <div className={styles.advanceTitle}>
                <span>Adelanto sugerido (50%):</span>
                <span>S/ {adelanto50.toFixed(2)}</span>
              </div>
              <div className={styles.advanceDesc}>
                Requerido para bloquear fecha de corte e ingresar orden a confección.
              </div>
              <div style={{ marginTop: "8px", borderTop: "1px solid #dbeafe", paddingTop: "6px", display: "flex", justifyContent: "space-between", fontWeight: 600, color: "#1e3a8a" }}>
                <span>Saldo a la entrega (50%):</span>
                <span>S/ {saldo50.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <footer className={styles.footerNotes}>
          <p style={{ margin: "0 0 4px 0" }}>
            * Esta proforma es un presupuesto comercial preliminar y no constituye comprobante de pago electrónico.
          </p>
          <p style={{ margin: 0 }}>
            * Las fechas de entrega rigen a partir de la recepción y confirmación del adelanto pactado.
          </p>
        </footer>
      </div>
    </div>
  );
}
