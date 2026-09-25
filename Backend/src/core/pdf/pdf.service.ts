import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import * as PDFDocument from 'pdfkit';

export interface ConfirmacionPdfData {
  codigo: string;
  version: number;
  clienteNombre: string;
  fechaEmision: Date;
  grupos: {
    nombre: string;
    tipoProducto: string;
    cantidadContratada: number;
    prendasVenta: number;
  }[];
  totalSinIgv: number;
  recargoTallas: number;
  recargoTelas: number;
  recargoCuellos: number;
  recargoAcabados: number;
  adicionales: number;
  adelantoSugerido: number;
  adelantoRecibido: number;
  saldo: number;
  igvCalculado: number | null;
  comprobante: string;
}

@Injectable()
export class PdfService {
  private readonly outputDir: string;

  constructor() {
    this.outputDir = path.join(process.cwd(), 'storage', 'confirmaciones');
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async generarConfirmacionPdf(data: ConfirmacionPdfData): Promise<string> {
    const filename = `${data.codigo}-v${data.version}.pdf`;
    const filepath = path.join(this.outputDir, filename);

    await new Promise<void>((resolve, reject) => {
      const doc = new (PDFDocument as any)({ margin: 50, size: 'A4' });
      const stream = fs.createWriteStream(filepath);

      doc.pipe(stream);

      doc.fontSize(20).font('Helvetica-Bold').text('SUBLITEX', { align: 'center' });
      doc.fontSize(10).font('Helvetica').text('Confección y personalización deportiva', { align: 'center' });
      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.5);

      doc.fontSize(14).font('Helvetica-Bold').text('CONFIRMACIÓN DE PEDIDO', { align: 'center' });
      doc.moveDown(0.5);

      doc.fontSize(10).font('Helvetica');
      doc.text(`Código de pedido: ${data.codigo}`, { continued: true });
      doc.text(`   Versión: ${data.version}`, { align: 'right' });
      doc.text(`Cliente: ${data.clienteNombre}`, { continued: true });
      doc.text(`   Fecha: ${data.fechaEmision.toLocaleDateString('es-PE')}`, { align: 'right' });
      doc.text(`Comprobante: ${data.comprobante}`);
      doc.moveDown(0.5);

      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.5);

      doc.fontSize(11).font('Helvetica-Bold').text('Detalle de grupos');
      doc.moveDown(0.3);

      const col = { nombre: 50, producto: 200, contratada: 340, venta: 430, subtotal: 490 };
      doc.fontSize(9).font('Helvetica-Bold');
      doc.text('Grupo', col.nombre, doc.y, { width: 145 });
      doc.text('Producto', col.producto, doc.y - doc.currentLineHeight(), { width: 135 });
      doc.text('Contratada', col.contratada, doc.y - doc.currentLineHeight(), { width: 85 });
      doc.text('Venta', col.venta, doc.y - doc.currentLineHeight(), { width: 55 });
      doc.moveDown(0.2);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.2);

      doc.font('Helvetica').fontSize(9);
      for (const g of data.grupos) {
        const y = doc.y;
        doc.text(g.nombre, col.nombre, y, { width: 145 });
        doc.text(g.tipoProducto, col.producto, y, { width: 135 });
        doc.text(String(g.cantidadContratada), col.contratada, y, { width: 85, align: 'center' });
        doc.text(String(g.prendasVenta), col.venta, y, { width: 55, align: 'center' });
        doc.moveDown(0.5);
      }

      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.5);

      doc.fontSize(10).font('Helvetica-Bold').text('Resumen financiero');
      doc.moveDown(0.3);

      const lineaFinanciera = (label: string, valor: number, negrita = false) => {
        const font = negrita ? 'Helvetica-Bold' : 'Helvetica';
        doc.font(font).fontSize(10);
        doc.text(label, 300, doc.y, { width: 180 });
        doc.text(`S/ ${valor.toFixed(2)}`, 480, doc.y - doc.currentLineHeight(), { width: 65, align: 'right' });
        doc.moveDown(0.3);
      };

      lineaFinanciera('Base productos', data.totalSinIgv - data.recargoTallas - data.recargoTelas - data.recargoCuellos - data.recargoAcabados - data.adicionales);
      if (data.recargoTallas > 0) lineaFinanciera('Recargo tallas especiales', data.recargoTallas);
      if (data.recargoTelas > 0) lineaFinanciera('Recargo telas especiales', data.recargoTelas);
      if (data.recargoCuellos > 0) lineaFinanciera('Recargo cuellos especiales', data.recargoCuellos);
      if (data.recargoAcabados > 0) lineaFinanciera('Recargo acabados', data.recargoAcabados);
      if (data.adicionales > 0) lineaFinanciera('Adicionales', data.adicionales);

      doc.moveTo(300, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.2);
      lineaFinanciera('TOTAL SIN IGV', data.totalSinIgv, true);
      if (data.igvCalculado !== null) lineaFinanciera('IGV (18%)', data.igvCalculado);
      lineaFinanciera('Adelanto sugerido (50%)', data.adelantoSugerido);
      lineaFinanciera('Adelanto recibido', data.adelantoRecibido);
      lineaFinanciera('SALDO PENDIENTE', data.saldo, true);

      doc.moveDown(1);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.5);
      doc.fontSize(8).font('Helvetica').fillColor('gray');
      doc.text('Documento generado automáticamente por el sistema SIPES · Sublitex', { align: 'center' });
      doc.text(`Generado el ${new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' })}`, { align: 'center' });

      doc.end();
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    return `/storage/confirmaciones/${filename}`;
  }
}
