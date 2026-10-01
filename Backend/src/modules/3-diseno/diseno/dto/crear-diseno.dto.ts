import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CrearDisenoDto {
  @ApiProperty({ description: 'ID del pedido al que pertenece el diseño' })
  @IsString()
  @IsNotEmpty()
  pedidoId: string;

  @ApiPropertyOptional({ description: 'URL del archivo de sublimación (vectorial/alta resolución)' })
  @IsString()
  @IsOptional()
  archivoUrl?: string;

  @ApiPropertyOptional({ description: 'URL de la imagen de vista previa' })
  @IsString()
  @IsOptional()
  imagenUrl?: string;

  @ApiPropertyOptional({ description: 'Indica si el diseño fue aprobado directamente por el cliente vía WhatsApp' })
  @IsOptional()
  aprobadoPorWhatsApp?: boolean;

  @ApiPropertyOptional({ description: 'ID del usuario autor (si aplica)' })
  @IsString()
  @IsOptional()
  usuarioId?: string;
}
