import { Test, TestingModule } from '@nestjs/testing';
import { PdfService, ConfirmacionPdfData } from './pdf.service';
import { StorageService } from '../storage/storage.service';

describe('📄 PdfService (Generador de PDF & Persistencia en Supabase)', () => {
  let service: PdfService;
  let mockStorageService: any;

  const mockData: ConfirmacionPdfData = {
    codigo: 'SUB-2002',
    version: 1,
    clienteNombre: 'Promoción 2002 San Agustín',
    fechaEmision: new Date('2026-09-26T10:00:00Z'),
    grupos: [
      {
        nombre: 'Varones Titulares',
        tipoProducto: 'Kit completo',
        cantidadContratada: 17,
        prendasVenta: 17,
      },
      {
        nombre: 'Camisetas',
        tipoProducto: 'Camiseta sola',
        cantidadContratada: 11,
        prendasVenta: 11,
      },
    ],
    totalSinIgv: 1040,
    recargoTallas: 30,
    recargoTelas: 0,
    recargoCuellos: 0,
    recargoAcabados: 0,
    adicionales: 25,
    adelantoSugerido: 520,
    adelantoRecibido: 500,
    saldo: 540,
    igvCalculado: null,
    comprobante: 'BOLETA',
  };

  describe('Modo Local (sin Supabase o no configurado)', () => {
    beforeEach(async () => {
      mockStorageService = {
        estaConfigurado: jest.fn().mockReturnValue(false),
        subirBuffer: jest.fn(),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          PdfService,
          { provide: StorageService, useValue: mockStorageService },
        ],
      }).compile();

      service = module.get<PdfService>(PdfService);
    });

    it('genera el PDF físico y retorna la ruta local cuando Supabase no está configurado', async () => {
      const url = await service.generarConfirmacionPdf(mockData);

      expect(url).toBe('/storage/confirmaciones/SUB-2002-v1.pdf');
      expect(mockStorageService.subirBuffer).not.toHaveBeenCalled();
    });
  });

  describe('Modo Cloud (con Supabase Storage conectado)', () => {
    const supabaseUrlMock =
      'https://vwcxibxfjfimpvgztbrv.supabase.co/storage/v1/object/public/sublitex-archivos/confirmaciones/SUB-2002-v1.pdf';

    beforeEach(async () => {
      mockStorageService = {
        estaConfigurado: jest.fn().mockReturnValue(true),
        subirBuffer: jest.fn().mockResolvedValue({
          url: supabaseUrlMock,
          path: 'confirmaciones/SUB-2002-v1.pdf',
          nombreOriginal: 'SUB-2002-v1.pdf',
          mimetype: 'application/pdf',
          tamanoBytes: 15420,
        }),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          PdfService,
          { provide: StorageService, useValue: mockStorageService },
        ],
      }).compile();

      service = module.get<PdfService>(PdfService);
    });

    it('sube el buffer del PDF a Supabase Storage y retorna la URL pública inmutable', async () => {
      const url = await service.generarConfirmacionPdf(mockData);

      expect(url).toBe(supabaseUrlMock);
      expect(mockStorageService.subirBuffer).toHaveBeenCalledTimes(1);
      expect(mockStorageService.subirBuffer).toHaveBeenCalledWith(
        expect.any(Buffer),
        'SUB-2002-v1.pdf',
        'application/pdf',
        'confirmaciones',
      );
    });

    it('hace fallback a almacenamiento local si la subida a Supabase falla por red', async () => {
      mockStorageService.subirBuffer.mockRejectedValueOnce(new Error('Network timeout'));

      const url = await service.generarConfirmacionPdf(mockData);

      expect(url).toBe('/storage/confirmaciones/SUB-2002-v1.pdf');
    });
  });
});
