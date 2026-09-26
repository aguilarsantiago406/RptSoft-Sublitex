import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';
import 'multer';

describe('📦 StorageService & StorageController (Supabase Storage)', () => {
  let service: StorageService;
  let controller: StorageController;

  const mockFile: Express.Multer.File = {
    fieldname: 'archivo',
    originalname: 'diseño_sublitex_2026.png',
    encoding: '7bit',
    mimetype: 'image/png',
    size: 1024,
    buffer: Buffer.from('fake-image-content'),
    stream: null as any,
    destination: '',
    filename: '',
    path: '',
  };

  beforeEach(async () => {
    // Limpiar variables de entorno para pruebas controladas
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_KEY;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StorageController],
      providers: [StorageService],
    }).compile();

    service = module.get<StorageService>(StorageService);
    controller = module.get<StorageController>(StorageController);
  });

  describe('Estado y Configuración', () => {
    it('debe iniciar sin error y reportar estaConfigurado = false si no hay credenciales en .env', () => {
      expect(service.estaConfigurado()).toBe(false);
      const estado = controller.verificarEstado();
      expect(estado.configurado).toBe(false);
      expect(estado.mensaje).toContain('espera de credenciales');
    });

    it('debe lanzar ServiceUnavailableException al intentar subir archivo si no está configurado', async () => {
      await expect(service.subirArchivo(mockFile)).rejects.toThrow(
        ServiceUnavailableException,
      );
    });

    it('debe lanzar ServiceUnavailableException en obtenerUrlPublica si no está configurado', () => {
      expect(() => service.obtenerUrlPublica('test.png')).toThrow(
        ServiceUnavailableException,
      );
    });

    it('debe lanzar ServiceUnavailableException en eliminarArchivo si no está configurado', async () => {
      await expect(service.eliminarArchivo('test.png')).rejects.toThrow(
        ServiceUnavailableException,
      );
    });
  });

  describe('Operaciones con Supabase Client Simulado', () => {
    let mockSupabase: any;

    beforeEach(() => {
      mockSupabase = {
        storage: {
          from: jest.fn().mockReturnValue({
            upload: jest.fn().mockResolvedValue({ data: { path: 'disenos/1_test.png' }, error: null }),
            getPublicUrl: jest.fn().mockReturnValue({
              data: { publicUrl: 'https://test.supabase.co/storage/v1/object/public/sublitex-archivos/disenos/1_test.png' },
            }),
            remove: jest.fn().mockResolvedValue({ data: [], error: null }),
          }),
        },
      };

      // Inyectar el cliente simulado en la instancia de StorageService
      (service as any).supabase = mockSupabase;
    });

    it('debe reportar estaConfigurado = true cuando el cliente está asignado', () => {
      expect(service.estaConfigurado()).toBe(true);
      const estado = controller.verificarEstado();
      expect(estado.configurado).toBe(true);
    });

    it('debe subir un archivo exitosamente y devolver su URL pública inmutable', async () => {
      const res = await service.subirArchivo(mockFile, 'disenos');

      expect(res.url).toBe(
        'https://test.supabase.co/storage/v1/object/public/sublitex-archivos/disenos/1_test.png',
      );
      expect(res.path).toContain('disenos/');
      expect(res.nombreOriginal).toBe('diseño_sublitex_2026.png');
      expect(res.mimetype).toBe('image/png');
      expect(res.tamanoBytes).toBe(1024);
      expect(mockSupabase.storage.from).toHaveBeenCalledWith('sublitex-archivos');
    });

    it('debe lanzar BadRequestException si Supabase responde con error al subir', async () => {
      mockSupabase.storage.from.mockReturnValue({
        upload: jest.fn().mockResolvedValue({ data: null, error: { message: 'Bucket not found' } }),
      });

      await expect(service.subirArchivo(mockFile)).rejects.toThrow(BadRequestException);
    });

    it('debe rechazar archivo si es nulo o no contiene buffer', async () => {
      await expect(service.subirArchivo(null as any)).rejects.toThrow(BadRequestException);
    });

    it('debe obtener la URL pública correctamente', () => {
      const url = service.obtenerUrlPublica('disenos/foto.png');
      expect(url).toContain('https://test.supabase.co');
    });

    it('debe eliminar archivo exitosamente', async () => {
      const res = await service.eliminarArchivo('disenos/foto.png');
      expect(res.eliminado).toBe(true);
    });

    it('debe lanzar BadRequestException si ocurre error al eliminar', async () => {
      mockSupabase.storage.from.mockReturnValue({
        remove: jest.fn().mockResolvedValue({ error: { message: 'No existe el archivo' } }),
      });

      await expect(service.eliminarArchivo('disenos/foto.png')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('Controlador StorageController', () => {
    it('debe rechazar subida si no se adjunta el archivo en el request', async () => {
      await expect(controller.subirArchivo(null as any)).rejects.toThrow(BadRequestException);
    });

    it('debe rechazar eliminación si no se pasa el parámetro path', async () => {
      await expect(controller.eliminarArchivo('')).rejects.toThrow(BadRequestException);
    });
  });
});
