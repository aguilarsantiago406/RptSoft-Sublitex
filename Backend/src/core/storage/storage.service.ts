import {
  Injectable,
  Logger,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import 'multer';

export interface ArchivoSubidoResponse {
  url: string;
  path: string;
  nombreOriginal: string;
  mimetype: string;
  tamanoBytes: number;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private supabase: SupabaseClient | null = null;
  private bucket: string = 'sublitex-archivos';

  constructor() {
    this.inicializarCliente();
  }

  /**
   * Inicializa el cliente de Supabase si existen las variables de entorno.
   * Si no existen, el servicio arranca sin error y avisa por consola.
   */
  public inicializarCliente() {
    let url = process.env.SUPABASE_URL?.trim();
    const key = (process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)?.trim();
    this.bucket = process.env.SUPABASE_BUCKET || 'sublitex-archivos';

    // Auto-corrección si se pegó la URL del Dashboard de Supabase en vez de la API
    if (url && url.includes('supabase.com/dashboard/project/')) {
      const match = url.match(/project\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        url = `https://${match[1]}.supabase.co`;
      }
    }

    if (url && key && url.startsWith('http')) {
      this.supabase = createClient(url, key, {
        auth: { persistSession: false },
      });
      this.logger.log(`✅ Supabase Storage inicializado correctamente (Bucket: ${this.bucket})`);
    } else {
      this.supabase = null;
      this.logger.warn(
        '⚠️ Supabase Storage en espera de credenciales (SUPABASE_URL y SUPABASE_KEY en .env).',
      );
    }
  }

  /**
   * Indica si el cliente de Supabase está activo y listo para operar.
   */
  public estaConfigurado(): boolean {
    return this.supabase !== null;
  }

  /**
   * Sube un archivo a Supabase Storage y retorna su URL pública inmutable.
   *
   * @param file Archivo recibido vía Multer
   * @param carpeta Subcarpeta de destino (ej: 'disenos', 'mockups', 'tifs')
   */
  async subirArchivo(
    file: Express.Multer.File,
    carpeta: string = 'general',
  ): Promise<ArchivoSubidoResponse> {
    if (!this.supabase) {
      throw new ServiceUnavailableException(
        'Supabase Storage no está configurado. Por favor define SUPABASE_URL y SUPABASE_KEY en el archivo .env del servidor.',
      );
    }

    if (!file || !file.buffer) {
      throw new BadRequestException('No se proporcionó ningún archivo para subir.');
    }

    // Sanitizar el nombre del archivo
    const nombreLimpio = file.originalname
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Eliminar tildes
      .replace(/[^a-zA-Z0-9._-]/g, '_'); // Reemplazar caracteres especiales

    const timePrefix = Date.now();
    const subcarpetaLimpia = carpeta.replace(/[^a-zA-Z0-9_-]/g, '');
    const path = `${subcarpetaLimpia}/${timePrefix}_${nombreLimpio}`;

    const { error } = await this.supabase.storage
      .from(this.bucket)
      .upload(path, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      this.logger.error(`Error al subir archivo a Supabase: ${error.message}`);
      throw new BadRequestException(`Error al guardar archivo en Supabase Storage: ${error.message}`);
    }

    const { data: urlData } = this.supabase.storage.from(this.bucket).getPublicUrl(path);

    return {
      url: urlData.publicUrl,
      path,
      nombreOriginal: file.originalname,
      mimetype: file.mimetype,
      tamanoBytes: file.size,
    };
  }

  /**
   * Obtiene la URL pública de un archivo dado su path relativo en el bucket.
   */
  obtenerUrlPublica(path: string): string {
    if (!this.supabase) {
      throw new ServiceUnavailableException('Supabase Storage no está configurado.');
    }
    const { data } = this.supabase.storage.from(this.bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  /**
   * Elimina un archivo del bucket.
   */
  async eliminarArchivo(path: string): Promise<{ eliminado: boolean }> {
    if (!this.supabase) {
      throw new ServiceUnavailableException('Supabase Storage no está configurado.');
    }
    const { error } = await this.supabase.storage.from(this.bucket).remove([path]);
    if (error) {
      throw new BadRequestException(`Error al eliminar archivo: ${error.message}`);
    }
    return { eliminado: true };
  }
}
