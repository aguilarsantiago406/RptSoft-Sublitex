import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBitacoraDto {
  @ApiProperty({ description: 'Descripción detallada de la modificación post-cierre', example: 'Cambio de talla de L a XL solicitado por el cliente por WhatsApp' })
  @IsNotEmpty()
  @IsString()
  descripcionCambio: string;

  @ApiProperty({ description: 'Persona o entidad que solicitó el cambio', example: 'Cliente (Carlos Pérez)' })
  @IsNotEmpty()
  @IsString()
  solicitadoPor: string;

  @ApiPropertyOptional({ description: 'ID de la prenda afectada si el cambio es puntual', example: 'cuid_prenda_123' })
  @IsOptional()
  @IsString()
  prendaId?: string;

  @ApiPropertyOptional({ description: 'Indica si ya fue comunicado al taller de confección', example: false })
  @IsOptional()
  @IsBoolean()
  avisadoATaller?: boolean;
}
