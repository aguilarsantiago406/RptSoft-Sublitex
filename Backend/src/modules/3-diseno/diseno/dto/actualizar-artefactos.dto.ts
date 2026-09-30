import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ActualizarArtefactosDto {
  @ApiPropertyOptional({ description: 'URL del archivo de sublimación (vectorial/alta resolución)' })
  @IsString()
  @IsOptional()
  archivoUrl?: string;

  @ApiPropertyOptional({ description: 'URL de la imagen de vista previa' })
  @IsString()
  @IsOptional()
  imagenUrl?: string;
}
