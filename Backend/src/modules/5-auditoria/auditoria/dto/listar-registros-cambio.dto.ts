import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrigenCambio } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListarRegistrosCambioDto {
  @ApiPropertyOptional({ description: 'Filtrar por pedido (R-I01 por pedido)' })
  @IsOptional()
  @IsString()
  pedidoId?: string;

  @ApiPropertyOptional({
    description: 'Entidad afectada: Diseno, NestingParte, Prenda...',
  })
  @IsOptional()
  @IsString()
  entidad?: string;

  @ApiPropertyOptional({ description: 'Id de la entidad afectada' })
  @IsOptional()
  @IsString()
  entidadId?: string;

  @ApiPropertyOptional({ enum: OrigenCambio, description: 'R-I04' })
  @IsOptional()
  @IsEnum(OrigenCambio)
  origen?: OrigenCambio;

  @ApiPropertyOptional({
    description: 'Máximo de registros (1..1000)',
    default: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  limit?: number;
}
