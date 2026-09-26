import {
  Controller,
  Post,
  Get,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { StorageService } from './storage.service';

@ApiTags('Almacenamiento y Archivos (Supabase Storage)')
@Controller('api/archivos')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Get('estado')
  @ApiOperation({ summary: 'Verifica si Supabase Storage está configurado y activo en el backend' })
  verificarEstado() {
    return {
      configurado: this.storageService.estaConfigurado(),
      mensaje: this.storageService.estaConfigurado()
        ? 'Supabase Storage está listo para recibir archivos.'
        : 'Supabase Storage en espera de credenciales (SUPABASE_URL y SUPABASE_KEY en .env).',
    };
  }

  @Post('subir')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Sube un archivo o imagen a Supabase Storage y retorna su URL pública',
  })
  @ApiConsumes('multipart/form-data')
  @ApiQuery({
    name: 'carpeta',
    required: false,
    example: 'disenos',
    description: 'Subcarpeta organizativa (ej: disenos, mockups, tifs, comprobantes)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        archivo: {
          type: 'string',
          format: 'binary',
          description: 'Archivo binario a subir (imágenes .png/.jpg, vector .ai/.cdr, tif, etc.)',
        },
      },
      required: ['archivo'],
    },
  })
  @UseInterceptors(FileInterceptor('archivo'))
  async subirArchivo(
    @UploadedFile() file: Express.Multer.File,
    @Query('carpeta') carpeta?: string,
  ) {
    if (!file) {
      throw new BadRequestException('El campo "archivo" es obligatorio en el formulario multipart.');
    }
    return this.storageService.subirArchivo(file, carpeta || 'general');
  }

  @Delete()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Elimina un archivo almacenado en Supabase Storage por su path' })
  @ApiQuery({ name: 'path', required: true, example: 'disenos/1711234567_arte.ai' })
  async eliminarArchivo(@Query('path') path: string) {
    if (!path) {
      throw new BadRequestException('El parámetro "path" es obligatorio.');
    }
    return this.storageService.eliminarArchivo(path);
  }
}
