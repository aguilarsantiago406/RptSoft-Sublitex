import { IsEnum, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoPedido } from '../estado-pedido.enum';

export { EstadoPedido };

export class UpdateEstadoDto {
  @ApiProperty({
    enum: EstadoPedido,
    description: 'Estado destino. Solo se admiten transiciones declaradas hacia adelante (R-A06).',
    example: EstadoPedido.EN_CONFIGURACION,
  })
  @IsEnum(EstadoPedido)
  estado: EstadoPedido;

  @ApiPropertyOptional({
    example: 'Aprobación inicial de ficha técnica',
    description: 'Motivo del cambio de estado (opcional para trazabilidad).',
  })
  @IsOptional()
  @IsString()
  motivo?: string;
}